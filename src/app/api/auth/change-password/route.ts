import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const decoded = verifyToken(token) as { id: number; email: string } | null;
    if (!decoded?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const { currentPassword, newPassword } = await request.json();
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Contraseña actual y nueva son requeridas" }, { status: 400 });
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "La nueva contraseña debe tener al menos 8 caracteres" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || !user.password) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return NextResponse.json({ error: "La contraseña actual es incorrecta" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });

    return NextResponse.json({ message: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("Error cambiando contraseña:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
