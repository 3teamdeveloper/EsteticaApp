"use client";

import { Clock, AlertTriangle, CheckCircle, CreditCard } from 'lucide-react';
import { useTrial } from '@/hooks/useTrial';

export default function TrialStatusCard() {
  const { trialStatus, loading } = useTrial();

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
      return 'Tu prueba gratuita ha terminado. Actualiza tu plan para continuar usando todas las funcionalidades.';
    } else if (trialStatus.daysRemaining <= 3) {
      return 'Tu trial está por expirar. Considera actualizar tu plan para mantener el acceso completo.';
    } else {
      return 'Estás disfrutando de tu prueba gratuita de 14 días.';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${getStatusColor()}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {getStatusIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
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
          {!trialStatus.isActive && (
            <div className="mt-3">
              <a
                href="/upgrade"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-600 text-white text-xs font-medium rounded-md hover:bg-rose-700 transition-colors"
              >
                <CreditCard className="w-3 h-3" />
                Actualizar Plan
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
