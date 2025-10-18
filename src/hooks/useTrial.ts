"use client";

import { useState, useEffect } from 'react';
import { TrialStatus } from '@/lib/trial';

export function useTrial() {
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  // Nuevos estados
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('trial');
  const [subscriptionPlan, setSubscriptionPlan] = useState<string>('free');
  const [subscriptionBilling, setSubscriptionBilling] = useState<string>('monthly');
  // Mantener por compatibilidad
  const [subscriptionType, setSubscriptionType] = useState<'trial' | 'paid'>('trial');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrialStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/trial/status');
      
      if (!response.ok) {
        throw new Error('Error al obtener estado del trial');
      }
      
      const data = await response.json();
      setTrialStatus(data);
      // Guardar nuevos campos
      setSubscriptionStatus(data.subscriptionStatus || 'trial');
      setSubscriptionPlan(data.subscriptionPlan || 'free');
      setSubscriptionBilling(data.subscriptionBilling || 'monthly');
      // Mantener campo viejo por compatibilidad
      setSubscriptionType(data.subscriptionType || 'trial');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrialStatus();
  }, []);

  const hasAccess = (feature: 'minilanding' | 'profile' | 'employees' | 'services' | 'create_appointments'): boolean => {
    if (!trialStatus) return false;
    
    if (trialStatus.isActive) {
      return true;
    }

    // Si el trial expiró, bloquear todas las funcionalidades excepto login y ver datos existentes
    return false;
  };

  const markNotificationSent = async () => {
    try {
      const response = await fetch('/api/trial/notify', {
        method: 'POST'
      });
      
      if (response.ok) {
        // Actualizar el estado local
        if (trialStatus) {
          setTrialStatus({
            ...trialStatus,
            shouldNotify: false
          });
        }
      }
    } catch (err) {
      console.error('Error al marcar notificación como enviada:', err);
    }
  };

  return {
    trialStatus,
    // Nuevos campos
    subscriptionStatus,
    subscriptionPlan,
    subscriptionBilling,
    // Campo viejo (mantener por compatibilidad)
    subscriptionType,
    loading,
    error,
    hasAccess,
    markNotificationSent,
    refetch: fetchTrialStatus
  };
}
