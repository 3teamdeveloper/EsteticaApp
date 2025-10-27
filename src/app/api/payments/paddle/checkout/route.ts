import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import paddleApi from '@/lib/paddle';

/**
 * POST /api/payments/paddle/checkout
 * 
 * Crea una sesión de checkout en Paddle para pagos internacionales
 * Similar al endpoint de MercadoPago pero para clientes fuera de Argentina
 */
export async function POST(request: Request) {
  try {
    // 1. Verificar autenticación
    const token = (await cookies()).get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Debes iniciar sesión para contratar un plan',
          requiresAuth: true 
        },
        { status: 401 }
      );
    }

    let decoded;
    try {
      decoded = verifyToken(token) as { id: number; email: string };
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Sesión inválida. Por favor inicia sesión nuevamente.',
          requiresAuth: true 
        },
        { status: 401 }
      );
    }

    const userId = decoded.id;

    // 2. Obtener datos del request
    const body = await request.json();
    const { planType = 'pro', billingType = 'monthly' } = body;

    // Validar planType
    if (!['pro', 'enterprise'].includes(planType)) {
      return NextResponse.json(
        { success: false, error: 'Plan inválido' },
        { status: 400 }
      );
    }

    // Validar billingType
    if (!['monthly', 'yearly'].includes(billingType)) {
      return NextResponse.json(
        { success: false, error: 'Tipo de facturación inválido' },
        { status: 400 }
      );
    }

    // 3. Obtener datos del usuario (email necesario)
    const { prisma } = await import('@/lib/db');
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    console.log('🏗️ Creando checkout de Paddle:', {
      userId,
      userEmail: user.email,
      planType,
      billingType
    });

    // 4. Crear checkout session en Paddle
    const checkoutUrl = await paddleApi.checkout.create({
      userId: userId.toString(),
      userEmail: user.email,
      planType: planType as 'pro' | 'enterprise',
      billingType: billingType as 'monthly' | 'yearly',
    });

    console.log('✅ Checkout de Paddle creado exitosamente');

    return NextResponse.json({
      success: true,
      checkoutUrl,
      provider: 'paddle'
    });

  } catch (error: any) {
    console.error('❌ Error creando checkout de Paddle:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error?.message || 'Error al crear checkout de Paddle' 
      },
      { status: 500 }
    );
  }
}
