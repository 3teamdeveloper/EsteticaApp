import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get('path');

  if (!path) {
    return NextResponse.json(
      { message: 'Se requiere el parámetro path' },
      { status: 400 }
    );
  }

  try {
    revalidatePath(path);
    return NextResponse.json({ revalidated: true, now: Date.now() });
  } catch (err) {
    return NextResponse.json(
      { message: 'Error al revalidar la página' },
      { status: 500 }
    );
  }
} 