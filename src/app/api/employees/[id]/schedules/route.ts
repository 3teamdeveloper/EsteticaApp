import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";

// GET - Obtener horarios de un empleado
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const decoded = verifyToken(token) as { id: number; email: string };
    
    const schedules = await prisma.schedule.findMany({
      where: {
        userId: decoded.id,
        employeeId: parseInt(id),
      },
      include: {
        service: true,
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });

    return NextResponse.json(schedules);
  } catch (error) {
    console.error("Error al obtener horarios:", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}

// POST - Crear horario para un empleado
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const decoded = verifyToken(token) as { id: number; email: string };
    const { dayOfWeek, period, startTime, endTime, serviceId } = await request.json();

    // Validaciones
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return new NextResponse("Día de la semana inválido", { status: 400 });
    }

    if (period < 1 || period > 2) {
      return new NextResponse("Período inválido (debe ser 1 o 2)", { status: 400 });
    }

    if (!startTime || !endTime) {
      return new NextResponse("Hora de inicio y fin son requeridas", { status: 400 });
    }

    if (startTime >= endTime) {
      return new NextResponse("La hora de inicio debe ser menor que la de fin", { status: 400 });
    }

    if (!serviceId) {
      return new NextResponse("Servicio es requerido", { status: 400 });
    }

    // Verificar que el empleado existe y pertenece al usuario
    const employee = await prisma.employee.findFirst({
      where: {
        id: parseInt(id),
        userId: decoded.id,
      },
    });

    if (!employee) {
      return new NextResponse("Empleado no encontrado", { status: 404 });
    }

    // Verificar que el servicio existe
    const service = await prisma.service.findFirst({
      where: {
        id: parseInt(serviceId),
        userId: decoded.id,
        isActive: true,
        deleted: false,
      },
    });

    if (!service) {
      return new NextResponse("Servicio no encontrado", { status: 404 });
    }

    // Verificar que no existe un horario duplicado para el mismo día, servicio y período
    const existingSchedule = await prisma.schedule.findFirst({
      where: {
        userId: decoded.id,
        employeeId: parseInt(id),
        dayOfWeek,
        period,
        serviceId: parseInt(serviceId),
      },
    });

    if (existingSchedule) {
      return new NextResponse("Ya existe un horario para este día, servicio y período", { status: 409 });
    }

    // Crear el horario
    const schedule = await prisma.schedule.create({
      data: {
        dayOfWeek,
        period,
        startTime,
        endTime,
        userId: decoded.id,
        employeeId: parseInt(id),
        serviceId: parseInt(serviceId),
      },
      include: {
        service: true,
        employee: true,
      },
    });

    return NextResponse.json(schedule);
  } catch (error) {
    console.error("Error al crear horario:", error);
    return new NextResponse("Error interno", { status: 500 });
  }
} 