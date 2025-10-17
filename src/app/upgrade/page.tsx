"use client";

import { useState } from 'react';
import { CheckCircle, CreditCard, Star, Zap, Shield, Users } from 'lucide-react';
import { useTrial } from '@/hooks/useTrial';

export default function UpgradePage() {
  const { trialStatus } = useTrial();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    
    try {
      console.log('🛒 Iniciando proceso de pago...');
      
      // Llamar a la API para crear la preferencia de pago
      const response = await fetch('/api/payments/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planName: 'Plan PRO - Suscripción Mensual'
        }),
      });

      const data = await response.json();

      if (data.success && data.initPoint) {
        console.log('✅ Preferencia creada, redirigiendo a Mercado Pago...');
        // Redirigir al usuario a Mercado Pago
        window.location.href = data.initPoint;
      } else {
        throw new Error(data.error || 'No se pudo crear la preferencia de pago');
      }
    } catch (error: any) {
      console.error('❌ Error al procesar el pago:', error);
      const errorMsg = error?.message || 'Error desconocido';
      alert(`Hubo un error al procesar el pago: ${errorMsg}\n\nRevisa la consola del navegador (F12) para más detalles.`);
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: <Users className="w-5 h-5" />,
      title: "Gestión de Empleados",
      description: "Administra tu equipo y asigna servicios"
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Servicios Ilimitados",
      description: "Crea y gestiona todos los servicios que necesites"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Perfil Público",
      description: "Tu minilanding personalizada para clientes"
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      title: "Reservas Ilimitadas",
      description: "Crea todas las reservas que necesites"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Actualiza tu Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Desbloquea todas las funcionalidades y lleva tu negocio al siguiente nivel
          </p>
          {trialStatus && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-800 rounded-lg">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">
                {trialStatus.isExpired 
                  ? 'Tu trial ha expirado' 
                  : `${trialStatus.daysRemaining} días restantes en tu trial`
                }
              </span>
            </div>
          )}
        </div>

        {/* Plan Card */}
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Header del plan */}
            <div className="bg-gradient-to-r from-rose-500 to-pink-600 px-8 py-6 text-white text-center">
              <h2 className="text-2xl font-bold mb-2">Plan Pro</h2>
              <div className="text-4xl font-bold mb-2">$20</div>
              <div className="text-rose-100">por mes</div>
            </div>

            {/* Features */}
            <div className="px-8 py-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Todo lo que necesitas para tu negocio
              </h3>
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{feature.title}</div>
                      <div className="text-sm text-gray-600">{feature.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Button */}
            <div className="px-8 pb-8">
              <button
                onClick={handleUpgrade}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-rose-600 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Actualizar Ahora
                  </>
                )}
              </button>
              <p className="text-xs text-gray-500 text-center mt-3">
                Cancelación en cualquier momento • Soporte 24/7
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            ¿Por qué elegir nuestro Plan Pro?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Sin Límites</h4>
              <p className="text-gray-600">Crea tantos servicios, empleados y reservas como necesites</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Seguro y Confiable</h4>
              <p className="text-gray-600">Tus datos están protegidos con la mejor tecnología</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Soporte Dedicado</h4>
              <p className="text-gray-600">Equipo de soporte disponible para ayudarte</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
