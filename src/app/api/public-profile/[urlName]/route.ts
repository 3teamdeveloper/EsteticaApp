import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';
import { getUserTrialStatus } from '@/lib/trial';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ urlName: string }> }
) {
  const { urlName } = await params;

  const profile = await prisma.publicProfile.findUnique({
    where: { urlName },
    select: {
      urlName: true,
      pageTitle: true,
      bio: true,
      coverImage: true,
      profileImage: true,
      publicLinks: true,
      fontFamily: true,
      backgroundColor: true,
      cardBackgroundColor: true,
      primaryColor: true,
      textColor: true,
      slogan: true,
      layoutVariant: true,
      isActive: true,
      userId: true,
    },
  });

  if (!profile || !profile.urlName || !profile.isActive) {
    return NextResponse.json({ error: 'Perfil no encontrado' }, { status: 404 });
  }

  // Verificar si el trial del usuario está activo
  try {
    const trialStatus = await getUserTrialStatus(profile.userId);
    if (!trialStatus.isActive) {
      return NextResponse.json({ error: 'Perfil no disponible' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error verificando trial status:', error);
    // En caso de error, permitir el acceso para no bloquear al usuario
  }

  // Obtener los servicios activos del usuario
  const services = await prisma.service.findMany({
    where: {
      userId: profile.userId,
      isActive: true,
      deleted: false,
    },
    orderBy: {
      name: 'asc',
    },
    select: {
      id: true,
      name: true,
      duration: true,
      price: true,
      description: true,
      serviceImage: true,
    }
  });

  // Asegurarse de parsear JSON de publicLinks si viene como objeto Prisma.JsonValue
  const links =
    typeof profile.publicLinks === 'string'
      ? JSON.parse(profile.publicLinks)
      : profile.publicLinks || [];

  return NextResponse.json({ 
    ...profile, 
    publicLinks: links,
    services 
  });
} 