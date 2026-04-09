'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslation } from '@/i18n/I18nContext';
import {
  useGetLocaleSettingsQuery,
  useUpdateDefaultLocaleMutation,
} from '@/features/locale/localeApiSlice';

export default function AdminSettingsPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useGetLocaleSettingsQuery();
  const [updateDefault, { isLoading: saving }] = useUpdateDefaultLocaleMutation();
  const [code, setCode] = useState('en');
  const [message, setMessage] = useState<'ok' | 'err' | null>(null);

  useEffect(() => {
    if (data?.defaultLocale) setCode(data.defaultLocale);
  }, [data?.defaultLocale]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      await updateDefault({ defaultLocale: code }).unwrap();
      setMessage('ok');
    } catch {
      setMessage('err');
    }
  };

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <Link href="/admin/dashboard" className="text-sm font-medium text-blue-600 hover:underline">
          {t('adminSettings.backDashboard')}
        </Link>
        <h2 className="text-2xl font-bold text-gray-900 mt-2">{t('adminSettings.title')}</h2>
        <p className="text-sm text-gray-600 mt-1">{t('adminSettings.intro')}</p>
      </div>

      <form
        onSubmit={onSubmit}
        className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4"
      >
        <div>
          <label htmlFor="org-default-lang" className="block text-sm font-medium text-gray-700">
            {t('adminSettings.defaultLanguage')}
          </label>
          <p className="text-xs text-gray-500 mt-1">{t('adminSettings.defaultLanguageHelp')}</p>
          <select
            id="org-default-lang"
            className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm shadow-sm"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={isLoading || saving}
          >
            {(data?.supportedLocales ?? [
              { code: 'en', label: 'English' },
              { code: 'es', label: 'Español' },
            ]).map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={saving || isLoading}
          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? t('common.saving') : t('common.save')}
        </button>
        {message === 'ok' && <p className="text-sm text-green-600">{t('common.saved')}</p>}
        {message === 'err' && <p className="text-sm text-red-600">{t('common.error')}</p>}
      </form>
    </div>
  );
}
