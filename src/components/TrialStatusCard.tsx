"use client";

import { Clock, AlertTriangle, CheckCircle, CreditCard } from 'lucide-react';
import { useTrial } from '@/hooks/useTrial';
import Link from 'next/link';

export default function TrialStatusCard() {
  const { trialStatus, subscriptionStatus, subscriptionPlan, loading } = useTrial();
  
  const isPaidSubscriber = subscriptionStatus === 'active' && subscriptionPlan !== 'free';

  if (loading || !trialStatus) {
    return null;
  }

  const getStatusIcon = () => {
    if (trialStatus.isExpired) {
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    } else if (trialStatus.daysRemaining <= 3) {
      return <AlertTriangle className="w-5 h-5 text-orange-500" />;
    } else {
      return <Clock className="w-5 h-5 text-green-500" />;
    }
  };

  const getStatusColor = () => {
    if (trialStatus.isExpired) {
      return 'border-red-200 bg-red-50';
    } else if (trialStatus.daysRemaining <= 3) {
      return 'border-orange-200 bg-orange-50';
    } else {
      return 'border-green-200 bg-green-50';
    }
  };

  const getStatusText = () => {
    if (trialStatus.isExpired) {
      return 'Trial expirado';
    } else if (trialStatus.daysRemaining === 1) {
      return 'Trial expira mañana';
    } else if (trialStatus.daysRemaining <= 3) {
      return `Trial expira en ${trialStatus.daysRemaining} días`;
    } else {
      return `${trialStatus.daysRemaining} días restantes`;
    }
  };

  const getStatusDescription = () => {
    if (trialStatus.isExpired) {
      return 'Tu período de acceso ha terminado. Actualiza tu plan para continuar usando todas las funcionalidades.';
    } else if (trialStatus.daysRemaining <= 3) {
      return isPaidSubscriber 
        ? 'Tu suscripción está por vencer. Renueva para mantener el acceso completo.'
        : 'Tu trial está por expirar. Considera actualizar tu plan para mantener el acceso completo.';
    } else {
      return isPaidSubscriber
        ? `Tienes acceso completo al plan ${subscriptionPlan.toUpperCase()}.`
        : 'Estás disfrutando de tu prueba gratuita de 14 días.';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor()}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getStatusIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900">
                  {getStatusText()}
                </h3>
                {!trialStatus.isExpired && (
                  <span className="text-xs text-gray-500">
                    {trialStatus.daysRemaining} días
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {getStatusDescription()}
              </p>
            </div>
            {/* Botón Actualizar siempre visible a la derecha */}
            {trialStatus.isActive && (
              <Link
                href="/upgrade"
                className="flex-shrink-0 inline-flex items-center gap-1 px-4 py-2 bg-rose-600 text-white text-sm font-medium rounded-md hover:bg-rose-700 transition-colors"
              >
                <CreditCard className="w-4 h-4" />
                Actualizar
              </Link>
            )}
          </div>
          {/* Botón de actualizar cuando está expirado - SOLO UNO */}
          {!trialStatus.isActive && (
            <div className="mt-3">
              <Link
                href="/upgrade"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-600 text-white text-xs font-medium rounded-md hover:bg-rose-700 transition-colors"
              >
                <CreditCard className="w-3 h-3" />
                Actualizar Plan
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
