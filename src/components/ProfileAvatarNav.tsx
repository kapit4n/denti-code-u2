'use client';

import Link from 'next/link';
import { useAppSelector } from '@/lib/redux/hooks';
import { selectCurrentUser, type AuthUser } from '@/features/auth/authSlice';
import { profileHrefForRoles } from '@/lib/auth/profileRoutes';

function initialsForUser(user: AuthUser | null): string {
  if (!user) return '?';
  const f = user.firstName?.trim()?.charAt(0);
  const l = user.lastName?.trim()?.charAt(0);
  if (f && l) return `${f}${l}`.toUpperCase();
  if (f) return f.toUpperCase();
  const e = user.email?.trim()?.charAt(0);
  return e ? e.toUpperCase() : '?';
}

function photoForUser(user: AuthUser | null): string | undefined {
  if (!user) return undefined;
  return user.avatarUrl || user.imageUrl || user.photoUrl;
}

type Props = {
  className?: string;
};

export default function ProfileAvatarNav({ className = '' }: Props) {
  const user = useAppSelector(selectCurrentUser);
  const href = profileHrefForRoles(user?.roles);
  const photo = photoForUser(user);
  const initials = initialsForUser(user);

  return (
    <Link
      href={href}
      className={`group relative inline-flex shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${className}`}
      aria-label="Your profile and account"
      title="Profile"
    >
      <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100 text-gray-700 shadow-sm transition group-hover:border-blue-300 group-hover:shadow-md">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- dynamic user-supplied URL from auth profile
          <img
            src={photo}
            alt=""
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-600 to-slate-800 text-xs font-bold text-white">
            {initials}
          </span>
        )}
      </span>
    </Link>
  );
}
