"use client";

import Link from "next/link";
import { Clock, KeyRound, Settings as SettingsIcon, User, MessageCircle, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { useTranslations, useLocale } from 'next-intl';

export default function Settings() {
  const t = useTranslations('settings');
  const locale = useLocale();
  const router = useRouter();
  const { session } = useSession();

  return (
    <div className="space-y-6 py-10">
      <h1 className="text-2xl font-bold pl-2 text-gray-900">{t('title')}</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Link
            href={session?.role !== 'EMPLEADO' ? `/${locale}/dashboard/settings/business-hours` : "#"}
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
              <h3 className="text-lg font-semibold text-gray-900">{t('cards.business_hours.title')}</h3>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              {t('cards.business_hours.description')}
            </p>
            <div className="mt-4 text-blue-600 text-sm font-medium">
              {t('cards.business_hours.action')}
            </div>
          </Link>


        <Link
          href={`/${locale}/dashboard/settings/password-change`}
          className="block bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow border border-gray-200 hover:border-gray-300"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <KeyRound className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{t('cards.password.title')}</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
          {t('cards.password.description')}
          </p>
          <div className="mt-4 text-blue-600 text-sm font-medium">
            {t('cards.password.action')}
          </div>
        </Link>

        <Link
          href={`/${locale}/dashboard/settings/personal-data`}
          className="block bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow border border-gray-200 hover:border-gray-300"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{t('cards.personal_data.title')}</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            {t('cards.personal_data.description')}
          </p>
          <div className="mt-4 text-blue-600 text-sm font-medium">
            {t('cards.personal_data.action')}
          </div>
        </Link>

        <Link
          href={session?.role !== 'EMPLEADO' ? `/${locale}/dashboard/settings/business-contact` : "#"}
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
            <h3 className="text-lg font-semibold text-gray-900">{t('cards.business_contact.title')}</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            {t('cards.business_contact.description')}
          </p>
          <div className="mt-4 text-blue-600 text-sm font-medium">
            {t('cards.business_contact.action')}
          </div>
        </Link>

        <Link
          href={`/${locale}/dashboard/settings/support`}
          className="block bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow border border-gray-200 hover:border-gray-300"
        >
          <div className="flex items-center gap-4 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageCircle className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{t('cards.support.title')}</h3>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            {t('cards.support.description')}
          </p>
          <div className="mt-4 text-blue-600 text-sm font-medium">
            {t('cards.support.action')}
          </div>
        </Link>

        {/* Placeholder for future settings */}
        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6">
          <div className="flex items-center gap-4 mb-3">
            <div className="p-2 bg-gray-200 rounded-lg">
              <SettingsIcon className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-500">{t('cards.coming_soon.title')}</h3>
          </div>
          <p className="text-gray-500 text-sm">
            {t('cards.coming_soon.description')}
          </p>
        </div>
      </div>
    </div>
  );
}