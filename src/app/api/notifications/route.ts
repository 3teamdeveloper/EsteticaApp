import { NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';
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
    const range = (searchParams.get('range') || '7d').toLowerCase();

    const now = new Date();
    let createdAtFilter: Record<string, Date> | undefined;
    if (range === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      createdAtFilter = { gte: startOfDay };
    } else if (range === '7d') {
      createdAtFilter = { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
    } else {
      // 'all' u otro valor: sin filtro de fecha
      createdAtFilter = undefined;
    }

    // Construir filtros según el rol del usuario
    let whereClause: any = {
      ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
    };

    if (user.role === 'EMPLEADO') {
      // Para empleados: mostrar appointments asignados a ellos
      const employee = await prisma.employee.findFirst({
        where: { accountUserId: user.id },
        select: { id: true }
      });

      if (!employee) {
        return NextResponse.json([]);
      }

      whereClause.employeeId = employee.id;
    } else {
      // Para prestadores: mostrar appointments de su negocio
      whereClause.OR = [
        { userId: user.id },
        { employee: { userId: user.id } }
      ];
    }

    const notifications = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        client: true,
        service: true,
        employee: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });
    

    const formattedNotifications = notifications.map((appointment: any) => ({
      id: appointment.id,
      subject: `Nuevo turno - ${appointment.client?.name || 'Cliente'}`,
      time: appointment.createdAt.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      read: false,
      appointment,
      createdAt: appointment.createdAt
    }));

    return NextResponse.json(formattedNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return new NextResponse('Error interno', { status: 500 });
  }
}