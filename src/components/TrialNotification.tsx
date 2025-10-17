"use client";

import { useState, useEffect } from 'react';
import { AlertTriangle, X, Clock, CreditCard } from 'lucide-react';
import { useTrial } from '@/hooks/useTrial';

interface TrialNotificationProps {
  onClose?: () => void;
}

export default function TrialNotification({ onClose }: TrialNotificationProps) {
  const { trialStatus, subscriptionType, markNotificationSent } = useTrial();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (trialStatus?.shouldNotify) {
      setIsVisible(true);
    }
  }, [trialStatus]);

  const handleClose = async () => {
    setIsVisible(false);
    await markNotificationSent();
    onClose?.();
  };

  const handleUpgrade = () => {
    // Aquí iría la lógica para redirigir a la página de upgrade
    window.open('/upgrade', '_blank');
  };

  if (!isVisible || !trialStatus) {
    return null;
  }

  const isTrial = subscriptionType === 'trial';
  const title = isTrial ? 'Tu trial expira pronto' : 'Tu suscripción expira pronto';
  const message = isTrial 
    ? `Tu prueba gratuita de 14 días expira en ${trialStatus.daysRemaining} día${trialStatus.daysRemaining !== 1 ? 's' : ''}.`
    : `Tu suscripción expira en ${trialStatus.daysRemaining} día${trialStatus.daysRemaining !== 1 ? 's' : ''}.`;
  const buttonText = isTrial ? 'Actualizar Plan' : 'Renovar Suscripción';

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-white border border-orange-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              {title}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {message} {isTrial ? 'Actualiza tu plan' : 'Renueva tu suscripción'} para mantener todas las funcionalidades.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleUpgrade}
                className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 text-white text-xs font-medium rounded-md hover:bg-rose-700 transition-colors"
              >
                <CreditCard className="w-3 h-3" />
                {buttonText}
              </button>
              <button
                onClick={handleClose}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
              >
                Recordar después
              </button>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Componente para mostrar cuando el trial ha expirado
export function TrialExpiredBanner() {
  const { trialStatus, subscriptionType } = useTrial();

  if (!trialStatus?.isExpired) {
    return null;
  }

  const isTrial = subscriptionType === 'trial';
  const message = isTrial
    ? '¡Tu trial expiró! Contrata el plan que necesites para seguir gestionando tu negocio sin límites.'
    : '¡Tu suscripción expiró! Renueva para seguir gestionando tu negocio sin límites.';
  const buttonText = isTrial ? 'Contratar Plan' : 'Renovar Ahora';

  return (
    <div className="bg-orange-100 border-l-4 border-red-400 p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{message}</p>
          </div>
        </div>
        <a
          href="/upgrade"
          className="ml-4 px-4 py-2 bg-rose-600 text-white text-sm font-medium rounded-md hover:bg-rose-700 transition-colors"
        >
          {buttonText}
        </a>
      </div>
    </div>
  );
}
