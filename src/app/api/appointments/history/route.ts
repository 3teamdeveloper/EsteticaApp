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

    // Parsear parámetros de búsqueda y filtros
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status");
    const serviceId = searchParams.get("serviceId");
    const employeeId = searchParams.get("employeeId");
    const search = searchParams.get("search"); // búsqueda por cliente
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const confirmed = searchParams.get("confirmed"); // "true" | "false" | null

    const skip = (page - 1) * limit;

    // Construir el where según el rol
    let where: any = {};

    if (user.role === 'EMPLEADO') {
      // Para empleados: solo sus propios appointments
      const employee = await prisma.employee.findFirst({
        where: { accountUserId: session.id },
        select: { id: true }
      });

      if (!employee) {
        return NextResponse.json({
          appointments: [],
          total: 0,
          page,
          limit,
          totalPages: 0
        });
      }

      where.employeeId = employee.id;
    } else {
      // Para prestadores: appointments de su negocio
      where.OR = [
        { userId: session.id },
        { employee: { userId: session.id } }
      ];
    }

    // Aplicar filtros adicionales
    if (status) {
      where.status = status;
    }

    if (serviceId) {
      where.serviceId = parseInt(serviceId);
    }

    if (employeeId && user.role !== 'EMPLEADO') {
      // Solo los prestadores pueden filtrar por empleado
      where.employeeId = parseInt(employeeId);
    }

    if (search) {
      // Búsqueda por nombre, email o teléfono del cliente
      where.client = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) {
        where.date.gte = new Date(dateFrom);
      }
      if (dateTo) {
        // Incluir todo el día hasta las 23:59:59
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        where.date.lte = endDate;
      }
    }

    if (confirmed !== null && confirmed !== undefined) {
      where.confirmedByClient = confirmed === "true";
    }

    // Obtener appointments con paginación
    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          service: {
            select: {
              id: true,
              name: true,
              duration: true,
              price: true
            }
          },
          employee: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.appointment.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      appointments,
      total,
      page,
      limit,
      totalPages
    });
  } catch (error) {
    console.error("Error al obtener historial de reservas:", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}