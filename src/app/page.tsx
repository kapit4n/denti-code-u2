'use client';

import Link from 'next/link';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslation } from '@/i18n/I18nContext';

export default function HomePage() {
  const { t } = useTranslation();
  return (
    <main className="flex min-h-screen flex-col">
      <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white">
        <div className="absolute top-6 right-6 z-10">
          <LanguageSwitcher />
        </div>
        <div className="max-w-5xl mx-auto px-6 pt-20 pb-24 flex flex-col items-center text-center">
          <h1 className="text-5xl font-bold mb-4">{t('home.title')}</h1>
          <p className="text-xl text-blue-200 mb-4">{t('home.subtitle')}</p>
          <p className="text-blue-100 max-w-2xl leading-relaxed mb-10">
            {t('home.heroDesc')}
          </p>
          <Link
            href="/login"
            className="bg-white text-blue-700 font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-blue-50 transition-colors text-lg"
          >
            {t('home.login')}
          </Link>
        </div>
      </div>

      <div className="bg-gray-50 flex-1 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">{t('home.forTitle')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-md p-8 flex flex-col">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{t('portal.admin')}</h3>
              <p className="text-gray-600 flex-1">{t('home.forAdmin')}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-8 flex flex-col">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{t('portal.doctor')}</h3>
              <p className="text-gray-600 flex-1">{t('home.forDoctor')}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-8 flex flex-col">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{t('portal.patient')}</h3>
              <p className="text-gray-600 flex-1">{t('home.forPatient')}</p>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white border-t py-6 text-center text-gray-500 text-sm">
        {t('home.footer')}
      </footer>
    </main>
  );
}
