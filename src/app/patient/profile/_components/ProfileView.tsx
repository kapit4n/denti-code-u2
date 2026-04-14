'use client';

import type { PatientProfile } from '@/types';
import { formatDobDisplay } from '@/lib/doctor/clinicalFormat';
import { useTranslation } from '@/i18n/I18nContext';
import AvatarThumb from '@/components/AvatarThumb';

interface ProfileViewProps {
  profile: PatientProfile;
  onEdit: () => void;
}

export default function ProfileView({ profile, onEdit }: ProfileViewProps) {
  const { t, intlLocale } = useTranslation();

  const dobDisplay = profile.DateOfBirth
    ? formatDobDisplay(profile.DateOfBirth, intlLocale)
    : t('patientPortal.notProvided');

  const displayName = `${profile.FirstName} ${profile.LastName}`.trim();

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <AvatarThumb src={profile.AvatarUrl} name={displayName || profile.Email || 'Patient'} size="md" />
        <p className="text-sm text-gray-500">{t('patientPortal.profileView.avatarCaption')}</p>
      </div>
      <div className="flex justify-between items-center mb-6 gap-3">
        <h3 className="text-lg font-semibold text-gray-900">
          {t('patientPortal.profileView.sectionTitle')}
        </h3>
        <button
          type="button"
          onClick={onEdit}
          className="shrink-0 bg-blue-600 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          {t('patientPortal.profileView.edit')}
        </button>
      </div>
      <dl className="space-y-5 text-sm">
        <div>
          <dt className="text-gray-500">{t('patientPortal.field.name')}</dt>
          <dd className="mt-0.5 font-medium text-gray-900 text-base">
            {profile.FirstName} {profile.LastName}
          </dd>
        </div>
        <div>
          <dt className="text-gray-500">{t('patientPortal.field.email')}</dt>
          <dd className="mt-0.5 text-gray-900">
            {profile.Email || t('patientPortal.notProvided')}
          </dd>
          <p className="text-xs text-gray-400 mt-1">{t('patientPortal.profileView.emailHint')}</p>
        </div>
        <div>
          <dt className="text-gray-500">{t('patientPortal.field.phone')}</dt>
          <dd className="mt-0.5 text-gray-900">
            {profile.ContactPhone || t('patientPortal.notProvided')}
          </dd>
        </div>
        <div>
          <dt className="text-gray-500">{t('patientPortal.field.dob')}</dt>
          <dd className="mt-0.5 text-gray-900">{dobDisplay}</dd>
        </div>
        {profile.Address ? (
          <div>
            <dt className="text-gray-500">{t('patientPortal.field.address')}</dt>
            <dd className="mt-0.5 text-gray-900">{profile.Address}</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-gray-500">{t('patientPortal.profileView.healthNotesTitle')}</dt>
          <dd className="mt-0.5 text-gray-900 whitespace-pre-wrap">
            {profile.MedicalHistorySummary?.trim()
              ? profile.MedicalHistorySummary
              : t('patientPortal.profileView.healthNotesEmpty')}
          </dd>
        </div>
      </dl>
    </div>
  );
}
