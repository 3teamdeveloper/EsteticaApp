import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    // Verificar autenticación
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const session = verifyToken(token) as { id: number; email: string };
    if (!session?.id) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    // Obtener el usuario para saber su rol
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { role: true }
    });

    if (!user) {
      return new NextResponse("Usuario no encontrado", { status: 404 });
    }

    // SOLO los prestadores pueden ver pagos
    if (user.role === 'EMPLEADO') {
      return new NextResponse("No autorizado - solo prestadores pueden ver pagos", { status: 403 });
    }

    // Parsear parámetros de búsqueda y filtros
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const skip = (page - 1) * limit;

    // Construir el where
    let where: any = {
      userId: session.id // Solo pagos del prestador logueado
    };

    if (status) {
      where.status = status;
    }

    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) {
        where.createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    // Obtener pagos con paginación
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.payment.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      payments,
      total,
      page,
      limit,
      totalPages
    });
  } catch (error) {
    console.error("Error al obtener historial de pagos:", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}