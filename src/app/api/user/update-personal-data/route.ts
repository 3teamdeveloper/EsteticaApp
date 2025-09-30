import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function PUT(request: Request) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const decoded = verifyToken(token) as { id: number; email: string } | null;
    if (!decoded?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { name, username } = await request.json();

    // Validate required fields
    if (!name?.trim() || !username?.trim()) {
      return NextResponse.json({ error: "Nombre y nombre de usuario son requeridos" }, { status: 400 });
    }

    // Validate username format
    const usernameRegex = /^[a-z0-9_-]+$/;
    if (!usernameRegex.test(username.trim())) {
      return NextResponse.json({ 
        error: "El nombre de usuario solo puede contener letras minúsculas, números, guiones y guiones bajos" 
      }, { status: 400 });
    }

    if (username.trim().length < 3) {
      return NextResponse.json({ 
        error: "El nombre de usuario debe tener al menos 3 caracteres" 
      }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Check if username is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        username: username.trim().toLowerCase(),
        id: { not: decoded.id } // Exclude current user
      }
    });

    if (existingUser) {
      return NextResponse.json({ 
        error: "Este nombre de usuario ya está en uso" 
      }, { status: 400 });
    }

    // Update user data
    const updatedUser = await prisma.user.update({
      where: { id: decoded.id },
      data: {
        name: name.trim(),
        username: username.trim().toLowerCase()
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true
      }
    });

    return NextResponse.json({ 
      message: "Datos actualizados correctamente",
      user: updatedUser
    });

  } catch (error) {
    console.error("Error actualizando datos personales:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
