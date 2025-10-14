'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useToastContext } from '@/components/ui/toast/ToastProvider';
import { X, Calendar, Clock, User, Phone, Mail, ArrowLeft, ArrowRight } from 'lucide-react';
import Avatar from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { triggerNewAppointmentNotification } from '@/lib/notifications';

interface Service {
  id: number;
  name: string;
  duration: number;
  price: number;
  description: string | null;
}

interface Employee {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  employeeImage: string | null;
  service: Service;
  schedules: Schedule[];
  appointments: { id: number; date: string; status: string }[];
}

interface Schedule {
  id: number;
  dayOfWeek: number;
  period: number;
  startTime: string;
  endTime: string;
}

interface TimeSlot {
  time: string;
  date: Date;
  available: boolean;
  employeeId: number;
  employeeName: string;
}

interface UnifiedTimeSlot {
  time: string;
  date: Date;
  available: boolean;
  employeeCount: number;
  employees: { id: number; name: string }[];
  isUnified: boolean;
}

interface BookingModalProps {
  service: Service;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ service, isOpen, onClose }: BookingModalProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(new Date().getDay()); // Día actual por defecto
  const [timeSlots, setTimeSlots] = useState<UnifiedTimeSlot[]>([]);
  const [individualTimeSlots, setIndividualTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<UnifiedTimeSlot | TimeSlot | null>(null);
  const [showClientForm, setShowClientForm] = useState(false);
  const [clientData, setClientData] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [assignedEmployee, setAssignedEmployee] = useState<{ id: number; name: string } | null>(null);
  const formRef = useRef<HTMLDivElement | null>(null);
  const schedulesRef = useRef<HTMLDivElement | null>(null);
  const [formSelectedEmployee, setFormSelectedEmployee] = useState<number | null>(null);
  const toast = useToastContext();

  const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  useEffect(() => {
    if (isOpen) {
      loadEmployees();
    }
  }, [isOpen, service.id]);

  useEffect(() => {
    if (employees.length > 0) {
      generateTimeSlots();
    }
  }, [employees, selectedEmployee, currentWeek, selectedDay]);

  useEffect(() => {
    if (isOpen) {
      setBookingSuccess(false);
      setAssignedEmployee(null);
      setShowClientForm(false);
      setSelectedTimeSlot(null);
      setFormSelectedEmployee(null);
      setClientData({ name: '', phone: '', email: '' });
    }
  }, [isOpen]);

  // Manejar tecla ESC para cerrar (solo desktop)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        // Solo en desktop (ancho >= 768px)
        if (window.innerWidth >= 768) {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll del body cuando el modal está abierto
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Manejar click en backdrop (solo desktop)
  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    // Solo cerrar si el click es directamente en el backdrop (no en el contenido)
    // Y solo en desktop (ancho >= 768px)
    if (e.target === e.currentTarget && window.innerWidth >= 768) {
      onClose();
    }
  }, [onClose]);

  const loadEmployees = async () => {
    try {
      setLoading(true);

      const response = await fetch(`/api/services/${service.id}/employees`);

      if (response.ok) {
        const data = await response.json();
        setEmployees(data);
      } else {
        const errorText = await response.text();
        toast.push('error', 'Error al cargar los empleados disponibles');
      }
    } catch (error) {
      toast.push('error', 'Error al cargar los empleados disponibles');
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = () => {
    const allSlots: TimeSlot[] = [];
    const weekStart = new Date(currentWeek);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const now = new Date();

    // Solo generar slots para el día seleccionado
    const currentDate = new Date(weekStart);
    currentDate.setDate(weekStart.getDate() + selectedDay);
    const dayOfWeek = currentDate.getDay();

    // Filtrar empleados si hay uno seleccionado
    const relevantEmployees = selectedEmployee
      ? employees.filter(emp => emp.id === selectedEmployee)
      : employees;

    // Generar todos los slots individuales primero
    relevantEmployees.forEach(employee => {
      const daySchedules = employee.schedules.filter(s => s.dayOfWeek === dayOfWeek);
      daySchedules.forEach(schedule => {
        const startTime = new Date(`2000-01-01T${schedule.startTime}`);
        const endTime = new Date(`2000-01-01T${schedule.endTime}`);
        const duration = service.duration;

        let currentTime = new Date(startTime);
        while (currentTime < endTime) {
          const timeString = currentTime.toTimeString().slice(0, 5);
          const slotEndTime = new Date(currentTime.getTime() + duration * 60000);
          if (slotEndTime <= endTime) {
            // Crear la fecha completa para el slot
            const slotDate = new Date(currentDate);
            slotDate.setHours(currentTime.getHours(), currentTime.getMinutes(), 0, 0);

            // SOLO mostrar slots futuros
            if (slotDate >= now) {
              // Verificar si hay una reserva para este slot (solo PENDING, CONFIRMED o COMPLETED)
              const isReserved = employee.appointments.some(app => {
                const appDate = new Date(app.date);
                const isActiveStatus = ['PENDING', 'CONFIRMED', 'COMPLETED'].includes(app.status?.toUpperCase());
                // Comparar usando valores UTC para evitar problemas de zona horaria
                return isActiveStatus && (
                  slotDate.getUTCFullYear() === appDate.getUTCFullYear() &&
                  slotDate.getUTCMonth() === appDate.getUTCMonth() &&
                  slotDate.getUTCDate() === appDate.getUTCDate() &&
                  slotDate.getUTCHours() === appDate.getUTCHours() &&
                  slotDate.getUTCMinutes() === appDate.getUTCMinutes()
                );
              });
              
              allSlots.push({
                time: timeString,
                date: slotDate,
                available: !isReserved,
                employeeId: employee.id,
                employeeName: employee.name
              });
            }
          }
          currentTime = new Date(currentTime.getTime() + duration * 60000);
        }
      });
    });

    // Si hay un empleado seleccionado, usar slots individuales
    if (selectedEmployee) {
      setIndividualTimeSlots(allSlots);
      setTimeSlots([]);
      return;
    }

    // Agrupar slots por tiempo y crear slots unificados
    const slotsMap = new Map<string, TimeSlot[]>();
    
    allSlots.forEach(slot => {
      const key = `${slot.time}-${slot.date.getTime()}`;
      if (!slotsMap.has(key)) {
        slotsMap.set(key, []);
      }
      slotsMap.get(key)!.push(slot);
    });

    const unifiedSlots: UnifiedTimeSlot[] = [];
    
    slotsMap.forEach((slots, key) => {
      if (slots.length > 0) {
        const firstSlot = slots[0];
        const availableSlots = slots.filter(s => s.available);
        
        unifiedSlots.push({
          time: firstSlot.time,
          date: firstSlot.date,
          available: availableSlots.length > 0,
          employeeCount: availableSlots.length,
          employees: availableSlots.map(s => ({ id: s.employeeId, name: s.employeeName })),
          isUnified: true
        });
      }
    });

    setTimeSlots(unifiedSlots);
    setIndividualTimeSlots([]);
  };

  const handleEmployeeSelect = (employeeId: number | null) => {
    setSelectedEmployee(employeeId);
    
    // Hacer scroll hacia la sección de horarios después de un pequeño delay
    // para que los horarios se actualicen primero
    setTimeout(() => {
      if (schedulesRef.current) {
        schedulesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleTimeSlotSelect = (slot: UnifiedTimeSlot | TimeSlot) => {
    setSelectedTimeSlot(slot);
    setShowClientForm(true);
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleClientFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTimeSlot || !clientData.name || !clientData.phone || !clientData.email) {
      toast.push('error', 'Por favor completa todos los campos');
      return;
    }

    try {
      setLoading(true);

      // Determinar el employeeId basado en el tipo de slot
      let employeeId: number | undefined;
      if ('isUnified' in selectedTimeSlot) {
        employeeId = formSelectedEmployee ?? undefined;
      } else {
        employeeId = selectedTimeSlot.employeeId;
      }

      const appointmentData = {
        serviceId: service.id,
        ...(employeeId && { employeeId }), // Solo incluir employeeId si existe
        clientName: clientData.name,
        clientPhone: clientData.phone,
        clientEmail: clientData.email,
        appointmentDate: selectedTimeSlot.date.toISOString(),
        duration: service.duration
      };

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        const result = await response.json();

        // Guardar el empleado asignado por Round Robin
        if (result.appointment && result.appointment.employee) {
          setAssignedEmployee({
            id: result.appointment.employee.id,
            name: result.appointment.employee.name
          });
        }

        // Recargar los empleados para actualizar las reservas disponibles
        await loadEmployees();

        // Disparar notificación de nueva cita
        triggerNewAppointmentNotification(result.appointment);

        // Mostrar estado de éxito
        setBookingSuccess(true);
        // NO llamar a resetForm aquí para que se muestre el mensaje de éxito
        // resetForm();
      } else {
        const error = await response.text();
        toast.push('error', `Error al crear la reserva: ${error}`);
      }
    } catch (error) {
      toast.push('error', 'Error al crear la reserva. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedEmployee(null);
    setSelectedTimeSlot(null);
    setShowClientForm(false);
    setClientData({ name: '', phone: '', email: '' });
    setBookingSuccess(false);
    setAssignedEmployee(null);
    setFormSelectedEmployee(null); // Resetear el empleado seleccionado en el formulario
    // No cerrar el modal, solo resetear el formulario
  };

  const nextWeek = () => {
    const next = new Date(currentWeek);
    next.setDate(next.getDate() + 7);
    setCurrentWeek(next);
  };

  const prevWeek = () => {
    const prev = new Date(currentWeek);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeek(prev);
  };

  const handleDaySelect = (dayIndex: number) => {
    setSelectedDay(dayIndex);
  };

  const formatWeekRange = () => {
    const start = new Date(currentWeek);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    return `${start.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${end.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`;
  };

  const formatTimeSlotDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  };

  if (!isOpen) return null;

  return (
    // modal container - Click en backdrop solo desktop
    <div 
      className="fixed inset-0 backdrop-blur-md bg-black/70 flex items-center justify-center z-50 p-0"
      onClick={handleBackdropClick}
    >
      {/* modal content */}
      <div className="bg-white w-full max-w-4xl max-h-[100vh] overflow-y-auto">

        {/* Header - Sticky para que siempre sea visible */}
        <div className="sticky top-0 z-10 bg-white flex items-center justify-between p-4 md:p-6 border-b shadow-sm">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">{service.name}</h2>
            <p className="text-base sm:text-lg font-semibold text-rose-600">${service.price}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="rounded-full p-2 flex-shrink-0 hover:bg-gray-100 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* main content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
            </div>
          ) : bookingSuccess ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">¡Reserva creada exitosamente!</h3>
              <p className="text-gray-600 text-center mb-6">Te enviaremos un email de confirmación.</p>
              <div className="flex gap-3">
                <Button
                  onClick={resetForm}
                  className="bg-rose-600 hover:bg-rose-700"
                >
                  Hacer otra reserva
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    onClose();
                  }}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          ) : (
            <>

              {/* Sección de Empleados */}
              <div className="mb-8 min-h-dvh">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Empleados</h3>
                  <span className="text-sm text-gray-500">({employees.length} empleados cargados)</span>
                  {selectedEmployee && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEmployeeSelect(null)}
                      className="text-sm"
                    >
                      Ver todos
                    </Button>
                  )}
                </div>

                <div className={`grid gap-4 ${
                  employees.length <= 3 
                    ? 'grid-cols-1' // 1 columna para 1-3 empleados
                    : employees.length <= 6 
                      ? 'grid-cols-2' // 2 columnas para 4-6 empleados
                      : 'grid-cols-3 sm:grid-cols-4' // 3-4 columnas para 7+ empleados
                }`}>
                  {employees.map((employee) => (
                    <button
                      key={employee.id}
                      onClick={() => handleEmployeeSelect(employee.id)}
                      className={`flex flex-col items-center rounded-xl border-2 transition-all ${
                        selectedEmployee === employee.id
                          ? 'border-rose-500 bg-rose-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${
                        employees.length <= 3 
                          ? 'p-6' // Más padding para pocos empleados
                          : employees.length <= 6 
                            ? 'p-4' // Padding normal
                            : 'p-3' // Menos padding para muchos empleados
                      }`}
                    >
                      <Avatar
                        src={employee.employeeImage}
                        alt={employee.name}
                        name={employee.name}
                        size={employees.length <= 3 ? "lg" : employees.length <= 6 ? "lg" : "md"}
                        className="mb-2"
                      />
                      <span className={`font-medium text-gray-900 text-center ${
                        employees.length <= 3 
                          ? 'text-base' // Texto más grande para pocos empleados
                          : employees.length <= 6 
                            ? 'text-sm' // Texto normal
                            : 'text-xs' // Texto más pequeño para muchos empleados
                      }`}>
                        {employee.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sección de Calendario */}
              <div className="pt-32 pb-12 min-h-dvh" ref={schedulesRef}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Horarios Disponibles</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={prevWeek}
                      className="p-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium text-gray-700">
                      {formatWeekRange()}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={nextWeek}
                      className="p-2"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Días de la semana */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {daysOfWeek.map((day, index) => {
                    const dayDate = new Date(currentWeek);
                    dayDate.setDate(dayDate.getDate() - dayDate.getDay() + index);
                    const isToday = dayDate.toDateString() === new Date().toDateString();
                    const isSelected = index === selectedDay;

                    return (
                      <button
                        key={day}
                        onClick={() => handleDaySelect(index)}
                        className={`text-center p-2 rounded-lg transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-rose-500 text-white' 
                            : isToday 
                              ? 'bg-rose-100 text-rose-700' 
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="text-xs font-medium">{day.slice(0, 3)}</div>
                        <div className="text-sm font-bold">{dayDate.getDate()}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Horarios */}
                <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {/* Mostrar slots unificados cuando no hay empleado seleccionado */}
                  {!selectedEmployee && timeSlots.map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => handleTimeSlotSelect(slot)}
                      disabled={!slot.available}
                      className={`p-3 rounded-lg border text-left transition-all ${slot.available
                        ? (selectedTimeSlot && 'isUnified' in selectedTimeSlot && selectedTimeSlot.time === slot.time && selectedTimeSlot.date.getTime() === slot.date.getTime()
                          ? 'border-rose-600 bg-rose-50 ring-2 ring-rose-400'
                          : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50 cursor-pointer')
                        : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-gray-900 font-bold text-xl">{slot.time}</div>
                          {slot.employeeCount > 1 && (
                            <div className="text-sm text-rose-600 font-medium">
                              ({slot.employeeCount} empleados disponibles)
                            </div>
                          )}
                        </div>
                        <Clock className="w-4 h-4 text-gray-400" />
                      </div>
                    </button>
                  ))}
                  
                  {/* Mostrar slots individuales cuando hay empleado seleccionado */}
                  {selectedEmployee && individualTimeSlots.map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => handleTimeSlotSelect(slot)}
                      disabled={!slot.available}
                      className={`p-3 rounded-lg border text-left transition-all ${slot.available
                        ? (selectedTimeSlot && !('isUnified' in selectedTimeSlot) && selectedTimeSlot.time === slot.time && selectedTimeSlot.date.getTime() === slot.date.getTime() && selectedTimeSlot.employeeId === slot.employeeId
                          ? 'border-rose-600 bg-rose-50 ring-2 ring-rose-400'
                          : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50 cursor-pointer')
                        : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-gray-900 font-bold text-xl">{slot.time}</div>
                          <div className="text-sm text-gray-600">{slot.employeeName}</div>
                        </div>
                        <Clock className="w-4 h-4 text-gray-400" />
                      </div>
                    </button>
                  ))}
                </div>

                {timeSlots.length === 0 && individualTimeSlots.length === 0 &&(
                  <div className="text-center py-8 text-gray-500">
                    No hay horarios disponibles para esta semana
                  </div>
                )}
              </div>

              {/* Formulario de Cliente */}
              {showClientForm && selectedTimeSlot && (
                bookingSuccess ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="bg-green-100 rounded-full p-4 mb-4">
                      <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-green-700 mb-2">¡Turno reservado!</h2>
                    <p className="text-green-800 mb-6">Tu turno fue registrado con éxito.</p>
                    <button
                      className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                      onClick={onClose}
                    >
                      Listo
                    </button>
                  </div>
                ) : (
                  <div className="border-t pt-32 min-h-dvh" ref={formRef}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Completa tus datos
                    </h3>
                    <div className="mb-4 p-3 bg-rose-50 rounded flex items-center gap-4">
                      <Clock className="w-5 h-5 text-rose-600" />
                      <span className="font-medium text-rose-700">
                        {formatTimeSlotDate(selectedTimeSlot.date)} {selectedTimeSlot.time} - {
                          'isUnified' in selectedTimeSlot && selectedTimeSlot.isUnified
                            ? assignedEmployee 
                              ? assignedEmployee.name 
                              : `(${selectedTimeSlot.employeeCount} empleados disponibles)`
                            : (selectedTimeSlot as TimeSlot).employeeName
                        }
                      </span>
                    </div>
                    <form onSubmit={handleClientFormSubmit} className="space-y-4">
                      {showClientForm && selectedTimeSlot && 'isUnified' in selectedTimeSlot && selectedTimeSlot.isUnified && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium mb-1">Elegir empleado (opcional)</label>
                          <select
                            className="w-full border rounded px-3 py-2"
                            value={formSelectedEmployee ?? ""}
                            onChange={e => setFormSelectedEmployee(e.target.value ? Number(e.target.value) : null)}
                          >
                            <option value="">Cualquiera (asignación automática)</option>
                            {selectedTimeSlot.employees.map(emp => (
                              <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre completo
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            type="text"
                            value={clientData.name}
                            onChange={(e) => setClientData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Tu nombre completo"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Teléfono
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            type="tel"
                            value={clientData.phone}
                            onChange={(e) => setClientData(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="Tu número de teléfono"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            type="email"
                            value={clientData.email}
                            onChange={(e) => setClientData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="tu@email.com"
                            className="pl-10"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex gap-3 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowClientForm(false)}
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="submit"
                          disabled={loading}
                          className="flex-1 bg-rose-600 hover:bg-rose-700"
                        >
                          {loading ? 'Confirmando...' : 'Confirmar'}
                        </Button>
                      </div>
                    </form>
                  </div>
                )
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
} 