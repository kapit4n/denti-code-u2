'use client';

import { useGetMyAppointmentsQuery } from '@/features/appointments/appointmentsApiSlice';
import AppointmentsList from './_components/AppointmentsList';
import AppointmentsSkeleton from './_components/AppointmentsSkeleton';

export default function AppointmentsPage() {
  const {
    data: appointments,
    isLoading,
    isError,
    error,
  } = useGetMyAppointmentsQuery();

  const renderContent = () => {
    if (isLoading) {
      return <AppointmentsSkeleton />;
    }

    if (isError) {
      // You can inspect the 'error' object for more details
      return <div className="text-center text-red-500">Failed to load appointments. Please try again later.</div>;
    }

    if (!appointments || appointments.length === 0) {
      return <div className="text-center text-gray-500">You have no appointments scheduled.</div>;
    }

    return <AppointmentsList appointments={appointments} />;
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-gray-800">My Appointments</h2>
      {renderContent()}
    </div>
  );
}