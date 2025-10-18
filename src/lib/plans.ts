// Definición de planes disponibles en CitaUp

export const PLANS = {
  free: {
    id: 'free',
    name: 'Gratis',
    description: 'Trial de 14 días',
    price: 0,
    duration: 14, // días
    features: [
      'Acceso completo por 14 días',
      'Gestión de empleados',
      'Servicios ilimitados',
      'Perfil público',
    ],
  },
  pro: {
    id: 'pro',
    name: 'PRO',
    description: 'Perfecto para negocios pequeños y medianos',
    monthly: {
      price: 28000, // ARS (actualizar según precio real)
      duration: 30, // días
    },
    yearly: {
      price: 280000, // 10 meses de precio (2 meses gratis)
      duration: 365,
    },
    features: [
      'Empleados ilimitados',
      'Servicios ilimitados',
      'Perfil público personalizable',
      'Sistema de reservas completo',
      'Reportes y estadísticas',
      'Notificaciones automáticas',
      'Soporte por email',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Para cadenas y empresas grandes',
    monthly: {
      price: 50000, // ARS (precio ejemplo)
      duration: 30,
    },
    yearly: {
      price: 500000,
      duration: 365,
    },
    features: [
      'Todo lo del plan PRO',
      'Múltiples sucursales',
      'API personalizada',
      'Integración con sistemas existentes',
      'Soporte prioritario 24/7',
      'Capacitación personalizada',
      'Reportes avanzados',
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;
export type BillingType = 'monthly' | 'yearly';

// Helper para obtener precio de un plan
export function getPlanPrice(planId: PlanId, billing: BillingType = 'monthly'): number {
  if (planId === 'free') {
    return 0;
  }
  
  const plan = PLANS[planId];
  return plan[billing].price;
}

// Helper para obtener duración de un plan
export function getPlanDuration(planId: PlanId, billing: BillingType = 'monthly'): number {
  if (planId === 'free') {
    return PLANS.free.duration;
  }
  
  const plan = PLANS[planId];
  return plan[billing].duration;
}

// Helper para validar si un plan existe
export function isValidPlan(planId: string): planId is PlanId {
  return planId in PLANS;
}
