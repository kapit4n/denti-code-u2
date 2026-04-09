'use client';

import { useState, FormEvent } from 'react';
import type { PatientProfile } from '@/types';
import { useUpdateMyProfileMutation } from '@/features/patients/patientsApiSlice';

interface ProfileFormProps {
  profile: PatientProfile;
  onSaveSuccess: () => void;
  onCancel: () => void;
}

export default function ProfileForm({ profile, onSaveSuccess, onCancel }: ProfileFormProps) {
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
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit your details</h3>
      <p className="text-sm text-gray-500 mb-4">
        Update what the front desk and clinical team should use to reach you and document your care.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">First name</label>
          <input
            type="text"
            name="FirstName"
            value={formData.FirstName || ''}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Last name</label>
          <input
            type="text"
            name="LastName"
            value={formData.LastName || ''}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Contact phone</label>
          <input
            type="tel"
            name="ContactPhone"
            value={formData.ContactPhone || ''}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Address</label>
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
            Health notes for your care team
          </label>
          <textarea
            name="MedicalHistorySummary"
            value={formData.MedicalHistorySummary || ''}
            onChange={handleChange}
            rows={4}
            placeholder="Allergies, medications, conditions…"
            className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      {error && (
        <p className="text-red-600 text-sm mt-4">Failed to save. Please try again.</p>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="py-2 px-4 rounded-lg border border-gray-300 text-gray-800 font-medium hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="py-2 px-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  );
}
