'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useGetPatientByIdQuery } from '@/features/patients/patientsApiSlice';
import EditPatientForm from '@/components/patients/EditPatientForm';
import { useTranslation } from '@/i18n/I18nContext';

export default function AdminPatientEditPage() {
  const { t } = useTranslation();
  const params = useParams();
  const rawId = params?.patientId;
  const patientId =
    typeof rawId === 'string' ? Number.parseInt(rawId, 10) : Number.NaN;
  const validId = Number.isFinite(patientId) && patientId > 0;

  const { data: patient, isLoading, isError } = useGetPatientByIdQuery(patientId, {
    skip: !validId,
  });

  if (!validId) {
    return (
      <div className="max-w-3xl space-y-4">
        <Link href="/admin/patients" className="text-sm font-medium text-blue-600 hover:underline">
          {t('adminPatients.backList')}
        </Link>
        <p className="text-red-600 text-sm">{t('editPatient.invalidId')}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-4">
        <Link href="/admin/patients" className="text-sm font-medium text-blue-600 hover:underline">
          {t('adminPatients.backList')}
        </Link>
        <p className="text-gray-500 text-sm">{t('common.loading')}</p>
      </div>
    );
  }

  if (isError || !patient) {
    return (
      <div className="max-w-3xl space-y-4">
        <Link href="/admin/patients" className="text-sm font-medium text-blue-600 hover:underline">
          {t('adminPatients.backList')}
        </Link>
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          {t('editPatient.loadError')}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link href="/admin/patients" className="text-sm font-medium text-blue-600 hover:underline">
          {t('adminPatients.backList')}
        </Link>
        <h2 className="text-2xl font-bold text-gray-900 mt-2">
          {patient.FirstName} {patient.LastName}
        </h2>
        <p className="text-gray-500 text-xs mt-1 tabular-nums">
          {t('editPatient.idLabel', { id: patient.PatientID })}
        </p>
      </div>

      <EditPatientForm patient={patient} variant="admin" />
    </div>
  );
}
