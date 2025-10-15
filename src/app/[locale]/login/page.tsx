'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Eye, EyeOff } from 'lucide-react';
import { useSession } from '@/hooks/useSession';
import { useTranslations, useLocale } from 'next-intl';

export default function Login() {
  const t = useTranslations('login');
  const locale = useLocale();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState<string | null>(null);
  const [recoverReady, setRecoverReady] = useState(false);
  const router = useRouter();
  const { login, session, isLoading: sessionLoading } = useSession();

  const emailInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!sessionLoading && session) {
      router.push(`/${locale}/dashboard`);
    }
  }, [session, sessionLoading, router, locale]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();

        login({
          userId: data.user.id,
          email: data.user.email,
          role: data.user.role,
          expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000)
        });

        router.push(`/${locale}/dashboard`);
      } else {
        const errorData = await response.json();
        setError(errorData.error || t('errors.invalid_credentials'));
      }
    } catch (error) {
      setError(t('errors.connection_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleForgotPassword = async () => {
    setForgotMsg(null);
    if (!recoverReady) {
      setRecoverReady(true);
      emailInputRef.current?.focus();
      setForgotMsg(t('forgot_password_prompt'));
      return;
    }

    if (!formData.email) {
      emailInputRef.current?.focus();
      setForgotMsg(t('forgot_password_prompt'));
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });
      const data = await res.json();
      if (!res.ok) {
        setForgotMsg(data.error || t('forgot_password_error'));
        return;
      }
      setForgotMsg(t('forgot_password_success'));
    } catch (err) {
      setForgotMsg(t('errors.network_error'));
    } finally {
      setForgotLoading(false);
      setRecoverReady(false);
    }
  };

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">{t('verifying_session')}</div>
      </div>
    );
  }

  if (session) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="w-full border-b bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 md:px-6">
          <a href="/" className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-rose-600" />
            <span className="text-xl text-gray-800 font-bold">CitaUp</span>
          </a>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl text-gray-800 font-bold">{t('title')}</h1>
              <p className="text-gray-500 mt-2">{t('subtitle')}</p>
            </div>

            {error && (
              <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t('email')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  ref={emailInputRef}
                  className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder={t('email_placeholder')}
                  required
                  disabled={loading}
                />
              </div>

              {forgotMsg && (
                <div className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded p-3 -mt-4"
                  dangerouslySetInnerHTML={{ __html: forgotMsg }}>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {t('password')}
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-gray-900 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent pr-10"
                    placeholder={t('password_placeholder')}
                    required
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-gray-300 rounded"
                    disabled={loading}
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                    {t('remember_me')}
                  </label>
                </div>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={forgotLoading}
                  className="text-sm text-rose-600 hover:text-rose-500 disabled:opacity-60"
                >
                  {forgotLoading ? t('forgot_password_generating') : (recoverReady ? t('forgot_password_recover') : t('forgot_password'))}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('submitting') : t('submit')}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">{t('or_continue_with')}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => window.location.href = '/api/auth/google'}
                disabled={loading}
                className="w-full flex justify-center items-center gap-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {t('continue_with_google')}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {t('no_account')}{' '}
                <a href={`/${locale}/register`} className="font-medium text-rose-600 hover:text-rose-500">
                  {t('register_link')}
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 border-t">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <p className="text-center text-xs text-gray-500">{t('footer')}</p>
        </div>
      </footer>
    </div>
  );
}