'use client';

import { useState, FormEvent } from 'react';
import type { PatientProfile } from '@/types';
import { useUpdateMyProfileMutation } from '@/features/patients/patientsApiSlice';
import { useTranslation } from '@/i18n/I18nContext';

interface ProfileFormProps {
  profile: PatientProfile;
  onSaveSuccess: () => void;
  onCancel: () => void;
}

export default function ProfileForm({ profile, onSaveSuccess, onCancel }: ProfileFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Partial<PatientProfile>>(profile);
  const [updateProfile, { isLoading, error }] = useUpdateMyProfileMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData).unwrap();
      onSaveSuccess();
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('patientPortal.profileForm.title')}</h3>
      <p className="text-sm text-gray-500 mb-4">{t('patientPortal.profileForm.intro')}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('patientPortal.profileForm.firstName')}
          </label>
          <input
            type="text"
            name="FirstName"
            value={formData.FirstName || ''}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('patientPortal.profileForm.lastName')}
          </label>
          <input
            type="text"
            name="LastName"
            value={formData.LastName || ''}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t('patientPortal.profileForm.contactPhone')}
          </label>
          <input
            type="tel"
            name="ContactPhone"
            value={formData.ContactPhone || ''}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            {t('patientPortal.profileForm.address')}
          </label>
          <input
            type="text"
            name="Address"
            value={formData.Address || ''}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">
            {t('patientPortal.profileForm.healthNotes')}
          </label>
          <textarea
            name="MedicalHistorySummary"
            value={formData.MedicalHistorySummary || ''}
            onChange={handleChange}
            rows={4}
            placeholder={t('patientPortal.profileForm.healthPlaceholder')}
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      {error && (
        <p className="text-red-600 text-sm mt-4">{t('patientPortal.profileForm.saveError')}</p>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="py-2 px-4 rounded-lg border border-gray-300 text-gray-800 font-medium hover:bg-gray-50"
        >
          {t('patientPortal.profileForm.cancel')}
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="py-2 px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? t('patientPortal.profileForm.saving') : t('patientPortal.profileForm.save')}
        </button>
      </div>
    </form>
  );
}
