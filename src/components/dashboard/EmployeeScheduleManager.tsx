"use client";

import { useState, useEffect } from "react";
import { useToastContext } from "@/components/ui/toast/ToastProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, Plus, X, Save } from "lucide-react";

interface Schedule {
  id: number;
  dayOfWeek: number;
  period: number;
  startTime: string;
  endTime: string;
  service: {
    id: number;
    name: string;
    isActive: boolean;
    deleted: boolean;
  };
}

interface Service {
  id: number;
  name: string;
  isActive: boolean;
  deleted: boolean;
}

interface ScheduleFormData {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  serviceId: string;
  periods: { startTime: string; endTime: string }[];
}

interface EmployeeScheduleManagerProps {
  employeeId: number;
  employeeName: string;
}

export default function EmployeeScheduleManager({ employeeId, employeeName }: EmployeeScheduleManagerProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [assignedServices, setAssignedServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [editingDay, setEditingDay] = useState<{ dayOfWeek: number; serviceId: number } | null>(null);
  const [formData, setFormData] = useState<ScheduleFormData>({
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "17:00",
    serviceId: "",
    periods: []
  });
  const toast = useToastContext();
  const [deleteModal, setDeleteModal] = useState<{ open: boolean, schedules?: Schedule[] }>({ open: false });

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
    loadSchedules();
    loadAssignedServices();
  }, [employeeId]);

  const loadSchedules = async () => {
    try {
      const response = await fetch(`/api/employees/${employeeId}/schedules`);
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      }
    } catch (error) {
      console.error("Error al cargar horarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAssignedServices = async () => {
    try {
      const response = await fetch(`/api/employees/${employeeId}/services`);
      if (response.ok) {
        const data = await response.json();
        // Filtrar servicios eliminados (deleted: true)
        const activeServices = data.filter((service: any) => !service.deleted);
        setAssignedServices(activeServices);
      }
    } catch (error) {
      console.error("Error al cargar servicios asignados:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedServiceId) {
      toast.push('error', 'Error: No se ha seleccionado un servicio');
      return;
    }
    
    try {
      // Si no hay franjas, usar el horario simple (por compatibilidad)
      const periods = formData.periods.length > 0 ? formData.periods : [{ startTime: formData.startTime, endTime: formData.endTime }];
      for (let i = 0; i < periods.length; i++) {
        const period = periods[i];
        await fetch(`/api/employees/${employeeId}/schedules`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dayOfWeek: formData.dayOfWeek,
            period: i + 1,
            startTime: period.startTime,
            endTime: period.endTime,
            serviceId: selectedServiceId,
          }),
        });
      }
      setShowForm(false);
      setSelectedServiceId(null);
      setFormData({
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "17:00",
        serviceId: "",
        periods: []
      });
      loadSchedules();
    } catch (error) {
      console.error("Error al crear horario:", error);
      toast.push('error', 'Error al crear el horario');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingDay || !formData.serviceId) {
      toast.push('error', 'Datos incompletos');
      return;
    }
    
    try {
      // Obtener los períodos actuales para este día y servicio
      const currentSchedules = schedules.filter(s => 
        s.dayOfWeek === editingDay.dayOfWeek && 
        s.service.id === editingDay.serviceId
      );

      // Eliminar horarios existentes para este día y servicio
      for (const schedule of currentSchedules) {
        await fetch(`/api/employees/${employeeId}/schedules/${schedule.id}`, {
          method: "DELETE",
        });
      }

      // Crear nuevos horarios basados en los períodos del formulario
      const periods = formData.periods;
      for (let i = 0; i < periods.length; i++) {
        const period = periods[i];
        await fetch(`/api/employees/${employeeId}/schedules`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            dayOfWeek: editingDay.dayOfWeek,
            period: i + 1,
            startTime: period.startTime,
            endTime: period.endTime,
            serviceId: editingDay.serviceId,
          }),
        });
      }

      setEditingDay(null);
      setFormData({
        dayOfWeek: 1,
        startTime: "09:00",
        endTime: "17:00",
        serviceId: "",
        periods: []
      });
      loadSchedules();
    } catch (error) {
      console.error("Error al actualizar horario:", error);
      toast.push('error', 'Error al actualizar el horario');
    }
  };

  const startEdit = (daySchedules: Schedule[]) => {
    const firstSchedule = daySchedules[0];
    const periods = daySchedules.map(s => ({
      startTime: s.startTime,
      endTime: s.endTime
    }));

    setEditingDay({ dayOfWeek: firstSchedule.dayOfWeek, serviceId: firstSchedule.service.id });
    setFormData({
      dayOfWeek: firstSchedule.dayOfWeek,
      startTime: "09:00",
      endTime: "17:00",
      serviceId: firstSchedule.service.id.toString(),
      periods: periods
    });
  };

  const cancelEdit = () => {
    setEditingDay(null);
    setFormData({
      dayOfWeek: 1,
      startTime: "09:00",
      endTime: "17:00",
      serviceId: "",
      periods: []
    });
  };

  const handleDeleteSchedule = (daySchedules: Schedule[]) => {
    setDeleteModal({ open: true, schedules: daySchedules });
  };

  const confirmDeleteSchedule = async () => {
    if (!deleteModal.schedules) return;
    
    try {
      // Eliminar todos los horarios del día
      for (const schedule of deleteModal.schedules) {
        await fetch(`/api/employees/${employeeId}/schedules/${schedule.id}`, {
          method: "DELETE",
        });
      }
      loadSchedules();
      toast.push('success', 'Horario eliminado correctamente');
    } catch (error) {
      console.error("Error al eliminar horario:", error);
      toast.push('error', 'Error al eliminar el horario');
    } finally {
      setDeleteModal({ open: false });
    }
  };

  const addPeriod = () => {
    setFormData(prev => ({
      ...prev,
      periods: [...prev.periods, { startTime: "09:00", endTime: "17:00" }]
    }));
  };

  const removePeriod = (index: number) => {
    setFormData(prev => ({
      ...prev,
      periods: prev.periods.filter((_, i) => i !== index)
    }));
  };

  const updatePeriod = (index: number, field: 'startTime' | 'endTime', value: string) => {
    setFormData(prev => ({
      ...prev,
      periods: prev.periods.map((period, i) => 
        i === index ? { ...period, [field]: value } : period
      )
    }));
  };

  const openAddForm = (serviceId: number) => {
    setSelectedServiceId(serviceId);
    setShowForm(true);
    setFormData({
      dayOfWeek: 1,
      startTime: "09:00",
      endTime: "17:00",
      serviceId: serviceId.toString(),
      periods: []
    });
  };

  const closeAddForm = () => {
    setShowForm(false);
    setSelectedServiceId(null);
    setFormData({
      dayOfWeek: 1,
      startTime: "09:00",
      endTime: "17:00",
      serviceId: "",
      periods: []
    });
  };

  // Agrupar horarios por servicio y día
  const schedulesByService = schedules.reduce((acc, schedule) => {
    const serviceId = schedule.service.id;
    if (!acc[serviceId]) {
      acc[serviceId] = {
        service: schedule.service,
        schedules: []
      };
    }
    acc[serviceId].schedules.push(schedule);
    return acc;
  }, {} as Record<number, { service: Service; schedules: Schedule[] }>);

  // Función para agrupar horarios por día
  const groupSchedulesByDay = (schedules: Schedule[]) => {
    const grouped = schedules.reduce((acc, schedule) => {
      const dayKey = schedule.dayOfWeek;
      if (!acc[dayKey]) {
        acc[dayKey] = [];
      }
      acc[dayKey].push(schedule);
      return acc;
    }, {} as Record<number, Schedule[]>);

    // Ordenar períodos dentro de cada día
    Object.keys(grouped).forEach(dayKey => {
      grouped[parseInt(dayKey)].sort((a, b) => a.period - b.period);
    });

    return grouped;
  };

  // Función para formatear horarios
  const formatSchedules = (daySchedules: Schedule[]) => {
    const sorted = daySchedules.sort((a, b) => a.period - b.period);
    return sorted.map(s => `${s.startTime} a ${s.endTime}`).join(' y ');
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Horarios organizados por servicio */}
      <div className="space-y-6">
        {assignedServices.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-800 text-center py-8">
              Este empleado no tiene servicios asignados. Asigna servicios desde la página de empleados.
            </p>
          </div>
        ) : (
          assignedServices.map((service) => {
            const serviceSchedules = schedulesByService[service.id]?.schedules || [];
            const schedulesByDay = groupSchedulesByDay(serviceSchedules);
            const isServiceActive = (service as any).isActive !== false; // Verificar si el servicio está activo
            
            return (
              <div key={service.id} className={`bg-white shadow rounded-lg p-6 ${!isServiceActive ? 'opacity-60' : ''}`}>
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {service.name}
                    </h3>
                    {!isServiceActive && (
                      <span className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded-full">
                        Deshabilitado
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-800">
                      {serviceSchedules.length} horario{serviceSchedules.length !== 1 ? 's' : ''}
                    </span>
                    <Button
                      onClick={() => openAddForm(service.id)}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Horario
                    </Button>
                  </div>
                </div>

                {/* Formulario para agregar horario a este servicio específico */}
                {showForm && selectedServiceId === service.id && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-md font-medium text-gray-900">
                        Agregar Horario para {service.name}
                      </h4>
                      <Button
                        onClick={closeAddForm}
                        variant="outline"
                        size="sm"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Día
                          </label>
                          <select
                            value={formData.dayOfWeek}
                            onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                            className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                          >
                            {days.map((day) => (
                              <option key={day.key} value={day.key}>
                                {day.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Franjas horarias */}
                      <div className="space-y-4">
                        {formData.periods.length === 0 && (
                          <div className="text-gray-800 text-sm">No hay franjas horarias agregadas</div>
                        )}
                        {formData.periods.map((period, index) => (
                          <div key={index} className="flex items-center gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Inicio
                              </label>
                              <Input
                                type="time"
                                value={period.startTime}
                                onChange={(e) => updatePeriod(index, 'startTime', e.target.value)}
                                className="w-32"
                              />
                            </div>
                            <div className="text-gray-800 mt-6">a</div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Fin
                              </label>
                              <Input
                                type="time"
                                value={period.endTime}
                                onChange={(e) => updatePeriod(index, 'endTime', e.target.value)}
                                className="w-32"
                              />
                            </div>
                            {formData.periods.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removePeriod(index)}
                                className="text-red-500 hover:text-red-700 mt-6"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addPeriod}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar franja horaria
                        </Button>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={closeAddForm}
                        >
                          Cancelar
                        </Button>
                        <Button type="submit">
                          Guardar
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="space-y-3">
                  {Object.entries(schedulesByDay)
                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                    .map(([dayKey, daySchedules]) => (
                      <div key={dayKey} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <span className="font-medium text-gray-900 min-w-[80px]">
                              {days.find(d => d.key === parseInt(dayKey))?.name}
                            </span>
                            <span className="text-gray-800">
                              {formatSchedules(daySchedules)}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEdit(daySchedules)}
                              className="text-gray-800"
                            >
                              <Edit className="w-4 h-4 text-gray-800" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteSchedule(daySchedules)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4 text-gray-800" />
                            </Button>
                          </div>
                        </div>

                        {/* Formulario de edición */}
                        {editingDay && 
                         editingDay.dayOfWeek === parseInt(dayKey) && 
                         editingDay.serviceId === service.id && (
                          <form onSubmit={handleEdit} className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <div className="space-y-4">
                              {formData.periods.map((period, index) => (
                                <div key={index} className="flex items-center gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Inicio
                                    </label>
                                    <Input
                                      type="time"
                                      value={period.startTime}
                                      onChange={(e) => updatePeriod(index, 'startTime', e.target.value)}
                                      className="w-32"
                                    />
                                  </div>
                                  <div className="text-gray-800 mt-6">a</div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Fin
                                    </label>
                                    <Input
                                      type="time"
                                      value={period.endTime}
                                      onChange={(e) => updatePeriod(index, 'endTime', e.target.value)}
                                      className="w-32"
                                    />
                                  </div>
                                  {formData.periods.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={() => removePeriod(index)}
                                      className="text-red-500 hover:text-red-700 mt-6"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                              
                              {formData.periods.length < 2 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={addPeriod}
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Agregar franja horaria
                                </Button>
                              )}
                            </div>
                            
                            <div className="flex justify-end gap-2 mt-4">
                              <Button type="button" variant="outline" onClick={cancelEdit}>
                                Cancelar
                              </Button>
                              <Button type="submit">
                                <Save className="w-4 h-4 mr-2" />
                                Guardar
                              </Button>
                            </div>
                          </form>
                        )}
                      </div>
                    ))}
                  
                  {Object.keys(schedulesByDay).length === 0 && (
                    <div className="text-center py-4 text-gray-800">
                      No hay horarios configurados para este servicio
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      {deleteModal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
            <div className="flex items-center gap-2 mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
              <span className="font-bold text-lg">Eliminar horario</span>
            </div>
            <p className="mb-6">¿Seguro que deseas eliminar este horario?</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteModal({ open: false })}>
                Cancelar
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={confirmDeleteSchedule}
              >
                Sí, eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 