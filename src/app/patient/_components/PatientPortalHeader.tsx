'use client';

import { useAppSelector } from '@/lib/redux/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import ProfileAvatarNav from '@/components/ProfileAvatarNav';

export default function PatientPortalHeader() {
  const user = useAppSelector(selectCurrentUser);
  const name = user?.firstName?.trim() || 'there';

  return (
    <header className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-gray-900">
            Hi, {name}
            <span className="block text-sm font-normal text-gray-500 mt-0.5">
              Appointments, your dentist, and visit costs in one place
            </span>
          </h1>
        </div>
        <ProfileAvatarNav />
      </div>
    </header>
  );
}
