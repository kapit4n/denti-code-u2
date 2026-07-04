# Language Switcher

**Role:** Cross-cutting (Public, Admin, Doctor, Patient)

**Description:** A select dropdown showing supported locales (English, Spanish). For authenticated users, includes a "Use organization default" option. Persists preference via API for logged-in users and localStorage for guests. Provides translation function `t()`, locale context, and BCP 47 tag for Intl APIs.

**Key Elements:**
- Locale selector dropdown
- EN/ES translations
- Org default option
- Preference persistence (API + localStorage)
- Translation context provider

**Files:**
- `src/i18n/I18nContext.tsx`
- `src/i18n/locales/en.json`
- `src/i18n/locales/es.json`
- `src/features/locale/localeApiSlice.ts`
- `src/components/LanguageSwitcher.tsx`
