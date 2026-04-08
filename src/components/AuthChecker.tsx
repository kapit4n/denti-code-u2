'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/redux/hooks';
import {
  selectCurrentToken,
  selectAuthHydrated,
} from '@/features/auth/authSlice';

export default function AuthChecker({ children }: { children: React.ReactNode }) {
  const token = useAppSelector(selectCurrentToken);
  const hydrated = useAppSelector(selectAuthHydrated);
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (token === null) {
      router.replace('/login');
    }
  }, [hydrated, token, router]);

  if (!hydrated || !token) {
    return <div className="p-6 text-gray-600">Loading...</div>;
  }

  return <>{children}</>;
}
