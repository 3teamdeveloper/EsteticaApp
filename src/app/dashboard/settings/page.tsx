"use client";

import Link from "next/link";
import { Clock, KeyRound, Settings as SettingsIcon, User, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";

export default function Settings() {
  const router = useRouter();
  const { session } = useSession();

  return (
    <div className="space-y-6  py-10">
      <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>

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

        {/* Placeholder for future settings */}
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-2 bg-gray-200 rounded-lg">
              <SettingsIcon className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-500">Próximamente</h3>
          </div>
          <p className="text-gray-500 text-sm">
            Más opciones de configuración estarán disponibles próximamente.
          </p>
        </div>
      </div>
    </div>
  );
}