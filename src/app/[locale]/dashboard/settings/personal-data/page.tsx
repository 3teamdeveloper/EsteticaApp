"use client";

import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useToastContext } from "@/components/ui/toast/ToastProvider";
import { useSession } from "@/hooks/useSession";
import { useTranslations, useLocale } from 'next-intl';

export default function PersonalData() {
  const t = useTranslations('settings.personal_data');
  const locale = useLocale();
  const { session, refreshSession } = useSession();
  const toast = useToastContext();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialData, setInitialData] = useState({ name: "", username: "" });

  // Load current user data
  useEffect(() => {
    const loadUserData = async () => {
      if (session) {
        // If session already has name and username, use them
        if (session.name && session.username) {
          setName(session.name);
          setUsername(session.username);
          setInitialData({ 
            name: session.name, 
            username: session.username 
          });
        } else {
          // If not, refresh session to get complete user data
          const refreshedSession = await refreshSession();
          if (refreshedSession && refreshedSession.name && refreshedSession.username) {
            setName(refreshedSession.name);
            setUsername(refreshedSession.username);
            setInitialData({ 
              name: refreshedSession.name, 
              username: refreshedSession.username 
            });
          }
        }
      }
    };

    loadUserData();
  }, [session]); // Removed refreshSession from dependencies to prevent infinite loop

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.push("error", t('messages.name_required'));
      return;
    }

    if (!username.trim()) {
      toast.push("error", t('messages.username_required'));
      return;
    }

    // Check if username contains only valid characters
    const usernameRegex = /^[a-z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      toast.push("error", t('messages.username_invalid'));
      return;
    }

    if (username.length < 3) {
      toast.push("error", t('messages.username_short'));
      return;
    }

    // Check if data has changed
    if (name === initialData.name && username === initialData.username) {
      toast.push("info", t('messages.no_changes'));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/user/update-personal-data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), username: username.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.push("error", data.error || t('messages.error'));
        return;
      }

      toast.push("success", t('messages.success'));
      setInitialData({ name: name.trim(), username: username.trim() });
      
      // Refresh session to update the data in the UI
      await refreshSession();
      
    } catch (err) {
      toast.push("error", t('messages.network_error'));
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = name !== initialData.name || username !== initialData.username;

  return (
    <div className="max-w-3xl p-6 space-y-8">
      <div className="flex items-center gap-4">
        <Link
          href={`/${locale}/dashboard/settings`}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors pt-8"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-600">{t('subtitle')}</p>
        </div>
      </div>

      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('section_title')}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('full_name')}
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('full_name_placeholder')}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('full_name_help')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('username')}
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                placeholder={t('username_placeholder')}
                required
                minLength={3}
                pattern="[a-z0-9_-]+"
              />
              <p className="text-xs text-gray-500 mt-1">
                {t('username_help')}
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">{t('info_title')}</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• {t('info_items.unique')}</li>
              <li>• {t('info_items.internal')}</li>
              <li>• {t('info_items.communications')}</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3">
            <Link
              href={`/${locale}/dashboard/settings`}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {t('button_cancel')}
            </Link>
            <button
              type="submit"
              disabled={loading || !hasChanges}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? t('button_saving') : t('button_save')}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
