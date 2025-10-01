import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { cookies } from "next/headers"
import { verifyToken } from "@/lib/auth"
import { verifyTrialAccess } from "@/lib/trial"
import { uploadToBlob } from "@/lib/blob"

export async function GET() {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const session = verifyToken(token) as { id: number; email: string };
    if (!session?.id) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const services = await prisma.service.findMany({
      where: {
        deleted: false,
        userId: session.id,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error("Error al obtener servicios:", error)
    return new NextResponse("Error interno", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const session = verifyToken(token) as { id: number; email: string };;
    if (!session?.id) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    // Verificar acceso del trial
    const { hasAccess } = await verifyTrialAccess(session.id, 'services');
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Tu trial ha expirado. Actualiza tu plan para crear servicios.' },
        { status: 403 }
      );
    }

    const contentType = req.headers.get('content-type') || ''
    let payload: any = {}
    let serviceImageUrl: string | null = null

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      payload.name = formData.get('name')
      payload.duration = parseInt(formData.get('duration') as string)
      payload.price = parseFloat(formData.get('price') as string)
      payload.description = formData.get('description') as string | null

      const image = formData.get('serviceImage') as File | null
      if (image && typeof image !== 'string' && image.size > 0) {
        const blob = await uploadToBlob(image, 'services')
        serviceImageUrl = blob.url
      }
    } else {
      payload = await req.json()
    }

    const { name, duration, price, description } = payload
    if (!name || !duration || !price) {
      return new NextResponse("Faltan campos requeridos", { status: 400 })
    }

    const service = await prisma.service.create({
      data: {
        name,
        duration,
        price,
        description,
        serviceImage: serviceImageUrl,
        userId: session.id,
      },
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error("[SERVICES_POST]", error)
    return new NextResponse("Error interno", { status: 500 })
  }
} 