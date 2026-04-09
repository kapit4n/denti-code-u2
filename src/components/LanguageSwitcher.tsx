'use client';

import { useCallback, useState } from 'react';
import { useTranslation } from '@/i18n/I18nContext';

type Props = {
  className?: string;
};

export default function LanguageSwitcher({ className = '' }: Props) {
  const {
    locale,
    t,
    supportedLocales,
    orgDefaultLocale,
    isAuthenticated,
    setDisplayLanguage,
    userPreferredLocale,
  } = useTranslation();
  const [busy, setBusy] = useState(false);

  const orgLabel =
    supportedLocales.find((o) => o.code === orgDefaultLocale)?.label ?? orgDefaultLocale;

  const selectValue =
    isAuthenticated && (userPreferredLocale === null || userPreferredLocale === undefined)
      ? ''
      : locale;

  const onChange = useCallback(
    async (e: React.ChangeEvent<HTMLSelectElement>) => {
      const v = e.target.value;
      setBusy(true);
      try {
        if (v === '') {
          await setDisplayLanguage(null);
        } else {
          await setDisplayLanguage(v);
        }
      } finally {
        setBusy(false);
      }
    },
    [setDisplayLanguage],
  );

  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      <label className="sr-only" htmlFor="denti-lang-select">
        {t('language.menuAria')}
      </label>
      <select
        id="denti-lang-select"
        className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[11rem]"
        value={selectValue}
        onChange={onChange}
        disabled={busy}
        aria-label={t('language.menuAria')}
      >
        {isAuthenticated && (
          <option value="">{`${t('language.useOrgDefault')} (${orgLabel})`}</option>
        )}
        {supportedLocales.map((opt) => (
          <option key={opt.code} value={opt.code}>
            {opt.label}
          </option>
        ))}
      </select>
      {isAuthenticated && (
        <span className="text-[10px] text-gray-400 leading-tight max-w-[11rem]">
          {t('language.preferenceHint')}
        </span>
      )}
    </div>
  );
}
