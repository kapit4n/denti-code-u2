'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useGetMyProfileQuery } from '@/features/patients/patientsApiSlice';
import { useTranslation } from '@/i18n/I18nContext';
import ProfileView from './_components/ProfileView';
import ProfileForm from './_components/ProfileForm';
import ProfileSkeleton from './_components/ProfileSkeleton';

export default function ProfilePage() {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const { data: profile, isLoading, isError } = useGetMyProfileQuery();

  const handleEditSuccess = () => {
    setIsEditing(false);
  };

  const renderContent = () => {
    if (isLoading) {
      return <ProfileSkeleton />;
    }

    if (isError || !profile) {
      return (
        <div className="text-center text-red-600 text-sm">
          {t('patientPortal.profilePage.loadError')}
        </div>
      );
    }

    if (isEditing) {
      return (
        <ProfileForm
          profile={profile}
          onSaveSuccess={handleEditSuccess}
          onCancel={() => setIsEditing(false)}
        />
      );
    }

    return <ProfileView profile={profile} onEdit={() => setIsEditing(true)} />;
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t('patientPortal.profilePage.title')}</h2>
        <p className="text-gray-600 text-sm mt-1">
          {t('patientPortal.profilePage.introBefore')}
          <Link href="/patient/dashboard" className="text-blue-600 font-medium hover:underline">
            {t('nav.home')}
          </Link>
          {t('patientPortal.profilePage.introBetween')}
          <Link href="/patient/appointments" className="text-blue-600 font-medium hover:underline">
            {t('nav.visits')}
          </Link>
          {t('patientPortal.profilePage.introAfter')}
        </p>
      </div>
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">{renderContent()}</div>
    </div>
  );
}
