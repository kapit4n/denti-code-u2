'use client';
import React, { useState, useEffect } from 'react';
import { useLoginMutation } from '@/features/auth/authApiSlice';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppSelector } from '@/lib/redux/hooks';
import { useTranslation } from '@/i18n/I18nContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export default function LoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('patient1@example.com');
  const [password, setPassword] = useState('Password123!');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const [login, { isLoading, error }] = useLoginMutation();
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    if (error && 'data' in error) {
      const errorData = error.data as { message?: string };
      setErrorMessage(errorData.message || t('login.unknownError'));
    }
  }, [error, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      const data = await login({ email, password }).unwrap();

      const profileUser = data?.user as { roles?: string[] } | undefined;
      const roles = profileUser?.roles ?? user?.roles ?? [];

      if (roles.includes('ADMIN')) {
        router.push('/admin/dashboard');
      } else if (roles.includes('DOCTOR')) {
        router.push('/doctor/dashboard');
      } else if (roles.includes('PATIENT')) {
        router.push('/patient/dashboard');
      } else {
        router.push('/');
      }
    } catch {
      // Error message is set via the useEffect hook
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-700 to-blue-900 text-white p-12 flex-col justify-between relative">
        <div className="absolute top-6 right-6">
          <LanguageSwitcher />
        </div>
        <div className="max-w-lg">
          <div className="mb-2">
            <svg className="w-10 h-10 mb-4" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="4" width="14" height="14" rx="2" fill="white" fillOpacity="0.4" />
              <rect x="22" y="4" width="14" height="14" rx="2" fill="white" fillOpacity="0.7" />
              <rect x="4" y="22" width="14" height="14" rx="2" fill="white" />
              <rect x="22" y="22" width="14" height="14" rx="2" fill="white" fillOpacity="0.4" />
            </svg>
            <h1 className="text-4xl font-bold mb-2">{t('loginBanner.title')}</h1>
          </div>
          <p className="text-xl text-blue-200 mb-6">{t('loginBanner.subtitle')}</p>
          <p className="text-blue-100 mb-8 leading-relaxed">{t('loginBanner.description')}</p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 shrink-0 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{t('loginBanner.features.appointments')}</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 shrink-0 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{t('loginBanner.features.treatments')}</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 shrink-0 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{t('loginBanner.features.patients')}</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 shrink-0 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{t('loginBanner.features.inventory')}</span>
            </li>
            <li className="flex items-start gap-3">
              <svg className="w-5 h-5 mt-0.5 shrink-0 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{t('loginBanner.features.multiRole')}</span>
            </li>
          </ul>
        </div>
        <p className="text-blue-300 text-sm">&copy; 2026 Denti-Code</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 relative">
        <div className="absolute top-6 right-6 lg:hidden">
          <LanguageSwitcher />
        </div>
        <div className="w-full max-w-md">
          <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl px-8 pt-6 pb-8 mb-4">
            <div className="lg:hidden text-center mb-6">
              <h1 className="text-3xl font-bold text-blue-700">{t('loginBanner.title')}</h1>
              <p className="text-gray-500 text-sm mt-1">{t('loginBanner.subtitle')}</p>
            </div>
            <h2 className="text-2xl text-center font-bold mb-8 text-gray-800">{t('login.title')}</h2>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                {t('login.email')}
              </label>
              <input
                className="shadow-sm appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                {t('login.password')}
              </label>
              <input
                className="shadow-sm appearance-none border rounded w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="******************"
                required
              />
            </div>
            {errorMessage && <p className="text-red-500 text-xs italic mb-4 text-center">{errorMessage}</p>}
            <div className="flex items-center justify-center">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full transition-colors duration-300"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? t('login.submitting') : t('login.submit')}
              </button>
            </div>
            <p className="text-center text-gray-500 text-xs mt-6">
              <Link href="/" className="text-blue-600 hover:underline">
                &larr; {t('login.backHome')}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
