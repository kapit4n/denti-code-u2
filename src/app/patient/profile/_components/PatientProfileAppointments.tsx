'use client';

import Link from 'next/link';
import { useGetMyAppointmentsQuery } from '@/features/appointments/appointmentsApiSlice';
import AppointmentCard from '@/app/patient/appointments/_components/AppointmentCard';

const PREVIEW_LIMIT = 5;

export default function PatientProfileAppointments() {
  const { data: appointments, isLoading, isError } = useGetMyAppointmentsQuery();

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading your appointments…</p>;
  }

  if (isError) {
    return <p className="text-sm text-red-600">Could not load appointments.</p>;
  }

  if (!appointments || appointments.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No appointments yet. When your clinic books a visit for you, it will appear here.
      </p>
    );
  }

  const now = new Date();
  const upcoming = appointments
    .filter((a) => new Date(a.ScheduledDateTime) >= now)
    .sort(
      (a, b) =>
        new Date(a.ScheduledDateTime).getTime() - new Date(b.ScheduledDateTime).getTime(),
    );
  const preview = upcoming.slice(0, PREVIEW_LIMIT);

  return (
    <div className="space-y-4">
      {preview.length === 0 ? (
        <p className="text-sm text-gray-500">No upcoming appointments.</p>
      ) : (
        <ul className="space-y-4">
          {preview.map((appt) => (
            <li key={appt.AppointmentID} className="space-y-2">
              <AppointmentCard appointment={appt} patientActions />
              <Link
                href={`/patient/appointments#patient-appt-${appt.AppointmentID}`}
                className="inline-block text-xs font-medium text-blue-600 hover:text-blue-800"
              >
                Open on full appointments page →
              </Link>
            </li>
          ))}
        </ul>
      )}
      <div className="flex flex-wrap gap-3 pt-1">
        <Link
          href="/patient/appointments"
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          View all appointments →
        </Link>
      </div>
    </div>
  );
}
