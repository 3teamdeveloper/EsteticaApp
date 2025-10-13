import { Resend } from 'resend';
import type { EmailProvider } from '../emailProvider';

export class ResendProvider implements EmailProvider {
  private client: Resend;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is required to initialize ResendProvider');
    }
    this.client = new Resend(apiKey);
  }

  async sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
    const from = process.env.RESEND_FROM_EMAIL || 'no-reply@citaup.com';

    const result = await this.client.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (result.error) {
      throw new Error(`Resend send error: ${result.error.message || 'Unknown error'}`);
    }

    return { id: (result as any).data?.id };
  }
}
