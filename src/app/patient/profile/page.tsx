'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useGetMyProfileQuery } from '@/features/patients/patientsApiSlice';
import ProfileView from './_components/ProfileView';
import ProfileForm from './_components/ProfileForm';
import ProfileSkeleton from './_components/ProfileSkeleton';

export default function ProfilePage() {
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
          Could not load your details. Please try again.
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
        <h2 className="text-2xl font-bold text-gray-900">Your details</h2>
        <p className="text-gray-600 text-sm mt-1">
          Contact information and health notes your care team uses. Appointments and costs live
          under{' '}
          <Link href="/patient/dashboard" className="text-blue-600 font-medium hover:underline">
            Home
          </Link>{' '}
          and{' '}
          <Link href="/patient/appointments" className="text-blue-600 font-medium hover:underline">
            Visits
          </Link>
          .
        </p>
      </div>
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">{renderContent()}</div>
    </div>
  );
}
