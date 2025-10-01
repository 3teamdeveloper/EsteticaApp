import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { verifyTrialAccess } from "@/lib/trial";

// Función para asignar empleado usando Round Robin
async function assignEmployeeRoundRobin(serviceId: number, appointmentDate: Date) {
  try {
    // console.log("🔍 Round Robin iniciado para servicio:", serviceId, "fecha:", appointmentDate);
    
    // 1. Obtener empleados disponibles para este servicio
    const availableEmployees = await prisma.employee.findMany({
      where: {
        services: {
          some: {
            serviceId: serviceId
          }
        }
      },
      orderBy: { id: 'asc' }
    });

    // console.log("👥 Empleados disponibles para el servicio:", availableEmployees.map(e => ({ id: e.id, name: e.name })));

    if (availableEmployees.length === 0) {
      throw new Error("No hay empleados disponibles para este servicio");
    }

    // 2. Obtener o crear el tracking de Round Robin para este servicio (global en tiempo)
    let tracking = await prisma.roundRobinTracking.findUnique({
      where: {
        serviceId_date_timeSlot: {
          serviceId: serviceId,
          date: new Date(0), // Fecha fija para tracking global por servicio
          timeSlot: "" // String vacío para tracking global por servicio
        }
      }
    });

    if (!tracking) {
      tracking = await prisma.roundRobinTracking.create({
        data: {
          serviceId: serviceId,
          date: new Date(0), // Tracking global por servicio
          timeSlot: "", // Sin considerar slot específico
          lastIndex: 0
        }
      });
    }

    // console.log("📊 Tracking actual - lastIndex:", tracking.lastIndex);

    // 3. Verificar disponibilidad de empleados para este horario específico
    const date = new Date(appointmentDate);
    const timeSlot = date.toTimeString().slice(0, 5); // "09:00", "10:00", etc.
    const dayOfWeek = date.getDay();
    const appointmentDateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    // console.log("⏰ Verificando disponibilidad para:", { timeSlot, dayOfWeek, appointmentDateOnly });

    // 4. Encontrar el siguiente empleado disponible en el ciclo
    let assignedEmployee = null;
    let attempts = 0;
    const maxAttempts = availableEmployees.length; // Evitar bucle infinito

    while (!assignedEmployee && attempts < maxAttempts) {
      const nextIndex = (tracking.lastIndex + attempts) % availableEmployees.length;
      const candidateEmployee = availableEmployees[nextIndex];
      
      // console.log(`🔍 Intentando empleado ${candidateEmployee.name} (índice ${nextIndex})`);
      
      // Verificar si el candidato está disponible para este horario específico
      // 1. Verificar que tiene horario disponible
      const hasSchedule = await prisma.schedule.findFirst({
        where: {
          employeeId: candidateEmployee.id,
          serviceId: serviceId,
          dayOfWeek: dayOfWeek,
          startTime: { lte: timeSlot },
          endTime: { gt: timeSlot }
        }
      });

      // console.log(`📅 ${candidateEmployee.name} tiene horario:`, !!hasSchedule);

      if (hasSchedule) {
        // 2. Verificar que no tiene citas en ese horario específico
        const existingAppointment = await prisma.appointment.findFirst({
          where: {
            employeeId: candidateEmployee.id,
            date: appointmentDate, // Usar la fecha exacta, no el día completo
            status: {
              in: ["PENDING", "CONFIRMED"]
            }
          }
        });

        // console.log(`📋 ${candidateEmployee.name} tiene cita existente:`, !!existingAppointment);

        if (!existingAppointment) {
          assignedEmployee = candidateEmployee;
          // console.log(`✅ ${candidateEmployee.name} asignado!`);
        }
      }
      
      attempts++;
    }

    if (!assignedEmployee) {
      throw new Error("No hay empleados disponibles para este horario");
    }

    // 5. Actualizar el índice para la próxima reserva en este servicio
    await prisma.roundRobinTracking.update({
      where: { id: tracking.id },
      data: { lastIndex: tracking.lastIndex + 1 }
    });

    //console.log("🔄 Índice actualizado a:", tracking.lastIndex + 1);

    return assignedEmployee.id;
  } catch (error) {
    console.error("❌ Error en Round Robin:", error);
    throw error;
  }
}

