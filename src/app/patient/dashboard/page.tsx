'use client';

import { useAppSelector } from '@/lib/redux/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import Link from 'next/link';

export default function PatientDashboardPage() {
  const user = useAppSelector(selectCurrentUser);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Welcome back, {user?.firstName || 'Patient'}!
      </h2>

      {/* Upcoming Appointment Card */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-3">Appointments</h3>
        <p className="text-gray-500">
          Live appointment data is temporarily unavailable. You can still access your appointments page once the service is back online.
        </p>
        <Link
          href="/patient/appointments"
          className="inline-block mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Go to Appointments
        </Link>
      </div>

      {/* Other sections can go here */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Action Required</h3>
          <p className="text-gray-500">You are due for a routine check-up. Please call our office to schedule.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Your Profile</h3>
          <p className="text-gray-500">Keep your contact and medical information up to date.</p>
          <Link href="/patient/profile" className="inline-block mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded">
            Go to Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
