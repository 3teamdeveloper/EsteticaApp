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
      where: { userId: decoded.id },
      select: { date: true, createdAt: true }
    });
    if (appointments.length === 0) return NextResponse.json({ promedioDias: 0 });
    let sumaDias = 0;
    for (const appt of appointments) {
      const fechaReserva = new Date(appt.createdAt);
      const fechaTurno = new Date(appt.date);
      const diff = (fechaTurno.getTime() - fechaReserva.getTime()) / (1000 * 60 * 60 * 24);
      sumaDias += diff;
    }
    const promedioDias = sumaDias / appointments.length;
    return NextResponse.json({ promedioDias: Math.round(promedioDias * 100) / 100 });
  } catch (error) {
    return new NextResponse('Error interno', { status: 500 });
  }
}
