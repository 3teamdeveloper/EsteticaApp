import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { verifyTrialAccess } from '@/lib/trial';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { generateUniqueUsername, slugifyUsername } from '@/lib/username';
import { emailService } from '@/lib/email/emailService';
import { uploadToBlob } from '@/lib/blob';

// GET /api/employees - Get all employees for the current user
export async function GET() {
  try {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: number; email: string };

    const employees = await prisma.employee.findMany({
      where: { userId: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        userId: true,
        employeeImage: true,
        accountUserId: true,
        accountUser: { select: { password: true, lastInvitationSentAt: true } },
      }
    });

    const withStatus = employees.map((e: any) => ({
      id: e.id,
      name: e.name,
      email: e.email,
      phone: e.phone,
      userId: e.userId,
      employeeImage: e.employeeImage,
      accountUserId: e.accountUserId,
      hasPassword: Boolean(e.accountUser?.password && e.accountUser.password.length > 0),
      lastInvitationSentAt: e.accountUser?.lastInvitationSentAt || null,
    }));

    return NextResponse.json(withStatus);
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    return NextResponse.json(
      { error: "Error al obtener empleados" },
      { status: 500 }
    );
  }
}

// POST /api/employees - Create a new employee
export async function POST(request: Request) {
  try {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: number; email: string };

    // Verificar acceso del trial
    const { hasAccess } = await verifyTrialAccess(decoded.id, 'employees');
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Tu trial ha expirado. Actualiza tu plan para crear empleados.' },
        { status: 403 }
      );
    }

    // Soportar multipart/form-data
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string | null;
    const phone = formData.get('phone') as string | null;
    const image = formData.get('employeeImage') as File | null;

    if (!name) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 }
      );
    }

    let employeeImageUrl: string | null = null;
    if (image && image.size > 0) {
      const blob = await uploadToBlob(image, 'employees');
      employeeImageUrl = blob.url;
    }

    // Crear usuario EMPLEADO con token de invitación
    let user: any = null;
    let invitationToken: string | null = null;
    let invitationExpiry: Date | null = null;
    let emailSendWarning: string | null = null;

    if (email) {
      // Verificar si ya existe un usuario con ese email
      user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        invitationToken = crypto.randomBytes(32).toString('hex');
        invitationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
        const baseForUsername = slugifyUsername(name || email.split('@')[0] || 'user');
        const uniqueUsername = await generateUniqueUsername(prisma as any, baseForUsername);
        user = await prisma.user.create({
          data: {
            email,
            password: '', // No tiene contraseña aún
            name,
            username: uniqueUsername,
            phone: phone || null,
            role: 'EMPLEADO',
            passwordResetToken: invitationToken,
            passwordResetTokenExpiry: invitationExpiry,
          }
        });

        // Enviar email de invitación mediante EmailService
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const inviteLink = `${baseUrl}/set-password?token=${invitationToken}`;
        try {
          await emailService.sendWelcomeEmail(email, name || email.split('@')[0], inviteLink);
        } catch (sendErr) {
          // No fallar la creación por errores de proveedor de email
          console.warn('Fallo al enviar invitación por email (no fatal):', sendErr);
          emailSendWarning = 'No se pudo enviar la invitación por email. Podrás reenviarla desde la lista de empleados.';
        }
        // Logs útiles para depuración (emulan el contenido del correo)
        console.info('[Email:Simulated] to=%s subject=%s', email, 'Invitación para establecer contraseña');
        console.info('[Email:Simulated] link=%s', inviteLink);
      } else {
        // Si el usuario ya existe, validar que no esté ya vinculado a otro empleado de este prestador
        const existingByAccount = await prisma.employee.findFirst({
          where: { accountUserId: user.id, userId: decoded.id },
          select: { id: true }
        });
        const existingByEmail = await prisma.employee.findFirst({
          where: { email: email, userId: decoded.id },
          select: { id: true }
        });
        if (existingByAccount || existingByEmail) {
          // Error controlado: el correo ya está asociado a otro empleado
          console.info('error mail controlado');
          return NextResponse.json(
            { error: 'Este correo ya existe en otro empleado' },
            { status: 400 }
          );
        }
      }
    }

    const employee = await prisma.employee.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        userId: decoded.id,
        employeeImage: employeeImageUrl,
        accountUserId: user?.id ?? null,
      }
    });

    // Incluir advertencia si el envío de email falló
    return NextResponse.json({ employee, user, emailSendWarning });
  } catch (error) {
    console.error('Error al crear empleado:', error);
    return NextResponse.json(
      { error: "Error al crear empleado" },
      { status: 500 }
    );
  }
}