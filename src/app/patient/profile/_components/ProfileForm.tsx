'use client';

import { useState, FormEvent } from 'react';
import { PatientProfile } from '@/types';
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData).unwrap();
      onSaveSuccess();
    } catch (err) {
      console.error('Failed to update profile:', err);
      // Error message will be displayed via the 'error' object from the hook
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3 className="text-xl font-semibold text-gray-700 mb-4">Edit Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <input type="text" name="FirstName" value={formData.FirstName || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name</label>
          <input type="text" name="LastName" value={formData.LastName || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Contact Phone</label>
          <input type="tel" name="ContactPhone" value={formData.ContactPhone || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <input type="text" name="Address" value={formData.Address || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Medical History Summary</label>
          <textarea name="MedicalHistorySummary" value={formData.MedicalHistorySummary || ''} onChange={handleChange} rows={4} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
        </div>
      </div>
      {error && <p className="text-red-500 text-sm mt-4">Failed to save profile. Please try again.</p>}
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded hover:bg-gray-300">
          Cancel
        </button>
        <button type="submit" disabled={isLoading} className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 disabled:bg-blue-300">
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
