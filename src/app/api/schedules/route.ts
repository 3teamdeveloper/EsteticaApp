import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

// GET - Obtener todos los horarios del usuario
export async function GET() {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const decoded = verifyToken(token) as { id: number; email: string };
    
    // Obtener el usuario para saber su rol
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { role: true }
    });

    if (!user) {
      return new NextResponse("Usuario no encontrado", { status: 404 });
    }

    let schedules;

    if (user.role === 'EMPLEADO') {
      // Si es empleado, buscar horarios donde él es el empleado
      schedules = await prisma.schedule.findMany({
        where: {
          employee: {
            accountUserId: decoded.id // Buscar por la cuenta del empleado
          }
        },
        include: {
          service: {
            select: {
              id: true,
              name: true,
              duration: true,
            }
          },
          employee: {
            select: {
              id: true,
              name: true,
            }
          },
        },
        orderBy: [
          { dayOfWeek: 'asc' },
          { startTime: 'asc' },
        ],
      });
    } else {
      // Si es prestador, buscar horarios de su negocio
      schedules = await prisma.schedule.findMany({
        where: {
          userId: decoded.id,
        },
        include: {
          service: {
            select: {
              id: true,
              name: true,
              duration: true,
            }
          },
          employee: {
            select: {
              id: true,
              name: true,
            }
          },
        },
        orderBy: [
          { dayOfWeek: 'asc' },
          { startTime: 'asc' },
        ],
      });
    }

    return NextResponse.json(schedules);
  } catch (error) {
    console.error("Error al obtener horarios:", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}
