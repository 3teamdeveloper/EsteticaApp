"use client";

import { useState } from "react";
import { useToastContext } from "@/components/ui/toast/ToastProvider";
import { useSession } from "@/hooks/useSession";

export default function PasswordChange() {
  const { session } = useSession();
  const toast = useToastContext();

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changing, setChanging] = useState(false);

  // Forgot password state (no email input when authenticated)
  const [requesting, setRequesting] = useState(false);
  // Internally track if success, but do not show raw URL
  const [resetRequested, setResetRequested] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetRequested(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.push("error", "Completá todos los campos");
      return;
    }
    if (newPassword.length < 8) {
      toast.push("error", "La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.push("error", "La confirmación no coincide");
      return;
    }

    setChanging(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.push("error", data.error || "No se pudo cambiar la contraseña");
        return;
      }
      toast.push("success", "Contraseña actualizada correctamente");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.push("error", "Error de red o del servidor");
    } finally {
      setChanging(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetRequested(false);

    if (!session?.email) {
      toast.push("error", "No se encontró el email de la sesión");
      return;
    }

    setRequesting(true);
    try {
      // No enviamos email en el body: el endpoint usará el email de la sesión
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.push("error", data.error || "No se pudo generar el enlace");
        return;
      }
      setResetRequested(true);
      // Solo consola (sin mostrar URL en UI)
      toast.push("success", "Enlace generado. Revisá la consola del servidor.");
    } catch (err) {
      toast.push("error", "Error de red o del servidor");
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="max-w-3xl p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cambio de contraseña</h1>
        <p className="text-gray-600">Administrá tu contraseña o generá un enlace para restablecerla.</p>
      </div>

      {/* Sección: Cambiar contraseña (autenticado) */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Cambiar contraseña</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña actual</label>
            <input
              type="password"
              className="w-full border rounded px-3 py-2"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nueva contraseña</label>
              <input
                type="password"
                className="w-full border rounded px-3 py-2"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nueva contraseña</label>
              <input
                type="password"
                className="w-full border rounded px-3 py-2"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={changing}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {changing ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </section>

      {/* Sección: Olvidé mi contraseña (solo consola) */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Olvidé mi contraseña</h2>
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div className="text-sm text-gray-700">
            Generaremos un enlace de restablecimiento para la cuenta iniciada: <b>{session?.email || 'N/D'}</b>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={requesting}
              className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60"
            >
              {requesting ? "Generando..." : "Generar enlace"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}