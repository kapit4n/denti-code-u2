'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import { selectCurrentUser, updateAuthUser } from '@/features/auth/authSlice';
import { useGetLocaleSettingsQuery, useUpdateMyPreferredLocaleMutation } from '@/features/locale/localeApiSlice';
import { FALLBACK_LOCALE, isUiLocale } from '@/i18n/supportedLocales';
import { translate } from '@/i18n/translate';
import en from '@/i18n/locales/en.json';
import es from '@/i18n/locales/es.json';

const CATALOG: Record<string, Record<string, unknown>> = {
  en: en as Record<string, unknown>,
  es: es as Record<string, unknown>,
};

const GUEST_LOCALE_KEY = 'denti-guest-locale';

export type I18nContextValue = {
  locale: string;
  t: (key: string, vars?: Record<string, string | number>) => string;
  orgDefaultLocale: string;
  supportedLocales: { code: string; label: string }[];
  isAuthenticated: boolean;
  /** Logged-in: PATCH /auth/me. Guest: localStorage only. */
  setDisplayLanguage: (code: string | null) => Promise<void>;
  /** Effective selection for the menu: code or null when following org default. */
  userPreferredLocale: string | null | undefined;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function pickMessages(locale: string): Record<string, unknown> {
  return CATALOG[locale] ?? CATALOG[FALLBACK_LOCALE];
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const { data } = useGetLocaleSettingsQuery();
  const [patchLocale] = useUpdateMyPreferredLocaleMutation();

  const [guestLocale, setGuestLocaleState] = useState<string | null>(null);

  useEffect(() => {
    try {
      const g = localStorage.getItem(GUEST_LOCALE_KEY);
      if (g && isUiLocale(g)) setGuestLocaleState(g);
    } catch {
      /* ignore */
    }
  }, []);

  const orgDefault =
    data?.defaultLocale && isUiLocale(data.defaultLocale)
      ? data.defaultLocale
      : FALLBACK_LOCALE;

  const effectiveLocale = useMemo(() => {
    if (user) {
      const p = user.preferredLocale;
      if (p && isUiLocale(p)) return p;
      return orgDefault;
    }
    if (guestLocale && isUiLocale(guestLocale)) return guestLocale;
    return orgDefault;
  }, [user, guestLocale, orgDefault]);

  const messages = useMemo(() => pickMessages(effectiveLocale), [effectiveLocale]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => translate(messages, key, vars),
    [messages],
  );

  useEffect(() => {
    document.documentElement.lang = effectiveLocale;
  }, [effectiveLocale]);

  const setGuestLocalePersist = useCallback((code: string | null) => {
    setGuestLocaleState(code);
    try {
      if (code && isUiLocale(code)) {
        localStorage.setItem(GUEST_LOCALE_KEY, code);
      } else {
        localStorage.removeItem(GUEST_LOCALE_KEY);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setDisplayLanguage = useCallback(
    async (code: string | null) => {
      if (user) {
        const res = await patchLocale({ preferredLocale: code }).unwrap();
        const next = (res as { preferredLocale?: string | null }).preferredLocale ?? null;
        dispatch(updateAuthUser({ preferredLocale: next }));
        return;
      }
      setGuestLocalePersist(code);
    },
    [user, patchLocale, dispatch, setGuestLocalePersist],
  );

  const supportedLocales = useMemo(
    () =>
      data?.supportedLocales?.length
        ? data.supportedLocales
        : [
            { code: 'en', label: 'English' },
            { code: 'es', label: 'Español' },
          ],
    [data?.supportedLocales],
  );

  const value = useMemo(
    () => ({
      locale: effectiveLocale,
      t,
      orgDefaultLocale: orgDefault,
      supportedLocales,
      isAuthenticated: !!user,
      setDisplayLanguage,
      userPreferredLocale: user?.preferredLocale ?? null,
    }),
    [
      effectiveLocale,
      t,
      orgDefault,
      supportedLocales,
      user,
      setDisplayLanguage,
    ],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useTranslation(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useTranslation must be used within I18nProvider');
  }
  return ctx;
}
