import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { initializeTrial } from "@/lib/trial";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, username, phone, businessType, acceptTerms } = body;

    if (!email || !password || !name || !username) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Formato de email inválido" }, { status: 400 });
    }

    // Validar longitud de contraseña
    if (password.length < 8) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 });
    }

    // Validar formato del username
    const usernameRegex = /^[a-z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json({ error: "El nombre de usuario solo puede contener letras minúsculas, números, guiones y guiones bajos" }, { status: 400 });
    }

    if (username.length < 3) {
      return NextResponse.json({ error: "El nombre de usuario debe tener al menos 3 caracteres" }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email o username ya registrado" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const now = new Date();
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        username: username.toLowerCase(), // Asegurar minúsculas en BD
        phone: phone || null,
        businessType: businessType || null,
        termsAcceptedAt: acceptTerms ? now : null,
        onboardingCompleted: true,
      },
    });

    // Inicializar el trial de 14 días
    await initializeTrial(newUser.id);

    return NextResponse.json({
      message: "Usuario creado con éxito",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        username: newUser.username,
      },
    }, { status: 201 });

  } catch (error) {
    console.error("Error en registro:", error);
    return NextResponse.json({ 
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : "Error desconocido"
    }, { status: 500 });
  }
}
