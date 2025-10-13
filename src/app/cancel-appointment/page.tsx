'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, Calendar, Clock, User, AlertCircle } from 'lucide-react';

function CancelContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [appointmentDetails, setAppointmentDetails] = useState<any>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token no válido');
      return;
    }

    async function cancelAppointment() {
      try {
        const res = await fetch('/api/appointments/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, action: 'cancel' })
        });

        const data = await res.json();

        if (res.ok) {
          setStatus('success');
          setMessage(data.message || 'Tu turno ha sido cancelado');
          setAppointmentDetails(data.appointment);
        } else {
          setStatus('error');
          setMessage(data.error || 'Error al cancelar el turno');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Error de conexión. Por favor, intenta nuevamente.');
      }
    }

    cancelAppointment();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {status === 'loading' && (
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-orange-500 animate-spin mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Cancelando turno...</h1>
            <p className="text-gray-600">Por favor espera un momento</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="text-center">
            <div className="bg-orange-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-12 h-12 text-orange-600" />
            </div>
            <h1 className="text-3xl font-bold text-orange-700 mb-2">Turno cancelado</h1>
            <p className="text-gray-600 mb-6">{message}</p>
            
            {appointmentDetails && (
              <div className="bg-gray-50 p-6 rounded-xl text-left space-y-3 mb-6">
                <h2 className="font-semibold text-gray-800 mb-3 text-center">Turno cancelado</h2>
                
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Fecha y hora</p>
                    <p className="font-medium text-gray-800">
                      {new Date(appointmentDetails.date).toLocaleDateString('es-AR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Servicio</p>
                    <p className="font-medium text-gray-800">{appointmentDetails.service}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-500">Profesional</p>
                    <p className="font-medium text-gray-800">{appointmentDetails.employee}</p>
                  </div>
                </div>

                {appointmentDetails.businessName && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-500 text-center">
                      {appointmentDetails.businessName}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                El horario ahora está disponible para otros clientes. Si cambiaste de opinión, puedes agendar un nuevo turno contactando directamente con el negocio.
              </p>
            </div>
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-center">
            <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-3xl font-bold text-red-700 mb-2">Error</h1>
            <p className="text-gray-600 mb-4">{message}</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                Si el problema persiste, por favor contacta directamente con el negocio.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CancelAppointmentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <Loader2 className="w-16 h-16 text-orange-500 animate-spin" />
      </div>
    }>
      <CancelContent />
    </Suspense>
  );
}
