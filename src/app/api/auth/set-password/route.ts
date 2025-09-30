import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token y contraseña requeridos' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 });
    }

    // Buscar usuario por token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetTokenExpiry: { gte: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 400 });
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Actualizar usuario: guardar contraseña y eliminar token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetTokenExpiry: null,
      },
    });

    return NextResponse.json({ message: 'Contraseña establecida correctamente' });
  } catch (error) {
    console.error('Error en set-password:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
} 