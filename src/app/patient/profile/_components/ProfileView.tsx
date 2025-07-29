import { PatientProfile } from '@/types';

interface ProfileViewProps {
  profile: PatientProfile;
  onEdit: () => void;
}

const ProfileField = ({ label, value }: { label: string; value: string | undefined }) => (
  <div>
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-md text-gray-900">{value || 'Not provided'}</dd>
  </div>
);

export default function ProfileView({ profile, onEdit }: ProfileViewProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-700">Personal Information</h3>
        <button
          onClick={onEdit}
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600 transition-colors"
        >
          Edit Profile
        </button>
      </div>
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
        <ProfileField label="First Name" value={profile.FirstName} />
        <ProfileField label="Last Name" value={profile.LastName} />
        <ProfileField label="Email Address" value={profile.Email} />
        <ProfileField label="Contact Phone" value={profile.ContactPhone} />
        <ProfileField label="Date of Birth" value={profile.DateOfBirth} />
        <ProfileField label="Gender" value={profile.Gender} />
        <div className="md:col-span-2">
          <ProfileField label="Address" value={profile.Address} />
        </div>
        <div className="md:col-span-2">
          <dt className="text-sm font-medium text-gray-500">Medical History Summary</dt>
          <dd className="mt-1 text-md text-gray-900 whitespace-pre-wrap">
            {profile.MedicalHistorySummary || 'No summary provided.'}
          </dd>
        </div>
      </dl>
    </div>
  );
}
