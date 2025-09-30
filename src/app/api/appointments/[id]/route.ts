import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    if (!id) return new NextResponse('ID inválido', { status: 400 });
    const { status } = await request.json();
    if (!status) return new NextResponse('Status requerido', { status: 400 });

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json({ success: true, appointment: updated });
  } catch (error) {
    return new NextResponse('Error al actualizar el turno', { status: 500 });
  }
}