// GET - Obtener todas las reservas (con filtros opcionales)
export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const session = verifyToken(token) as { id: number; email: string };
    if (!session?.id) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    // Obtener el usuario para saber su rol
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { role: true }
    });

    if (!user) {
      return new NextResponse("Usuario no encontrado", { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("serviceId");
    const employeeId = searchParams.get("employeeId");

    let where: any = {};

    if (user.role === 'EMPLEADO') {
      // Para empleados: solo sus propios appointments
      const employee = await prisma.employee.findFirst({
        where: { accountUserId: session.id },
        select: { id: true, userId: true }
      });

      if (!employee) {
        return NextResponse.json([]);
      }

      where.employeeId = employee.id;
      
      // Aplicar filtros adicionales si se proporcionan
      if (serviceId) where.serviceId = parseInt(serviceId);
    } else {
      // Para prestadores: appointments de su negocio
      where.OR = [
        { userId: session.id },
        { employee: { userId: session.id } }
      ];
      
      // Aplicar filtros adicionales si se proporcionan
      if (serviceId) where.serviceId = parseInt(serviceId);
      if (employeeId) where.employeeId = parseInt(employeeId);
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        service: true,
        employee: true,
        client: true
      },
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error al obtener reservas:", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}

// POST - Crear una nueva reserva
export async function POST(request: Request) {
  try {
    //console.log("🚀 POST /api/appointments iniciado");
    
    // Verificar autenticación
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const session = verifyToken(token) as { id: number; email: string };
    if (!session?.id) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    // Verificar acceso del trial
    const { hasAccess } = await verifyTrialAccess(session.id, 'create_appointments');
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Tu trial ha expirado. Actualiza tu plan para crear nuevas reservas.' },
        { status: 403 }
      );
    }
    
    const {
      serviceId,
      employeeId,
      clientName,
      clientPhone,
      clientEmail,
      appointmentDate,
      duration
    } = await request.json();

    //console.log("📝 Datos recibidos:", { serviceId, employeeId, clientName, appointmentDate });

    // Validaciones
    if (!serviceId || !clientName || !clientPhone || !clientEmail || !appointmentDate) {
      return new NextResponse("Todos los campos son requeridos", { status: 400 });
    }

    // Verificar que el servicio existe y está activo
    const service = await prisma.service.findFirst({
      where: {
        id: parseInt(serviceId),
        isActive: true,
        deleted: false
      }
    });

    if (!service) {
      return new NextResponse("Servicio no encontrado", { status: 404 });
    }

    // Asignar empleado usando Round Robin si no se proporciona
    let finalEmployeeId = employeeId;
    if (!employeeId) {
      //console.log("🎯 No se proporcionó employeeId, usando Round Robin");
      try {
        finalEmployeeId = await assignEmployeeRoundRobin(parseInt(serviceId), new Date(appointmentDate));
        //console.log("✅ Round Robin asignó empleado:", finalEmployeeId);
      } catch (error) {
        console.error("❌ Error en Round Robin:", error);
        return new NextResponse("No hay empleados disponibles para este horario", { status: 400 });
      }
    } else {
      //console.log("👤 Usando employeeId proporcionado:", employeeId);
    }

    // Verificar que el empleado existe y tiene asignado este servicio
    const employee = await prisma.employee.findFirst({
      where: {
        id: parseInt(finalEmployeeId),
        services: {
          some: {
            serviceId: parseInt(serviceId)
          }
        }
      }
    });

    if (!employee) {
      return new NextResponse("Empleado no encontrado o no asignado a este servicio", { status: 404 });
    }

    //console.log("👤 Empleado verificado:", employee.name);

    // Crear o encontrar el cliente
    let client = await prisma.client.findFirst({
      where: {
        OR: [
          { email: clientEmail },
          { phone: clientPhone }
        ]
      }
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          name: clientName,
          email: clientEmail,
          phone: clientPhone
        }
      });
      //console.log("👤 Cliente creado:", client.name);
    } else {
      // Actualizar datos del cliente si es necesario
      client = await prisma.client.update({
        where: { id: client.id },
        data: {
          name: clientName,
          email: clientEmail,
          phone: clientPhone
        }
      });
      //console.log("👤 Cliente actualizado:", client.name);
    }

    // Crear la reserva
    const appointment = await prisma.appointment.create({
      data: {
        date: new Date(appointmentDate),
        status: "PENDING",
        serviceId: parseInt(serviceId),
        userId: employee.userId, // El userId del empleado (que es el prestador)
        employeeId: parseInt(finalEmployeeId),
        clientId: client.id
      },
      include: {
        service: true,
        employee: true,
        client: true
      }
    });

    /*console.log("✅ Cita creada exitosamente:", {
      id: appointment.id,
      employee: appointment.employee?.name || "Sin empleado",
      service: appointment.service.name,
      date: appointment.date
    });*/

    // TODO: Aquí se enviaría el email de confirmación
    // Por ahora solo retornamos la reserva creada

    return NextResponse.json({
      success: true,
      appointment,
      message: "Reserva creada exitosamente"
    });

  } catch (error) {
    console.error("❌ Error al crear reserva:", error);
    return new NextResponse("Error interno del servidor", { status: 500 });
  }
} 