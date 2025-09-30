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

    const appointments = await prisma.appointment.findMany({
      where: {
        userId: decoded.id,
        status: { in: ['CONFIRMED', 'COMPLETED'] }
      },
      include: { service: true }
    });
    const ingresosPorServicio: Record<string, number> = {};
    for (const appt of appointments) {
      if (!appt.service) continue;
      const nombre = appt.service.name;
      ingresosPorServicio[nombre] = (ingresosPorServicio[nombre] || 0) + appt.service.price;
    }
    return NextResponse.json(ingresosPorServicio);
  } catch (error) {
    return new NextResponse('Error interno', { status: 500 });
  }
}
