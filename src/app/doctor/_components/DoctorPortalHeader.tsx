'use client';

import { useAppSelector } from '@/lib/redux/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';

export default function DoctorPortalHeader() {
  const user = useAppSelector(selectCurrentUser);
  const name = user?.firstName?.trim() || 'Doctor';

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <h1 className="text-xl font-semibold text-gray-900">
        Dr. {name}
        <span className="block text-sm font-normal text-gray-500 mt-0.5">
          Your schedule, patients you treat, and visit documentation
        </span>
      </h1>
    </header>
  );
}
