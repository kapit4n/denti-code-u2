'use client'; // This component MUST be a client component

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/lib/redux/hooks';
import { selectCurrentToken } from '@/features/auth/authSlice';

export default function AuthChecker({ children }: { children: React.ReactNode }) {
  const token = useAppSelector(selectCurrentToken);
  const router = useRouter();

  useEffect(() => {
    if (token === null) {
      router.replace('/login');
    }
  }, [token, router]);

  if (!token) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}
