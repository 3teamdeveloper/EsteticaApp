'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToastContext } from '@/components/ui/toast/ToastProvider';
import { Input } from '@/components/ui/input';
import { Search, Plus, Pencil, Trash2, Clock, Send } from 'lucide-react';
import EmployeeServices from '@/components/EmployeeServices';
import { useTrial } from '@/hooks/useTrial';

interface Employee {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  employeeImage?: string | null;
  accountUserId?: number | null;
  hasPassword?: boolean;
  lastInvitationSentAt?: string | null;
}

export default function EmployeesPage() {
  const router = useRouter();
  const toast = useToastContext();
  const { trialStatus } = useTrial();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ open: boolean, employee?: Employee }>({ open: false });
  // Normalize trial status to a strict boolean to avoid boolean | null in props
  const isTrialInactive = !!(trialStatus && !trialStatus.isActive);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/employees');

      if (!response.ok) {
        throw new Error('Error al cargar empleados');
      }

      const data = await response.json();
      setEmployees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = (employee: Employee) => {
    setDeleteModal({ open: true, employee });
  };

  const confirmDeleteEmployee = async () => {
    if (!deleteModal.employee) return;
    
    try {
      const response = await fetch(`/api/employees/${deleteModal.employee.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar empleado');
      }

      setEmployees(employees.filter(emp => emp.id !== deleteModal.employee!.id));
      toast.push('success', 'Empleado eliminado correctamente');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar empleado');
      toast.push('error', 'Error al eliminar empleado');
    } finally {
      setDeleteModal({ open: false });
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (employee.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (employee.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const handleInvite = async (id: number) => {
    try {
      const res = await fetch(`/api/employees/${id}/invite`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al enviar invitación');
      if (data.emailSendWarning) {
        toast.push('info', data.emailSendWarning);
      } else {
        toast.push('success', 'Invitación enviada correctamente');
      }
    } catch (err) {
      toast.push('error', err instanceof Error ? err.message : 'Error al enviar invitación');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
              </div>

      {/* Modal de confirmación de eliminación */}
      {deleteModal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
            <div className="flex items-center gap-2 mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
              <span className="font-bold text-lg">Eliminar empleado</span>
            </div>
            <p className="mb-6">¿Seguro que deseas eliminar el empleado "{deleteModal.employee?.name}"?</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteModal({ open: false })}>
                Cancelar
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={confirmDeleteEmployee}
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

  return (
    <div className="p-1 md:p-6 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Empleados</h1>
        <Button
          onClick={() => router.push('/dashboard/employees/new')}
          disabled={isTrialInactive}
          className={isTrialInactive ? 'opacity-50 cursor-not-allowed' : ''}
          title={isTrialInactive ? 'Actualiza tu plan para agregar empleados' : ''}
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo
        </Button>
      </div>
      {isTrialInactive && (
        <div className="bg-orange-100 text-orange-800 p-2 rounded mb-4 text-sm">
          Tu trial ha expirado. Actualiza tu plan para agregar o editar empleados.
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
          {error}
        </div>
      )}

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Buscar empleados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="min-w-full divide-y divide-gray-200">
          {filteredEmployees.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No se encontraron empleados
            </div>
          ) : (
            filteredEmployees.map((employee) => (
              <div key={employee.id} className="p-4 hover:bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    {employee.employeeImage ? (
                      <img src={employee.employeeImage} alt={employee.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-base font-bold text-gray-600">
                        {employee.name ? employee.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">
                        {employee.name}
                      </h3>
                      <div className="mt-1">
                        {employee.hasPassword ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Cuenta activada</span>
                        ) : employee.accountUserId ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              Invitación enviada
                            </span>
                            {employee.lastInvitationSentAt && (
                              <span className="text-[11px] text-gray-500">
                                Enviada: {new Date(employee.lastInvitationSentAt).toLocaleString()}
                              </span>
                            )}
                          </div>
                        ) : (
                          employee.email && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Sin cuenta</span>
                          )
                        )}
                      </div>
                      {employee.email && (
                        <p className="text-sm text-gray-500">{employee.email}</p>
                      )}
                      {employee.phone && (
                        <p className="text-sm text-gray-500">{employee.phone}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 mt-4 sm:mt-0 sm:flex-row sm:items-center">
                    <EmployeeServices
                      employeeId={employee.id}
                      employeeName={employee.name}
                    />
                    <div className="flex w-full justify-end gap-2 flex-nowrap overflow-x-auto sm:w-auto sm:justify-start">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/employees/${employee.id}/schedules`)}
                        title="Gestionar horarios"
                      >
                        <Clock className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/employees/${employee.id}`)}
                        disabled={isTrialInactive}
                        title={isTrialInactive ? 'Actualiza tu plan para editar empleados' : ''}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      {employee.email && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleInvite(employee.id)}
                          title={employee.hasPassword ? 'Cuenta activada' : 'Reenviar invitación para establecer contraseña'}
                          disabled={Boolean(employee.hasPassword)}
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteEmployee(employee)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {deleteModal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
            <div className="flex items-center gap-2 mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
              <span className="font-bold text-lg">Eliminar empleado</span>
            </div>
            <p className="mb-6">¿Seguro que deseas eliminar el empleado "{deleteModal.employee?.name}"?</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteModal({ open: false })}>
                Cancelar
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={confirmDeleteEmployee}
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
