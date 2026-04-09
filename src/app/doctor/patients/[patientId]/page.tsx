'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAppSelector } from '@/lib/redux/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { useGetAppointmentsQuery } from '@/features/appointments/appointmentsApiSlice';
import { useGetDoctorsQuery } from '@/features/doctors/doctorsApiSlice';
import { useGetPatientByIdQuery } from '@/features/patients/patientsApiSlice';
import {
  appointmentStatusBadgeClass,
  appointmentStatusLabel,
} from '@/lib/appointments/appointmentStatus';

export default function DoctorPatientDetailPage() {
  const params = useParams();
  const rawId = params?.patientId;
  const patientId =
    typeof rawId === 'string' ? Number.parseInt(rawId, 10) : Number.NaN;
  const validId = Number.isFinite(patientId) && patientId > 0;

  const user = useAppSelector(selectCurrentUser);
  const { data: doctors = [], isLoading: doctorsLoading } = useGetDoctorsQuery();
  const { data: appointments = [], isLoading: apptsLoading } = useGetAppointmentsQuery();

  const clinicDoctor = useMemo(() => {
    if (!user?.email) return undefined;
    return doctors.find((d) => d.Email.toLowerCase() === user.email.toLowerCase());
  }, [doctors, user?.email]);

  const myAppointments = useMemo(() => {
    if (!clinicDoctor) return [];
    return appointments.filter((a) => a.PrimaryDoctorID === clinicDoctor.DoctorID);
  }, [appointments, clinicDoctor]);

  const treatedPatientIds = useMemo(() => {
    return new Set(myAppointments.map((a) => a.PatientID));
  }, [myAppointments]);

  const hasAccess = validId && treatedPatientIds.has(patientId);

  const {
    data: patient,
    isLoading: patientLoading,
    isError: patientError,
  } = useGetPatientByIdQuery(patientId, { skip: !hasAccess });

  const patientAppointments = useMemo(() => {
    if (!validId || !clinicDoctor) return [];
    return myAppointments
      .filter((a) => a.PatientID === patientId)
      .sort(
        (a, b) =>
          new Date(b.ScheduledDateTime).getTime() -
          new Date(a.ScheduledDateTime).getTime(),
      );
  }, [myAppointments, patientId, validId, clinicDoctor]);

  const loading = doctorsLoading || apptsLoading || (hasAccess && patientLoading);

  if (!validId) {
    return (
      <div className="space-y-4">
        <Link href="/doctor/patients" className="text-blue-600 hover:underline text-sm">
          ← Patients
        </Link>
        <p className="text-red-600">Invalid patient.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <Link href="/doctor/patients" className="text-blue-600 hover:underline text-sm">
          ← Patients
        </Link>
        <p className="mt-4 text-gray-500">Loading…</p>
      </div>
    );
  }

  if (!clinicDoctor) {
    return (
      <div>
        <Link href="/doctor/patients" className="text-blue-600 hover:underline text-sm">
          ← Patients
        </Link>
        <p className="mt-4 text-amber-800">No clinic doctor profile for your account.</p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div>
        <Link href="/doctor/patients" className="text-blue-600 hover:underline text-sm">
          ← Patients
        </Link>
        <p className="mt-4 text-amber-800">
          You do not have any appointments with this patient as their primary doctor.
        </p>
      </div>
    );
  }

  const profileUnavailable = hasAccess && (patientError || !patient);

  return (
    <div className="space-y-8">
      <div>
        <Link href="/doctor/patients" className="text-blue-600 hover:underline text-sm">
          ← Patients
        </Link>
        <h2 className="text-3xl font-bold text-gray-900 mt-2">
          {patient
            ? `${patient.FirstName} ${patient.LastName}`
            : `Patient #${patientId}`}
        </h2>
        <p className="text-gray-500 text-sm">Patient ID {patientId}</p>
      </div>

      {profileUnavailable ? (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-900 text-sm">
          Patient profile could not be loaded (record may be missing in the patients service).
          Appointment history with you is still shown below.
        </div>
      ) : patient ? (
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Profile</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Date of birth</dt>
              <dd className="font-medium text-gray-900">{patient.DateOfBirth}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Gender</dt>
              <dd className="font-medium text-gray-900">{patient.Gender || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Email</dt>
              <dd className="font-medium text-gray-900">{patient.Email || '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Phone</dt>
              <dd className="font-medium text-gray-900">{patient.ContactPhone}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-gray-500">Address</dt>
              <dd className="font-medium text-gray-900">{patient.Address || '—'}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-gray-500">Medical history summary</dt>
              <dd className="text-gray-800">{patient.MedicalHistorySummary || '—'}</dd>
            </div>
          </dl>
        </section>
      ) : null}

      <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">
            Appointments with you ({patientAppointments.length})
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Only visits where you are listed as primary doctor.
          </p>
        </div>
        {patientAppointments.length === 0 ? (
          <p className="p-6 text-gray-500 text-sm">No appointments found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 font-medium">When</th>
                  <th className="px-4 py-3 font-medium">Purpose</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 w-44" />
                </tr>
              </thead>
              <tbody>
                {patientAppointments.map((a) => {
                  const when = new Date(a.ScheduledDateTime);
                  return (
                    <tr key={a.AppointmentID} className="border-b border-gray-100">
                      <td className="px-4 py-3 text-gray-800">
                        {when.toLocaleString('en-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {a.AppointmentPurpose || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={appointmentStatusBadgeClass(a.Status)}>
                          {appointmentStatusLabel(a.Status)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/doctor/appointments/${a.AppointmentID}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Treatments & costs
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
