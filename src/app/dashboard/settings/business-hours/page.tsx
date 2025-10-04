"use client";

import { useState, useEffect } from "react";
import { useToastContext } from "@/components/ui/toast/ToastProvider";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";

interface Period {
  startTime: string;
  endTime: string;
}

type BusinessHours = Record<number, Period[]>;

export default function BusinessHoursConfig() {
  const [hours, setHours] = useState<BusinessHours>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToastContext();
  const router = useRouter();
  const { session } = useSession();

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
    // Verificar acceso para empleados
    if (session?.role === 'EMPLEADO') {
      router.push('/dashboard');
      return;
    }
    
    loadBusinessHours();
  }, [session, router]);

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
        toast.push('success', 'Horarios guardados correctamente');
      } else {
        const error = await response.text();
        toast.push('error', `Error: ${error}`);
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      toast.push('error', 'Error al guardar los horarios');
    } finally {
      setSaving(false);
    }
  };

  const addPeriod = (dayKey: number) => {
    setHours(prev => ({
      ...prev,
      [dayKey]: [
        ...(prev[dayKey] || []),
        { startTime: "09:00", endTime: "17:00" }
      ]
    }));
  };

  const removePeriod = (dayKey: number, periodIndex: number) => {
    setHours(prev => ({
      ...prev,
      [dayKey]: prev[dayKey]?.filter((_, index) => index !== periodIndex) || []
    }));
  };

  const updatePeriod = (dayKey: number, periodIndex: number, field: keyof Period, value: string) => {
    setHours(prev => {
      const dayPeriods = [...(prev[dayKey] || [])];
      dayPeriods[periodIndex] = {
        ...dayPeriods[periodIndex],
        [field]: value
      };
      return {
        ...prev,
        [dayKey]: dayPeriods
      };
    });
  };

  // No renderizar nada para empleados mientras se redirige
  if (session?.role === 'EMPLEADO') {
    return null;
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/dashboard/settings"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Horarios de Atención</h1>
          <p className="text-gray-600 mt-1">
            Configura los horarios generales de tu negocio. Estos horarios se aplicarán automáticamente cuando asignes servicios a empleados.
          </p>
        </div>
      </div>
      
      <div>
        <div className="space-y-6">
          {days.map((day) => {
            const dayPeriods = hours[day.key] || [];
            const hasSchedules = dayPeriods.length > 0;

            return (
              <div key={day.key} className="border border-gray-400 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">{day.name}</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addPeriod(day.key)}
                    className="flex text-sm md:text-[0.925rem] items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar período
                  </Button>
                </div>
                
                {hasSchedules ? (
                  <div className="space-y-3">
                    {dayPeriods.map((period, periodIndex) => (
                      <div key={periodIndex} className="flex items-center gap-4 p-3 flex-wrap  rounded-lg">
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-gray-700 w-16">
                            Desde:
                          </label>
                          <input
                            type="time"
                            value={period.startTime}
                            onChange={(e) => updatePeriod(day.key, periodIndex, 'startTime', e.target.value)}
                            className="border rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-gray-700 w-16">
                            Hasta:
                          </label>
                          <input
                            type="time"
                            value={period.endTime}
                            onChange={(e) => updatePeriod(day.key, periodIndex, 'endTime', e.target.value)}
                            className="border rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removePeriod(day.key, periodIndex)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm italic">Sin horarios configurados</p>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="flex justify-end pt-6 border-t mt-6">
          <Button
            onClick={saveBusinessHours}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? "Guardando..." : "Guardar Horarios"}
          </Button>
        </div>
      </div>
    </div>
  );
}
