"use client";

import Link from "next/link";
import { Clock, KeyRound, Settings as SettingsIcon, User, MessageCircle, Building2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { useState } from "react";
import DeleteAccountModal from "@/components/DeleteAccountModal";

export default function Settings() {
  const router = useRouter();
  const { session } = useSession();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      setDeleteError(null);
      
      const response = await fetch('/api/user/delete-account', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al eliminar la cuenta');
      }

      // Limpiar completamente la sesión del cliente
      // 1. Limpiar localStorage
      localStorage.removeItem('userSession');
      localStorage.clear(); // Por seguridad, limpiamos todo
      
      // 2. Limpiar cookies del cliente
      document.cookie = 'userSession=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // 3. Redirigir a la página principal usando window.location para forzar recarga completa
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
      window.location.href = `${baseUrl}?deleted=true`;
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
      setDeleteError(error instanceof Error ? error.message : 'Error desconocido');
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 py-10">
      <h1 className="text-2xl font-bold pl-2 text-gray-900">Configuración</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href={session?.role !== 'EMPLEADO' ? "/dashboard/settings/business-hours" : "#"}
            className={`block bg-white shadow rounded-lg p-6 transition-shadow border ${
              session?.role !== "EMPLEADO"
                ? "hover:shadow-md hover:border-gray-300 border-gray-200" //enabled
                : "opacity-50 border-gray-200"  //disabled
            }`}
          >
            <div className="flex items-center gap-4 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Horarios de Atención</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Configura los horarios generales de tu negocio. Estos horarios se aplicarán automáticamente cuando asignes servicios a empleados y determinarán la disponibilidad para reservas online.
            </p>
            <div className="mt-4 text-blue-600 text-sm font-medium">
              Configurar horarios →
            </div>
          </Link>


        <Link
          href="/dashboard/settings/password-change"
          className="block bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow border border-gray-200 hover:border-gray-300"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <KeyRound className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Cambiar contraseña</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
          La nueva contraseña reemplazará a la actual y se utilizará para acceder a tu perfil. Asegúrate de elegir una clave segura para proteger tu información y mantener la seguridad de tu cuenta.
          </p>
          <div className="mt-4 text-blue-600 text-sm font-medium">
            Olvidé mi contraseña →
          </div>
        </Link>

        <Link
          href="/dashboard/settings/personal-data"
          className="block bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow border border-gray-200 hover:border-gray-300"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Datos Personales</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            Modifica tu nombre de usuario y nombre completo. Esta información se mostrará en tu perfil interno y será visible en las comunicaciones del sistema.
          </p>
          <div className="mt-4 text-blue-600 text-sm font-medium">
            Editar datos →
          </div>
        </Link>

        <Link
          href={session?.role !== 'EMPLEADO' ? "/dashboard/settings/business-contact" : "#"}
          className={`block bg-white shadow rounded-lg p-6 transition-shadow border ${
            session?.role !== "EMPLEADO"
              ? "hover:shadow-md hover:border-gray-300 border-gray-200"
              : "opacity-50 border-gray-200"
          }`}
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Información del Negocio</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            Configura el teléfono, dirección y otros datos de contacto de tu negocio. Esta información se mostrará en los emails enviados a tus clientes.
          </p>
          <div className="mt-4 text-blue-600 text-sm font-medium">
            Configurar contacto →
          </div>
        </Link>

        <Link
          href="/dashboard/settings/support"
          className="block bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow border border-gray-200 hover:border-gray-300"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageCircle className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Soporte Técnico</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            ¿Necesitas ayuda? Contacta con nuestro equipo de soporte técnico. Reporta problemas, solicita nuevas funcionalidades o recibe asistencia personalizada.
          </p>
          <div className="mt-4 text-blue-600 text-sm font-medium">
            Contactar soporte →
          </div>
        </Link>

        {/* Eliminar Cuenta - Zona de peligro */}
        <div className="bg-white shadow rounded-lg p-6 border-2 border-red-200 hover:border-red-300 transition-shadow">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-red-600">Eliminar Cuenta</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            Elimina permanentemente tu cuenta y todos tus datos. Esta acción no se puede deshacer. Los registros de pagos se conservarán por obligaciones legales (Ley 25.326).
          </p>
          {deleteError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{deleteError}</p>
            </div>
          )}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
          >
            Eliminar mi cuenta
          </button>
        </div>
      </div>

      {/* Modal de confirmación */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        isDeleting={isDeleting}
      />
    </div>
  );
}