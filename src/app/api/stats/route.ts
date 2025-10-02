import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma"
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  try {
    const token = (await cookies()).get('token')?.value;
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const decoded = verifyToken(token) as { id: number; email: string } | null;
    if (!decoded) return NextResponse.json({ error: 'Token inválido' }, { status: 401 });

    // Obtener el usuario para saber su rol
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    let appointmentFilter;
    let serviceFilter;
    let employeeFilter;

    if (user.role === 'EMPLEADO') {
      // Para empleados: solo sus propios appointments
      const employee = await prisma.employee.findFirst({
        where: { accountUserId: decoded.id },
        select: { id: true, userId: true }
      });

      if (!employee) {
        return NextResponse.json({
          totalAppointments: 0,
          confirmedAppointments: 0,
          pendingAppointments: 0,
          estimatedRevenue: 0,
          topServices: [],
          appointmentsByEmployee: []
        });
      }

      appointmentFilter = {
        date: { gte: startOfMonth, lte: endOfMonth },
        employeeId: employee.id
      };

      serviceFilter = {
        employees: {
          some: { employeeId: employee.id }
        }
      };

      employeeFilter = {
        userId: employee.userId
      };
    } else {
      // Para prestadores: appointments del negocio completo
      appointmentFilter = {
        date: { gte: startOfMonth, lte: endOfMonth },
        OR: [
          { userId: decoded.id },
          { employee: { userId: decoded.id } }
        ]
      };

      serviceFilter = {
        userId: decoded.id
      };

      employeeFilter = {
        userId: decoded.id
      };
    }

    // Estadísticas básicas
    const [totalAppointments, confirmedAppointments, pendingAppointments] = await Promise.all([
      prisma.appointment.count({
        where: appointmentFilter
      }),
      prisma.appointment.count({
        where: {
          ...appointmentFilter,
          status: 'CONFIRMED'
        }
      }),
      prisma.appointment.count({
        where: {
          ...appointmentFilter,
          status: 'PENDING'
        }
      })
    ]);

    // Servicios más populares
    const topServices = await prisma.appointment.groupBy({
      by: ['serviceId'],
      where: appointmentFilter,
      _count: {
        serviceId: true
      },
      orderBy: {
        _count: {
          serviceId: 'desc'
        }
      },
      take: 5
    });

    // Obtener nombres de servicios
    const serviceIds = topServices.map((s: any) => s.serviceId);
    const services = await prisma.service.findMany({
      where: { 
        id: { in: serviceIds },
        ...serviceFilter
      }
    });

    const topServicesWithNames = topServices.map((ts: any) => {
      const service = services.find((s: any) => s.id === ts.serviceId);
      return {
        name: service?.name || 'Servicio desconocido',
        count: ts._count.serviceId
      };
    });

    // Turnos por empleado
    const appointmentsByEmployee = await prisma.appointment.groupBy({
      by: ['employeeId'],
      where: appointmentFilter,
      _count: {
        employeeId: true
      }
    });

    const employeeIds = appointmentsByEmployee
      .map((a: any) => a.employeeId)
      .filter((id): id is number => id !== null);

    const employees = await prisma.employee.findMany({
      where: { 
        id: { in: employeeIds },
        ...employeeFilter
      }
    });

    const appointmentsByEmployeeWithNames = appointmentsByEmployee.map((ae: any) => {
      const employee = employees.find((e: any) => e.id === ae.employeeId);
      return {
        name: employee?.name || 'Empleado desconocido',
        count: ae._count.employeeId
      };
    });

    // Calcular ingresos estimados (suma de precios de servicios confirmados)
    const confirmedAppointmentsWithPrices = await prisma.appointment.findMany({
      where: {
        ...appointmentFilter,
        status: 'CONFIRMED'
      },
      include: {
        service: true
      }
    });

    const estimatedRevenue = confirmedAppointmentsWithPrices.reduce(
      (sum: number, appointment: any) => sum + appointment.service.price, 
      0
    );

    return NextResponse.json({
      totalAppointments,
      confirmedAppointments,
      pendingAppointments,
      estimatedRevenue: Math.round(estimatedRevenue),
      topServices: topServicesWithNames,
      appointmentsByEmployee: appointmentsByEmployeeWithNames
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return new NextResponse('Error interno', { status: 500 });
  }
}