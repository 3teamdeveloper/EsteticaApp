import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { generateUniqueUsername, slugifyUsername } from '@/lib/username';
import { uploadToBlob, deleteFromBlob } from '@/lib/blob';

// GET /api/employees/[id] - Get a specific employee
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const decoded = verifyToken(token) as { id: number; email: string };
    if (!decoded?.id) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const employee = await prisma.employee.findFirst({
      where: { id: parseInt(id), userId: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        employeeImage: true,
        accountUserId: true,
        accountUser: { select: { password: true, lastInvitationSentAt: true } },
      }
    });

    if (!employee) {
      return new NextResponse("Empleado no encontrado", { status: 404 });
    }

    if (!employee) return new NextResponse("Empleado no encontrado", { status: 404 });

    const data = {
      id: employee.id,
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      employeeImage: employee.employeeImage,
      accountUserId: employee.accountUserId,
      hasPassword: Boolean(employee.accountUser?.password && employee.accountUser.password.length > 0),
      lastInvitationSentAt: employee.accountUser?.lastInvitationSentAt || null,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error al obtener empleado:", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}

// PUT /api/employees/[id] - Update an employee
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const decoded = verifyToken(token) as { id: number; email: string };
    if (!decoded?.id) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    // Soportar multipart/form-data
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string | null;
    const phone = formData.get('phone') as string | null;
    const image = formData.get('employeeImage') as File | null;
    const removeImage = formData.get('removeImage') === 'true';

    // Obtener el empleado actual para saber si tiene imagen previa
    const current = await prisma.employee.findUnique({
      where: { id: parseInt(id) }
    });

    let employeeImageUrl = current?.employeeImage || null;

    // Si se sube una nueva imagen, guardar y eliminar la anterior
    if (image && image.size > 0) {
      const blob = await uploadToBlob(image, 'employees');
      // Eliminar imagen anterior si existe
      if (employeeImageUrl) {
        await deleteFromBlob(employeeImageUrl);
      }
      employeeImageUrl = blob.url;
    } else if (removeImage && employeeImageUrl) {
      // Si se solicita eliminar la imagen
      await deleteFromBlob(employeeImageUrl);
      employeeImageUrl = null;
    }

    const employee = await prisma.employee.update({
      where: {
        id: parseInt(id),
        userId: decoded.id
      },
      data: {
        name,
        email,
        phone,
        employeeImage: employeeImageUrl,
      }
    });

    // Enviar invitación automáticamente si el email cambió y hay email
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const emailChanged = email && email !== (current?.email || null);
    if (emailChanged && email) {
      // Buscar o crear usuario por email
      let user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        const baseForUsername = slugifyUsername(name || email.split('@')[0] || 'user');
        const username = await generateUniqueUsername(prisma as any, baseForUsername);
        user = await prisma.user.create({
          data: {
            email,
            password: '',
            name: name || email,
            username,
            role: 'EMPLEADO',
          }
        });
      }

      // Vincular cuenta si faltaba
      if (!employee.accountUserId || employee.accountUserId !== user.id) {
        await prisma.employee.update({
          where: { id: employee.id },
          data: { accountUserId: user.id }
        });
      }

      // Si el usuario no tiene contraseña establecida (password vacío) o queremos enviar invitación de todos modos
      if (!user.password || user.password.length === 0) {
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

        await fetch(`${baseUrl}/api/send-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: email,
            subject: 'Invitación para establecer contraseña',
            body: `Hola ${name || ''},\n\nHas sido invitado a unirte como empleado. Haz clic en el siguiente enlace para establecer tu contraseña:\n\n${baseUrl}/set-password?token=${invitationToken}\n\nEste enlace expirará en 24 horas.`,
          })
        });
      }
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error("Error al actualizar empleado:", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}

// DELETE /api/employees/[id] - Delete an employee
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const decoded = verifyToken(token) as { id: number; email: string };
    if (!decoded?.id) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    // Obtener empleado para eliminar su imagen del blob
    const employee = await prisma.employee.findUnique({
      where: { id: parseInt(id) },
      select: { employeeImage: true }
    });

    // Use a transaction to delete related records first
    await prisma.$transaction(async (tx) => {
      // First, delete all related records
      await tx.employeeService.deleteMany({
        where: {
          employeeId: parseInt(id)
        }
      });

      await tx.schedule.deleteMany({
        where: {
          employeeId: parseInt(id)
        }
      });

      // Update appointments to remove employee assignment
      await tx.appointment.updateMany({
        where: {
          employeeId: parseInt(id)
        },
        data: {
          employeeId: null
        }
      });

      // Finally delete the employee
      await tx.employee.delete({
        where: {
          id: parseInt(id),
          userId: decoded.id
        }
      });
    });

    // Eliminar imagen del blob después de la transacción exitosa
    if (employee?.employeeImage) {
      await deleteFromBlob(employee.employeeImage);
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error al eliminar empleado:", error);
    return new NextResponse("Error interno", { status: 500 });
  }
} 