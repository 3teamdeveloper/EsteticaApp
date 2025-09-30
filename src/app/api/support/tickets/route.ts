import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const decoded = verifyToken(token) as { id: number; email: string } | null;
    if (!decoded?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    // Get user's support tickets
    const tickets = await prisma.supportTicket.findMany({
      where: {
        userId: decoded.id
      },
      select: {
        id: true,
        subject: true,
        category: true,
        priority: true,
        status: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10 // Limit to last 10 tickets
    });

    // Format tickets with padded IDs
    const formattedTickets = tickets.map(ticket => ({
      ...ticket,
      ticketNumber: `#${ticket.id.toString().padStart(6, '0')}`
    }));

    return NextResponse.json({ tickets: formattedTickets });

  } catch (error) {
    console.error("Error obteniendo tickets de soporte:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
