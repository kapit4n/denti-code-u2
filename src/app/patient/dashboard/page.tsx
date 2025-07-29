'use client';

import { useGetMyAppointmentsQuery } from '@/features/appointments/appointmentsApiSlice';
import { useAppSelector } from '@/lib/redux/hooks';
import { selectCurrentUser } from '@/features/auth/authSlice';

// A simple component for displaying a loading state
const LoadingSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="bg-gray-200 h-24 rounded-lg"></div>
    <div className="bg-gray-200 h-16 rounded-lg"></div>
    <div className="bg-gray-200 h-16 rounded-lg"></div>
  </div>
);

export default function PatientDashboardPage() {
  const user = useAppSelector(selectCurrentUser);
  const {
    data: appointments,
    isLoading,
    isError,
    error,
  } = useGetMyAppointmentsQuery();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError) {
    return <div className="text-red-500">Error loading your data. Please try again later.</div>;
  }

  // Process the appointment data
  const now = new Date();
  const upcomingAppointments = appointments?.filter(appt => new Date(appt.ScheduledDateTime) >= now)
    .sort((a, b) => new Date(a.ScheduledDateTime).getTime() - new Date(b.ScheduledDateTime).getTime());
  
  const nextAppointment = upcomingAppointments?.[0];

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-gray-800">
        Welcome back, {user?.firstName || 'Patient'}!
      </h2>

      {/* Upcoming Appointment Card */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-6">
        <h3 className="text-xl font-semibold text-gray-700 mb-3">Your Next Appointment</h3>
        {nextAppointment ? (
          <div>
            <p className="text-2xl font-bold text-blue-600">
              {new Date(nextAppointment.ScheduledDateTime).toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
              })}
            </p>
            <p className="text-lg text-gray-600">
              at {new Date(nextAppointment.ScheduledDateTime).toLocaleTimeString('en-US', {
                hour: '2-digit', minute: '2-digit'
              })}
            </p>
            <p className="mt-2 text-gray-500">
              Purpose: <strong>{nextAppointment.AppointmentPurpose}</strong>
            </p>
          </div>
        ) : (
          <p className="text-gray-500">You have no upcoming appointments scheduled.</p>
        )}
      </div>

      {/* Other sections can go here */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Action Required</h3>
          <p className="text-gray-500">You are due for a routine check-up. Please call our office to schedule.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">Your Profile</h3>
          <p className="text-gray-500">Keep your contact and medical information up to date.</p>
          <button className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded">
            Go to Profile
          </button>
        </div>
      </div>
    </div>
  );
}
