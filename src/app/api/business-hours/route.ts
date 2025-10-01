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
    
    // Obtener horarios de la base de datos
    const businessHours = await prisma.businessHours.findMany({
      where: { userId: decoded.id },
      orderBy: { dayOfWeek: 'asc' }
    });

    // Si no hay horarios configurados, retornar horarios por defecto
    if (businessHours.length === 0) {
      const defaultHours = {
        0: [], // Domingo
        1: [{ startTime: "09:00", endTime: "17:00" }], // Lunes
        2: [{ startTime: "09:00", endTime: "17:00" }], // Martes
        3: [{ startTime: "09:00", endTime: "17:00" }], // Miércoles
        4: [{ startTime: "09:00", endTime: "17:00" }], // Jueves
        5: [{ startTime: "09:00", endTime: "17:00" }], // Viernes
        6: [] // Sábado
      };
      return NextResponse.json(defaultHours);
    }

    // Convertir a formato esperado por el frontend
    const formattedHours: Record<number, Array<{ startTime: string; endTime: string }>> = {};
    // Inicializar todos los días
    for (let day = 0; day < 7; day++) {
      formattedHours[day] = [];
    }

    // Agrupar por día
    businessHours.forEach(({ dayOfWeek, startTime, endTime }: { dayOfWeek: number; startTime: string; endTime: string }) => {
      formattedHours[dayOfWeek].push({
        startTime,
        endTime
      });
    });

    return NextResponse.json(formattedHours);
  } catch (error) {
    console.error("Error al obtener horario:", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const decoded = verifyToken(token) as { id: number; email: string };
    const businessHours: Record<number, Array<{ startTime: string; endTime: string }>> = await request.json();
    
    // Validar estructura
    for (let day = 0; day < 7; day++) {
      if (!businessHours[day]) {
        return new NextResponse(`Faltan datos para el día ${day}`, { status: 400 });
      }
    }
    
    // Eliminar horarios existentes del usuario
    await prisma.businessHours.deleteMany({
      where: { userId: decoded.id }
    });

    // Crear nuevos horarios
    const hoursToCreate: Array<{ userId: number; dayOfWeek: number; startTime: string; endTime: string }> = [];
    for (let day = 0; day < 7; day++) {
      const dayHours = businessHours[day];
      for (const hour of dayHours) {
        hoursToCreate.push({
          userId: decoded.id,
          dayOfWeek: day,
          startTime: hour.startTime,
          endTime: hour.endTime
        });
      }
    }

    if (hoursToCreate.length > 0) {
      await prisma.businessHours.createMany({
        data: hoursToCreate
      });
    }
    
    return NextResponse.json(businessHours);
  } catch (error) {
    console.error("Error al guardar horario:", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}