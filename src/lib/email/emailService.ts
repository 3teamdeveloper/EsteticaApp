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
}

// Export a default singleton instance for convenience
export const emailService = new EmailService();
