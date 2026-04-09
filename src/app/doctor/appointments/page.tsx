'use client';

import { useMemo, useState } from 'react';
import { useAppSelector } from '@/lib/redux/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { useGetAppointmentsQuery } from '@/features/appointments/appointmentsApiSlice';
import { useGetDoctorsQuery } from '@/features/doctors/doctorsApiSlice';
import { useGetPatientsQuery } from '@/features/patients/patientsApiSlice';
import Link from 'next/link';
import type { PatientProfile } from '@/types';
import DoctorAppointmentsList from './_components/DoctorAppointmentsList';
import CreateAppointmentModal from './_components/CreateAppointmentModal';

export default function DoctorAppointmentsPage() {
  const user = useAppSelector(selectCurrentUser);
  const [showCreate, setShowCreate] = useState(false);

  const { data: doctors = [], isLoading: doctorsLoading, isError: doctorsError } =
    useGetDoctorsQuery();
  const { data: appointments = [], isLoading: apptsLoading, isError: apptsError } =
    useGetAppointmentsQuery();
  const { data: patientsRaw = [], isLoading: patientsLoading } = useGetPatientsQuery();

  const patients = useMemo((): PatientProfile[] => {
    return (patientsRaw as PatientProfile[]).filter(
      (p) => p && typeof p.PatientID === 'number',
    );
  }, [patientsRaw]);

  const clinicDoctor = useMemo(() => {
    if (!user?.email) return undefined;
    return doctors.find((d) => d.Email.toLowerCase() === user.email.toLowerCase());
  }, [doctors, user?.email]);

  const doctorAppointments = useMemo(() => {
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

  const loading = doctorsLoading || apptsLoading || patientsLoading;

  if (loading) {
    return (
      <div className="max-w-4xl">
        <h2 className="text-2xl font-bold text-gray-900">Visits</h2>
        <p className="text-gray-500 text-sm mt-4">Loading…</p>
      </div>
    );
  }

  if (doctorsError || apptsError) {
    return (
      <div className="max-w-4xl">
        <h2 className="text-2xl font-bold text-gray-900">Visits</h2>
        <p className="text-red-600 text-sm mt-4">Could not load data. Try again.</p>
      </div>
    );
  }

  if (!clinicDoctor) {
    return (
      <div className="max-w-4xl space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Visits</h2>
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-900 text-sm">
          <p className="font-medium">No clinic profile for this login</p>
          <p className="mt-1 text-amber-800/90">
            Use a doctor email registered in the clinic service (see README seed users).
          </p>
        </div>
        <Link href="/doctor/dashboard" className="text-sm font-medium text-blue-600 hover:underline">
          ← Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Visits</h2>
          <p className="text-sm text-gray-600 mt-1">
            {doctorAppointments.length} as your primary visits ·{' '}
            <span className="text-gray-500">
              Dr. {clinicDoctor.FirstName} {clinicDoctor.LastName}
            </span>
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm font-medium">
            <Link href="/doctor/dashboard" className="text-blue-600 hover:text-blue-800">
              ← Home
            </Link>
            <Link href="/doctor/calendar" className="text-blue-600 hover:text-blue-800">
              Week / day calendar →
            </Link>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 px-4 rounded-lg shrink-0"
        >
          New visit
        </button>
      </div>

      <DoctorAppointmentsList appointments={doctorAppointments} patientById={patientById} />

      <CreateAppointmentModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        doctorId={clinicDoctor.DoctorID}
        patients={patients}
      />
    </div>
  );
}
