'use client';

import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslation } from '@/i18n/I18nContext';

export default function HomePage() {
  const { t } = useTranslation();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50 relative">
      <div className="absolute top-6 right-6">
        <LanguageSwitcher />
      </div>
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4 text-gray-800">{t('home.title')}</h1>
        <p className="text-lg mb-8 text-gray-600">{t('home.subtitle')}</p>
        <div className="space-x-4">
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105"
          >
            {t('home.login')}
          </Link>
        </div>
      </div>
    </main>
  );
}
