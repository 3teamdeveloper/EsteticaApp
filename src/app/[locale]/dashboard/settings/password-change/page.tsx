"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useToastContext } from "@/components/ui/toast/ToastProvider";
import { useSession } from "@/hooks/useSession";
import { useTranslations, useLocale } from 'next-intl';

export default function PasswordChange() {
  const t = useTranslations('settings.password_change');
  const locale = useLocale();
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
      toast.push("error", t('messages.complete_fields'));
      return;
    }
    if (newPassword.length < 8) {
      toast.push("error", t('messages.min_length'));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.push("error", t('messages.no_match'));
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
        toast.push("error", data.error || t('messages.error'));
        return;
      }
      toast.push("success", t('messages.success'));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.push("error", t('messages.network_error'));
    } finally {
      setChanging(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetRequested(false);

    if (!session?.email) {
      toast.push("error", t('messages.no_email'));
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
        toast.push("error", data.error || t('messages.link_error'));
        return;
      }
      setResetRequested(true);
      // Solo consola (sin mostrar URL en UI)
      toast.push("success", t('messages.link_success'));
    } catch (err) {
      toast.push("error", t('messages.network_error'));
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="max-w-3xl p-6 space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href={`/${locale}/dashboard/settings`}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600">{t('subtitle')}</p>
        </div>
      </div>

      {/* Sección: Cambiar contraseña (autenticado) */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('change_section.title')}</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('change_section.current_password')}</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('change_section.new_password')}</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('change_section.confirm_password')}</label>
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
              {changing ? t('change_section.button_saving') : t('change_section.button_save')}
            </button>
          </div>
        </form>
      </section>

      {/* Sección: Olvidé mi contraseña (solo consola) */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('forgot_section.title')}</h2>
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div className="text-sm text-gray-700">
            {t('forgot_section.description')} <b>{session?.email || 'N/D'}</b>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={requesting}
              className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60"
            >
              {requesting ? t('forgot_section.button_generating') : t('forgot_section.button_generate')}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}