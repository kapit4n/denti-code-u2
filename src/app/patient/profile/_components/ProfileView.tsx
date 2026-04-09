import type { PatientProfile } from '@/types';

interface ProfileViewProps {
  profile: PatientProfile;
  onEdit: () => void;
}

function formatDob(raw: string | undefined): string {
  if (!raw) return 'Not provided';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function ProfileView({ profile, onEdit }: ProfileViewProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6 gap-3">
        <h3 className="text-lg font-semibold text-gray-900">Contact &amp; health notes</h3>
        <button
          type="button"
          onClick={onEdit}
          className="shrink-0 bg-blue-600 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          Edit
        </button>
      </div>
      <dl className="space-y-5 text-sm">
        <div>
          <dt className="text-gray-500">Name</dt>
          <dd className="mt-0.5 font-medium text-gray-900 text-base">
            {profile.FirstName} {profile.LastName}
          </dd>
        </div>
        <div>
          <dt className="text-gray-500">Email</dt>
          <dd className="mt-0.5 text-gray-900">{profile.Email || 'Not provided'}</dd>
          <p className="text-xs text-gray-400 mt-1">Used to sign in; change via clinic if needed.</p>
        </div>
        <div>
          <dt className="text-gray-500">Phone</dt>
          <dd className="mt-0.5 text-gray-900">{profile.ContactPhone || 'Not provided'}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Date of birth</dt>
          <dd className="mt-0.5 text-gray-900">{formatDob(profile.DateOfBirth)}</dd>
        </div>
        {profile.Address ? (
          <div>
            <dt className="text-gray-500">Address</dt>
            <dd className="mt-0.5 text-gray-900">{profile.Address}</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-gray-500">Health notes for your care team</dt>
          <dd className="mt-0.5 text-gray-900 whitespace-pre-wrap">
            {profile.MedicalHistorySummary?.trim()
              ? profile.MedicalHistorySummary
              : 'None on file — add anything your dentist should know (allergies, conditions, medications).'}
          </dd>
        </div>
      </dl>
    </div>
  );
}
