'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useGetMyAppointmentsQuery } from '@/features/appointments/appointmentsApiSlice';
import { useGetDoctorsQuery } from '@/features/doctors/doctorsApiSlice';
import { useGetMyProfileQuery } from '@/features/patients/patientsApiSlice';
import AppointmentCard from '@/app/patient/appointments/_components/AppointmentCard';
import PatientInfoSummary from '@/app/patient/_components/PatientInfoSummary';
import { sumRecordedTreatmentTotal } from '@/lib/patient/appointmentCost';

const UPCOMING_PREVIEW = 4;

export default function PatientDashboardPage() {
  const { data: profile, isLoading: profileLoading, isError: profileError } = useGetMyProfileQuery();
  const { data: appointments = [], isLoading: apptLoading, isError: apptError } =
    useGetMyAppointmentsQuery();
  const { data: doctors = [] } = useGetDoctorsQuery();

  const doctorById = useMemo(() => {
    const m = new Map<number, string>();
    for (const d of doctors) {
      m.set(d.DoctorID, `Dr. ${d.FirstName} ${d.LastName}`);
    }
    return m;
  }, [doctors]);

  const upcoming = useMemo(() => {
    const n = new Date();
    return appointments
      .filter((a) => new Date(a.ScheduledDateTime) >= n)
      .sort(
        (a, b) =>
          new Date(a.ScheduledDateTime).getTime() - new Date(b.ScheduledDateTime).getTime(),
      );
  }, [appointments]);

  const upcomingPreview = upcoming.slice(0, UPCOMING_PREVIEW);

  const recordedTotalsUpcoming = useMemo(
    () => upcomingPreview.reduce((s, a) => s + sumRecordedTreatmentTotal(a), 0),
    [upcomingPreview],
  );

  const loading = profileLoading || apptLoading;

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Home</h2>
        <p className="text-gray-600 text-sm mt-1">
          What matters for your care: who you are on file, who is seeing you next, and what has been
          billed to the visit so far.
        </p>
      </div>

      {loading && (
        <p className="text-gray-500 text-sm">Loading your overview…</p>
      )}

      {!loading && profileError && (
        <p className="text-red-600 text-sm">We could not load your profile.</p>
      )}

      {!loading && !profileError && profile && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <PatientInfoSummary profile={profile} />

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming visits</h2>
              <Link
                href="/patient/appointments"
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                All visits →
              </Link>
            </div>

            {apptError && (
              <p className="text-sm text-red-600">Appointments could not be loaded.</p>
            )}

            {!apptError && upcomingPreview.length === 0 && (
              <p className="text-sm text-gray-500">
                No upcoming visits. When the clinic schedules you, they will show here with your
                dentist and any recorded costs after treatment.
              </p>
            )}

            {!apptError && upcomingPreview.length > 0 && (
              <ul className="space-y-3">
                {upcomingPreview.map((appt) => (
                  <li key={appt.AppointmentID}>
                    <AppointmentCard
                      appointment={appt}
                      patientActions
                      compact
                      doctorLabel={
                        doctorById.get(appt.PrimaryDoctorID) ??
                        `Primary dentist (clinic ID ${appt.PrimaryDoctorID})`
                      }
                      showCost
                    />
                  </li>
                ))}
              </ul>
            )}

            {!apptError && recordedTotalsUpcoming > 0 && (
              <p className="text-xs text-gray-500 mt-3 border-t border-gray-100 pt-3">
                Subtotals above are from treatments already posted to those visits. Final statements
                may come from the front desk.
              </p>
            )}
          </div>
        </div>
      )}

      <section className="border-t border-gray-200 pt-6">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
          Quick links
        </h3>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/patient/appointments"
            className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Full visit list &amp; history
          </Link>
          <Link
            href="/patient/profile"
            className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Update contact &amp; health notes
          </Link>
        </div>
      </section>
    </div>
  );
}
