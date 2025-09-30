import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

// PUT - Actualizar horario
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; scheduleId: string }> }
) {
  try {
    const { id, scheduleId } = await params;
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const decoded = verifyToken(token) as { id: number; email: string };
    const { dayOfWeek, period, startTime, endTime, serviceId } = await request.json();

    // Validaciones
    if (period < 1 || period > 2) {
      return new NextResponse("Período inválido (debe ser 1 o 2)", { status: 400 });
    }

    if (!serviceId) {
      return new NextResponse("Servicio es requerido", { status: 400 });
    }

    const schedule = await prisma.schedule.update({
      where: {
        id: parseInt(scheduleId),
        userId: decoded.id,
        employeeId: parseInt(id),
      },
      data: {
        dayOfWeek,
        period,
        startTime,
        endTime,
        serviceId: parseInt(serviceId),
      },
      include: {
        service: true,
        employee: true,
      },
    });

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("Error al actualizar horario:", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}

// DELETE - Eliminar horario
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; scheduleId: string }> }
) {
  try {
    const { id, scheduleId } = await params;
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const decoded = verifyToken(token) as { id: number; email: string };

    await prisma.schedule.delete({
      where: {
        id: parseInt(scheduleId),
        userId: decoded.id,
        employeeId: parseInt(id),
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error al eliminar horario:", error);
    return new NextResponse("Error interno", { status: 500 });
  }
} 