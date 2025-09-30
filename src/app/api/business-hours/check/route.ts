import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const decoded = verifyToken(token) as { id: number; email: string };
    if (!decoded?.id) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    // Verificar si existen horarios de negocio configurados
    const businessHours = await prisma.businessHours.findMany({
      where: { userId: decoded.id }
    });

    return NextResponse.json({ 
      hasBusinessHours: businessHours.length > 0,
      count: businessHours.length
    });
  } catch (error) {
    console.error("Error al verificar horarios de negocio:", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}
