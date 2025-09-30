// src/app/api/profile/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { verifyTrialAccess } from "@/lib/trial";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// GET /api/profile
export async function GET() {
  try {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: number; email: string };

    const profile = await prisma.publicProfile.findUnique({
      where: { userId: decoded.id },
    });

    return NextResponse.json(profile || {});
  } catch (error) {
    console.error("Error al obtener el perfil:", error);
    return NextResponse.json(
      { error: "Error al obtener el perfil" },
      { status: 500 }
    );
  }
}

// POST /api/profile
export async function POST(req: Request) {
  try {
    const token = (await cookies()).get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const decoded = verifyToken(token) as { id: number; email: string };

    // Verificar acceso del trial
    const { hasAccess } = await verifyTrialAccess(decoded.id, 'profile');
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Tu trial ha expirado. Actualiza tu plan para editar tu perfil.' },
        { status: 403 }
      );
    }

    // Detectar si es multipart/form-data
    const contentType = req.headers.get('content-type') || '';
    let data: any = {};
    let profileImageUrl: string | null = null;
    let coverImageUrl: string | null = null;
    let removeProfileImage = false;
    let removeCoverImage = false;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      data.urlName = formData.get('urlName');
      data.pageTitle = formData.get('pageTitle');
      data.bio = formData.get('bio');
      data.isActive = formData.get('isActive') === 'true';
      data.publicLinks = JSON.parse(formData.get('publicLinks') as string || '[]');
      // Theme customization
      data.fontFamily = formData.get('fontFamily');
      data.backgroundColor = formData.get('backgroundColor');
      data.cardBackgroundColor = formData.get('cardBackgroundColor');
      data.primaryColor = formData.get('primaryColor');
      data.textColor = formData.get('textColor');
      data.slogan = formData.get('slogan');
      data.layoutVariant = formData.get('layoutVariant');
      removeProfileImage = formData.get('removeProfileImage') === 'true';
      removeCoverImage = formData.get('removeCoverImage') === 'true';
      // Guardar imagen de perfil
      const profileImage = formData.get('profileImage') as File | null;
      if (profileImage && typeof profileImage !== 'string' && profileImage.size > 0) {
        const buffer = Buffer.from(await profileImage.arrayBuffer());
        const uploadDir = path.join(process.cwd(), 'public', 'images', 'profiles');
        await mkdir(uploadDir, { recursive: true });
        const fileName = `${Date.now()}_${profileImage.name.replace(/\s/g, '_')}`;
        const filePath = path.join(uploadDir, fileName);
        await writeFile(filePath, buffer);
        profileImageUrl = `/images/profiles/${fileName}`;
      }
      // Guardar imagen de portada
      const coverImage = formData.get('coverImage') as File | null;
      if (coverImage && typeof coverImage !== 'string' && coverImage.size > 0) {
        const buffer = Buffer.from(await coverImage.arrayBuffer());
        const uploadDir = path.join(process.cwd(), 'public', 'images', 'profiles');
        await mkdir(uploadDir, { recursive: true });
        const fileName = `${Date.now()}_${coverImage.name.replace(/\s/g, '_')}`;
        const filePath = path.join(uploadDir, fileName);
        await writeFile(filePath, buffer);
        coverImageUrl = `/images/profiles/${fileName}`;
      }
    } else {
      data = await req.json();
    }

    // Validar que la URL sea única
    if (data.urlName) {
      const existingProfile = await prisma.publicProfile.findFirst({
        where: {
          urlName: data.urlName,
          userId: { not: decoded.id },
        },
      });
      if (existingProfile) {
        return NextResponse.json(
          { error: "Esta URL ya está en uso" },
          { status: 400 }
        );
      }
    }

    // Obtener el perfil actual para saber si hay que borrar imágenes
    const currentProfile = await prisma.publicProfile.findUnique({ where: { userId: decoded.id } });

    // Crear o actualizar el perfil
    const profile = await prisma.publicProfile.upsert({
      where: { userId: decoded.id },
      update: {
        urlName: data.urlName,
        pageTitle: data.pageTitle,
        bio: data.bio,
        coverImage: removeCoverImage ? null : (coverImageUrl || currentProfile?.coverImage),
        profileImage: removeProfileImage ? null : (profileImageUrl || currentProfile?.profileImage),
        publicLinks: data.publicLinks,
        fontFamily: data.fontFamily,
        backgroundColor: data.backgroundColor,
        cardBackgroundColor: data.cardBackgroundColor,
        primaryColor: data.primaryColor,
        textColor: data.textColor,
        slogan: data.slogan,
        layoutVariant: data.layoutVariant,
        isActive: data.isActive,
      },
      create: {
        userId: decoded.id,
        urlName: data.urlName,
        pageTitle: data.pageTitle,
        bio: data.bio,
        coverImage: coverImageUrl || null,
        profileImage: profileImageUrl || null,
        publicLinks: data.publicLinks,
        fontFamily: data.fontFamily,
        backgroundColor: data.backgroundColor,
        cardBackgroundColor: data.cardBackgroundColor,
        primaryColor: data.primaryColor,
        textColor: data.textColor,
        slogan: data.slogan,
        layoutVariant: data.layoutVariant,
        isActive: data.isActive,
      },
    });

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Error al guardar el perfil:", error);
    return NextResponse.json(
      { error: "Error al guardar el perfil" },
      { status: 500 }
    );
  }
}
