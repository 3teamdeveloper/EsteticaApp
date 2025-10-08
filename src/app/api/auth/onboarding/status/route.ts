import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    if (!decoded?.id) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        onboardingCompleted: true,
        phone: true,
        businessType: true,
        termsAcceptedAt: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const needsOnboarding = !user.onboardingCompleted || !user.phone || !user.businessType || !user.termsAcceptedAt;

    return NextResponse.json({ needsOnboarding, user });
  } catch (error) {
    console.error('Error verificando onboarding:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
