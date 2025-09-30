export interface EmailProvider {
  sendEmail(params: { to: string; subject: string; html: string }): Promise<{ id?: string } | void>;
}

// Simple console-based provider (useful for dev when no provider is configured)
class ConsoleEmailProvider implements EmailProvider {
  async sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
    // Keep minimal logging as a safe fallback
    console.info('[Email:Console] to=%s subject=%s', to, subject);
    if (process.env.NODE_ENV !== 'production') {
      console.info('[Email:Console] html preview:\n%s', html);
    }
    return { id: undefined };
  }
}

// Factory that returns the appropriate provider instance
export function createEmailProvider(): EmailProvider {
  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey && apiKey.trim().length > 0) {
    // Lazy import to avoid impacting environments without this dependency
    const { ResendProvider } = require('./providers/resendProvider');
    return new ResendProvider(apiKey);
  }
  // Fallback to console provider
  return new ConsoleEmailProvider();
}
