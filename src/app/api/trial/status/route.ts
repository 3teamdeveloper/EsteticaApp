import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { getUserTrialStatus } from '@/lib/trial';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Obtener el token de las cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar el token
    const decodedToken = verifyToken(token);
    
    if (!decodedToken || typeof decodedToken === 'string') {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Obtener usuario con campos de suscripción
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.id },
      select: {
        trialStartDate: true,
        trialEndDate: true,
        isTrialActive: true,
        trialExpirationNotified: true,
        subscriptionStatus: true,
        subscriptionPlan: true,
        subscriptionBilling: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Obtener el estado del trial
    const trialStatus = await getUserTrialStatus(decodedToken.id);

    return NextResponse.json({
      ...trialStatus,
      subscriptionStatus: user.subscriptionStatus || 'trial',
      subscriptionPlan: user.subscriptionPlan || 'free',
      subscriptionBilling: user.subscriptionBilling || 'monthly',
    });
  } catch (error) {
    console.error('Error al obtener estado del trial:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
