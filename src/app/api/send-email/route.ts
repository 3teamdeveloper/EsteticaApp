import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { to, subject, body } = await request.json();
  // Aquí integrarás la Google API para enviar correos
  console.log(`Enviando email a ${to} con asunto ${subject}: ${body}`);
  return NextResponse.json({ success: true });
}