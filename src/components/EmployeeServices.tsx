import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, X, Clock, ExternalLink } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

interface Service {
  id: number;
  name: string;
  duration: number;
  price: number;
}

interface EmployeeServicesProps {
  employeeId: number;
  employeeName: string;
}

export default function EmployeeServices({ employeeId, employeeName }: EmployeeServicesProps) {
  const t = useTranslations('employees.services_modal');
  const locale = useLocale();
  const [services, setServices] = useState<Service[]>([]);
  const [assignedServiceIds, setAssignedServiceIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{ open: boolean, serviceId?: number, serviceName?: string }>({ open: false });
  const [defaultHoursModal, setDefaultHoursModal] = useState<{ open: boolean, serviceId?: number, serviceName?: string }>({ open: false });

  useEffect(() => {
    if (isModalOpen) {
      fetchServices();
      fetchEmployeeServices();
    }
  }, [employeeId, isModalOpen]);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      if (!response.ok) throw new Error(t('error_load_services'));
      const data = await response.json();
      setServices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error_load_services'));
    }
  };

  const fetchEmployeeServices = async () => {
    try {
      const response = await fetch(`/api/employees/${employeeId}/services`);
      if (!response.ok) throw new Error(t('error_load_employee_services'));
      const data = await response.json();
      setAssignedServiceIds(data.map((service: Service) => service.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error_load_employee_services'));
    } finally {
      setLoading(false);
    }
  };

  const checkBusinessHours = async () => {
    try {
      const response = await fetch('/api/business-hours/check');
      if (!response.ok) throw new Error('Error al verificar horarios');
      const data = await response.json();
      return data.hasBusinessHours;
    } catch (err) {
      console.error('Error al verificar horarios de negocio:', err);
      return false;
    }
  };

  const handleServiceToggle = async (serviceId: number, checked: boolean, serviceName: string) => {
    if (!checked) {
      // Mostrar confirmación antes de desasignar
      setConfirmModal({ open: true, serviceId, serviceName });
      return;
    }
    
    // Verificar si hay horarios de negocio configurados antes de asignar
    const hasBusinessHours = await checkBusinessHours();
    
    if (!hasBusinessHours) {
      // Mostrar modal de confirmación para horarios por defecto
      setDefaultHoursModal({ open: true, serviceId, serviceName });
      return;
    }

    // Asignar directamente si hay horarios configurados
    await assignService(serviceId);
  };

  const assignService = async (serviceId: number) => {
    try {
      const response = await fetch(`/api/employees/${employeeId}/services`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId }),
      });
      if (!response.ok) throw new Error(t('error_assign'));
      await fetchEmployeeServices();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error_update'));
    }
  };

  const confirmDefaultHours = async () => {
    if (!defaultHoursModal.serviceId) return;
    
    await assignService(defaultHoursModal.serviceId);
    setDefaultHoursModal({ open: false });
  };

  const confirmRemoveService = async () => {
    if (!confirmModal.serviceId) return;
    
    try {
      const response = await fetch(`/api/employees/${employeeId}/services`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceId: confirmModal.serviceId }),
      });
      if (!response.ok) throw new Error(t('error_remove'));
      await fetchEmployeeServices();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error_update'));
    } finally {
      setConfirmModal({ open: false });
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="bg-green-100 hover:bg-green-300 text-green-800 px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
      >
        <Plus className="w-4 h-4" />
        {t('button')}
      </Button>

      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl mx-4 rounded-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                {t('title')} {employeeName}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-md mb-4">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service) => {
                    const isAssigned = assignedServiceIds.includes(service.id);
                    return (
                      <div
                        key={service.id}
                        className={`p-4 rounded-lg border transition-all cursor-pointer ${
                          isAssigned
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                        onClick={() => handleServiceToggle(service.id, !isAssigned, service.name)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{service.name}</h3>
                            <p className="text-sm text-gray-800">
                              {service.duration} min • ${service.price}
                            </p>
                          </div>
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              isAssigned
                                ? 'border-purple-500 bg-purple-500'
                                : 'border-gray-300'
                            }`}
                          >
                            {isAssigned && (
                              <div className="w-3 h-3 bg-white rounded-full" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de desasignación */}
      {confirmModal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
            <div className="flex items-center gap-2 mb-4">
              <X className="w-6 h-6 text-red-600" />
              <span className="font-bold text-lg">{t('unassign_title')}</span>
            </div>
            <p className="mb-6">{t('unassign_message')} "{confirmModal.serviceName}" {t('unassign_from')} {employeeName}?</p>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setConfirmModal({ open: false })}>
                {t('cancel')}
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={confirmRemoveService}
              >
                {t('confirm_unassign')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de horarios por defecto */}
      {defaultHoursModal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-full">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <span className="font-bold text-lg text-gray-900">{t('default_hours_title')}</span>
            </div>
            
            <div className="mb-6 space-y-3">
              <p className="text-gray-700">
                {t('default_hours_message')}
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{t('default_hours_schedule')}</p>
                <p className="text-sm text-gray-600">{t('default_hours_weekend')}</p>
              </div>
              <p className="text-sm text-amber-700">
                {t('default_hours_recommendation')}
              </p>
            </div>

            <div className="space-y-3">
              <a
                href={`/${locale}/dashboard/settings/business-hours`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
              >
                <Clock className="w-4 h-4" />
                {t('configure_hours')}
                <ExternalLink className="w-4 h-4" />
              </a>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setDefaultHoursModal({ open: false })}
                  className="flex-1"
                >
                  {t('cancel')}
                </Button>
                <Button 
                  onClick={confirmDefaultHours}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {t('use_default_hours')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}