import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const token = (await cookies()).get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: number; email: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        businessPhone: true,
        businessAddress: true,
        businessCity: true,
        businessState: true,
        businessDescription: true,
        businessWebsite: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('[BusinessInfo] Error al obtener info:', error);
    return NextResponse.json(
      { error: 'Error al obtener información del negocio' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const token = (await cookies()).get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: number; email: string };

    const body = await request.json();
    const {
      businessPhone,
      businessAddress,
      businessCity,
      businessState,
      businessDescription,
      businessWebsite,
    } = body;

    // Validaciones básicas
    if (businessPhone && !/^[\d\s\+\-\(\)]+$/.test(businessPhone)) {
      return NextResponse.json(
        { error: 'Formato de teléfono inválido' },
        { status: 400 }
      );
    }

    if (businessWebsite && !businessWebsite.startsWith('http')) {
      return NextResponse.json(
        { error: 'La URL del sitio web debe comenzar con http:// o https://' },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: decoded.id },
      data: {
        businessPhone,
        businessAddress,
        businessCity,
        businessState,
        businessDescription,
        businessWebsite,
      },
      select: {
        businessPhone: true,
        businessAddress: true,
        businessCity: true,
        businessState: true,
        businessDescription: true,
        businessWebsite: true,
      }
    });

    console.log(`[BusinessInfo] ✅ Info actualizada para usuario #${decoded.id}`);

    return NextResponse.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('[BusinessInfo] Error al actualizar info:', error);
    return NextResponse.json(
      { error: 'Error al actualizar información del negocio' },
      { status: 500 }
    );
  }
}
