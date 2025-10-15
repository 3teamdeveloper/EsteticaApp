'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Camera } from 'lucide-react';
import { useTrial } from '@/hooks/useTrial';
import { useToastContext } from '@/components/ui/toast/ToastProvider';
import { useTranslations, useLocale } from 'next-intl';

interface EmployeeFormData {
  name: string;
  email: string;
  phone: string;
  employeeImage?: File | null;
}
interface EmployeeFetchedData {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  employeeImage?: string | null;
  accountUserId?: number | null;
  hasPassword?: boolean;
  lastInvitationSentAt?: string | null;
}

export default function EmployeeForm({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslations('employees');
  const tStatus = useTranslations('employees.status');
  const tForm = useTranslations('employees.form');
  const locale = useLocale();
  const router = useRouter();
  const { id } = use(params);
  const { trialStatus } = useTrial();
  const toast = useToastContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<EmployeeFormData>({
    name: '',
    email: '',
    phone: ''
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [removeImage, setRemoveImage] = useState(false);

  useEffect(() => {
    if (id !== 'new') {
      fetchEmployee(id);
    }
  }, [id]);

  const fetchEmployee = async (employeeId: string) => {
    try {
      const response = await fetch(`/api/employees/${employeeId}`);
      
      if (!response.ok) {
        throw new Error(tForm('error_load'));
      }

      const data: EmployeeFetchedData = await response.json();
      setFormData({
        name: data.name,
        email: data.email || '',
        phone: data.phone || '',
        employeeImage: null,
      });
      setImagePreview(data.employeeImage || null);
      setInviteInfo({
        hasPassword: Boolean(data.hasPassword),
        lastInvitationSentAt: data.lastInvitationSentAt || null,
        accountUserId: data.accountUserId ?? null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : tForm('error_load'));
    }
  };
  const [inviteInfo, setInviteInfo] = useState<{ hasPassword: boolean; lastInvitationSentAt: string | null; accountUserId: number | null }>({
    hasPassword: false,
    lastInvitationSentAt: null,
    accountUserId: null,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData({ ...formData, employeeImage: file });
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, employeeImage: null });
    setImagePreview(null);
    setRemoveImage(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const url = id !== 'new' ? `/api/employees/${id}` : '/api/employees';
      const method = id !== 'new' ? 'PUT' : 'POST';
      const form = new FormData();
      form.append('name', formData.name);
      form.append('email', formData.email);
      form.append('phone', formData.phone);
      if (formData.employeeImage) {
        form.append('employeeImage', formData.employeeImage);
      }
      if (removeImage) {
        form.append('removeImage', 'true');
      }
      const response = await fetch(url, {
        method,
        body: form,
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || 'Error al guardar empleado');
      }

      // Toasts de éxito y advertencia
      if (id === 'new') {
        toast.push('success', 'Empleado creado correctamente');
      } else {
        toast.push('success', 'Empleado actualizado correctamente');
      }
      if (data?.emailSendWarning) {
        toast.push('info', data.emailSendWarning);
      }

      router.push(`/${locale}/dashboard/employees`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : tForm('error_save'));
      toast.push('error', err instanceof Error ? err.message : tForm('error_save'));
    } finally {
      setLoading(false);
    }
  };

  const isEditing = id !== 'new';

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditing ? tForm('title_edit') : tForm('title_new')}
        </h1>
        {trialStatus && !trialStatus.isActive && (
          <div className="bg-orange-100 text-orange-800 p-2 rounded mb-4 text-sm">
            {t('trial_expired')}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
          <div>
            {inviteInfo.hasPassword ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">{tStatus('active')}</span>
            ) : inviteInfo.accountUserId ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  {tStatus('invited')}
                </span>
                {inviteInfo.lastInvitationSentAt && (
                  <span className="text-[11px] text-gray-500">
                    {tStatus('sent_at')} {new Date(inviteInfo.lastInvitationSentAt).toLocaleString()}
                  </span>
                )}
              </div>
            ) : null}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{tForm('image_label')}</label>
            <div className="flex items-center space-x-4 mt-1">
              <button
                type="button"
                className="relative group focus:outline-none"
                onClick={() => fileInputRef.current?.click()}
                tabIndex={0}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt={tForm('image_alt')}
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-300 shadow group-hover:opacity-80 transition"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border-2 border-gray-300 shadow relative">
                    <span className="text-2xl font-semibold text-gray-500">
                      {formData.name ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase() : <Camera className="w-8 h-8 text-gray-400" />}
                    </span>
                    <Camera className="w-7 h-7 text-gray-400 absolute bottom-2 right-2 bg-white rounded-full p-1 border border-gray-200 shadow-sm group-hover:scale-110 transition" />
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </button>
              {imagePreview && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="ml-2 flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-gray-300 text-gray-500 text-xs font-medium shadow-sm hover:bg-red-100 hover:text-red-600 transition focus:outline-none focus:ring-2 focus:ring-red-200"
                  title={tForm('remove_image_title')}
                >
                  <Camera className="w-4 h-4 mr-1" /> {tForm('remove_image')}
                </button>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              {tForm('name_label')}
            </label>
            <Input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              {tForm('email_label')}
            </label>
            <Input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              {tForm('phone_label')}
            </label>
            <Input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="mt-1"
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/${locale}/dashboard/employees`)}
            >
              {tForm('button_cancel')}
            </Button>
            <Button type="submit" disabled={loading || (trialStatus?.isActive === false)}>
              {loading ? tForm('button_saving') : isEditing ? tForm('button_update') : tForm('button_create')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}