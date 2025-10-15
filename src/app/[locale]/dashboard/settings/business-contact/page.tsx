'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Phone, MapPin, Globe, Save, Loader2 } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

export default function BusinessContactPage() {
  const t = useTranslations('settings.business_contact');
  const locale = useLocale();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [formData, setFormData] = useState({
    businessPhone: '',
    businessAddress: '',
    businessCity: '',
    businessState: '',
    businessDescription: '',
    businessWebsite: '',
  });

  useEffect(() => {
    fetchBusinessInfo();
  }, []);

  const fetchBusinessInfo = async () => {
    try {
      const res = await fetch('/api/user/business-info');
      if (res.ok) {
        const data = await res.json();
        setFormData({
          businessPhone: data.businessPhone || '',
          businessAddress: data.businessAddress || '',
          businessCity: data.businessCity || '',
          businessState: data.businessState || '',
          businessDescription: data.businessDescription || '',
          businessWebsite: data.businessWebsite || '',
        });
      }
    } catch (error) {
      console.error(t('messages.load_error'), error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/user/business-info', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: t('messages.success') });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || t('messages.error') });
      }
    } catch (error) {
      setMessage({ type: 'error', text: t('messages.connection_error') });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
        >
          ← {t('back')}
        </button>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Building2 className="w-8 h-8" />
          {t('title')}
        </h1>
        <p className="text-gray-600 mt-2">
          {t('subtitle')}
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg mb-6 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Teléfono */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Phone className="w-4 h-4" />
            {t('phone')}
          </label>
          <input
            type="tel"
            name="businessPhone"
            value={formData.businessPhone}
            onChange={handleChange}
            placeholder={t('phone_placeholder')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            {t('phone_help')}
          </p>
        </div>

        {/* Dirección */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4" />
            {t('address')}
          </label>
          <input
            type="text"
            name="businessAddress"
            value={formData.businessAddress}
            onChange={handleChange}
            placeholder={t('address_placeholder')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Ciudad y Provincia */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('city')}
            </label>
            <input
              type="text"
              name="businessCity"
              value={formData.businessCity}
              onChange={handleChange}
              placeholder={t('city_placeholder')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('state')}
            </label>
            <input
              type="text"
              name="businessState"
              value={formData.businessState}
              onChange={handleChange}
              placeholder={t('state_placeholder')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Sitio Web */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Globe className="w-4 h-4" />
            {t('website')}
          </label>
          <input
            type="url"
            name="businessWebsite"
            value={formData.businessWebsite}
            onChange={handleChange}
            placeholder={t('website_placeholder')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('description')}
          </label>
          <textarea
            name="businessDescription"
            value={formData.businessDescription}
            onChange={handleChange}
            placeholder={t('description_placeholder')}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            {t('description_help')}
          </p>
        </div>

        {/* Botón Guardar */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('button_saving')}
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {t('button_save')}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Info adicional */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">{t('info_title')}</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• {t('info_items.confirmation')}</li>
          <li>• {t('info_items.reminder')}</li>
          <li>• {t('info_items.profile')}</li>
        </ul>
      </div>
    </div>
  );
}
