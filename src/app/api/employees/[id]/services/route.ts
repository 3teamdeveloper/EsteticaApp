import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

type PrismaTransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

// Función para obtener horarios de negocio desde la base de datos
async function getBusinessHoursFromDatabase(userId: number) {
  try {
    const businessHours = await prisma.businessHours.findMany({
      where: { userId },
      orderBy: { dayOfWeek: 'asc' }
    });

    // Si no hay horarios configurados, usar horarios por defecto
    if (businessHours.length === 0) {
      return {
        0: [], // Domingo
        1: [{ startTime: "09:00", endTime: "17:00" }], // Lunes
        2: [{ startTime: "09:00", endTime: "17:00" }], // Martes
        3: [{ startTime: "09:00", endTime: "17:00" }], // Miércoles
        4: [{ startTime: "09:00", endTime: "17:00" }], // Jueves
        5: [{ startTime: "09:00", endTime: "17:00" }], // Viernes
        6: [] // Sábado
      };
    }

    // Convertir a formato esperado
    const formattedHours: Record<number, Array<{ startTime: string; endTime: string }>> = {};
    
    // Inicializar todos los días
    for (let day = 0; day < 7; day++) {
      formattedHours[day] = [];
    }

    // Agrupar por día
    businessHours.forEach(({ dayOfWeek, startTime, endTime }: { dayOfWeek: number; startTime: string; endTime: string }) => {
      formattedHours[dayOfWeek].push({
        startTime,
        endTime
      });
    });

    return formattedHours;
  } catch (error) {
    console.error('Error al obtener horarios de negocio desde DB:', error);
    return null;
  }
}

// Función para copiar horarios de negocio a la base de datos
async function copyBusinessHoursToDatabase(employeeId: number, serviceId: number) {
  try {
    // Obtener el empleado para acceder al userId del prestador
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: { userId: true }
    });

    if (!employee) {
      console.error('Empleado no encontrado');
      return;
    }

    // Obtener horarios de negocio del prestador desde la base de datos
    const businessHours = await getBusinessHoursFromDatabase(employee.userId);
    if (!businessHours) {
      console.error('No se pudieron obtener los horarios de negocio');
      return;
    }

    // Crear horarios para cada día de la semana
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
      const dayHours = businessHours[dayOfWeek];
      
      if (dayHours && dayHours.length > 0) {
        for (const period of dayHours as Array<{ startTime: string; endTime: string }>) {
          await prisma.schedule.create({
            data: {
              employeeId: employeeId,
              serviceId: serviceId,
              dayOfWeek: dayOfWeek,
              startTime: period.startTime,
              endTime: period.endTime,
              userId: employee.userId
            }
          });
        }
      }
    }

    //console.log(`Horarios copiados exitosamente para empleado ${employeeId} y servicio ${serviceId}`);
  } catch (error) {
    console.error('Error al copiar horarios a la base de datos:', error);
  }
}

// Función para eliminar horarios de un empleado y servicio específico
async function deleteBusinessHoursFromDatabase(employeeId: number, serviceId: number) {
  try {
    await prisma.schedule.deleteMany({
      where: {
        employeeId: employeeId,
        serviceId: serviceId
      }
    });
    
    //console.log(`Horarios eliminados para empleado ${employeeId} y servicio ${serviceId}`);
  } catch (error) {
    console.error('Error al eliminar horarios:', error);
  }
}

// GET /api/employees/[id]/services
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const decoded = verifyToken(token) as { id: number; email: string };
    if (!decoded?.id) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    // Obtener el usuario para saber su rol
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { role: true }
    });

    let employee;
    if (user?.role === 'EMPLEADO') {
      // El empleado puede ver solo su propio registro
      employee = await prisma.employee.findUnique({
        where: { id: parseInt(id) },
        include: {
          services: { include: { service: true } }
        }
      });
    } else {
      // El prestador puede ver solo empleados de su negocio
      employee = await prisma.employee.findFirst({
        where: { id: parseInt(id), userId: decoded.id },
        include: {
          services: { include: { service: true } }
        }
      });
    }

    //console.log('employee:', JSON.stringify(employee, null, 2));
    if (!employee) {
      return new NextResponse("Empleado no encontrado", { status: 404 });
    }

    const servicios = employee.services.map(es => es.service);
    //console.log('servicios:', JSON.stringify(servicios, null, 2));
    return NextResponse.json(servicios);
  } catch (error) {
    console.error("Error al obtener servicios del empleado:", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}

// POST /api/employees/[id]/services
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const decoded = verifyToken(token) as { id: number; email: string };
    if (!decoded?.id) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const body = await request.json();
    if (!body || !body.serviceId) {
      return new NextResponse("ID de servicio requerido", { status: 400 });
    }

    const { serviceId } = body;

    // Verificar que el empleado existe y pertenece al usuario
    const employee = await prisma.employee.findFirst({
      where: {
        id: parseInt(id),
        userId: decoded.id
      }
    });

    if (!employee) {
      return new NextResponse("Empleado no encontrado", { status: 404 });
    }

    // Verificar que el servicio existe y pertenece al usuario
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        userId: decoded.id
      }
    });

    if (!service) {
      return new NextResponse("Servicio no encontrado", { status: 404 });
    }

    // Verificar si la relación ya existe
    const existingRelation = await prisma.employeeService.findFirst({
      where: {
        employeeId: parseInt(id),
        serviceId: serviceId
      }
    });

    if (existingRelation) {
      return new NextResponse("El servicio ya está asignado a este empleado", { status: 400 });
    }

    // Usar transacción para crear la relación y copiar horarios
    await prisma.$transaction(async (tx: PrismaTransactionClient) => {
      // Crear la relación
      await tx.employeeService.create({
        data: {
          employeeId: parseInt(id),
          serviceId: serviceId,
          createdAt: new Date()
        }
      });

      // Copiar horarios de negocio
      await copyBusinessHoursToDatabase(parseInt(id), serviceId);
    });

    return new NextResponse(null, { status: 201 });
  } catch (error) {
    console.error("Error al asignar servicio al empleado:", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}

// DELETE /api/employees/[id]/services
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const decoded = verifyToken(token) as { id: number; email: string };
    if (!decoded?.id) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const body = await request.json();
    if (!body || !body.serviceId) {
      return new NextResponse("ID de servicio requerido", { status: 400 });
    }

    const { serviceId } = body;

    // Verificar que la relación existe
    const relation = await prisma.employeeService.findFirst({
      where: {
        employeeId: parseInt(id),
        serviceId: serviceId
      }
    });

    if (!relation) {
      return new NextResponse("El servicio no está asignado a este empleado", { status: 404 });
    }

    // Usar transacción para eliminar la relación y los horarios
    await prisma.$transaction(async (tx: PrismaTransactionClient) => {
      // Eliminar horarios primero
      await deleteBusinessHoursFromDatabase(parseInt(id), serviceId);
      
      // Eliminar la relación
      await tx.employeeService.delete({
        where: {
          id: relation.id
        }
      });
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error al desasignar servicio del empleado:", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}