'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserData {
  id: string;
  email: string;
  name: string;
  username: string;
}

export default function Dashboard() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/dashboard', {
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Error al cargar los datos del usuario');
        }

        const data = await response.json();
        setUserData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  // const handleLogout = async () => {
  //   try {
  //     await fetch('/api/auth/logout', {
  //       method: 'POST',
  //       credentials: 'include',
  //     });
  //     router.push('/login');
  //   } catch (error) {
  //     setError(error instanceof Error ? error.message : 'Error al cerrar sesión');
  //   }
  // };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="bg-white h-auto shadow rounded-lg w-90 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Bienvenido</h2>
        {userData && (
          <div className="flex gap-4 space-y-4 text-gray-600">
            <p><strong>Email:</strong> {userData.email}</p>
            <p><strong>Nombre:</strong> {userData.name}</p>
            <p><strong>Usuario:</strong> {userData.username}</p>
          </div>
        )}
      </div>
    </div>
  );
}
