'use client';

import Link from 'next/link';
import type { PatientProfile } from '@/types';
import { formatDobDisplay } from '@/lib/doctor/clinicalFormat';
import { useTranslation } from '@/i18n/I18nContext';

type Props = {
  profile: PatientProfile;
};

export default function PatientInfoSummary({ profile }: Props) {
  const { t, intlLocale } = useTranslation();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{t('patientPortal.infoSummary.title')}</h2>
        <Link
          href="/patient/profile"
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          {t('patientPortal.infoSummary.editDetails')}
        </Link>
      </div>
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="text-gray-500">{t('patientPortal.field.name')}</dt>
          <dd className="font-medium text-gray-900">
            {profile.FirstName} {profile.LastName}
          </dd>
        </div>
        <div>
          <dt className="text-gray-500">{t('patientPortal.field.email')}</dt>
          <dd className="text-gray-900">{profile.Email || t('patientPortal.emptyDash')}</dd>
        </div>
        <div>
          <dt className="text-gray-500">{t('patientPortal.field.phone')}</dt>
          <dd className="text-gray-900">{profile.ContactPhone || t('patientPortal.emptyDash')}</dd>
        </div>
        <div>
          <dt className="text-gray-500">{t('patientPortal.field.dob')}</dt>
          <dd className="text-gray-900">{formatDobDisplay(profile.DateOfBirth, intlLocale)}</dd>
        </div>
        {profile.Address ? (
          <div>
            <dt className="text-gray-500">{t('patientPortal.field.address')}</dt>
            <dd className="text-gray-900">{profile.Address}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
