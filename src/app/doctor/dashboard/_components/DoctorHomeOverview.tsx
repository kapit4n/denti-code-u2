'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useAppSelector } from '@/lib/redux/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { useGetAppointmentsQuery } from '@/features/appointments/appointmentsApiSlice';
import { useGetDoctorsQuery } from '@/features/doctors/doctorsApiSlice';
import { useGetPatientsQuery } from '@/features/patients/patientsApiSlice';
import {
  appointmentStatusBadgeClass,
  appointmentStatusLabel,
} from '@/lib/appointments/appointmentStatus';
import type { Appointment, PatientProfile } from '@/types';

const UPCOMING_PREVIEW = 6;

function formatWhen(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function DoctorHomeOverview() {
  const user = useAppSelector(selectCurrentUser);
  const { data: doctors = [], isLoading: docLoading } = useGetDoctorsQuery();
  const { data: appointments = [], isLoading: apptLoading } = useGetAppointmentsQuery();
  const { data: patientsRaw = [] } = useGetPatientsQuery();

  const patients = useMemo((): PatientProfile[] => {
    return (patientsRaw as PatientProfile[]).filter(
      (p) => p && typeof p.PatientID === 'number',
    );
  }, [patientsRaw]);

  const clinicDoctor = useMemo(() => {
    if (!user?.email) return undefined;
    return doctors.find((d) => d.Email.toLowerCase() === user.email.toLowerCase());
  }, [doctors, user?.email]);

  const myAppointments = useMemo(() => {
    if (!clinicDoctor) return [];
    return appointments.filter((a) => a.PrimaryDoctorID === clinicDoctor.DoctorID);
  }, [appointments, clinicDoctor]);

  const patientById = useMemo(() => {
    const m = new Map<number, PatientProfile>();
    for (const p of patients) {
      m.set(p.PatientID, p);
    }
    return m;
  }, [patients]);

  const upcoming = useMemo(() => {
    const n = new Date();
    return myAppointments
      .filter((a) => new Date(a.ScheduledDateTime) >= n)
      .sort(
        (a, b) =>
          new Date(a.ScheduledDateTime).getTime() - new Date(b.ScheduledDateTime).getTime(),
      )
      .slice(0, UPCOMING_PREVIEW);
  }, [myAppointments]);

  const loading = docLoading || apptLoading;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Home</h2>
        <p className="text-sm text-gray-600 mt-1 max-w-2xl">
          Next on your calendar, quick navigation, and practice metrics below for the period you
          select.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/doctor/appointments"
          className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
        >
          Visits &amp; new booking
        </Link>
        <Link
          href="/doctor/patients"
          className="inline-flex items-center rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
        >
          Patients you treat
        </Link>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading schedule…</p>}

      {!loading && !clinicDoctor && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          Your login email must match a doctor in the clinic directory to see your schedule and
          metrics. Use a seeded doctor account from the project README.
        </p>
      )}

      {!loading && clinicDoctor && (
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex flex-wrap justify-between items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900">Next on your calendar</h3>
            <Link
              href="/doctor/appointments"
              className="text-xs font-medium text-blue-600 hover:text-blue-800"
            >
              All visits →
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">No upcoming visits as primary doctor.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {upcoming.map((a: Appointment) => {
                const p = patientById.get(a.PatientID);
                const label = p ? `${p.FirstName} ${p.LastName}` : `Patient #${a.PatientID}`;
                return (
                  <li
                    key={a.AppointmentID}
                    className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 hover:bg-gray-50/80"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900">{label}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {a.AppointmentPurpose || 'Visit'}
                      </p>
                      <span className={`mt-1 ${appointmentStatusBadgeClass(a.Status)}`}>
                        {appointmentStatusLabel(a.Status)}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium text-gray-800">
                        {formatWhen(a.ScheduledDateTime)}
                      </p>
                      <Link
                        href={`/doctor/appointments/${a.AppointmentID}`}
                        className="text-xs font-medium text-blue-600 hover:text-blue-800 mt-1 inline-block"
                      >
                        Open visit →
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
