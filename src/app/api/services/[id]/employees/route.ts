import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - Obtener empleados disponibles para un servicio específico
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const serviceId = parseInt(id);

    // Calcular rango de fechas (hoy a 8 semanas)
    const now = new Date();
    const end = new Date();
    end.setDate(now.getDate() + 56); // 8 semanas

    //console.log('Buscando empleados para servicio:', serviceId);
    //console.log('Rango de fechas:', now.toISOString(), 'a', end.toISOString());

    // Obtener empleados que tienen asignado este servicio
    const employees = await prisma.employee.findMany({
      where: {
        services: {
          some: {
            serviceId: serviceId
          }
        }
      },
      include: {
        services: {
          where: {
            serviceId: serviceId
          },
          include: {
            service: true
          }
        },
        schedules: {
          where: {
            serviceId: serviceId
          },
          orderBy: [
            { dayOfWeek: 'asc' },
            { startTime: 'asc' }
          ]
        }
      }
    });

    //console.log('Empleados encontrados:', employees.length);

            // Para cada empleado, obtener sus reservas por separado (PENDING, CONFIRMED, COMPLETED)
    const employeesWithAppointments = await Promise.all(
      employees.map(async (employee) => {
        const appointments = await prisma.appointment.findMany({
          where: {
            employeeId: employee.id,
            date: {
              gte: now,
              lte: end
            },
            status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] }
          },
          select: {
            id: true,
            date: true,
            status: true
          }
        });
        //console.log(`Empleado ${employee.name} (${employee.id}) appointments:`, appointments);

        //console.log(`Empleado ${employee.name}: ${appointments.length} reservas`);

        return {
          id: employee.id,
          name: employee.name,
          email: employee.email,
          phone: employee.phone,
          employeeImage: employee.employeeImage,
          service: employee.services[0]?.service || null,
          schedules: employee.schedules,
          appointments: appointments
        };
      })
    );

    return NextResponse.json(employeesWithAppointments);
  } catch (error) {
    console.error("Error al obtener empleados del servicio:", error);
    return new NextResponse("Error interno", { status: 500 });
  }
} 