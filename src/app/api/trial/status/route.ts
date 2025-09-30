import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { getUserTrialStatus } from '@/lib/trial';

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

    // Obtener el estado del trial
    const trialStatus = await getUserTrialStatus(decodedToken.id);

    return NextResponse.json(trialStatus);
  } catch (error) {
    console.error('Error al obtener estado del trial:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
