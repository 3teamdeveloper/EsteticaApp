import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Obtener el token de las cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar el token
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

    // Calcular fecha de hace 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let totalServices, activeServices, totalEmployees, monthlyAppointments;

    if (user.role === 'EMPLEADO') {
      // Para empleados: mostrar solo sus servicios asignados y estadísticas relacionadas
      const employee = await prisma.employee.findFirst({
        where: { accountUserId: userId },
        select: { id: true, userId: true }
      });

      if (!employee) {
        return NextResponse.json({
          totalServices: 0,
          activeServices: 0,
          totalEmployees: 0,
          monthlyAppointments: 0
        });
      }

      // Ejecutar consultas para empleado
      [totalServices, activeServices, totalEmployees, monthlyAppointments] = await Promise.all([
        // Servicios asignados al empleado
        prisma.employeeService.count({
          where: {
            employeeId: employee.id,
            service: { deleted: false }
          }
        }),
        
        // Servicios activos asignados al empleado
        prisma.employeeService.count({
          where: {
            employeeId: employee.id,
            service: { 
              isActive: true,
              deleted: false 
            }
          }
        }),
        
        // Total de empleados del mismo prestador (incluyéndose)
        prisma.employee.count({
          where: {
            userId: employee.userId
          }
        }),
        
        // Citas del empleado en los últimos 30 días
        prisma.appointment.count({
          where: {
            employeeId: employee.id,
            date: {
              gte: thirtyDaysAgo
            }
          }
        })
      ]);
    } else {
      // Para prestadores: mostrar estadísticas completas del negocio
      [totalServices, activeServices, totalEmployees, monthlyAppointments] = await Promise.all([
        // Total de servicios (no eliminados)
        prisma.service.count({
          where: {
            userId: userId,
            deleted: false
          }
        }),
        
        // Servicios activos
        prisma.service.count({
          where: {
            userId: userId,
            isActive: true,
            deleted: false
          }
        }),
        
        // Total de empleados
        prisma.employee.count({
          where: {
            userId: userId
          }
        }),
        
        // Citas de los últimos 30 días (del prestador y sus empleados)
        prisma.appointment.count({
          where: {
            OR: [
              { userId: userId },
              { employee: { userId: userId } }
            ],
            date: {
              gte: thirtyDaysAgo
            }
          }
        })
      ]);
    }

    return NextResponse.json({
      totalServices,
      activeServices,
      totalEmployees,
      monthlyAppointments
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}
