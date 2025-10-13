import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';
import { emailService } from '@/lib/email/emailService';

export async function GET(request: Request) {
  try {
    // Verificar que la request viene de Vercel Cron
    const userAgent = request.headers.get('user-agent');
    if (!userAgent?.includes('vercel-cron')) {
      console.warn('[Cron] Intento de acceso no autorizado');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const in48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const in46Hours = new Date(now.getTime() + 46 * 60 * 60 * 1000);

    console.log(`[Cron] 🕐 Ejecutando verificación de turnos - ${now.toISOString()}`);
    console.log(`[Cron] 📅 Buscando turnos entre ${in46Hours.toISOString()} y ${in48Hours.toISOString()}`);

    // Buscar turnos PENDING que necesitan confirmación
    const appointmentsToConfirm = await prisma.appointment.findMany({
      where: {
        status: 'PENDING',
        date: {
          gte: in46Hours,
          lte: in48Hours
        },
        confirmationEmailSentAt: null, // No se envió email aún
        client: {
          email: { not: null } // Cliente tiene email
        }
      },
      include: {
        client: true,
        service: true,
        employee: true,
        user: { 
          select: { 
            name: true,
            businessPhone: true,
            businessAddress: true,
            businessWebsite: true
          } 
        }
      }
    });

    console.log(`[Cron] 📧 Encontrados ${appointmentsToConfirm.length} turnos para enviar confirmación`);

    const results = [];

    for (const appointment of appointmentsToConfirm) {
      try {
        // Generar token único
        const confirmToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = new Date(appointment.date.getTime() + 1 * 60 * 60 * 1000); // Expira 1h después del turno

        // Actualizar appointment con token
        await prisma.appointment.update({
          where: { id: appointment.id },
          data: {
            confirmationToken: confirmToken,
            confirmationTokenExpiry: tokenExpiry,
            confirmationEmailSentAt: now
          }
        });

        // Enviar email
        await emailService.sendAppointmentConfirmationRequest(
          appointment.client!.email!,
          appointment.client!.name,
          {
            date: appointment.date,
            serviceName: appointment.service.name,
            employeeName: appointment.employee?.name || 'Sin asignar',
            businessName: appointment.user.name || 'Nuestro negocio',
            duration: appointment.service.duration,
            businessPhone: appointment.user.businessPhone || undefined,
            businessAddress: appointment.user.businessAddress || undefined,
            businessWebsite: appointment.user.businessWebsite || undefined,
          },
          confirmToken,
          confirmToken // Mismo token para ambas acciones
        );

        results.push({
          appointmentId: appointment.id,
          clientEmail: appointment.client!.email,
          clientName: appointment.client!.name,
          appointmentDate: appointment.date,
          status: 'sent'
        });

        console.log(`[Cron] ✅ Email enviado para turno #${appointment.id} - Cliente: ${appointment.client!.name}`);
      } catch (error) {
        console.error(`[Cron] ❌ Error procesando turno #${appointment.id}:`, error);
        results.push({
          appointmentId: appointment.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.status === 'sent').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    console.log(`[Cron] ✨ Proceso completado: ${successCount} enviados, ${errorCount} errores`);

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      processed: appointmentsToConfirm.length,
      sent: successCount,
      errors: errorCount,
      results
    });

  } catch (error) {
    console.error('[Cron] 💥 Error general:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
