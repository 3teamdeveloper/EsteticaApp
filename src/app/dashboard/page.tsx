'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TrialStatusCard from '@/components/TrialStatusCard';

interface UserData {
  id: string;
  email: string;
  name: string;
  username: string;
  role: string; // <-- Agregado
}

interface DashboardStats {
  totalServices: number;
  activeServices: number;
  totalEmployees: number;
  totalAppointments: number;
}

interface TodayAppointment {
  id: number;
  date: string;
  status: string;
  clientName: string;
  serviceName: string;
  employeeName?: string;
}

export default function Dashboard() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalServices: 0,
    activeServices: 0,
    totalEmployees: 0,
    totalAppointments: 0
  });
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Obtener datos del usuario
        const userResponse = await fetch('/api/dashboard', {
          credentials: 'include',
        });

        if (!userResponse.ok) {
          if (userResponse.status === 401) {
            router.push('/login');
            return;
          }
          throw new Error('Error al cargar los datos del usuario');
        }

        const userData = await userResponse.json();
        setUserData(userData);

        // Obtener estadísticas reales
        const statsResponse = await fetch('/api/dashboard/stats', {
          credentials: 'include',
        });

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          setStats({
            totalServices: statsData.totalServices,
            activeServices: statsData.activeServices,
            totalEmployees: statsData.totalEmployees,
            totalAppointments: statsData.monthlyAppointments
          });
        } else {
          console.error('Error al cargar estadísticas:', statsResponse.statusText);
          setStats({
            totalServices: 0,
            activeServices: 0,
            totalEmployees: 0,
            totalAppointments: 0
          });
        }

        // Obtener turnos de hoy
        const todayResponse = await fetch('/api/dashboard/today-appointments', {
          credentials: 'include',
        });

        if (todayResponse.ok) {
          const todayData = await todayResponse.json();
          setTodayAppointments(todayData.appointments || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar los datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
          <p className="text-gray-600 text-lg">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-lg mb-2">⚠️ Error</div>
          <div className="text-red-700">{error}</div>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon, color, gradient }: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    gradient: string;
  }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 hover:shadow-md transition-all duration-300 ${gradient}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs md:text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-2 md:p-3 rounded-lg ${color}`}>
          <div className="w-5 h-5 md:w-6 md:h-6">{icon}</div>
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, description, icon, href, color }: {
    title: string;
    description: string;
    icon: React.ReactNode;
    href: string;
    color: string;
  }) => (
    <Link href={href} className="block">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-300 hover:scale-105">
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center mb-4`}>
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </Link>
  );

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
    };
    return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts = {
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmado',
      CANCELLED: 'Cancelado',
      COMPLETED: 'Completado',
    };
    return texts[status as keyof typeof texts] || status;
  };

  return (
    <div className="space-y-6 md:space-y-8 p-4 md:p-8">
      {/* Header con bienvenida - Más compacto */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-6 md:p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">
              ¡Hola, {userData?.name || 'Usuario'}! 
            </h1>
            <p className="text-rose-100 text-sm md:text-lg">
              Bienvenido a tu panel de control
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Estado del Trial */}
      <TrialStatusCard />

      {/* Tarjetas de estadísticas - Grid 2x2 en mobile */}
      <div>
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Resumen del negocio</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <StatCard
            title="Total Servicios"
            value={stats.totalServices}
            icon={
              <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="bg-blue-500"
            gradient="hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100"
          />
          <StatCard
            title="Servicios Activos"
            value={stats.activeServices}
            icon={
              <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            }
            color="bg-green-500"
            gradient="hover:bg-gradient-to-br hover:from-green-50 hover:to-green-100"
          />
          <StatCard
            title="Empleados"
            value={stats.totalEmployees}
            icon={
              <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
              </svg>
            }
            color="bg-purple-500"
            gradient="hover:bg-gradient-to-br hover:from-purple-50 hover:to-purple-100"
          />
          <StatCard
            title="Citas (30 días)"
            value={stats.totalAppointments}
            icon={
              <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
            }
            color="bg-orange-500"
            gradient="hover:bg-gradient-to-br hover:from-orange-50 hover:to-orange-100"
          />
        </div>
      </div>

      {/* Turnos de Hoy */}
      {todayAppointments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Turnos de Hoy
            </h2>
            <Link href="/dashboard/management" className="text-sm text-rose-600 hover:text-rose-700 font-medium">
              Ver todos →
            </Link>
          </div>
          <div className="space-y-3">
            {todayAppointments.slice(0, 5).map((apt) => (
              <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900 text-sm md:text-base">
                      {new Date(apt.date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(apt.status)}`}>
                      {getStatusText(apt.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{apt.clientName}</p>
                  <p className="text-xs text-gray-500 truncate">{apt.serviceName}</p>
                </div>
              </div>
            ))}
          </div>
          {todayAppointments.length > 5 && (
            <p className="text-xs text-gray-500 text-center mt-3">
              +{todayAppointments.length - 5} turnos más
            </p>
          )}
        </div>
      )}

      {/* Acciones rápidas */}
      <div>
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">Acciones rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Mostrar solo si NO es EMPLEADO */}
          {userData?.role !== 'EMPLEADO' && (
            <QuickActionCard
              title="Gestionar Servicios"
              description="Agregar, editar o configurar tus servicios"
              icon={
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              href="/dashboard/services"
              color="bg-blue-500"
            />
          )}
          {/* Mostrar solo si NO es EMPLEADO */}
          {userData?.role !== 'EMPLEADO' && (
            <QuickActionCard
              title="Perfil Público"
              description="Personaliza tu minilanding pública"
              icon={
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              }
              href="/dashboard/profile"
              color="bg-green-500"
            />
          )}
          {/* Mostrar solo si NO es EMPLEADO */}
          {userData?.role !== 'EMPLEADO' && (
            <QuickActionCard
              title="Gestionar Empleados"
              description="Administra tu equipo de trabajo"
              icon={
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              }
              href="/dashboard/employees"
              color="bg-purple-500"
            />
          )}
          {/* Accesos siempre visibles */}
          <QuickActionCard
            title="Ver Estadísticas"
            description="Analiza el rendimiento de tu negocio"
            icon={
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            }
            href="/dashboard/stats"
            color="bg-orange-500"
          />
          <QuickActionCard
            title="Notificaciones"
            description="Revisa tus mensajes y alertas"
            icon={
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            }
            href="/dashboard/notifications"
            color="bg-red-500"
          />
          <QuickActionCard
            title="Configuración"
            description="Ajusta las preferencias de tu cuenta"
            icon={
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            }
            href="/dashboard/settings"
            color="bg-gray-500"
          />
        </div>
      </div>

    </div>
  );
}
