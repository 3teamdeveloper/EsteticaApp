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

    // Buscar todos los clientes con al menos una cita para este userId
    const clientes = await prisma.client.findMany({
      where: {
        appointments: {
          some: { userId: decoded.id }
        }
      },
      include: {
        appointments: {
          where: { userId: decoded.id },
          select: { id: true }
        }
      }
    });
    let nuevos = 0, recurrentes = 0;
    for (const c of clientes) {
      if (c.appointments.length === 1) nuevos++;
      else if (c.appointments.length > 1) recurrentes++;
    }
    return NextResponse.json({ nuevos, recurrentes });
  } catch (error) {
    return new NextResponse('Error interno', { status: 500 });
  }
}
