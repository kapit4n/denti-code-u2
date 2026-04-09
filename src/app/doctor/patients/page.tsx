'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useAppSelector } from '@/lib/redux/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { useGetAppointmentsQuery } from '@/features/appointments/appointmentsApiSlice';
import { useGetDoctorsQuery } from '@/features/doctors/doctorsApiSlice';
import { useGetPatientsQuery } from '@/features/patients/patientsApiSlice';
import type { PatientProfile } from '@/types';

type TreatedPatient = {
  patientId: number;
  profile: PatientProfile | undefined;
  appointmentCount: number;
  lastVisit: Date | null;
};

export default function DoctorPatientsPage() {
  const user = useAppSelector(selectCurrentUser);
  const { data: doctors = [], isLoading: doctorsLoading } = useGetDoctorsQuery();
  const { data: appointments = [], isLoading: apptsLoading } = useGetAppointmentsQuery();
  const { data: patients = [], isLoading: patientsLoading } = useGetPatientsQuery();

  const clinicDoctor = useMemo(() => {
    if (!user?.email) return undefined;
    return doctors.find((d) => d.Email.toLowerCase() === user.email.toLowerCase());
  }, [doctors, user?.email]);

  const myAppointments = useMemo(() => {
    if (!clinicDoctor) return [];
    return appointments.filter((a) => a.PrimaryDoctorID === clinicDoctor.DoctorID);
  }, [appointments, clinicDoctor]);

  const treatedPatients = useMemo((): TreatedPatient[] => {
    const byPatient = new Map<
      number,
      { count: number; last: Date | null }
    >();
    for (const a of myAppointments) {
      const cur = byPatient.get(a.PatientID) ?? { count: 0, last: null };
      cur.count += 1;
      const d = new Date(a.ScheduledDateTime);
      if (!cur.last || d > cur.last) cur.last = d;
      byPatient.set(a.PatientID, cur);
    }

    const patientById = new Map(patients.map((p) => [p.PatientID, p]));

    return Array.from(byPatient.entries())
      .map(([patientId, { count, last }]) => ({
        patientId,
        profile: patientById.get(patientId),
        appointmentCount: count,
        lastVisit: last,
      }))
      .sort((a, b) => {
        const na = a.profile
          ? `${a.profile.LastName} ${a.profile.FirstName}`
          : String(a.patientId);
        const nb = b.profile
          ? `${b.profile.LastName} ${b.profile.FirstName}`
          : String(b.patientId);
        return na.localeCompare(nb, undefined, { sensitivity: 'base' });
      });
  }, [myAppointments, patients]);

  const loading = doctorsLoading || apptsLoading || patientsLoading;

  if (loading) {
    return (
      <div>
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Patients</h2>
        <p className="text-gray-500">Loading…</p>
      </div>
    );
  }

  if (!clinicDoctor) {
    return (
      <div>
        <h2 className="text-3xl font-bold mb-6 text-gray-800">Patients</h2>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-900 text-sm">
          No clinic doctor profile matches your login. Use a seeded doctor account to view patients
          you have treated.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-2 text-gray-800">Patients you treat</h2>
      <p className="text-gray-600 text-sm mb-6">
        Patients with at least one appointment where you are the primary doctor. Open a row for
        profile details and full appointment history with you.
      </p>

      {treatedPatients.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500">
          No patients yet. Create an appointment from the Appointments page to link a patient to
          your practice.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-medium">Patient</th>
                <th className="px-4 py-3 font-medium">Patient ID</th>
                <th className="px-4 py-3 font-medium text-right">Appointments with you</th>
                <th className="px-4 py-3 font-medium">Last visit</th>
                <th className="px-4 py-3 w-40" />
              </tr>
            </thead>
            <tbody>
              {treatedPatients.map((row) => (
                <tr key={row.patientId} className="border-b border-gray-100 hover:bg-gray-50/80">
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900">
                      {row.profile
                        ? `${row.profile.FirstName} ${row.profile.LastName}`
                        : `Unknown patient`}
                    </span>
                    {row.profile?.Email ? (
                      <div className="text-xs text-gray-500">{row.profile.Email}</div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-gray-600 tabular-nums">{row.patientId}</td>
                  <td className="px-4 py-3 text-right tabular-nums font-medium">
                    {row.appointmentCount}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {row.lastVisit
                      ? row.lastVisit.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/doctor/patients/${row.patientId}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      View details →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
