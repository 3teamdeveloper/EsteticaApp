import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { generateUniqueUsername, slugifyUsername } from '@/lib/username';
import { emailService } from '@/lib/email/emailService';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = (await cookies()).get('token')?.value;

    if (!token) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const decoded = verifyToken(token) as { id: number; email: string };
    if (!decoded?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    const employee = await prisma.employee.findFirst({
      where: { id: parseInt(id), userId: decoded.id },
      select: { name: true, email: true }
    });
    if (!employee) return NextResponse.json({ error: 'Empleado no encontrado' }, { status: 404 });
    if (!employee.email) return NextResponse.json({ error: 'El empleado no tiene email' }, { status: 400 });

    // upsert del usuario por email
    let user = await prisma.user.findUnique({ where: { email: employee.email } });
    if (!user) {
      const baseForUsername = slugifyUsername(employee.name || employee.email.split('@')[0] || 'user');
      const username = await generateUniqueUsername(prisma as any, baseForUsername);
      user = await prisma.user.create({
        data: {
          email: employee.email,
          password: '', // sin contraseña aún
          name: employee.name || employee.email,
          username,
          role: 'EMPLEADO',
        }
      });
    }

    // Vincular cuenta si falta
    await prisma.employee.update({
      where: { id: parseInt(id) },
      data: { accountUserId: user.id }
    });

    // generar token de invitación y enviar email
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const invitationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: invitationToken,
        passwordResetTokenExpiry: invitationExpiry,
        lastInvitationSentAt: new Date(),
      }
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const inviteLink = `${baseUrl}/set-password?token=${invitationToken}`;

    let emailSendWarning: string | null = null;
    try {
      await emailService.sendWelcomeEmail(employee.email, employee.name || employee.email, inviteLink);
    } catch (sendErr: any) {
      // No fallar el reenvío por errores del proveedor de email. Log más limpio.
      const msg = (sendErr && (sendErr.message || String(sendErr))) || 'Fallo desconocido';
      console.warn('Fallo al enviar invitación por email (no fatal): %s', msg);
      emailSendWarning = 'No se pudo enviar la invitación por email. Podrás reenviarla nuevamente desde la lista de empleados.';
    }

    // Logs útiles para depuración (emulan el contenido del correo)
    console.info('[Email:Simulated] to=%s subject=%s', employee.email, 'Invitación para establecer contraseña');
    console.info('[Email:Simulated] link=%s', inviteLink);

    return NextResponse.json({ message: 'Invitación enviada', emailSendWarning });
  } catch (error) {
    console.error('Error al invitar empleado:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
