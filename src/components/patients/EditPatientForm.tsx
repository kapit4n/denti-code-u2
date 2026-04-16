'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { useUpdatePatientMutation } from '@/features/patients/patientsApiSlice';
import { useTranslation } from '@/i18n/I18nContext';
import type { PatientProfile, StaffPatientUpdateBody } from '@/types';

type FormState = {
  FirstName: string;
  LastName: string;
  DateOfBirth: string;
  Gender: string;
  Address: string;
  ContactPhone: string;
  Email: string;
  MedicalHistorySummary: string;
};

function patientToForm(p: PatientProfile): FormState {
  const dob = p.DateOfBirth || '';
  return {
    FirstName: p.FirstName ?? '',
    LastName: p.LastName ?? '',
    DateOfBirth: dob.length >= 10 ? dob.slice(0, 10) : dob,
    Gender: p.Gender ?? '',
    Address: p.Address ?? '',
    ContactPhone: p.ContactPhone ?? '',
    Email: p.Email ?? '',
    MedicalHistorySummary: p.MedicalHistorySummary ?? '',
  };
}

function formatPutError(err: unknown, fallback: string): string {
  if (!err || typeof err !== 'object') return fallback;
  const data = (err as { data?: unknown }).data;
  if (data && typeof data === 'object') {
    const d = data as { message?: string };
    if (d.message && typeof d.message === 'string') return d.message;
  }
  return fallback;
}

type Props = {
  patient: PatientProfile;
  variant: 'admin' | 'doctor';
  className?: string;
};

export default function EditPatientForm({ patient, variant, className = '' }: Props) {
  const { t } = useTranslation();
  const [form, setForm] = useState<FormState>(() => patientToForm(patient));
  const [formError, setFormError] = useState('');
  const [savedFlash, setSavedFlash] = useState(false);
  const [updatePatient, { isLoading }] = useUpdatePatientMutation();
  const hashHandledRef = useRef(false);

  useEffect(() => {
    setForm(patientToForm(patient));
    setFormError('');
    setSavedFlash(false);
    hashHandledRef.current = false;
  }, [patient]);

  useEffect(() => {
    if (hashHandledRef.current) return;
    if (typeof window === 'undefined') return;
    if (window.location.hash !== '#patient-edit') return;
    hashHandledRef.current = true;
    requestAnimationFrame(() => {
      document.getElementById('patient-edit')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [patient.PatientID]);

  const intro =
    variant === 'admin' ? t('editPatient.introAdmin') : t('editPatient.introDoctor');

  const summary = `${patient.FirstName} ${patient.LastName}`.trim();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormError('');
    setSavedFlash(false);
  };

  const handleCancel = () => {
    setForm(patientToForm(patient));
    setFormError('');
    setSavedFlash(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSavedFlash(false);
    const body: StaffPatientUpdateBody = {
      FirstName: form.FirstName.trim(),
      LastName: form.LastName.trim(),
      DateOfBirth: form.DateOfBirth.trim(),
      ContactPhone: form.ContactPhone.trim(),
      Email: form.Email.trim() ? form.Email.trim() : null,
      Gender: form.Gender.trim() || null,
      Address: form.Address.trim() || null,
      MedicalHistorySummary: form.MedicalHistorySummary.trim() || null,
    };
    try {
      await updatePatient({ id: patient.PatientID, body }).unwrap();
      setSavedFlash(true);
    } catch (err) {
      setFormError(formatPutError(err, t('editPatient.errGeneric')));
    }
  };

  return (
    <div
      id="patient-edit"
      className={`bg-white rounded-xl border border-gray-200 shadow-sm scroll-mt-4 ${className}`}
    >
      <div className="px-5 pt-5 pb-3 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">{t('editPatient.title')}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{summary}</p>
        <p className="text-sm text-gray-600 mt-2">{intro}</p>
      </div>

      <div className="p-5">
        {savedFlash ? (
          <p className="text-sm text-green-800 font-medium mb-4">{t('editPatient.saved')}</p>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="ep-fn">
                {t('registerPatient.firstName')}
              </label>
              <input
                id="ep-fn"
                name="FirstName"
                required
                value={form.FirstName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="ep-ln">
                {t('registerPatient.lastName')}
              </label>
              <input
                id="ep-ln"
                name="LastName"
                required
                value={form.LastName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="ep-dob">
                {t('registerPatient.dob')}
              </label>
              <input
                id="ep-dob"
                name="DateOfBirth"
                type="date"
                required
                value={form.DateOfBirth}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="ep-phone">
                {t('registerPatient.phone')}
              </label>
              <input
                id="ep-phone"
                name="ContactPhone"
                type="tel"
                required
                placeholder={t('registerPatient.phonePlaceholder')}
                value={form.ContactPhone}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700" htmlFor="ep-email">
                {t('registerPatient.email')}
              </label>
              <input
                id="ep-email"
                name="Email"
                type="email"
                value={form.Email}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="ep-gender">
                {t('registerPatient.gender')}
              </label>
              <input
                id="ep-gender"
                name="Gender"
                value={form.Gender}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700" htmlFor="ep-addr">
                {t('registerPatient.address')}
              </label>
              <input
                id="ep-addr"
                name="Address"
                value={form.Address}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700" htmlFor="ep-notes">
                {t('registerPatient.notes')}
              </label>
              <textarea
                id="ep-notes"
                name="MedicalHistorySummary"
                rows={3}
                value={form.MedicalHistorySummary}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
              />
            </div>
          </div>

          {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-lg bg-blue-600 text-white font-semibold py-2 px-4 hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? t('editPatient.saving') : t('editPatient.save')}
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={handleCancel}
              className="rounded-lg border border-gray-300 bg-white text-gray-800 font-medium py-2 px-4 hover:bg-gray-50 disabled:opacity-50"
            >
              {t('editPatient.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
