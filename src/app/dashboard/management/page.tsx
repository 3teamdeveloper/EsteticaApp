"use client";
import { useState, useEffect } from 'react';
import { Calendar, Trash, CheckCircle, XCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToastContext } from '@/components/ui/toast/ToastProvider';
import { useTrial } from '@/hooks/useTrial';

interface Appointment {
  id: string;
  title: string;
  start: string;
  end: string;
  extendedProps: {
    status: string;
    employee: string;
    service: string;
    client: string;
  };
}

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
}

interface Schedule {
  id: number;
  dayOfWeek: number;
  period: number;
  startTime: string;
  endTime: string;
  employeeId: number;
  serviceId: number;
}

interface BusinessHours {
  [key: string]: {
    periods: Array<{
      startTime: string;
      endTime: string;
    }>;
    isOpen: boolean;
  };
}

interface DayAvailability {
  totalSlots: number;
  reservedSlots: number;
  availableSlots: number;
}

interface TimeSlot {
  time: string;
  isOccupied: boolean;
  appointment?: Appointment;
  employee?: Employee;
  service?: Service;
  duration: number;
}

interface BookingFormData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
}

export default function CalendarCardsPage() {
  const [events, setEvents] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedService, setSelectedService] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [businessHours, setBusinessHours] = useState<BusinessHours>({});
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());
  
  // Nuevos estados para el formulario de reserva
  const [expandedSlot, setExpandedSlot] = useState<string | null>(null);
  const [bookingFormData, setBookingFormData] = useState<BookingFormData>({
    clientName: '',
    clientEmail: '',
    clientPhone: ''
  });
  const [isBooking, setIsBooking] = useState(false);
  const toast = useToastContext();
  const { hasAccess } = useTrial();

  // Estado para modal de feedback y de confirmación de cancelación
  const [modal, setModal] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const [cancelModal, setCancelModal] = useState<{ open: boolean, slot?: TimeSlot }>({ open: false });

  // Función para confirmar turno (cambiar de PENDING a CONFIRMED)
  const handleConfirmAppointment = async (slot: TimeSlot) => {
    if (!slot.appointment?.id) return;
    try {
      const res = await fetch(`/api/appointments/${slot.appointment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CONFIRMED' })
      });
      if (!res.ok) throw new Error('Error al confirmar el turno');
      toast.push('success', 'Turno confirmado exitosamente');
      setRefreshFlag(f => f + 1);
    } catch (e: any) {
      toast.push('error', 'No se pudo confirmar el turno: ' + e.message);
    }
  };

  // Función para marcar turno como completado
  const handleCompleteAppointment = async (slot: TimeSlot) => {
    if (!slot.appointment?.id) return;
    try {
      const res = await fetch(`/api/appointments/${slot.appointment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' })
      });
      if (!res.ok) throw new Error('Error al marcar el turno como completado');
      toast.push('success', 'Turno marcado como completado');
      setRefreshFlag(f => f + 1);
    } catch (e: any) {
      toast.push('error', 'No se pudo marcar el turno como completado: ' + e.message);
    }
  };

  // Función para convertir tiempo "HH:MM" a minutos desde medianoche
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Función para convertir minutos a formato "HH:MM"
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Función para calcular intersección de horarios
  const getEffectiveHours = (
    businessPeriods: Array<{ startTime: string; endTime: string }>,
    employeeSchedule: { startTime: string; endTime: string }
  ): Array<{ startTime: string; endTime: string }> => {
    const result: Array<{ startTime: string; endTime: string }> = [];

    const empStart = timeToMinutes(employeeSchedule.startTime);
    const empEnd = timeToMinutes(employeeSchedule.endTime);

    for (const period of businessPeriods) {
      const busStart = timeToMinutes(period.startTime);
      const busEnd = timeToMinutes(period.endTime);

      // Calcular intersección
      const start = Math.max(empStart, busStart);
      const end = Math.min(empEnd, busEnd);

      if (start < end) {
        result.push({
          startTime: minutesToTime(start),
          endTime: minutesToTime(end)
        });
      }
    }

    return result;
  };

  // Función para generar slots de tiempo
  const generateTimeSlots = (
    periods: Array<{ startTime: string; endTime: string }>,
    serviceDuration: number
  ): string[] => {
    const slots: string[] = [];

    for (const period of periods) {
      const start = timeToMinutes(period.startTime);
      const end = timeToMinutes(period.endTime);

      for (let time = start; time + serviceDuration <= end; time += serviceDuration) {
        slots.push(minutesToTime(time));
      }
    }

    return slots;
  };

  // Función para calcular disponibilidad de un día
  const calculateDayAvailability = (date: Date, serviceId?: string, employeeIdFilter?: string): DayAvailability => {
    const dayOfWeek = date.getDay();
    let totalSlots = 0;
    const servicesToCheck = serviceId ? services.filter(s => s.id.toString() === serviceId) : services;

    for (const service of servicesToCheck) {
      // Obtener empleados que brindan este servicio
      let serviceSchedules = schedules.filter(s =>
        s.serviceId === service.id && s.dayOfWeek === dayOfWeek
      );
      // Filtrar por empleado si está seleccionado
      if (employeeIdFilter) {
        serviceSchedules = serviceSchedules.filter(s => s.employeeId.toString() === employeeIdFilter);
      }
      for (const schedule of serviceSchedules) {
        // Generar slots igual que BookingModal, sin cruzar con business hours
        const start = timeToMinutes(schedule.startTime);
        const end = timeToMinutes(schedule.endTime);
        for (let time = start; time + service.duration <= end; time += service.duration) {
          totalSlots++;
        }
      }
    }

         // Contar appointments reservados (PENDING, CONFIRMED o COMPLETED - todos ocupan slots)
     const reservedSlots = events.filter(event => {
       const eventDate = new Date(event.start);
       const matchesDate = eventDate.toDateString() === date.toDateString();
       const matchesService = !serviceId || event.extendedProps.service === services.find(s => s.id.toString() === serviceId)?.name;
       
       // Para empleados, comparar directamente con el nombre del appointment
       // Para prestadores, buscar en el array de employees
       const matchesEmployee = !employeeIdFilter || 
         (userRole === 'EMPLEADO' 
           ? event.extendedProps.employee === event.extendedProps.employee // Siempre true para empleados cuando hay filtro
           : event.extendedProps.employee === employees.find(e => e.id.toString() === employeeIdFilter)?.name);
       
       const matchesStatus = ["PENDING", "CONFIRMED", "COMPLETED"].includes(event.extendedProps.status?.toUpperCase());
       return matchesDate && matchesService && matchesEmployee && matchesStatus;
     }).length;

    return {
      totalSlots,
      reservedSlots,
      availableSlots: Math.max(0, totalSlots - reservedSlots)
    };
  };

  // Función para generar lista completa de horarios de un día
  const generateDayTimeSlots = (date: Date): TimeSlot[] => {
    const dayOfWeek = date.getDay();
    const timeSlots: TimeSlot[] = [];
    const servicesToCheck = selectedService ? services.filter(s => s.id.toString() === selectedService) : services;

         // Obtener appointments del día y filtrar PENDING, CONFIRMED o COMPLETED (todos son ocupados)
     const dayAppointments = events.filter(event => {
       const eventDate = new Date(event.start);
       const isSameDay = eventDate.toDateString() === date.toDateString();
       const isOccupied = ['PENDING', 'CONFIRMED', 'COMPLETED'].includes(event.extendedProps.status?.toUpperCase());
       return isSameDay && isOccupied;
     });

     // DEBUG: Log para ver qué appointments se encontraron para el día
     /*console.log('📅 Appointments del día', date.toDateString(), ':', dayAppointments.map(appt => ({
       id: appt.id,
       start: appt.start,
       employee: appt.extendedProps.employee,
       service: appt.extendedProps.service,
       status: appt.extendedProps.status
     })));
     */

    for (const service of servicesToCheck) {
      let serviceSchedules = schedules.filter(s =>
        s.serviceId === service.id && s.dayOfWeek === dayOfWeek
      );
      if (selectedEmployee) {
        serviceSchedules = serviceSchedules.filter(s => s.employeeId.toString() === selectedEmployee);
      }
      for (const schedule of serviceSchedules) {
        const employee = employees.find(e => e.id === schedule.employeeId);
        // Generar slots igual que BookingModal, sin cruzar con business hours
        const start = timeToMinutes(schedule.startTime);
        const end = timeToMinutes(schedule.endTime);
        for (let time = start; time + service.duration <= end; time += service.duration) {
          const timeString = minutesToTime(time);
          // Verificar si este slot está ocupado SOLO por turnos activos
          const appointment = dayAppointments.find(appt => {
            const apptTime = new Date(appt.start);
            // Convertir a hora local para comparación correcta
            const apptTimeString = apptTime.toLocaleTimeString('es-AR', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            });
            
            // Para empleados, comparar directamente con el nombre del empleado del appointment
            // Para prestadores, usar el employee del schedule
            const employeeToCompare = userRole === 'EMPLEADO' 
              ? appt.extendedProps.employee 
              : employee?.name;
            
            // DEBUG: Log para identificar el problema
            /*console.log('🔍 Comparando slot:', {
              timeString,
              apptTimeString,
              apptTimeUTC: appt.start,
              apptTimeLocal: apptTime.toString(),
              userRole,
              employeeToCompare,
              apptEmployee: appt.extendedProps.employee,
              service: service.name,
              apptService: appt.extendedProps.service,
              apptStatus: appt.extendedProps.status
            });
            */
            return apptTimeString === timeString &&
              appt.extendedProps.employee === employeeToCompare &&
              appt.extendedProps.service === service.name;
          });
          timeSlots.push({
            time: timeString,
            isOccupied: !!appointment,
            appointment,
            employee,
            service,
            duration: service.duration
          });
        }
      }
    }
    // Ordenar y deduplicar como antes
    const uniqueSlots = timeSlots.reduce((acc, slot) => {
      const key = `${slot.time}-${slot.employee?.id}-${slot.service?.id}`;
      if (!acc.some(s => `${s.time}-${s.employee?.id}-${s.service?.id}` === key)) {
        acc.push(slot);
      }
      return acc;
    }, [] as TimeSlot[]);
    return uniqueSlots.sort((a, b) => {
      const timeA = timeToMinutes(a.time);
      const timeB = timeToMinutes(b.time);
      if (timeA !== timeB) return timeA - timeB;
      return (a.employee?.name || '').localeCompare(b.employee?.name || '');
    });
  };

  // Obtener rol y employeeId al montar
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/dashboard', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUserRole(data.role);
          if (data.employeeId) setEmployeeId(data.employeeId.toString());
        }
      } catch { }
    }
    fetchUser();
  }, []);

  // Cargar business hours
  useEffect(() => {
    async function fetchBusinessHours() {
      try {
        const res = await fetch('/api/business-hours');
        if (res.ok) {
          const data = await res.json();
          setBusinessHours(data);
        } else {
          console.error('Error loading business hours:', res.statusText);
        }
      } catch (err) {
        console.error('Error loading business hours:', err);
      }
    }
    fetchBusinessHours();
  }, []);

  // Cargar schedules
  useEffect(() => {
    async function fetchSchedules() {
      try {
        const res = await fetch('/api/schedules');
        if (res.ok) {
          const data = await res.json();
          setSchedules(data);
        }
      } catch (err) {
        console.error('Error loading schedules:', err);
        setSchedules([]);
      }
    }
    if (userRole) fetchSchedules();
  }, [userRole]);

  // Cargar servicios según rol
  useEffect(() => {
    async function fetchServices() {
      try {
        let data = [];
        if (userRole === 'EMPLEADO' && employeeId) {
          const res = await fetch(`/api/employees/${employeeId}/services`);
          if (!res.ok) throw new Error('Error al obtener servicios asignados');
          data = await res.json();
        } else {
          const res = await fetch('/api/services');
          if (!res.ok) throw new Error('Error al obtener servicios');
          data = await res.json();
        }
        setServices(data);
      } catch (err) {
        setServices([]);
      }
    }
    if (userRole) fetchServices();
  }, [userRole, employeeId]);

  // Cargar empleados solo si es PRESTADOR
  useEffect(() => {
    async function fetchEmployees() {
      try {
        let url = "/api/employees";
        if (selectedService) {
          url = `/api/services/${selectedService}/employees`;
        }
        const res = await fetch(url);
        if (!res.ok) throw new Error("Error al obtener empleados");
        const data = await res.json();
        setEmployees(data);
      } catch (err) {
        setEmployees([]);
      }
    }
    if (userRole !== 'EMPLEADO') fetchEmployees();
  }, [selectedService, userRole]);

  // Cargar turnos según filtros y refreshFlag
  useEffect(() => {
    async function fetchAppointments() {
      setLoading(true);
      setError("");
      try {
        let url = "/api/appointments";
        const params = [];
        if (userRole === 'EMPLEADO' && employeeId) {
          params.push(`employeeId=${employeeId}`);
          if (selectedService) params.push(`serviceId=${selectedService}`);
        } else {
          if (selectedService) params.push(`serviceId=${selectedService}`);
          if (selectedEmployee) params.push(`employeeId=${selectedEmployee}`);
        }
        if (params.length) url += `?${params.join("&")}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Error al obtener turnos");
        const data = await res.json();
        const mapped = data.map((appt: any) => ({
          id: appt.id,
          title: `${appt.client?.name || "Sin cliente"} - ${appt.service?.name || "Sin servicio"}`,
          start: appt.date,
          end: appt.date,
          extendedProps: {
            status: appt.status,
            employee: appt.employee?.name,
            service: appt.service?.name,
            client: appt.client?.name,
          },
        }));
        setEvents(mapped);
      } catch (err: any) {
        setError(err.message || "Error desconocido");
      } finally {
        setLoading(false);
      }
    }
    if ((userRole === 'EMPLEADO' && employeeId) || userRole !== 'EMPLEADO') {
      fetchAppointments();
    }
  }, [selectedService, selectedEmployee, refreshFlag, userRole, employeeId, schedules, businessHours]);

  // Handler para expandir/contraer slot de reserva
  const handleSlotExpand = (slotKey: string) => {
    if (expandedSlot === slotKey) {
      setExpandedSlot(null);
      setBookingFormData({ clientName: '', clientEmail: '', clientPhone: '' });
    } else {
      setExpandedSlot(slotKey);
      setBookingFormData({ clientName: '', clientEmail: '', clientPhone: '' });
    }
  };

  // Handler para manejar cambios en el formulario
  const handleFormChange = (field: keyof BookingFormData, value: string) => {
    setBookingFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handler para crear reserva directa
  const handleDirectBooking = async (slot: TimeSlot) => {
    // Verificar si el usuario tiene acceso para crear reservas
    if (!hasAccess('create_appointments')) {
      toast.push('error', 'Tu trial ha expirado. Actualiza tu plan para crear nuevas reservas.');
      return;
    }

    if (!selectedDay || !selectedService || !slot.employee) {
      toast.push('error', 'Faltan datos para crear la reserva');
      return;
    }

    if (!bookingFormData.clientName || !bookingFormData.clientEmail || !bookingFormData.clientPhone) {
      toast.push('error', 'Por favor complete todos los campos del cliente');
      return;
    }

    setIsBooking(true);
    try {
      const serviceObj = services.find(s => s.id.toString() === selectedService);
      if (!serviceObj) throw new Error('Servicio no encontrado');

      // Construir la fecha completa con la hora específica del turno
      const [hours, minutes] = slot.time.split(':').map(Number);
      const appointmentDate = new Date(selectedDay);
      appointmentDate.setHours(hours, minutes, 0, 0);

      const appointmentData = {
        appointmentDate: appointmentDate.toISOString(),
        serviceId: parseInt(selectedService),
        employeeId: slot.employee.id,
        clientName: bookingFormData.clientName,
        clientEmail: bookingFormData.clientEmail,
        clientPhone: bookingFormData.clientPhone,
        status: 'PENDIENTE'
      };

      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        throw new Error('Error al crear la reserva');
      }

      // Limpiar formulario y cerrar expansión
      setBookingFormData({ clientName: '', clientEmail: '', clientPhone: '' });
      setExpandedSlot(null);
      setRefreshFlag(f => f + 1); // Refrescar turnos
      setModal({ type: 'success', message: 'Reserva creada exitosamente' });
    } catch (error: any) {
      setModal({ type: 'error', message: 'Error: ' + error.message });
    } finally {
      setIsBooking(false);
    }
  };

  // Handler para cancelar reserva
  const handleCancelBooking = () => {
    setExpandedSlot(null);
    setBookingFormData({ clientName: '', clientEmail: '', clientPhone: '' });
  };

  // Handler para cancelar turno
  const handleCancelAppointment = async (slot: TimeSlot) => {
    setCancelModal({ open: true, slot });
  };
  const confirmCancelAppointment = async () => {
    if (!cancelModal.slot?.appointment?.id) return;
    try {
      const res = await fetch(`/api/appointments/${cancelModal.slot.appointment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' })
      });
      if (!res.ok) throw new Error('Error al cancelar el turno');
      setModal({ type: 'success', message: 'Turno cancelado exitosamente.' });
      setRefreshFlag(f => f + 1);
    } catch (e) {
      setModal({ type: 'error', message: 'No se pudo cancelar el turno.' });
    } finally {
      setCancelModal({ open: false });
    }
  };

  // Funciones para navegación del calendario
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDay(today);
  };

  // Generar días del mes
  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Agregar días del mes anterior para completar la primera semana
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        dayNumber: prevDate.getDate()
      });
    }

    // Agregar días del mes actual
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i);
      days.push({
        date: currentDate,
        isCurrentMonth: true,
        dayNumber: i
      });
    }

    // Agregar días del mes siguiente para completar la última semana
    const remainingDays = 42 - days.length; // 6 semanas * 7 días
    for (let i = 1; i <= remainingDays; i++) {
      const nextDate = new Date(year, month + 1, i);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        dayNumber: nextDate.getDate()
      });
    }

    return days;
  };



  const days = getDaysInMonth();
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="py-10">
      {/* Fila superior: título, botón y filtros */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2 px-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold whitespace-nowrap">Agenda de Turnos</h1>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div>
            <label className="block text-sm font-medium mb-0.5">Servicio</label>
            <select
              className="border rounded px-2 py-1 text-sm"
              value={selectedService}
              onChange={e => {
                setSelectedService(e.target.value);
                setSelectedEmployee("");
              }}
            >
              <option value="">{userRole === 'EMPLEADO' ? 'Todos mis servicios' : 'Todos'}</option>
              {services.map((s: Service) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          {userRole !== 'EMPLEADO' && (
            <div>
              <label className="block text-sm font-medium mb-0.5">Empleado</label>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={selectedEmployee}
                onChange={e => setSelectedEmployee(e.target.value)}
              >
                <option value="">Todos</option>
                {employees.map((e: Employee) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Calendario y panel de horarios */}
      <div className="flex flex-col md:flex-row gap-2">
        {/* Calendario compacto */}
        <div className="md:w-1/3 w-full flex flex-col">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            {/* Header del calendario con navegación */}
            <div className="p-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
              <div className="text-center">
                 <span className="text-sm font-semibold text-gray-700">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </span>
              </div>
           
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={goToPreviousMonth}
                  className="px-2 py-1 border rounded hover:bg-gray-100 text-xs"
                >
                  ←
                </button>


                                   
          
            <button
              onClick={goToToday}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs"
            >
              Hoy
            </button>
       
                <button
                  onClick={goToNextMonth}
                  className="px-2 py-1 border rounded hover:bg-gray-100 text-xs"
                >
                  →
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                  <div key={day} className="text-center text-xs font-semibold text-gray-700 py-1">
                    {day}
                  </div>
                ))}
              </div>
            </div>

            {/* Grid de días */}
            <div className="grid grid-cols-7 gap-0.5 p-1">
              {days.map((day, index) => {
                const isToday = day.date.toDateString() === new Date().toDateString();
                const canOpenPanel = selectedService !== "";
                const isSelected = selectedDay && day.date.toDateString() === selectedDay.toDateString();
                return (
                  <div
                    key={index}
                    onClick={() => {
                      if (day.isCurrentMonth && canOpenPanel) {
                        setSelectedDay(day.date);
                      }
                    }}
                    className={`
                      min-h-[36px] md:min-h-[48px] p-0.5 border border-gray-200 rounded-lg transition-all duration-200 flex flex-col items-center justify-center
                      ${isSelected ? 'bg-rose-100' : day.isCurrentMonth ? 'bg-white hover:bg-gray-50 cursor-pointer' : 'bg-gray-50'}
                      ${isToday && !isSelected ? 'bg-blue-100' : ''}
                      ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-800'}
                    `}
                  >
                    <div className={`text-[11px] font-bold mb-0.5 ${isToday ? 'text-blue-600' : day.isCurrentMonth ? 'text-gray-800' : 'text-gray-400'
                      }`}>
                      {day.dayNumber}
                    </div>
                    {/* Indicadores de slots */}
                    <div className="flex gap-0.5 justify-center items-center">
                      {(() => {
                        const availability = calculateDayAvailability(
                          day.date,
                          selectedService || undefined,
                          (userRole !== 'EMPLEADO' ? selectedEmployee : employeeId) || undefined
                        );
                        if (!day.isCurrentMonth) {
                          return <div className="text-[10px] text-gray-300 italic">Fuera del mes</div>;
                        }
                        if (availability.totalSlots === 0) {
                          return <div className="text-[10px] text-gray-400 italic">Cerrado</div>;
                        }
                        return (
                          <>
                            <span className="inline-flex w-3.5 h-3.5 rounded bg-green-200 border border-green-300 items-center justify-center text-[10px] font-bold text-green-900" title="Disponibles">
                              {availability.availableSlots}
                            </span>
                            <span className="inline-flex w-3.5 h-3.5 rounded bg-blue-200 border border-blue-300 items-center justify-center text-[10px] font-bold text-blue-900" title="Reservados">
                              {availability.reservedSlots}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Leyenda de colores debajo del calendario */}
          <div className="flex items-center gap-4 mt-2 px-2">
            <div className="flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded bg-green-200 border border-green-300 flex items-center justify-center text-[10px] font-bold text-green-900"></span>
              <span className="text-xs text-gray-700">Disponibles</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3.5 h-3.5 rounded bg-blue-200 border border-blue-300 flex items-center justify-center text-[10px] font-bold text-blue-900"></span>
              <span className="text-xs text-gray-700">Reservados</span>
            </div>
          </div>
        </div>
        {/* Panel de horarios a la derecha */}
        <div className="w-full md:w-2/3">
          {selectedDay && selectedService !== "" ? (
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 py-4 px-1 md:px-2">
              {/* Título de servicio y precio */}
              {(() => {
                const serviceObj = services.find(s => s.id.toString() === selectedService);
                return serviceObj ? (
                  <div className="mb-2 flex items-center gap-2">
                    <span className="font-bold text-lg text-gray-800">{serviceObj.name}</span>
                    {serviceObj.price && (
                      <span className="text-sm text-gray-500">${serviceObj.price}</span>
                    )}
                  </div>
                ) : null;
              })()}
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedDay.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Horarios disponibles y ocupados
                </p>
              </div>
              {/* Lista de horarios en una sola línea */}
              <div className="flex-1 md:overflow-y-auto md:max-h-[60vh] md:px-2">
                {(() => {
                  const daySlots = generateDayTimeSlots(selectedDay);
                  if (daySlots.length === 0) {
                    return (
                      <div className="p-8 text-center text-gray-500">
                        <div className="text-lg font-medium">No hay horarios disponibles</div>
                        <div className="text-sm mt-1">
                          El local está cerrado este día o no hay empleados asignados
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div className="space-y-1">
                      {daySlots.map((slot, index) => {
                        const slotKey = `${slot.time}-${slot.employee?.id}-${slot.service?.id}`;
                        const isExpanded = expandedSlot === slotKey;
                        
                        return (
                          <div key={index}>
                            <div
                              className={`
                                flex items-center  justify-between pt-2 pb-6 px-1 md:p-2  rounded-lg border relative transition-all duration-200 text-sm
                                ${slot.isOccupied 
                                  ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
                                  : 'bg-green-50 border-green-200 hover:bg-green-100 cursor-pointer'
                                }
                              `}
                              onClick={() => !slot.isOccupied && hasAccess('create_appointments') && handleSlotExpand(slotKey)}
                            >
                              {/* Izquierda: hora y empleado */}
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-mono font-bold text-base w-12 text-center">{slot.time}</span>
                                <span className="truncate max-w-[120px]">{slot.employee?.name}</span>
                              </div>
                              {/* Centro: cliente si ocupado */}
                              {slot.isOccupied && (
                                <span className="truncate max-w-[210px] text-blue-700 text-center flex-1 absolute md:static left-24 bottom-1">
                                  {slot.appointment?.extendedProps.client}
                                </span>
                              )}
                              {/* Derecha: estado y acciones */}
                              <div className="flex items-center gap-2 min-w-0">
                                {slot.isOccupied ? (
                                  <>
                                    {/* <span className="text-blue-700 font-semibold">OCUPADO</span> */}
                                    <span className={`px-2 py-0.5 rounded text-[10px] absolute bottom-1.5 left-1 md:static md:left-0 ${
                                      slot.appointment?.extendedProps.status?.toLowerCase() === 'confirmed'
                                        ? 'bg-blue-400 text-white'
                                        : slot.appointment?.extendedProps.status?.toLowerCase() === 'completed'
                                        ? 'bg-blue-800 text-white'
                                        : slot.appointment?.extendedProps.status?.toLowerCase() === 'pending'
                                        ? 'bg-yellow-400 text-gray-900'
                                        : slot.appointment?.extendedProps.status?.toLowerCase() === 'cancelled'
                                        ? 'bg-gray-400 text-white'
                                        : 'bg-gray-500 text-white'
                                    }`}>
                                      {slot.appointment?.extendedProps.status}
                                    </span>

                                    {/* Botones de acción para turnos ocupados */}
                                    <div className="flex items-center gap-1 sm:gap-2">

                                      {/* Botón Confirmar - solo si está pendiente */}
                                      {slot.appointment?.extendedProps.status?.toLowerCase() === 'pending' && (
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleConfirmAppointment(slot);
                                          }}
                                          className="hover:bg-blue-100 border-blue-300 text-blue-700 hover:text-blue-800 px-2 sm:px-3"
                                        >
                                          <CheckCircle className="w-4 h-4" />
                                          <span className="hidden sm:inline ml-1">Confirmar</span>
                                        </Button>
                                      )}
                                      {/* Botón Completado - solo si está confirmado */}
                                      {slot.appointment?.extendedProps.status?.toLowerCase() === 'confirmed' && (
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCompleteAppointment(slot);
                                          }}
                                          className="hover:bg-blue-100 border-blue-600 text-blue-800 hover:text-blue-900 px-2 sm:px-3"
                                        >
                                          <CheckCircle className="w-4 h-4" />
                                          <span className="hidden sm:inline ml-1">Completado</span>
                                        </Button>
                                      )}
                                      {/* Botón Cancelar - siempre disponible */}
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCancelAppointment(slot);
                                        }}
                                        className="hover:bg-red-100 border-red-300 text-red-700 hover:text-red-800 px-2 sm:px-3"
                                      >
                                        <Trash className="w-4 h-4" />
                                        <span className="hidden sm:inline ml-1">Cancelar</span>
                                      </Button>

                                    </div>
                                  </>
                                ) : (
                                  hasAccess('create_appointments') ? (
                                    <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => handleSlotExpand(slotKey)}>
                                      <Calendar className="w-4 h-4" />
                                      <span>Reservar</span>
                                    </Button>
                                  ) : (
                                    <Button variant="outline" size="sm" className="flex items-center gap-1 opacity-50 cursor-not-allowed" disabled>
                                      <Lock className="w-4 h-4" />
                                      <span>Bloqueado</span>
                                    </Button>
                                  )
                                )}
                              </div>
                            </div>
                            
                            {/* Formulario expandido para reserva */}
                            {isExpanded && !slot.isOccupied && (
                              <div className="bg-green-100 border border-green-300 rounded-lg p-3 mt-1">
                                <div className="text-sm font-medium text-green-800 mb-3">
                                  Reservar turno para {slot.time} con {slot.employee?.name}
                                </div>
                                <div className="space-y-2">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Nombre completo
                                    </label>
                                    <input
                                      type="text"
                                      value={bookingFormData.clientName}
                                      onChange={(e) => handleFormChange('clientName', e.target.value)}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                      placeholder="Nombre completo del cliente"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Email
                                    </label>
                                    <input
                                      type="email"
                                      value={bookingFormData.clientEmail}
                                      onChange={(e) => handleFormChange('clientEmail', e.target.value)}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                      placeholder="email@ejemplo.com"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Teléfono
                                    </label>
                                    <input
                                      type="tel"
                                      value={bookingFormData.clientPhone}
                                      onChange={(e) => handleFormChange('clientPhone', e.target.value)}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                      placeholder="+54 9 11 1234-5678"
                                    />
                                  </div>
                                  <div className="flex gap-2 pt-2">
                                    <button
                                      onClick={() => handleDirectBooking(slot)}
                                      disabled={isBooking}
                                      className="flex-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                                    >
                                      {isBooking ? 'Reservando...' : 'Confirmar Reserva'}
                                    </button>
                                    <button
                                      onClick={handleCancelBooking}
                                      className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50"
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8 text-center text-gray-400">
              Selecciona un servicio para ver los horarios
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación de cancelación */}
      {cancelModal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
            <div className="flex items-center gap-2 mb-4">
              <Trash className="w-6 h-6 text-red-600" />
              <span className="font-bold text-lg">Cancelar turno</span>
            </div>
            <p className="mb-6">¿Seguro que deseas cancelar este turno?</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setCancelModal({ open: false })}>No</Button>
              <Button variant="default" onClick={confirmCancelAppointment}>Sí, cancelar</Button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de feedback visual */}
      {modal.type && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full flex flex-col items-center">
            {modal.type === 'success' ? (
              <CheckCircle className="w-12 h-12 text-green-500 mb-2" />
            ) : (
              <XCircle className="w-12 h-12 text-red-500 mb-2" />
            )}
            <span className="text-lg font-semibold mb-4 text-center">{modal.message}</span>
            <Button variant="default" onClick={() => setModal({ type: null, message: '' })}>Cerrar</Button>
          </div>
        </div>
      )}
    </div>
  );
}
