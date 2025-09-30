import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const token = (await cookies()).get('token')?.value;
    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const decoded = verifyToken(token) as { id: number; email: string } | null;
    if (!decoded) return NextResponse.json({ error: 'Token inválido' }, { status: 401 });

    // Obtener información del usuario para determinar su rol
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true }
    });

    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

    const { searchParams } = new URL(request.url);
    const lastSeen = searchParams.get('lastSeen');

    let whereClause: any = {};
    
    if (lastSeen) {
      // Contar citas creadas después de la última vez que el usuario vio las notificaciones
      whereClause.createdAt = {
        gte: new Date(parseInt(lastSeen))
      };
    } else {
      // Fallback: contar citas de las últimas 24 horas si no hay timestamp
      whereClause.createdAt = {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
      };
    }

    // Filtrar appointments según el rol del usuario
    if (user.role === 'EMPLEADO') {
      // Para empleados: contar appointments asignados a ellos
      const employee = await prisma.employee.findFirst({
        where: { accountUserId: user.id },
        select: { id: true }
      });

      if (!employee) {
        return NextResponse.json({ count: 0 });
      }

      whereClause.employeeId = employee.id;
    } else {
      // Para prestadores: contar appointments de su negocio (creados por ellos o asignados a sus empleados)
      whereClause.OR = [
        { userId: user.id },
        { employee: { userId: user.id } }
      ];
    }

    const unreadCount = await prisma.appointment.count({
      where: whereClause
    });

    return NextResponse.json({ count: unreadCount });
  } catch (error) {
    console.error('Error counting notifications:', error);
    return new NextResponse('Error interno', { status: 500 });
  }
}
