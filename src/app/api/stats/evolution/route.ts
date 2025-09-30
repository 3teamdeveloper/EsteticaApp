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

    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    const appointments = await prisma.appointment.findMany({
      where: {
        userId: decoded.id,
        date: { gte: oneYearAgo, lte: now }
      },
      select: { date: true }
    });
    // Por semana (ISO week)
    const porSemana: Record<string, number> = {};
    // Por mes
    const porMes: Record<string, number> = {};
    for (const appt of appointments) {
      const d = new Date(appt.date);
      // Semana ISO: año + semana
      const year = d.getFullYear();
      const week = getISOWeek(d);
      const keySemana = `${year}-W${week}`;
      porSemana[keySemana] = (porSemana[keySemana] || 0) + 1;
      // Mes: año-mes
      const keyMes = `${year}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      porMes[keyMes] = (porMes[keyMes] || 0) + 1;
    }
    return NextResponse.json({ porSemana, porMes });
  } catch (error) {
    return new NextResponse('Error interno', { status: 500 });
  }
}

// Función para obtener el número de semana ISO
function getISOWeek(date: Date) {
  const tmp = new Date(date.getTime());
  tmp.setHours(0, 0, 0, 0);
  // Jueves en la semana decide el año
  tmp.setDate(tmp.getDate() + 3 - ((tmp.getDay() + 6) % 7));
  const week1 = new Date(tmp.getFullYear(), 0, 4);
  return 1 + Math.round(((tmp.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}
