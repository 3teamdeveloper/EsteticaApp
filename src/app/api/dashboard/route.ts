import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Obtener el token de las cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar el token
    const decodedToken = verifyToken(token);
    
    if (!decodedToken || typeof decodedToken === 'string') {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Obtener los datos del usuario
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.id },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        role: true // <-- Agregado para exponer el rol
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Si el usuario es EMPLEADO, buscar su employeeId
    let employeeId = null;
    if (user.role === 'EMPLEADO') {
      const employee = await prisma.employee.findFirst({
        where: { accountUserId: user.id },
        select: { id: true }
      });
      if (employee) employeeId = employee.id;
    }

    return NextResponse.json({ ...user, employeeId });
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 