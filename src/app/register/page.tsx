'use client';

import Link from "next/link";
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useSession } from '@/hooks/useSession';
import { useToastContext } from '@/components/ui/toast/ToastProvider';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    businessType: 'salon',
    acceptTerms: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, isLoading: sessionLoading } = useSession();
  const toast = useToastContext();

  // Obtener returnUrl de query params
  const returnUrl = searchParams.get('returnUrl') || '/dashboard';

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (!sessionLoading && session) {
      router.push(returnUrl);
    }
  }, [session, sessionLoading, router, returnUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    // Para username, convertir a minúsculas y remover espacios
    let processedValue = value;
    if (name === "username") {
      processedValue = value.toLowerCase().replace(/\s/g, '');
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : processedValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      setLoading(false);
      return;
    }

    // Validar formato del username
    const usernameRegex = /^[a-z0-9_-]+$/;
    if (!usernameRegex.test(formData.username)) {
      setError('El nombre de usuario solo puede contener letras minúsculas, números, guiones y guiones bajos');
      setLoading(false);
      return;
    }

    if (formData.username.length < 3) {
      setError('El nombre de usuario debe tener al menos 3 caracteres');
      setLoading(false);
      return;
    }

    if (!formData.acceptTerms) {
      setError('Debes aceptar los términos y condiciones');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phone: formData.phone || undefined, // Solo enviar si tiene valor
          businessType: formData.businessType,
          acceptTerms: formData.acceptTerms,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrarse');
      }

      // Registro exitoso → Hacer login automático
      toast.push('success', '¡Cuenta creada exitosamente! Iniciando sesión...');

      try {
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });

        if (loginResponse.ok) {
          // Login exitoso → Redirigir a returnUrl
          toast.push('success', '¡Bienvenido a CitaUp!');
          router.push(returnUrl);
        } else {
          // Login falló → Ir a página de login
          toast.push('info', 'Por favor inicia sesión con tu cuenta.');
          router.push('/login');
        }
      } catch (loginError) {
        // Error en login → Ir a página de login
        toast.push('info', 'Por favor inicia sesión con tu cuenta.');
        router.push('/login');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al registrarse';
      setError(errorMessage);
      toast.push('error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading mientras se verifica la sesión
  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Verificando sesión...</div>
      </div>
    );
  }

  // Si ya está autenticado, no mostrar nada (se redirigirá)
  if (session) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="w-full border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/images/logocitaup.jpg" 
              alt="CitaUp Logo" 
              width={40} 
              height={40} 
              className="rounded-full object-cover"
            />
            <span className="text-xl text-gray-800 font-bold">CitaUp</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl text-gray-800 font-bold">Crea tu cuenta</h1>
              <p className="text-gray-500 mt-2">Comienza a gestionar tu negocio de belleza</p>
            </div>

            {returnUrl === '/upgrade' && (
              <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-md text-sm">
                <p className="font-medium">🎉 Estás a un paso de contratar el Plan PRO</p>
                <p className="mt-1 text-blue-700">Completa tu registro y te redirigiremos al pago automáticamente.</p>
              </div>
            )}

            {error && (
              <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nombre completo
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full text-gray-400 px-3 py-2 border rounded-md text-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Tu nombre completo"
                  required
                  disabled={loading}
                />
              </div>

              {/* Username Field */}
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Nombre de usuario
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md text-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="mi-usuario"
                  required
                  disabled={loading}
                  minLength={3}
                  pattern="[a-z0-9_-]+"
                />
                <p className="text-xs text-gray-500">
                  Solo letras minúsculas, números, guiones y guiones bajos. Mínimo 3 caracteres.
                </p>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 text-gray-400  py-2 border rounded-md text-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="tu@email.com"
                  required
                  disabled={loading}
                />
              </div>

              {/* Phone Field (Optional) */}
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Teléfono <span className="text-gray-400 text-xs">(opcional)</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 text-gray-400 py-2 border rounded-md text-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="+1234567890"
                  disabled={loading}
                />
              </div>

              {/* Business Type */}
              <div className="space-y-2">
                <label htmlFor="businessType" className="block text-sm font-medium text-gray-700">
                  Tipo de negocio
                </label>
                <select
                  id="businessType"
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-gray-400  border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="salon">Salón de belleza</option>
                  <option value="barbershop">Barbería</option>
                  <option value="spa">Spa</option>
                  <option value="nails">Uñas</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 text-gray-400  py-2 border rounded-md text-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent pr-10"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0  right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500">La contraseña debe tener al menos 8 caracteres</p>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border text-gray-400 rounded-md text-sm border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent pr-10"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-2">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="acceptTerms"
                      name="acceptTerms"
                      type="checkbox"
                      checked={formData.acceptTerms}
                      onChange={handleChange}
                      className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                      disabled={loading}
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="acceptTerms" className="font-medium text-gray-700">
                      Acepto los{" "}
                      <Link href="/terms" className="text-rose-600 hover:text-rose-500">
                        términos y condiciones
                      </Link>{" "}
                      y la{" "}
                      <Link href="/privacy" className="text-rose-600 hover:text-rose-500">
                        política de privacidad
                      </Link>
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">O regístrate con</span>
                </div>
              </div>

              {/* Google Register Button */}
              <button
                type="button"
                onClick={() => window.location.href = '/api/auth/google'}
                disabled={loading}
                className="w-full flex justify-center items-center gap-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continuar con Google
              </button>
            </form>

            {/* Benefits */}
            <div className="mt-8 space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Al registrarte obtienes:</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-rose-600 mr-2 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Prueba gratuita de 14 días</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-rose-600 mr-2 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Acceso a todas las funciones</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-rose-600 mr-2 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Soporte técnico personalizado</span>
                </li>
              </ul>
            </div>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/login" className="font-medium text-rose-600 hover:text-rose-500">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 border-t">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <p className="text-center text-xs text-gray-500"> 2025 CitaUp. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}