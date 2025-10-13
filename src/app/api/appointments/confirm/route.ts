import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { token, action } = await request.json();

    if (!token || !action) {
      return NextResponse.json(
        { error: 'Token y acción requeridos' },
        { status: 400 }
      );
    }

    if (!['confirm', 'cancel'].includes(action)) {
      return NextResponse.json(
        { error: 'Acción inválida. Debe ser "confirm" o "cancel"' },
        { status: 400 }
      );
    }

    console.log(`[Confirm] 🔍 Buscando turno con token: ${token.substring(0, 8)}...`);

    // Buscar appointment por token
    const appointment = await prisma.appointment.findFirst({
      where: {
        confirmationToken: token,
        confirmationTokenExpiry: { gte: new Date() }, // Token no expirado
        status: 'PENDING' // Solo si está pendiente
      },
      include: {
        client: true,
        service: true,
        employee: true,
        user: { select: { name: true } }
      }
    });

    if (!appointment) {
      console.log(`[Confirm] ❌ Token inválido o expirado`);
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 404 }
      );
    }

    // Actualizar estado según acción
    const newStatus = action === 'confirm' ? 'CONFIRMED' : 'CANCELLED';
    
    console.log(`[Confirm] 🔄 Actualizando turno #${appointment.id} a ${newStatus}`);

    const updated = await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        status: newStatus,
        confirmedByClient: action === 'confirm',
        confirmationMethod: 'email_link',
        confirmationToken: null, // Invalidar token
        confirmationTokenExpiry: null
      }
    });

    console.log(`[Confirm] ✅ Turno #${appointment.id} ${action === 'confirm' ? 'confirmado' : 'cancelado'} por cliente`);

    return NextResponse.json({
      success: true,
      appointment: {
        id: updated.id,
        status: updated.status,
        date: updated.date,
        service: appointment.service.name,
        employee: appointment.employee?.name || 'Sin asignar',
        businessName: appointment.user.name
      },
      message: action === 'confirm' 
        ? 'Turno confirmado exitosamente' 
        : 'Turno cancelado exitosamente'
    });

  } catch (error) {
    console.error('[Confirm] 💥 Error al procesar confirmación:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
