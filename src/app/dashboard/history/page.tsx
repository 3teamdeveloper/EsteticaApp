"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react';

type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

interface Appointment {
  id: number;
  date: string;
  status: AppointmentStatus;
  notes?: string;
  confirmedByClient: boolean;
  service: {
    id: number;
    name: string;
    duration: number;
    price: number;
  };
  employee: {
    id: number;
    name: string;
    email?: string;
  };
  client: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
  };
}

interface ApiResponse {
  appointments: Appointment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  COMPLETED: 'bg-green-100 text-green-800 border-green-200'
};

const statusLabels = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  CANCELLED: 'Cancelado',
  COMPLETED: 'Completado'
};

export default function HistoryPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Filtros
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [confirmedFilter, setConfirmedFilter] = useState<string>('');
  
  // Datos para los filtros
  const [services, setServices] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [serviceFilter, setServiceFilter] = useState<string>('');
  const [employeeFilter, setEmployeeFilter] = useState<string>('');

  // Obtener rol del usuario
  useEffect(() => {
    async function fetchUserRole() {
      try {
        const res = await fetch('/api/auth/verify-session');
        if (res.ok) {
          const data = await res.json();
          setUserRole(data.role);
        }
      } catch (error) {
        console.error('Error al obtener rol:', error);
      }
    }
    fetchUserRole();
  }, []);

  // Obtener servicios y empleados para filtros (solo prestadores)
  useEffect(() => {
    if (userRole && userRole !== 'EMPLEADO') {
      async function fetchFilters() {
        try {
          const [servicesRes, employeesRes] = await Promise.all([
            fetch('/api/services'),
            fetch('/api/employees')
          ]);
          
          if (servicesRes.ok) {
            const servicesData = await servicesRes.json();
            setServices(servicesData);
          }
          
          if (employeesRes.ok) {
            const employeesData = await employeesRes.json();
            setEmployees(employeesData);
          }
        } catch (error) {
          console.error('Error al cargar filtros:', error);
        }
      }
      fetchFilters();
    }
  }, [userRole]);

  // Obtener turnos
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50'
      });

      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);
      if (serviceFilter) params.append('serviceId', serviceFilter);
      if (employeeFilter) params.append('employeeId', employeeFilter);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);
      if (confirmedFilter) params.append('confirmed', confirmedFilter);

      const res = await fetch(`/api/appointments/history?${params.toString()}`);
      
      if (res.ok) {
        const data: ApiResponse = await res.json();
        setAppointments(data.appointments);
        setTotal(data.total);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Error al cargar turnos:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, serviceFilter, employeeFilter, dateFrom, dateTo, confirmedFilter]);

  useEffect(() => {
    if (userRole) {
      fetchAppointments();
    }
  }, [userRole, fetchAppointments]);

  // Resetear página cuando cambian filtros
  useEffect(() => {
    if (page !== 1) {
      setPage(1);
    }
  }, [search, statusFilter, serviceFilter, employeeFilter, dateFrom, dateTo, confirmedFilter]);

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Exportar a CSV (solo prestadores)
  const exportToCSV = () => {
    if (appointments.length === 0) return;

    const headers = ['Fecha', 'Cliente', 'Servicio', 'Empleado', 'Estado', 'Confirmado', 'Email', 'Teléfono', 'Precio'];
    const rows = appointments.map(apt => [
      formatDate(apt.date),
      apt.client.name,
      apt.service.name,
      apt.employee.name,
      statusLabels[apt.status],
      apt.confirmedByClient ? 'Sí' : 'No',
      apt.client.email || '',
      apt.client.phone || '',
      `$${apt.service.price}`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historial-turnos-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!userRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2 py-6 sm:px-4 md:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Historial y Consultas</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {total} {total === 1 ? 'turno encontrado' : 'turnos encontrados'}
          </p>
        </div>
        
        {userRole !== 'EMPLEADO' && appointments.length > 0 && (
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        )}
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-semibold">
          <Filter className="w-5 h-5" />
          Filtros
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Búsqueda por cliente */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>

          {/* Estado */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            <option value="PENDING">Pendiente</option>
            <option value="CONFIRMED">Confirmado</option>
            <option value="COMPLETED">Completado</option>
            <option value="CANCELLED">Cancelado</option>
          </select>

          {/* Fecha desde */}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />

          {/* Fecha hasta */}
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          />

          {/* Servicio (solo prestadores) */}
          {userRole !== 'EMPLEADO' && (
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            >
              <option value="">Todos los servicios</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>{service.name}</option>
              ))}
            </select>
          )}

          {/* Empleado (solo prestadores) */}
          {userRole !== 'EMPLEADO' && (
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            >
              <option value="">Todos los empleados</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.id}>{employee.name}</option>
              ))}
            </select>
          )}

          {/* Confirmación */}
          <select
            value={confirmedFilter}
            onChange={(e) => setConfirmedFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 focus:border-transparent"
          >
            <option value="">Metodo de confirmación</option>
            <option value="true">Confirmados por email</option>
            <option value="false">Confirmación manual</option>
          </select>
        </div>

        {/* Botón limpiar filtros */}
        {(search || statusFilter || serviceFilter || employeeFilter || dateFrom || dateTo || confirmedFilter) && (
          <button
            onClick={() => {
              setSearch('');
              setStatusFilter('');
              setServiceFilter('');
              setEmployeeFilter('');
              setDateFrom('');
              setDateTo('');
              setConfirmedFilter('');
            }}
            className="text-sm text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 font-medium"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Tabla */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No se encontraron turnos</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Intenta ajustar los filtros o busca otro criterio
          </p>
        </div>
      ) : (
        <>
          {/* Vista Desktop */}
          <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Fecha y Hora
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Servicio
                    </th>
                    {userRole !== 'EMPLEADO' && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Empleado
                      </th>
                    )}
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Confirmado
                    </th>
                    {userRole !== 'EMPLEADO' && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Precio
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {appointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(apt.date)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{apt.client.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                          {apt.client.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {apt.client.email}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          {apt.client.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {apt.client.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900 dark:text-white">{apt.service.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          {apt.service.duration} min
                        </div>
                      </td>
                      {userRole !== 'EMPLEADO' && (
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900 dark:text-white">{apt.employee.name}</span>
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[apt.status]}`}>
                          {statusLabels[apt.status]}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {apt.confirmedByClient ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-300 dark:text-gray-600" />
                        )}
                      </td>
                      {userRole !== 'EMPLEADO' && (
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            ${apt.service.price}
                          </span>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vista Mobile */}
          <div className="lg:hidden space-y-4">
            {appointments.map((apt) => (
              <div key={apt.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {formatDate(apt.date)}
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[apt.status]}`}>
                    {statusLabels[apt.status]}
                  </span>
                </div>

                <div>
                  <div className="font-semibold text-gray-900 dark:text-white">{apt.client.name}</div>
                  {apt.client.email && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                      <Mail className="w-3 h-3" />
                      {apt.client.email}
                    </div>
                  )}
                  {apt.client.phone && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {apt.client.phone}
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Servicio:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{apt.service.name}</span>
                  </div>
                  {userRole !== 'EMPLEADO' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Empleado:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{apt.employee.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Duración:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{apt.service.duration} min</span>
                  </div>
                  {userRole !== 'EMPLEADO' && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Precio:</span>
                      <span className="font-semibold text-gray-900 dark:text-white">${apt.service.price}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Confirmado:</span>
                    {apt.confirmedByClient ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-lg shadow px-4 py-3">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>

              <span className="text-sm text-gray-700 dark:text-gray-300">
                Página {page} de {totalPages}
              </span>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}