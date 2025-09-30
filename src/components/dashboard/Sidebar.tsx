'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  BarChart2, 
  Calendar, 
  User, 
  Settings,
  LogOut,
  Bell,
  Briefcase,
  Contact,
  ArrowLeftFromLine,
  ArrowRightFromLine,
} from 'lucide-react';
import { useState } from 'react';

import NotificationBell from '@/components/NotificationBell';
import { setLastSeenTimestamp } from '@/lib/notifications';
import { useSession } from '@/hooks/useSession';

// Definición de las rutas del sidebar
const SIDEBAR_ITEMS = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'Estadísticas',
    href: '/dashboard/stats',
    icon: BarChart2
  },
  {
    title: 'Perfil Público',
    href: '/dashboard/profile',
    icon: User
  },
  {
    title: 'Servicios',
    href: '/dashboard/services',
    icon: Briefcase
  },
  {
    title: 'Empleados',
    href: '/dashboard/employees',
    icon: Contact
  },
  {
    title: 'Gestión',
    href: '/dashboard/management',
    icon: Calendar
  },
  {
    title: 'Configuración',
    href: '/dashboard/settings',
    icon: Settings
  }
];

interface SidebarProps {
  currentPath: string;
  userRole?: string; // <-- Nuevo prop opcional
  collapsed?: boolean; // modo colapsado en desktop
  onToggleCollapse?: () => void; // alternar colapso
}

export function Sidebar({ currentPath, userRole, collapsed = false, onToggleCollapse }: SidebarProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { logout } = useSession();

  const handleLogout = async () => {
    try {
      // Limpiar sesión del servidor
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      // Limpiar sesión local
      logout();
      
      // Redirigir al login
      router.push('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Aún así, limpiar la sesión local y redirigir
      logout();
      router.push('/login');
    }
  };

  // Botón hamburguesa para mobile
  return (
    <>
      {/* Botón hamburguesa solo en mobile */}
      <button
        className={`fixed top-4 left-4 z-20 md:hidden bg-white border border-gray-200 rounded-lg p-2 shadow ${open ? 'hidden' : ''}`}
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        aria-expanded={open}
        aria-controls="dashboard-sidebar"
      >
        <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Sidebar como drawer en mobile, fijo en desktop */}
      <aside
        className={`
          fixed top-0 left-0 h-full ${collapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 z-40 transform transition-all duration-300
          md:static md:translate-x-0 md:block
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
        id="dashboard-sidebar"
        style={{ boxShadow: '0 0 24px 0 rgba(0,0,0,0.04)' }}
      >
        {/* Logo y nombre de la app */}
        <div className={`h-16 relative flex items-center border-b border-gray-200 px-4`}>
          <h1 className={`text-xl font-bold text-gray-800 transition-opacity duration-200 ${collapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>BeautyBook</h1>
          
          {/* Botón colapsar solo en md+ */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`hidden md:inline-flex items-center justify-center w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 absolute right-6 top-1/2 -translate-y-1/2 transition-transform ${collapsed ? '' : ''}`}
            aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            title={collapsed ? 'Expandir' : 'Colapsar'}
          >
            {collapsed ? (
              <ArrowRightFromLine className="w-4 h-4 text-gray-700" />
            ) : (
              <ArrowLeftFromLine className="w-4 h-4 text-gray-700" />
            )}
          </button>
        </div>

        {/* Navegación */}
        <nav className="p-4 space-y-1 pb-32">
          {SIDEBAR_ITEMS.filter(item => {
            // Ocultar para EMPLEADO
            if (userRole === 'EMPLEADO' && [
              '/dashboard/profile',
              '/dashboard/services',
              '/dashboard/employees'
            ].includes(item.href)) {
              return false;
            }
            return true;
          }).map((item) => {
            const isActive = currentPath === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${isActive 
                    ? 'bg-rose-50 text-rose-600' 
                    : 'text-gray-800 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
                onClick={() => setOpen(false)}
              >
                <Icon className={`h-5 w-5 ${collapsed ? '' : 'mr-3'}`} />
                <span className={`${collapsed ? 'opacity-0 pointer-events-none w-0' : 'opacity-100 w-auto'} whitespace-nowrap transition-all duration-200`}>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Campanita de notificaciones - arriba del botón de cerrar sesión */}
        <div className={`absolute bottom-20 ${collapsed ? 'w-20' : 'w-64'} p-4 border-t border-gray-200`}>
          <Link
            href="/dashboard/notifications"
            className={`flex items-center rounded-md ${collapsed ? 'justify-center' : 'justify-start'} px-3 py-2 hover:bg-gray-50`}
            onClick={() => { setLastSeenTimestamp(); setOpen(false); }}
          >
            <NotificationBell />
            {!collapsed && (
              <span className="ml-2 text-sm text-gray-600 font-medium">Notificaciones</span>
            )}
          </Link>
        </div>

        {/* Botón de cerrar sesión */}
        <div className={`absolute bottom-0 ${collapsed ? 'w-20' : 'w-64'} p-4 border-t border-gray-200`}>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-800 rounded-md hover:bg-gray-50 hover:text-gray-900"
          >
            <LogOut className={`h-5 w-5 ${collapsed ? '' : 'mr-3'}`} />
            <span className={`${collapsed ? 'opacity-0 pointer-events-none w-0' : 'opacity-100 w-auto'} whitespace-nowrap transition-all duration-200`}>Cerrar Sesión</span>
          </button>
        </div>
        {/* Botón para cerrar el drawer en mobile */}
        <button
          className="absolute top-4 right-4 md:hidden bg-gray-100 rounded-full p-2"
          onClick={() => setOpen(false)}
          aria-label="Cerrar menú"
        >
          <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </aside>
      {/* Fondo oscuro al abrir el drawer en mobile */}
      {open && (
        <div
          className="fixed inset-0 backdrop-blur-md bg-black/70 z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
} 