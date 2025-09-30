export interface Period {
  startTime: string;
  endTime: string;
}

export interface DaySchedule {
  periods: Period[];
  isOpen: boolean;
}

export interface BusinessHours {
  [dayOfWeek: number]: DaySchedule;
}

export const defaultBusinessHours: BusinessHours = {
  0: { 
    periods: [{ startTime: "09:00", endTime: "17:00" }], 
    isOpen: false 
  }, // Domingo
  1: { 
    periods: [
      { startTime: "09:00", endTime: "13:00" },
      { startTime: "16:00", endTime: "20:00" }
    ], 
    isOpen: true 
  }, // Lunes
  2: { 
    periods: [{ startTime: "09:00", endTime: "17:00" }], 
    isOpen: true 
  }, // Martes
  3: { 
    periods: [{ startTime: "09:00", endTime: "17:00" }], 
    isOpen: true 
  }, // Miércoles
  4: { 
    periods: [{ startTime: "09:00", endTime: "17:00" }], 
    isOpen: true 
  }, // Jueves
  5: { 
    periods: [{ startTime: "09:00", endTime: "17:00" }], 
    isOpen: true 
  }, // Viernes
  6: { 
    periods: [{ startTime: "09:00", endTime: "13:00" }], 
    isOpen: true 
  }, // Sábado
};

// Función para obtener horario del negocio
export function getBusinessHours(userId: number): BusinessHours {
  // Aquí podrías cargar desde un archivo JSON específico por usuario
  // Por ahora retornamos el default
  return defaultBusinessHours;
} 