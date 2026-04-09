'use client';

import { useAppSelector } from '@/lib/redux/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import ProfileAvatarNav from '@/components/ProfileAvatarNav';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslation } from '@/i18n/I18nContext';

export default function PatientPortalHeader() {
  const { t } = useTranslation();
  const user = useAppSelector(selectCurrentUser);
  const name = user?.firstName?.trim() || t('portal.patientThere');

  return (
    <header className="px-6 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-gray-900">
            {t('portal.hi', { name })}
            <span className="block text-sm font-normal text-gray-500 mt-0.5">
              {t('portal.patientSubtitle')}
            </span>
          </h1>
        </div>
        <div className="flex items-start gap-3 shrink-0">
          <LanguageSwitcher />
          <ProfileAvatarNav />
        </div>
      </div>
    </header>
  );
}
