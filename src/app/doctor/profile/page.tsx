'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useAppSelector } from '@/lib/redux/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';
import { useGetDoctorsQuery, usePatchMyDoctorAvatarMutation } from '@/features/doctors/doctorsApiSlice';
import { useTranslation } from '@/i18n/I18nContext';
import AvatarThumb from '@/components/AvatarThumb';
import { uploadAvatarFile } from '@/lib/avatar/uploadAvatarFile';

export default function DoctorProfilePage() {
  const { t } = useTranslation();
  const user = useAppSelector(selectCurrentUser);
  const { data: doctors = [] } = useGetDoctorsQuery();
  const [patchAvatar, { isLoading: savingAvatar }] = usePatchMyDoctorAvatarMutation();
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarErr, setAvatarErr] = useState('');

  const clinicDoctor = useMemo(() => {
    if (!user?.email) return undefined;
    return doctors.find((d) => d.Email.toLowerCase() === user.email.toLowerCase());
  }, [doctors, user?.email]);

  const clinicName = clinicDoctor
    ? `${clinicDoctor.FirstName} ${clinicDoctor.LastName}`.trim()
    : '';

  const handleAvatarPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !clinicDoctor) return;
    setAvatarErr('');
    setAvatarBusy(true);
    try {
      const url = await uploadAvatarFile(file);
      await patchAvatar({ AvatarUrl: url }).unwrap();
    } catch (err) {
      setAvatarErr(err instanceof Error ? err.message : t('doctor.profile.avatarError'));
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleAvatarClear = async () => {
    if (!clinicDoctor) return;
    setAvatarErr('');
    setAvatarBusy(true);
    try {
      await patchAvatar({ AvatarUrl: '' }).unwrap();
    } catch {
      setAvatarErr(t('doctor.profile.avatarError'));
    } finally {
      setAvatarBusy(false);
    }
  };

  const busy = avatarBusy || savingAvatar;

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <Link href="/doctor/dashboard" className="text-sm font-medium text-blue-600 hover:underline">
          {t('doctor.nav.backHome')}
        </Link>
        <h2 className="text-2xl font-bold text-gray-900 mt-2">{t('doctor.profile.title')}</h2>
        <p className="text-sm text-gray-600 mt-1">{t('doctor.profile.intro')}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4 text-sm">
        <div>
          <p className="font-semibold text-gray-900 text-lg">
            {user?.firstName || user?.lastName
              ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
              : '—'}
          </p>
          <p className="text-gray-500 mt-1">{user?.email ?? '—'}</p>
        </div>
        <dl className="space-y-3">
          <div>
            <dt className="text-gray-500">{t('doctor.profile.userId')}</dt>
            <dd className="font-mono text-gray-900 mt-0.5 break-all">{user?.id ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">{t('doctor.profile.roles')}</dt>
            <dd className="text-gray-900 mt-0.5">
              {user?.roles?.length ? user.roles.join(', ') : '—'}
            </dd>
          </div>
        </dl>
        <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-2">
          <Link
            href="/doctor/appointments"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            {t('nav.visits')}
          </Link>
          <span className="text-gray-300">·</span>
          <Link
            href="/doctor/calendar"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            {t('nav.calendar')}
          </Link>
          <span className="text-gray-300">·</span>
          <Link
            href="/doctor/patients"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            {t('nav.patients')}
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <h3 className="text-base font-semibold text-gray-900">{t('doctor.profile.clinicCardTitle')}</h3>
        {!clinicDoctor ? (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            {t('doctor.profile.noClinicRecord')}
          </p>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-4">
              <AvatarThumb
                src={clinicDoctor.AvatarUrl}
                name={clinicName || user?.email || 'Doctor'}
                size="md"
              />
              <div className="min-w-0 space-y-2">
                <p className="font-medium text-gray-900">{clinicName}</p>
                <p className="text-xs text-gray-500">{clinicDoctor.Email}</p>
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      disabled={busy}
                      onChange={handleAvatarPick}
                    />
                    <span className="cursor-pointer inline-flex items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-50">
                      {busy ? t('doctor.profile.avatarUploading') : t('doctor.profile.avatarChoose')}
                    </span>
                  </label>
                  {clinicDoctor.AvatarUrl ? (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void handleAvatarClear()}
                      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {t('doctor.profile.avatarRemove')}
                    </button>
                  ) : null}
                </div>
                {avatarErr ? <p className="text-sm text-red-600">{avatarErr}</p> : null}
                <p className="text-xs text-gray-500">{t('doctor.profile.avatarHint')}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
