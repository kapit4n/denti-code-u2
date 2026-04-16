'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useCreatePatientMutation } from '@/features/patients/patientsApiSlice';
import { useTranslation } from '@/i18n/I18nContext';
import type { CreatePatientInput } from '@/types';

function formatCreateError(err: unknown, fallback: string): string {
  if (!err || typeof err !== 'object') return fallback;
  const data = (err as { data?: unknown }).data;
  if (data && typeof data === 'object') {
    const d = data as { message?: string; errors?: Record<string, string>[] };
    if (d.message && typeof d.message === 'string') return d.message;
    if (Array.isArray(d.errors)) {
      const parts = d.errors.flatMap((o) => Object.values(o));
      if (parts.length) return parts.join(' ');
    }
  }
  return fallback;
}

type Props = {
  variant: 'admin' | 'doctor';
  className?: string;
};

const emptyForm: CreatePatientInput = {
  FirstName: '',
  LastName: '',
  DateOfBirth: '',
  ContactPhone: '',
  Email: '',
  Gender: '',
  Address: '',
  MedicalHistorySummary: '',
};

export default function RegisterPatientForm({ variant, className = '' }: Props) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [form, setForm] = useState<CreatePatientInput>(emptyForm);
  const [createdId, setCreatedId] = useState<number | null>(null);
  const [formError, setFormError] = useState('');
  const [createPatient, { isLoading }] = useCreatePatientMutation();

  const intro =
    variant === 'admin' ? t('registerPatient.introAdmin') : t('registerPatient.introDoctor');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setCreatedId(null);
    setFormError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setCreatedId(null);
    setFormError('');
    const body: CreatePatientInput = {
      FirstName: form.FirstName.trim(),
      LastName: form.LastName.trim(),
      DateOfBirth: form.DateOfBirth.trim(),
      ContactPhone: form.ContactPhone.trim(),
    };
    const email = form.Email?.trim();
    if (email) body.Email = email;
    const gender = form.Gender?.trim();
    if (gender) body.Gender = gender;
    const address = form.Address?.trim();
    if (address) body.Address = address;
    const notes = form.MedicalHistorySummary?.trim();
    if (notes) body.MedicalHistorySummary = notes;

    try {
      const res = await createPatient(body).unwrap();
      setCreatedId(res.patientId);
      setForm(emptyForm);
      setExpanded(false);
    } catch (err) {
      setFormError(formatCreateError(err, t('registerPatient.errGeneric')));
    }
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-label={expanded ? t('registerPatient.toggleCollapse') : t('registerPatient.toggleExpand')}
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-gray-50/90 border-b border-gray-100 transition-colors"
      >
        <div className="min-w-0">
          <span className="text-base font-semibold text-gray-900">{t('registerPatient.title')}</span>
          {!expanded ? (
            <p className="text-xs text-gray-500 mt-0.5">{t('registerPatient.collapsedHint')}</p>
          ) : null}
        </div>
        <span
          className={`shrink-0 text-gray-500 text-sm transition-transform inline-block ${
            expanded ? 'rotate-180' : ''
          }`}
          aria-hidden
        >
          ▼
        </span>
      </button>

      {!expanded && createdId !== null ? (
        <div className="px-5 pb-4 flex flex-wrap items-center gap-3 border-b border-gray-100 bg-green-50/50">
          <span className="text-sm text-green-800 font-medium">
            {t('registerPatient.success', { id: createdId })}
          </span>
          {variant === 'doctor' ? (
            <Link
              href={`/doctor/patients/${createdId}`}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              {t('registerPatient.viewChart')}
            </Link>
          ) : null}
        </div>
      ) : null}

      {expanded ? (
        <div className="p-5 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 mb-4">{intro}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="rp-fn">
              {t('registerPatient.firstName')}
            </label>
            <input
              id="rp-fn"
              name="FirstName"
              required
              autoComplete="given-name"
              value={form.FirstName}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="rp-ln">
              {t('registerPatient.lastName')}
            </label>
            <input
              id="rp-ln"
              name="LastName"
              required
              autoComplete="family-name"
              value={form.LastName}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="rp-dob">
              {t('registerPatient.dob')}
            </label>
            <input
              id="rp-dob"
              name="DateOfBirth"
              type="date"
              required
              value={form.DateOfBirth}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="rp-phone">
              {t('registerPatient.phone')}
            </label>
            <input
              id="rp-phone"
              name="ContactPhone"
              type="tel"
              required
              autoComplete="tel"
              placeholder={t('registerPatient.phonePlaceholder')}
              value={form.ContactPhone}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700" htmlFor="rp-email">
              {t('registerPatient.email')}
            </label>
            <input
              id="rp-email"
              name="Email"
              type="email"
              autoComplete="email"
              value={form.Email}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="rp-gender">
              {t('registerPatient.gender')}
            </label>
            <input
              id="rp-gender"
              name="Gender"
              value={form.Gender}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700" htmlFor="rp-addr">
              {t('registerPatient.address')}
            </label>
            <input
              id="rp-addr"
              name="Address"
              autoComplete="street-address"
              value={form.Address}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700" htmlFor="rp-notes">
              {t('registerPatient.notes')}
            </label>
            <textarea
              id="rp-notes"
              name="MedicalHistorySummary"
              rows={3}
              value={form.MedicalHistorySummary}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
            />
          </div>
        </div>

        {formError ? <p className="text-sm text-red-600">{formError}</p> : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isLoading}
            className="rounded-lg bg-blue-600 text-white font-semibold py-2 px-4 hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? t('registerPatient.saving') : t('registerPatient.submit')}
          </button>
          {createdId !== null ? (
            <span className="text-sm text-green-800 font-medium">
              {t('registerPatient.success', { id: createdId })}
            </span>
          ) : null}
          {variant === 'doctor' && createdId !== null ? (
            <Link
              href={`/doctor/patients/${createdId}`}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              {t('registerPatient.viewChart')}
            </Link>
          ) : null}
          {variant === 'admin' && createdId !== null ? (
            <Link
              href={`/admin/patients/${createdId}`}
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              {t('adminPatients.edit')}
            </Link>
          ) : null}
        </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
