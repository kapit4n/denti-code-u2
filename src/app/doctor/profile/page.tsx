'use client';

import Link from 'next/link';
import { useAppSelector } from '@/lib/redux/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';

export default function DoctorProfilePage() {
  const user = useAppSelector(selectCurrentUser);

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <Link href="/doctor/dashboard" className="text-sm font-medium text-blue-600 hover:underline">
          ← Home
        </Link>
        <h2 className="text-2xl font-bold text-gray-900 mt-2">Your account</h2>
        <p className="text-sm text-gray-600 mt-1">
          Login identity for the portal. Clinical scheduling and patients use your clinic doctor
          record (matched by email). Open this page from the avatar in the header.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4 text-sm">
        <div>
          <p className="font-semibold text-gray-900 text-lg">
            {user?.firstName || user?.lastName
              ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
              : '—'}
          </p>
          <p className="text-gray-500 mt-1">{user?.email ?? '—'}</p>
        </div>
        <dl className="space-y-3">
          <div>
            <dt className="text-gray-500">User ID</dt>
            <dd className="font-mono text-gray-900 mt-0.5 break-all">{user?.id ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Roles</dt>
            <dd className="text-gray-900 mt-0.5">
              {user?.roles?.length ? user.roles.join(', ') : '—'}
            </dd>
          </div>
        </dl>
        <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-2">
          <Link
            href="/doctor/appointments"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Visits
          </Link>
          <span className="text-gray-300">·</span>
          <Link
            href="/doctor/calendar"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Calendar
          </Link>
          <span className="text-gray-300">·</span>
          <Link
            href="/doctor/patients"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Patients
          </Link>
        </div>
      </div>
    </div>
  );
}
