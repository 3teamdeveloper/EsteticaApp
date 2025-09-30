import { prisma } from '@/lib/db';

export interface TrialStatus {
  isActive: boolean;
  daysRemaining: number;
  isExpired: boolean;
  shouldNotify: boolean;
  trialEndDate: Date | null;
}

/**
 * Calcula el estado del trial para un usuario
 */
export function calculateTrialStatus(user: {
  trialStartDate: Date | null;
  trialEndDate: Date | null;
  isTrialActive: boolean;
  trialExpirationNotified: boolean;
}): TrialStatus {
  const now = new Date();
  
  // Si no hay trial configurado, considerar como activo (nuevo usuario)
  if (!user.trialStartDate || !user.trialEndDate) {
    return {
      isActive: true,
      daysRemaining: 14,
      isExpired: false,
      shouldNotify: false,
      trialEndDate: null
    };
  }

  const trialEndDate = new Date(user.trialEndDate);
  const timeDiff = trialEndDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  const isExpired = timeDiff <= 0;
  const shouldNotify = daysRemaining === 1 && !user.trialExpirationNotified;

  return {
    isActive: user.isTrialActive && !isExpired,
    daysRemaining: Math.max(0, daysRemaining),
    isExpired,
    shouldNotify,
    trialEndDate: trialEndDate
  };
}

/**
 * Inicializa el trial para un nuevo usuario
 */
export async function initializeTrial(userId: number): Promise<void> {
  const now = new Date();
  const trialEndDate = new Date(now.getTime() + (14 * 24 * 60 * 60 * 1000)); // 14 días

  await prisma.user.update({
    where: { id: userId },
    data: {
      trialStartDate: now,
      trialEndDate: trialEndDate,
      isTrialActive: true,
      trialExpirationNotified: false
    }
  });
}

/**
 * Marca que se notificó al usuario sobre la expiración del trial
 */
export async function markTrialNotificationSent(userId: number): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      trialExpirationNotified: true
    }
  });
}

/**
 * Verifica si un usuario tiene acceso a una funcionalidad específica
 */
export function hasAccessToFeature(trialStatus: TrialStatus, feature: 'minilanding' | 'profile' | 'employees' | 'services' | 'create_appointments'): boolean {
  if (trialStatus.isActive) {
    return true;
  }

  // Si el trial expiró, bloquear todas las funcionalidades excepto login y ver datos existentes
  return false;
}

/**
 * Obtiene el estado del trial para un usuario
 */
export async function getUserTrialStatus(userId: number): Promise<TrialStatus> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      trialStartDate: true,
      trialEndDate: true,
      isTrialActive: true,
      trialExpirationNotified: true
    }
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  return calculateTrialStatus(user);
}

/**
 * Middleware helper para verificar trial en APIs
 */
export async function verifyTrialAccess(
  userId: number, 
  feature: 'minilanding' | 'profile' | 'employees' | 'services' | 'create_appointments'
): Promise<{ hasAccess: boolean; trialStatus: TrialStatus }> {
  const trialStatus = await getUserTrialStatus(userId);
  const hasAccess = hasAccessToFeature(trialStatus, feature);
  
  return { hasAccess, trialStatus };
}
