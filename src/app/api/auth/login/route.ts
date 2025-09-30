// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { generateToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    // Generar JWT
    const token = generateToken({ id: user.id, email: user.email });

    // Crear la respuesta
    const response = NextResponse.json(
      { 
        message: 'Login exitoso', 
        user: { id: user.id, email: user.email, name: user.name, username: user.username, businessType: user.businessType }
      }
    );

    // Establecer la cookie en la respuesta
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 días
      path: '/',
      sameSite: 'lax'
    });

    // También configurar una cookie no-httpOnly para que el frontend pueda leer la sesión
    const sessionData = {
      userId: user.id,
      email: user.email,
      role: user.role || 'user',
      name: user.name,
      username: user.username,
      businessType: user.businessType,
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000)
    };

    response.cookies.set({
      name: 'userSession',
      value: JSON.stringify(sessionData),
      httpOnly: false, // Permitir acceso desde JavaScript
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      sameSite: 'lax',
    });

    return response;

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
