'use client';

import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/lib/redux/hooks';
import { logout } from '@/features/auth/authSlice';
import { authApiSlice } from '@/features/auth/authApiSlice';
import { patientsApiSlice } from '@/features/patients/patientsApiSlice';
import { appointmentsApiSlice } from '@/features/appointments/appointmentsApiSlice';
import { doctorsApiSlice } from '@/features/doctors/doctorsApiSlice';

type Props = {
  className?: string;
};

export default function LogoutButton({ className }: Props) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = () => {
    dispatch(logout());
    dispatch(authApiSlice.util.resetApiState());
    dispatch(patientsApiSlice.util.resetApiState());
    dispatch(appointmentsApiSlice.util.resetApiState());
    dispatch(doctorsApiSlice.util.resetApiState());
    router.push('/login');
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={
        className ??
        'w-full text-left py-2 px-3 rounded-md text-red-600 hover:bg-red-50 font-medium text-sm'
      }
    >
      Log out
    </button>
  );
}
