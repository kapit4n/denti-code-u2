'use client';

import { useMemo, useState } from 'react';
import { useAppSelector } from '@/lib/redux/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { useGetAppointmentsQuery } from '@/features/appointments/appointmentsApiSlice';
import { useGetDoctorsQuery } from '@/features/doctors/doctorsApiSlice';
import { useGetPatientsQuery } from '@/features/patients/patientsApiSlice';
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
    return doctors.find(
      (d) => d.Email.toLowerCase() === user.email.toLowerCase(),
    );
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
      <div>
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Appointments</h2>
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  if (doctorsError || apptsError) {
    return (
      <div>
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Appointments</h2>
        <p className="text-red-600">Failed to load data. Please try again.</p>
      </div>
    );
  }

  if (!clinicDoctor) {
    return (
      <div>
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Appointments</h2>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-900">
          <p className="font-medium">No clinic profile for this account</p>
          <p className="text-sm mt-1">
            Your login email must match a doctor record in the clinic service (e.g. seeded
            doctors <code className="text-xs bg-amber-100 px-1 rounded">susan.storm@denti-code.com</code> or{' '}
            <code className="text-xs bg-amber-100 px-1 rounded">peter.parker@denti-code.com</code>).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-3xl font-bold text-gray-800">My appointments</h2>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg"
        >
          New appointment
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-6">
        Signed in as Dr. {clinicDoctor.FirstName} {clinicDoctor.LastName} — showing{' '}
        {doctorAppointments.length} appointment(s) where you are the primary doctor.
      </p>
      <DoctorAppointmentsList
        appointments={doctorAppointments}
        patientById={patientById}
      />
      <CreateAppointmentModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        doctorId={clinicDoctor.DoctorID}
        patients={patients}
      />
    </div>
  );
}
