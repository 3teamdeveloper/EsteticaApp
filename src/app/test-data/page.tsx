'use client';

import { useState, useEffect } from 'react';

export default function TestDataPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestData();
  }, []);

  const fetchTestData = async () => {
    try {
      // Test 1: Get all services
      const servicesResponse = await fetch('/api/services');
      const services = await servicesResponse.json();
      
      // Test 2: Get employees for first service
      if (services.length > 0) {
        const employeesResponse = await fetch(`/api/services/${services[0].id}/employees`);
        const employees = await employeesResponse.json();
        
        setData({
          services,
          employees,
          firstServiceId: services[0].id
        });
      }
    } catch (error) {
      console.error('Error fetching test data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Cargando datos de prueba...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Datos de Prueba</h1>
      
      {data ? (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">Servicios ({data.services.length})</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(data.services, null, 2)}
            </pre>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-2">Empleados para servicio {data.firstServiceId} ({data.employees.length})</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(data.employees, null, 2)}
            </pre>
          </div>
        </div>
      ) : (
        <div className="text-red-600">No se pudieron cargar los datos</div>
      )}
    </div>
  );
} 