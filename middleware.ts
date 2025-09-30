import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getUserTrialStatus, hasAccessToFeature } from '@/lib/trial';

// Rutas que no requieren autenticación (exactas)
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/set-password',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/set-password',
  // Nota: send-email se invoca internamente sin cookies; mantener pública.
  '/api/send-email',
];

// Rutas que requieren trial activo
const TRIAL_PROTECTED_ROUTES: { [key: string]: 'services' | 'employees' | 'profile' | 'create_appointments' } = {
  '/dashboard/services/new': 'services',
  '/dashboard/services/[id]/edit': 'services',
  '/dashboard/employees/new': 'employees',
  '/dashboard/employees/[id]': 'employees',
  '/dashboard/profile': 'profile',
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir rutas públicas y archivos estáticos
  if (
    PUBLIC_ROUTES.includes(pathname) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/public-profile') ||
    pathname.startsWith('/api/trial') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Obtener el token de las cookies
  const token = request.cookies.get('token')?.value;

  // Si no hay token, redirigir a login
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verificar el token
  const decodedToken = verifyToken(token);

  if (!decodedToken) {
    // Si el token es inválido, eliminar la cookie y redirigir a login
    const response = pathname.startsWith('/api/')
      ? NextResponse.json({ error: 'Token inválido' }, { status: 401 })
      : NextResponse.redirect(new URL('/login', request.url));

    response.cookies.delete('token');
    // También limpiar localStorage en el cliente
    response.headers.set('Clear-Site-Data', '"cookies", "storage"');
    return response;
  }

  // Verificar protección de trial para rutas específicas
  const matchedRoute = Object.keys(TRIAL_PROTECTED_ROUTES).find(route => {
    if (route.includes('[id]')) {
      const pattern = route.replace('[id]', '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(pathname);
    }
    return pathname === route;
  });

  if (matchedRoute && typeof decodedToken === 'object' && 'id' in decodedToken) {
    try {
      const trialStatus = await getUserTrialStatus(decodedToken.id);
      const feature = TRIAL_PROTECTED_ROUTES[matchedRoute];
      const hasAccess = hasAccessToFeature(trialStatus, feature);
      
      if (!hasAccess) {
        return NextResponse.redirect(new URL('/dashboard?trial_expired=true', request.url));
      }
    } catch (error) {
      console.error('Error verificando trial en middleware:', error);
      // En caso de error, permitir el acceso para no bloquear al usuario
    }
  }

  return NextResponse.next();
}
// Configurar qué rutas deben ser protegidas
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*'
  ]
};