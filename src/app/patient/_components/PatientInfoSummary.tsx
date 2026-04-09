import Link from 'next/link';
import type { PatientProfile } from '@/types';

function formatDob(raw: string | undefined): string {
  if (!raw) return '—';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

type Props = {
  profile: PatientProfile;
};

export default function PatientInfoSummary({ profile }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Your information</h2>
        <Link
          href="/patient/profile"
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          Edit details
        </Link>
      </div>
      <dl className="space-y-3 text-sm">
        <div>
          <dt className="text-gray-500">Name</dt>
          <dd className="font-medium text-gray-900">
            {profile.FirstName} {profile.LastName}
          </dd>
        </div>
        <div>
          <dt className="text-gray-500">Email</dt>
          <dd className="text-gray-900">{profile.Email || '—'}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Phone</dt>
          <dd className="text-gray-900">{profile.ContactPhone || '—'}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Date of birth</dt>
          <dd className="text-gray-900">{formatDob(profile.DateOfBirth)}</dd>
        </div>
        {profile.Address ? (
          <div>
            <dt className="text-gray-500">Address</dt>
            <dd className="text-gray-900">{profile.Address}</dd>
          </div>
        ) : null}
      </dl>
    </div>
  );
}
