'use client';

import { useState, useEffect } from 'react';

export default function TestAppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      // Obtener todas las reservas
      const response = await fetch('/api/appointments');
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (error) {
      console.error('Error al cargar reservas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Cargando reservas...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Reservas en la Base de Datos</h1>
      
      {appointments.length === 0 ? (
        <div className="text-center text-gray-500">
          No hay reservas en la base de datos
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="bg-white p-4 rounded-lg border">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <strong>ID:</strong> {appointment.id}
                </div>
                <div>
                  <strong>Estado:</strong> {appointment.status}
                </div>
                <div>
                  <strong>Fecha:</strong> {new Date(appointment.date).toLocaleString()}
                </div>
                <div>
                  <strong>Empleado ID:</strong> {appointment.employeeId}
                </div>
                <div>
                  <strong>Servicio ID:</strong> {appointment.serviceId}
                </div>
                <div>
                  <strong>Cliente:</strong> {appointment.client?.name || 'N/A'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 