import { NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { verifyTrialAccess } from "@/lib/trial"
import { prisma } from "@/lib/db"
import { cookies } from "next/headers"
import { uploadToBlob, deleteFromBlob } from "@/lib/blob"

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

    const service = await prisma.service.findFirst({
      where: {
        id: parseInt(id),
        userId: decoded.id
      }
    });

    if (!service) {
      return new NextResponse("Servicio no encontrado", { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error("Error al obtener servicio:", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}

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

    // Verificar acceso del trial
    const { hasAccess } = await verifyTrialAccess(decoded.id, 'services');
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Tu trial ha expirado. Actualiza tu plan para editar servicios.' },
        { status: 403 }
      );
    }

    const contentType = request.headers.get('content-type') || ''
    let payload: any = {}
    let serviceImageUrl: string | null = null

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      payload.name = formData.get('name')
      payload.description = formData.get('description')
      payload.price = parseFloat(formData.get('price') as string)
      payload.duration = parseInt(formData.get('duration') as string)

      const image = formData.get('serviceImage') as File | null
      if (image && typeof image !== 'string' && image.size > 0) {
        const blob = await uploadToBlob(image, 'services')
        serviceImageUrl = blob.url
      }
    } else {
      payload = await request.json()
    }

    const { name, description, price, duration } = payload

    // Obtener servicio actual para eliminar imagen antigua si se reemplaza
    const currentService = await prisma.service.findUnique({
      where: { id: parseInt(id) }
    });

    if (serviceImageUrl && currentService?.serviceImage) {
      await deleteFromBlob(currentService.serviceImage);
    }

    const service = await prisma.service.update({
      where: {
        id: parseInt(id),
        userId: decoded.id
      },
      data: {
        name,
        description,
        price,
        duration,
        ...(serviceImageUrl ? { serviceImage: serviceImageUrl } : {}),
      }
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("Error al actualizar servicio:", error);
    return new NextResponse("Error interno", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const token = (await cookies()).get("token")?.value;
    if (!token) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    const session = verifyToken(token) as { id: number; email: string };
    if (!session?.id) {
      return new NextResponse("No autorizado", { status: 401 });
    }

    // Verificar acceso del trial
    const { hasAccess } = await verifyTrialAccess(session.id, 'services');
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Tu trial ha expirado. Actualiza tu plan para modificar servicios.' },
        { status: 403 }
      );
    }

    const body = await req.json()
    const { isActive } = body

    if (typeof isActive !== "boolean") {
      return new NextResponse("Estado inválido", { status: 400 })
    }

    const service = await prisma.service.findUnique({
      where: {
        id: parseInt(id),
        userId: session.id,
        deleted: false,
      },
    })

    if (!service) {
      return new NextResponse("Servicio no encontrado", { status: 404 })
    }

    const updatedService = await prisma.service.update({
      where: {
        id: parseInt(id),
        userId: session.id,
      },
      data: {
        isActive,
      },
    })

    return NextResponse.json(updatedService)
  } catch (error) {
    console.error("[SERVICE_PATCH]", error)
    return new NextResponse("Error interno", { status: 500 })
  }
}

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

    // Verificar si el servicio existe y pertenece al usuario
    const service = await prisma.service.findUnique({
      where: {
        id: parseInt(id),
        userId: decoded.id,
        deleted: false,
      },
      include: {
        appointments: true,
        schedules: true,
        employees: true,
      },
    });

    if (!service) {
      return new NextResponse("Servicio no encontrado", { status: 404 });
    }

    // Verificar si tiene relaciones (turnos, horarios o empleados)
    const hasRelations = 
      service.appointments.length > 0 || 
      service.schedules.length > 0 || 
      service.employees.length > 0;

    if (hasRelations) {
      // Si tiene relaciones, hacer soft delete
      await prisma.service.update({
        where: {
          id: parseInt(id),
          userId: decoded.id,
        },
        data: {
          deleted: true,
          isActive: false,
        },
      });
    } else {
      // Si no tiene relaciones, eliminar completamente
      // Eliminar imagen del blob si existe
      if (service.serviceImage) {
        await deleteFromBlob(service.serviceImage);
      }
      
      await prisma.service.delete({
        where: {
          id: parseInt(id),
          userId: decoded.id,
        },
      });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error al eliminar servicio:", error);
    return new NextResponse("Error interno", { status: 500 });
  }
} 