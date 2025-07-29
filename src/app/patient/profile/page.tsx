'use client';

import { useState } from 'react';
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
      return <div className="text-center text-red-500">Could not load your profile. Please try again.</div>;
    }

    if (isEditing) {
      return <ProfileForm profile={profile} onSaveSuccess={handleEditSuccess} onCancel={() => setIsEditing(false)} />;
    }

    return <ProfileView profile={profile} onEdit={() => setIsEditing(true)} />;
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-gray-800">My Profile</h2>
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        {renderContent()}
      </div>
    </div>
  );
}
