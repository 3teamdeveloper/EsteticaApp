"use client";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useState, useEffect } from 'react';
import BookingModal from '@/components/BookingModal';

export default function ManagementsCalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [services, setServices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [showServiceSelector, setShowServiceSelector] = useState(false);
  const [bookingService, setBookingService] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(0);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);

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
      } catch {}
    }
    fetchUser();
  }, []);

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
  }, [selectedService, selectedEmployee, refreshFlag, userRole, employeeId]);

  // Handler para abrir el modal de nuevo turno
  const handleNewBooking = () => {
    setShowServiceSelector(true);
  };

  // Handler para seleccionar servicio y abrir BookingModal
  const handleServiceSelect = (e: any) => {
    const serviceId = e.target.value;
    if (!serviceId) {
      setBookingService(null);
      return;
    }
    const service = services.find((s: any) => s.id === parseInt(serviceId));
    if (service) {
      setBookingService(service);
    } else {
      setBookingService(null);
    }
    setShowServiceSelector(false);
  };

  // Handler para cerrar BookingModal y refrescar turnos
  const handleBookingClose = () => {
    setBookingService(null);
    setRefreshFlag(f => f + 1); // Refresca los turnos
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Agenda de Turnos</h1>
      <div className="flex gap-4 mb-4">
        <button
          className="bg-rose-600 text-white px-4 py-2 rounded hover:bg-rose-700 transition"
          onClick={handleNewBooking}
        >
          Nuevo turno
        </button>
        {/* Filtros existentes */}
        <div>
          <label className="block text-sm font-medium mb-1">Servicio</label>
          <select
            className="border rounded px-2 py-1"
            value={selectedService}
            onChange={e => {
              setSelectedService(e.target.value);
              setSelectedEmployee("");
            }}
          >
            <option value="">{userRole === 'EMPLEADO' ? 'Todos mis servicios' : 'Todos'}</option>
            {services.map((s: any) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        {/* Mostrar filtro de empleados solo si NO es EMPLEADO */}
        {userRole !== 'EMPLEADO' && (
          <div>
            <label className="block text-sm font-medium mb-1">Empleado</label>
            <select
              className="border rounded px-2 py-1"
              value={selectedEmployee}
              onChange={e => setSelectedEmployee(e.target.value)}
            >
              <option value="">Todos</option>
              {employees.map((e: any) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      {/* Modal de selección de servicio para nuevo turno */}
      {showServiceSelector && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow p-6 w-full max-w-xs">
            <h2 className="text-lg font-bold mb-4">Selecciona un servicio</h2>
            <select
              className="w-full border rounded px-2 py-2 mb-4"
              defaultValue=""
              onChange={handleServiceSelect}
            >
              <option value="" disabled>Elige un servicio...</option>
              {services.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <button
              className="w-full bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300"
              onClick={() => setShowServiceSelector(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      {/* BookingModal reutilizado */}
      {bookingService && (
        <BookingModal
          service={bookingService}
          isOpen={!!bookingService}
          onClose={handleBookingClose}
        />
      )}
      {loading && <div className="mb-2 text-gray-500">Cargando turnos...</div>}
      {error && <div className="mb-2 text-red-600">{error}</div>}
      <div className="bg-white rounded shadow p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          locale="es"
          events={events}
          height="auto"
        />
      </div>
    </div>
  );
} 