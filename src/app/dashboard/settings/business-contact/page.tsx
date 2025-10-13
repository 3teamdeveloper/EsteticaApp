'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Phone, MapPin, Globe, Save, Loader2 } from 'lucide-react';

export default function BusinessContactPage() {
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
      console.error('Error al cargar información:', error);
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
        setMessage({ type: 'success', text: 'Información actualizada correctamente' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al actualizar' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
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
          ← Volver
        </button>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Building2 className="w-8 h-8" />
          Información del Negocio
        </h1>
        <p className="text-gray-600 mt-2">
          Esta información se mostrará en los emails enviados a tus clientes
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
            Teléfono de contacto
          </label>
          <input
            type="tel"
            name="businessPhone"
            value={formData.businessPhone}
            onChange={handleChange}
            placeholder="+54 9 11 1234-5678"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Número que aparecerá en los emails a clientes
          </p>
        </div>

        {/* Dirección */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <MapPin className="w-4 h-4" />
            Dirección
          </label>
          <input
            type="text"
            name="businessAddress"
            value={formData.businessAddress}
            onChange={handleChange}
            placeholder="Av. Corrientes 1234, Piso 5, Depto B"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Ciudad y Provincia */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ciudad
            </label>
            <input
              type="text"
              name="businessCity"
              value={formData.businessCity}
              onChange={handleChange}
              placeholder="Buenos Aires"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Provincia / Estado
            </label>
            <input
              type="text"
              name="businessState"
              value={formData.businessState}
              onChange={handleChange}
              placeholder="CABA"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Sitio Web */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            <Globe className="w-4 h-4" />
            Sitio web (opcional)
          </label>
          <input
            type="url"
            name="businessWebsite"
            value={formData.businessWebsite}
            onChange={handleChange}
            placeholder="https://www.ejemplo.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción del negocio (opcional)
          </label>
          <textarea
            name="businessDescription"
            value={formData.businessDescription}
            onChange={handleChange}
            placeholder="Breve descripción de tu negocio..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Esta descripción puede usarse en el futuro para tu perfil público
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
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </form>

      {/* Info adicional */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ ¿Dónde se usa esta información?</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• En los emails de confirmación de turnos</li>
          <li>• En los emails de recordatorio 48h antes</li>
          <li>• En tu perfil público (próximamente)</li>
        </ul>
      </div>
    </div>
  );
}
