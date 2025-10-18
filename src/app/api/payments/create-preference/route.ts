import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import api from "@/lib/apimp";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { planName } = body;

    // REQUERIR sesión válida (NO permitir guest)
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

    const userId = decoded.id.toString();
    const userEmail = decoded.email;

    console.log('🚀 Creando preferencia de pago para:', { 
      planName, 
      userId,
      email: userEmail 
    });

    // Crear la preferencia de pago (pasar userId para el webhook)
    const initPoint = await api.message.submit(planName || "Plan PRO", userId);

    console.log('✅ Preferencia creada, init_point:', initPoint);

    return NextResponse.json({ 
      success: true, 
      initPoint 
    });
  } catch (error: any) {
    console.error('❌ Error creando preferencia:', error);
    console.error('❌ Detalles del error:', {
      message: error?.message,
      cause: error?.cause,
      stack: error?.stack
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al crear preferencia de pago',
        details: error?.message || 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
