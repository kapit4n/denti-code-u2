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
    const byPatient = new Map<number, { count: number; last: Date | null }>();
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
      <div className="max-w-4xl">
        <h2 className="text-2xl font-bold text-gray-900">Patients</h2>
        <p className="text-gray-500 text-sm mt-4">Loading…</p>
      </div>
    );
  }

  if (!clinicDoctor) {
    return (
      <div className="max-w-4xl space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Patients</h2>
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
          Link your login to a clinic doctor record to see patients you treat.
        </p>
        <Link href="/doctor/dashboard" className="text-sm font-medium text-blue-600 hover:underline">
          ← Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Patients you treat</h2>
        <p className="text-gray-600 text-sm mt-1">
          Everyone with at least one visit where you are the primary dentist.
        </p>
        <Link
          href="/doctor/dashboard"
          className="inline-block mt-2 text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          ← Home
        </Link>
      </div>

      {treatedPatients.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center text-gray-500 text-sm">
          No patients yet. Book a visit from{' '}
          <Link href="/doctor/appointments" className="text-blue-600 font-medium hover:underline">
            Visits
          </Link>
          .
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 font-medium">Patient</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium text-right">Visits with you</th>
                <th className="px-4 py-3 font-medium">Last seen</th>
                <th className="px-4 py-3 w-28" />
              </tr>
            </thead>
            <tbody>
              {treatedPatients.map((row) => (
                <tr key={row.patientId} className="border-b border-gray-100 hover:bg-gray-50/80">
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900">
                      {row.profile
                        ? `${row.profile.FirstName} ${row.profile.LastName}`
                        : 'Unknown name'}
                    </span>
                    {row.profile?.Email ? (
                      <div className="text-xs text-gray-500 truncate max-w-[200px]">
                        {row.profile.Email}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-gray-600 tabular-nums">
                    {row.profile?.ContactPhone || '—'}
                  </td>
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
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Open →
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
