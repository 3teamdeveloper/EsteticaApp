import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const decodedToken = verifyToken(token);
    
    if (!decodedToken || typeof decodedToken === 'string') {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    const userId = decodedToken.id;

    // Obtener el usuario para saber su rol
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Calcular inicio y fin del día actual
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    let appointments;

    if (user.role === 'EMPLEADO') {
      // Para empleados: mostrar solo sus turnos asignados
      const employee = await prisma.employee.findFirst({
        where: { accountUserId: userId },
        select: { id: true }
      });

      if (!employee) {
        return NextResponse.json({ appointments: [] });
      }

      appointments = await prisma.appointment.findMany({
        where: {
          employeeId: employee.id,
          date: {
            gte: startOfDay,
            lte: endOfDay
          },
          status: {
            in: ['PENDING', 'CONFIRMED'] // Solo mostrar pendientes y confirmados
          }
        },
        select: {
          id: true,
          date: true,
          status: true,
          client: {
            select: {
              name: true
            }
          },
          service: {
            select: {
              name: true
            }
          },
          employee: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          date: 'asc'
        },
        take: 10 // Limitar a 10 turnos
      });
    } else {
      // Para prestadores: mostrar todos los turnos del negocio
      appointments = await prisma.appointment.findMany({
        where: {
          OR: [
            { userId: userId },
            { employee: { userId: userId } }
          ],
          date: {
            gte: startOfDay,
            lte: endOfDay
          },
          status: {
            in: ['PENDING', 'CONFIRMED']
          }
        },
        select: {
          id: true,
          date: true,
          status: true,
          client: {
            select: {
              name: true
            }
          },
          service: {
            select: {
              name: true
            }
          },
          employee: {
            select: {
              name: true
            }
          }
        },
        orderBy: {
          date: 'asc'
        },
        take: 10
      });
    }

    // Formatear los datos
    const formattedAppointments = appointments.map(apt => ({
      id: apt.id,
      date: apt.date.toISOString(),
      status: apt.status,
      clientName: apt.client?.name || 'Sin cliente',
      serviceName: apt.service.name,
      employeeName: apt.employee?.name
    }));

    return NextResponse.json({
      appointments: formattedAppointments
    });

  } catch (error) {
    console.error('Error fetching today appointments:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
