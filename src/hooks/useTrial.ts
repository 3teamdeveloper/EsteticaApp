"use client";

import { useState, useEffect } from 'react';
import { TrialStatus } from '@/lib/trial';

export function useTrial() {
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
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
    subscriptionType,
    loading,
    error,
    hasAccess,
    markNotificationSent,
    refetch: fetchTrialStatus
  };
}
