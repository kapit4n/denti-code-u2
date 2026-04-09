/** Keep aligned with `denti-code-auth-srv/src/locale/supported-locales.ts` when adding languages. */
export const SUPPORTED_UI_LOCALES = ['en', 'es'] as const;

export type UiLocaleCode = (typeof SUPPORTED_UI_LOCALES)[number];

export function isUiLocale(code: string): code is UiLocaleCode {
  return (SUPPORTED_UI_LOCALES as readonly string[]).includes(code);
}

export const FALLBACK_LOCALE: UiLocaleCode = 'en';
