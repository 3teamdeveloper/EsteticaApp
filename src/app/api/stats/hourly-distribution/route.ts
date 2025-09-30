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
      select: { date: true }
    });
    const horas: Record<string, number> = {};
    for (let h = 0; h < 24; h++) horas[h] = 0;
    for (const appt of appointments) {
      const hour = new Date(appt.date).getHours();
      horas[hour]++;
    }
    return NextResponse.json(horas);
  } catch (error) {
    return new NextResponse('Error interno', { status: 500 });
  }
}
