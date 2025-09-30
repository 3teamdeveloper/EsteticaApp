import { NextResponse } from 'next/server';
import { emailService } from '@/lib/email/emailService';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const to = (body?.to as string | undefined)?.trim();
    const subject = (body?.subject as string | undefined)?.trim();
    const html = (body?.html as string | undefined) ?? (body?.body as string | undefined);

    if (!to || !subject || !html) {
      return NextResponse.json({ error: 'Parámetros inválidos. Requiere to, subject y html.' }, { status: 400 });
    }

    // Logs útiles para depuración (emulan el contenido del correo)
    console.info('[Email:Simulated] to=%s subject=%s', to, subject);
    // Limitar tamaño de log por seguridad y ruido
    const preview = typeof html === 'string' ? html.slice(0, 500) : '';
    console.info('[Email:Simulated] html preview (500 chars):\n%s', preview);
    
    const result = await emailService.sendEmail({ to, subject, html });

    return NextResponse.json({ success: true, id: (result as any)?.id });
  } catch (error) {
    console.error('Error enviando email:', error);
    return NextResponse.json({ error: 'No se pudo enviar el email' }, { status: 500 });
  }
}
