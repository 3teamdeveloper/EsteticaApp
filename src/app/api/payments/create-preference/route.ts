import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import api from "@/lib/apimp";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { planName } = body;

    // Intentar obtener el usuario autenticado (opcional para pruebas)
    let userId = 'guest';
    let userEmail = 'test@test.com';
    
    const token = (await cookies()).get('token')?.value;
    if (token) {
      try {
        const decoded = verifyToken(token) as { id: number; email: string };
        userId = decoded.id.toString();
        userEmail = decoded.email;
      } catch (error) {
        console.log('⚠️ Token inválido, continuando como invitado');
      }
    }

    console.log('🚀 Creando preferencia de pago para:', { 
      planName, 
      userId,
      email: userEmail 
    });

    // Crear la preferencia de pago
    const initPoint = await api.message.submit(planName || "Plan PRO");

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
