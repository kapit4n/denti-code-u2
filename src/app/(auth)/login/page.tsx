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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 relative">
      <div className="absolute top-6 right-6">
        <LanguageSwitcher />
      </div>
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl px-8 pt-6 pb-8 mb-4">
          <h1 className="text-3xl text-center font-bold mb-8 text-gray-800">{t('login.title')}</h1>
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
  );
}
