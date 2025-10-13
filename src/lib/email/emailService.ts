import { createEmailProvider, EmailProvider } from './emailProvider';

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export class EmailService {
  private provider: EmailProvider;

  constructor(provider?: EmailProvider) {
    this.provider = provider ?? createEmailProvider();
  }

  async sendEmail(params: { to: string; subject: string; html: string }) {
    return this.provider.sendEmail(params);
  }

  async sendWelcomeEmail(to: string, username: string, link: string) {
    const safeName = escapeHtml(username || '');
    const subject = 'Invitación para establecer contraseña';
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222">
        <h2>¡Hola ${safeName}!</h2>
        <p>Has sido invitado/a a unirte como empleado/a en EstéticaApp.</p>
        <p>Haz clic en el siguiente botón para establecer tu contraseña. El enlace expirará en 24 horas.</p>
        <p style="margin: 24px 0">
          <a href="${link}" style="background:#111827;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;display:inline-block">Establecer contraseña</a>
        </p>
        <p>Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
        <p><a href="${link}">${link}</a></p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="font-size:12px;color:#6b7280">Este mensaje fue enviado automáticamente. No respondas a este correo.</p>
      </div>
    `;
    return this.provider.sendEmail({ to, subject, html });
  }

  async sendPasswordReset(to: string, link: string) {
    const subject = 'Restablecer contraseña';
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #222">
        <h2>Restablecer contraseña</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente botón para continuar. El enlace expirará en 24 horas.</p>
        <p style="margin: 24px 0">
          <a href="${link}" style="background:#111827;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;display:inline-block">Restablecer contraseña</a>
        </p>
        <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
        <p>Enlace directo: <a href="${link}">${link}</a></p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="font-size:12px;color:#6b7280">Este mensaje fue enviado automáticamente. No respondas a este correo.</p>
      </div>
    `;
    return this.provider.sendEmail({ to, subject, html });
  }

  async sendAppointmentConfirmationRequest(
    to: string,
    clientName: string,
    appointmentDetails: {
      date: Date;
      serviceName: string;
      employeeName: string;
      businessName: string;
      duration: number;
      businessPhone?: string;
      businessAddress?: string;
      businessWebsite?: string;
    },
    confirmToken: string,
    cancelToken: string
  ) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://citaup.com';
    const confirmLink = `${baseUrl}/confirm-appointment?token=${confirmToken}`;
    const cancelLink = `${baseUrl}/cancel-appointment?token=${cancelToken}`;
    
    const formattedDate = appointmentDetails.date.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const subject = `Confirma tu turno en ${appointmentDetails.businessName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #222">
        <h2>¡Hola ${escapeHtml(clientName)}!</h2>
        <p>Tu turno está próximo y necesitamos que confirmes tu asistencia.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Detalles del turno:</h3>
          <p><strong>Servicio:</strong> ${escapeHtml(appointmentDetails.serviceName)}</p>
          <p><strong>Profesional:</strong> ${escapeHtml(appointmentDetails.employeeName)}</p>
          <p><strong>Fecha y hora:</strong> ${formattedDate}</p>
          <p><strong>Duración:</strong> ${appointmentDetails.duration} minutos</p>
        </div>

        ${appointmentDetails.businessAddress || appointmentDetails.businessPhone || appointmentDetails.businessWebsite ? `
        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
          <h3 style="margin-top: 0; color: #1e40af;">📍 Información de contacto</h3>
          ${appointmentDetails.businessAddress ? `<p style="margin: 8px 0;"><strong>Dirección:</strong> ${escapeHtml(appointmentDetails.businessAddress)}</p>` : ''}
          ${appointmentDetails.businessPhone ? `<p style="margin: 8px 0;"><strong>Teléfono:</strong> ${escapeHtml(appointmentDetails.businessPhone)}</p>` : ''}
          ${appointmentDetails.businessWebsite ? `<p style="margin: 8px 0;"><strong>Web:</strong> <a href="${escapeHtml(appointmentDetails.businessWebsite)}" style="color: #3b82f6;">${escapeHtml(appointmentDetails.businessWebsite)}</a></p>` : ''}
        </div>
        ` : ''}

        <p><strong>¿Vas a asistir?</strong></p>
        
        <div style="margin: 30px 0;">
          <a href="${confirmLink}" 
             style="background: #10b981; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 8px; display: inline-block; 
                    margin-right: 10px;">
            ✓ Sí, confirmo mi asistencia
          </a>
          
          <a href="${cancelLink}" 
             style="background: #ef4444; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 8px; display: inline-block;">
            ✗ No puedo asistir
          </a>
        </div>

        <p style="color: #6b7280; font-size: 14px;">
          Si no confirmas tu turno, será cancelado automáticamente.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;"/>
        <p style="font-size: 12px; color: #6b7280;">
          Este mensaje fue enviado automáticamente. No respondas a este correo.
        </p>
      </div>
    `;
    
    return this.provider.sendEmail({ to, subject, html });
  }

  async sendAppointmentCreated(
    to: string,
    clientName: string,
    appointmentDetails: {
      date: Date;
      serviceName: string;
      employeeName: string;
      businessName: string;
      duration: number;
      businessPhone?: string;
      businessAddress?: string;
      businessWebsite?: string;
    }
  ) {
    const formattedDate = appointmentDetails.date.toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const subject = `Tu turno ha sido agendado - ${appointmentDetails.businessName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #222">
        <h2>¡Hola ${escapeHtml(clientName)}!</h2>
        <p>Tu turno ha sido <strong>agendado exitosamente</strong>.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #1f2937;">📋 Detalles de tu turno</h3>
          <p style="margin: 8px 0;"><strong>📅 Fecha y hora:</strong> ${formattedDate}</p>
          <p style="margin: 8px 0;"><strong>💇 Servicio:</strong> ${escapeHtml(appointmentDetails.serviceName)}</p>
          <p style="margin: 8px 0;"><strong>👤 Profesional:</strong> ${escapeHtml(appointmentDetails.employeeName)}</p>
          <p style="margin: 8px 0;"><strong>⏱️ Duración:</strong> ${appointmentDetails.duration} minutos</p>
        </div>

        ${appointmentDetails.businessAddress || appointmentDetails.businessPhone || appointmentDetails.businessWebsite ? `
        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
          <h3 style="margin-top: 0; color: #1e40af;">📍 Información de contacto</h3>
          ${appointmentDetails.businessAddress ? `<p style="margin: 8px 0;"><strong>Dirección:</strong> ${escapeHtml(appointmentDetails.businessAddress)}</p>` : ''}
          ${appointmentDetails.businessPhone ? `<p style="margin: 8px 0;"><strong>Teléfono:</strong> ${escapeHtml(appointmentDetails.businessPhone)}</p>` : ''}
          ${appointmentDetails.businessWebsite ? `<p style="margin: 8px 0;"><strong>Web:</strong> <a href="${escapeHtml(appointmentDetails.businessWebsite)}" style="color: #3b82f6;">${escapeHtml(appointmentDetails.businessWebsite)}</a></p>` : ''}
        </div>
        ` : ''}

        <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; color: #92400e;">
            <strong>📧 Recordatorio:</strong> Recibirás un email de confirmación 48 horas antes de tu turno.
          </p>
        </div>

        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
          Si no puedes asistir, por favor avísanos con anticipación para que otros clientes puedan tomar el horario.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;"/>
        <p style="font-size: 12px; color: #6b7280;">
          Este mensaje fue enviado automáticamente. No respondas a este correo.
        </p>
      </div>
    `;
    
    return this.provider.sendEmail({ to, subject, html });
  }
}

// Export a default singleton instance for convenience
export const emailService = new EmailService();
