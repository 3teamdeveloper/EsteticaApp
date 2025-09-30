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

    const totalConfirmados = await prisma.appointment.count({ where: { userId: decoded.id, status: 'CONFIRMED' } });
    const completados = await prisma.appointment.count({ where: { userId: decoded.id, status: 'COMPLETED' } });
    const tasa = totalConfirmados > 0 ? (completados / totalConfirmados) * 100 : 0;
    return NextResponse.json({ totalConfirmados, completados, tasa: Math.round(tasa * 100) / 100 });
  } catch (error) {
    return new NextResponse('Error interno', { status: 500 });
  }
}
