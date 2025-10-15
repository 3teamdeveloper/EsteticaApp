"use client";

import { useState, useEffect } from "react";
import { BusinessHours, Period } from "@/lib/businessHours";
import { useToastContext } from "@/components/ui/toast/ToastProvider";

export default function BusinessHoursConfig() {
  const [hours, setHours] = useState<BusinessHours>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToastContext();

  const days = [
    { key: 0, name: "Domingo" },
    { key: 1, name: "Lunes" },
    { key: 2, name: "Martes" },
    { key: 3, name: "Miércoles" },
    { key: 4, name: "Jueves" },
    { key: 5, name: "Viernes" },
    { key: 6, name: "Sábado" },
  ];

  useEffect(() => {
    loadBusinessHours();
  }, []);

  const loadBusinessHours = async () => {
    try {
      const response = await fetch("/api/business-hours");
      if (response.ok) {
        const data = await response.json();
        setHours(data);
      }
    } catch (error) {
      console.error("Error al cargar horario:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveBusinessHours = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/business-hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hours),
      });
      
      if (response.ok) {
        toast.push('success', 'Horario guardado correctamente');
      } else {
        const error = await response.text();
        toast.push('error', `Error: ${error}`);
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      toast.push('error', 'Error al guardar el horario');
    } finally {
      setSaving(false);
    }
  };

  const updateDay = (dayKey: number, field: keyof BusinessHours[0], value: any) => {
    setHours(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        [field]: value
      }
    }));
  };

  const updatePeriod = (dayKey: number, periodIndex: number, field: keyof Period, value: string) => {
    setHours(prev => {
      const day = prev[dayKey];
      if (!day || !day.periods) return prev;

      const newPeriods = [...day.periods];
      newPeriods[periodIndex] = {
        ...newPeriods[periodIndex],
        [field]: value
      };

      return {
        ...prev,
        [dayKey]: {
          ...day,
          periods: newPeriods
        }
      };
    });
  };

  const addPeriod = (dayKey: number) => {
    setHours(prev => {
      const day = prev[dayKey];
      if (!day || !day.periods || day.periods.length >= 2) return prev;

      const newPeriods = [...day.periods, { startTime: "09:00", endTime: "17:00" }];

      return {
        ...prev,
        [dayKey]: {
          ...day,
          periods: newPeriods
        }
      };
    });
  };

  const removePeriod = (dayKey: number, periodIndex: number) => {
    setHours(prev => {
      const day = prev[dayKey];
      if (!day || !day.periods) return prev;

      const newPeriods = day.periods.filter((_, index) => index !== periodIndex);

      return {
        ...prev,
        [dayKey]: {
          ...day,
          periods: newPeriods
        }
      };
    });
  };

  const initializeDay = (dayKey: number) => {
    if (!hours[dayKey]) {
      setHours(prev => ({
        ...prev,
        [dayKey]: {
          periods: [{ startTime: "09:00", endTime: "17:00" }],
          isOpen: false
        }
      }));
    }
  };

  if (loading) {
    return <div className="p-6">Cargando horarios...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configurar Horario de Atención</h1>
        <p className="text-gray-600 mt-2">
          Configura el horario general de tu negocio. Puedes agregar hasta 2 períodos por día para horarios partidos.
        </p>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        {days.map((day) => {
          const dayData = hours[day.key];
          if (!dayData) {
            initializeDay(day.key);
            return null;
          }

          return (
            <div key={day.key} className="mb-6 p-4 border rounded-lg">
              <div className="flex items-center gap-4 mb-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={dayData.isOpen || false}
                    onChange={(e) => updateDay(day.key, 'isOpen', e.target.checked)}
                    className="rounded"
                  />
                  <span className="font-medium text-gray-900">{day.name}</span>
                </label>
              </div>
              
              {dayData.isOpen && (
                <div className="space-y-4">
                  {dayData.periods?.map((period, periodIndex) => (
                    <div key={periodIndex} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hora de apertura
                        </label>
                        <input
                          type="time"
                          value={period.startTime}
                          onChange={(e) => updatePeriod(day.key, periodIndex, 'startTime', e.target.value)}
                          className="border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div className="text-gray-500">a</div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hora de cierre
                        </label>
                        <input
                          type="time"
                          value={period.endTime}
                          onChange={(e) => updatePeriod(day.key, periodIndex, 'endTime', e.target.value)}
                          className="border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {dayData.periods && dayData.periods.length > 1 && (
                        <button
                          onClick={() => removePeriod(day.key, periodIndex)}
                          className="text-red-500 hover:text-red-700 px-2 py-1"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {(!dayData.periods || dayData.periods.length < 2) && (
                    <button
                      onClick={() => addPeriod(day.key)}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                    >
                      + Agregar período
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
        
        <div className="flex justify-end pt-6 border-t">
          <button
            onClick={saveBusinessHours}
            disabled={saving}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Guardando..." : "Guardar Horario"}
          </button>
        </div>
      </div>
    </div>
  );
} 