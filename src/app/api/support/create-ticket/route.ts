import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    const decoded = verifyToken(token) as { id: number; email: string } | null;
    if (!decoded?.id) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        businessType: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const {
      subject,
      message,
      category,
      priority,
      userPhone,
      businessName,
      errorDetails,
      browserInfo,
      deviceInfo
    } = await request.json();

    // Validate required fields
    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json({ 
        error: "Asunto y mensaje son obligatorios" 
      }, { status: 400 });
    }

    if (message.trim().length < 10) {
      return NextResponse.json({ 
        error: "El mensaje debe tener al menos 10 caracteres" 
      }, { status: 400 });
    }

    // Validate category and priority
    const validCategories = ["TECHNICAL", "BILLING", "FEATURE_REQUEST", "BUG_REPORT", "OTHER"];
    const validPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"];

    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "Categoría inválida" }, { status: 400 });
    }

    if (!validPriorities.includes(priority)) {
      return NextResponse.json({ error: "Prioridad inválida" }, { status: 400 });
    }

    // Create support ticket
    const ticket = await prisma.supportTicket.create({
      data: {
        subject: subject.trim(),
        message: message.trim(),
        category,
        priority,
        userEmail: user.email,
        userName: user.name,
        userPhone: userPhone?.trim() || null,
        businessName: businessName?.trim() || user.businessType || null,
        browserInfo: browserInfo || null,
        deviceInfo: deviceInfo || null,
        errorDetails: errorDetails?.trim() || null,
        userId: user.id
      }
    });

    // Generate ticket ID for display (using padded number)
    const ticketNumber = `#${ticket.id.toString().padStart(6, '0')}`;

    // Prepare email content for console (similar to employee invitation)
    const emailSubject = `[Soporte] ${ticketNumber} - ${subject.trim()}`;
    const supportEmail = process.env.SUPPORT_EMAIL || 'soporte@esteticaapp.com';
    
    // Log email content to console (simulating email sending)
    console.info('='.repeat(80));
    console.info('[Email:Support] NUEVO TICKET DE SOPORTE');
    console.info('='.repeat(80));
    console.info('Para: %s', supportEmail);
    console.info('Asunto: %s', emailSubject);
    console.info('Ticket ID: %s', ticketNumber);
    console.info('Usuario: %s (%s)', user.name, user.email);
    console.info('Categoría: %s', category);
    console.info('Prioridad: %s', priority);
    console.info('Teléfono: %s', userPhone || 'No proporcionado');
    console.info('Negocio: %s', businessName || user.businessType || 'No especificado');
    console.info('-'.repeat(40));
    console.info('MENSAJE:');
    console.info(message.trim());
    
    if (errorDetails?.trim()) {
      console.info('-'.repeat(40));
      console.info('DETALLES TÉCNICOS:');
      console.info(errorDetails.trim());
    }
    
    console.info('-'.repeat(40));
    console.info('INFORMACIÓN TÉCNICA:');
    console.info('Navegador: %s', browserInfo || 'No disponible');
    console.info('Dispositivo: %s', deviceInfo || 'No disponible');
    console.info('Fecha: %s', new Date().toLocaleString('es-AR'));
    console.info('='.repeat(80));

    // Also log a summary for easy tracking
    console.info('[Support:Created] ticket=%s user=%s category=%s priority=%s', 
      ticketNumber, user.email, category, priority);

    return NextResponse.json({ 
      message: "Ticket de soporte creado correctamente",
      ticketId: ticketNumber,
      ticket: {
        id: ticket.id,
        subject: ticket.subject,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        createdAt: ticket.createdAt
      }
    });

  } catch (error) {
    console.error("Error creando ticket de soporte:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
