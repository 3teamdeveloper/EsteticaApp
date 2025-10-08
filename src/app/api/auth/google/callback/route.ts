import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { generateUniqueUsername } from '@/lib/username';
import { initializeTrial } from '@/lib/trial';

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: 'Faltan GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET' }, { status: 500 });
  }

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const storedState = request.cookies.get('oauth_state')?.value;

  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.redirect(new URL('/login?error=oauth_state', request.url));
  }

  const origin = url.origin;
  const redirectUri = `${origin}/api/auth/google/callback`;

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL('/login?error=oauth_token', request.url));
  }

  const tokenData = await tokenRes.json();
  const accessToken: string | undefined = tokenData.access_token;

  if (!accessToken) {
    return NextResponse.redirect(new URL('/login?error=oauth_no_access_token', request.url));
  }

  // Fetch user info
  const userInfoRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!userInfoRes.ok) {
    return NextResponse.redirect(new URL('/login?error=oauth_userinfo', request.url));
  }

  const profile = await userInfoRes.json();
  const email: string | undefined = profile.email;
  const name: string | undefined = profile.name;

  if (!email) {
    return NextResponse.redirect(new URL('/login?error=oauth_no_email', request.url));
  }

  // Upsert user
  let user = await prisma.user.findUnique({ where: { email } });
  const isNewUser = !user;
  if (!user) {
    const baseForUsername = (name || email.split('@')[0] || 'user').trim();
    const username = await generateUniqueUsername(prisma as any, baseForUsername);
    const randomPassword = crypto.randomBytes(32).toString('hex');
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email,
        username,
        onboardingCompleted: false,
      },
    });

    // Inicializar el trial de 14 días para nuevos usuarios
    await initializeTrial(user.id);
  }

  // Issue our JWT and set cookie
  const token = generateToken({ id: user.id, email: user.email });
  const needsOnboarding = isNewUser || !user.onboardingCompleted || !user.phone || !user.businessType || !user.termsAcceptedAt;
  const redirectTo = needsOnboarding ? '/onboarding' : '/dashboard';
  const response = NextResponse.redirect(new URL(redirectTo, request.url));

  response.cookies.set({
    name: 'token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
    sameSite: 'lax',
  });

  // También configurar una cookie no-httpOnly para que el frontend pueda leer la sesión
  const sessionData = {
    userId: user.id,
    email: user.email,
    role: user.role || 'user',
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000)
  };

  response.cookies.set({
    name: 'userSession',
    value: JSON.stringify(sessionData),
    httpOnly: false, // Permitir acceso desde JavaScript
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
    sameSite: 'lax',
  });

  // Clean state cookie
  response.cookies.set({
    name: 'oauth_state',
    value: '',
    maxAge: 0,
    path: '/',
  });

  return response;
}


