'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [businessType, setBusinessType] = useState('salon');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Verificar si el usuario realmente necesita onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const res = await fetch('/api/auth/onboarding/status', {
          credentials: 'include'
        });
        
        if (!res.ok) {
          // Si no está autenticado, redirigir a login
          router.push('/login');
          return;
        }

        const data = await res.json();
        
        // Si no necesita onboarding, redirigir al dashboard
        if (!data.needsOnboarding) {
          router.push('/dashboard');
          return;
        }

        // Si necesita onboarding, mostrar el formulario
        setCheckingStatus(false);
      } catch (err) {
        console.error('Error verificando onboarding:', err);
        router.push('/login');
      }
    };

    checkOnboardingStatus();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone || undefined, businessType, acceptTerms }),
        credentials: 'include'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al completar el onboarding');
      
      // Redirigir al dashboard después de completar
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  // Mostrar loading mientras se verifica el estado
  if (checkingStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Verificando estado...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-2 text-gray-800">Completa tu perfil</h1>
        <p className="text-gray-600 mb-6 text-sm">Necesitamos algunos datos para configurar tu cuenta.</p>
        {error && <div className="mb-4 text-sm text-red-600">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono (opcional)</label>
            <input
              type="tel"
              className="w-full border rounded-md px-3 py-2 text-sm"
              placeholder="+54911..."
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de negocio</label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              disabled={loading}
            >
              <option value="salon">Salón de belleza</option>
              <option value="barbershop">Barbería</option>
              <option value="spa">Spa</option>
              <option value="nails">Uñas</option>
              <option value="other">Otro</option>
            </select>
          </div>
          <div className="flex items-center">
            <input
              id="acceptTerms"
              type="checkbox"
              className="h-4 w-4 text-rose-600 border-gray-300 rounded"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              disabled={loading}
            />
            <label htmlFor="acceptTerms" className="ml-2 text-sm text-gray-700">
              Acepto los términos y la política de privacidad
            </label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-600 text-white py-2 rounded-md text-sm hover:bg-rose-700 transition"
          >
            {loading ? 'Guardando...' : 'Guardar y continuar'}
          </button>
        </form>
      </div>
    </div>
  );
}


