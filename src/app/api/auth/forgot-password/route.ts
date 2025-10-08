import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import crypto from "crypto";
import { verifyToken } from "@/lib/auth";
import { emailService } from "@/lib/email/emailService";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const providedEmail = (body?.email as string | undefined)?.trim().toLowerCase();

    // Detect authenticated user
    const cookieToken = (await cookies()).get("token")?.value;
    const decoded = cookieToken ? (verifyToken(cookieToken) as { id: number; email: string } | null) : null;

    let email: string | undefined;
    if (decoded?.email) {
      // If authenticated, force using session email (ignore provided)
      email = decoded.email.toLowerCase();
    } else {
      // If not authenticated (login page), use provided email
      email = providedEmail;
    }

    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Do not reveal user existence; still respond success-like
      return NextResponse.json({ message: "Si el email existe, se generó un enlace de restablecimiento" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: token,
        passwordResetTokenExpiry: expiry,
        lastInvitationSentAt: new Date(),
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://citaup.com";
    const resetUrl = `${baseUrl}/set-password?token=${token}`;
    
    // Logs útiles para depuración (emulan el contenido del correo)
    console.info('[Email:Simulated] to=%s subject=%s', email, 'Restablecer contraseña');
    console.info('[Email:Simulated] link=%s', resetUrl);

    // Enviar email real mediante EmailService
    await emailService.sendPasswordReset(email, resetUrl);

    return NextResponse.json({ message: "Enlace de restablecimiento generado" });
  } catch (error) {
    console.error("Error generando reset de contraseña:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
