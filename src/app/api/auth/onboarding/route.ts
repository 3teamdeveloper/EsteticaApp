import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const decoded: any = verifyToken(token);
    if (!decoded?.id) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    const body = await request.json();
    const { phone, businessType, acceptTerms } = body;

    if (!businessType) {
      return NextResponse.json({ error: 'businessType es requerido' }, { status: 400 });
    }

    const updateData: any = {
      phone: phone || null,
      businessType,
      onboardingCompleted: true,
    };

    if (acceptTerms) {
      updateData.termsAcceptedAt = new Date();
    }

    const user = await prisma.user.update({
      where: { id: decoded.id },
      data: updateData,
      select: { id: true, email: true, name: true, username: true, onboardingCompleted: true }
    });

    return NextResponse.json({ message: 'Onboarding completado', user });
  } catch (error) {
    console.error('Error onboarding:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}


