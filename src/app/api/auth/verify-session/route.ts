import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET() {
  try {
    const token = (await cookies()).get('token')?.value;
    
    if (!token) {
      return new NextResponse('No autorizado', { status: 401 });
    }

    // Verificar el JWT token correctamente
    let decoded;
    try {
      decoded = verifyToken(token) as { id: number; email: string };
    } catch (error) {
      return new NextResponse('Token inválido', { status: 401 });
    }

    // Buscar el usuario por ID del token decodificado
    const user = await prisma.user.findUnique({
      where: {
        id: decoded.id
      },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        username: true,
        businessType: true
      }
    });

    if (!user) {
      return new NextResponse('Usuario no encontrado', { status: 401 });
    }
    
    // Devolver datos de sesión
    return NextResponse.json({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      username: user.username,
      businessType: user.businessType,
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 días
    });
  } catch (error) {
    console.error('Error verificando sesión:', error);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}