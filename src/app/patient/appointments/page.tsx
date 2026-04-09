'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useGetMyAppointmentsQuery } from '@/features/appointments/appointmentsApiSlice';
import AppointmentsList from './_components/AppointmentsList';
import AppointmentsSkeleton from './_components/AppointmentsSkeleton';

export default function AppointmentsPage() {
  const {
    data: appointments,
    isLoading,
    isError,
  } = useGetMyAppointmentsQuery();

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    if (!hash.startsWith('#patient-appt-')) return;
    const el = document.querySelector(hash);
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [appointments]);

  const renderContent = () => {
    if (isLoading) {
      return <AppointmentsSkeleton />;
    }

    if (isError) {
      return (
        <div className="text-center text-red-600 text-sm">
          Failed to load appointments. Please try again later.
        </div>
      );
    }

    if (!appointments || appointments.length === 0) {
      return (
        <div className="text-center text-gray-500 text-sm space-y-3">
          <p>You have no visits on file yet.</p>
          <Link href="/patient/dashboard" className="inline-block text-blue-600 font-medium hover:underline">
            Back to home
          </Link>
        </div>
      );
    }

    return <AppointmentsList appointments={appointments} />;
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Your visits</h2>
        <p className="text-gray-600 text-sm mt-1">
          See who you are scheduled with, manage upcoming visits, and review recorded treatment
          costs.
        </p>
        <Link
          href="/patient/dashboard"
          className="inline-block mt-3 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Home
        </Link>
      </div>
      {renderContent()}
    </div>
  );
}
