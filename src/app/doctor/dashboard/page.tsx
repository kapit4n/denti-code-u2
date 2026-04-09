'use client';

import DoctorHomeOverview from './_components/DoctorHomeOverview';
import DoctorDashboardStats from './_components/DoctorDashboardStats';

export default function DoctorDashboardPage() {
  return (
    <div className="max-w-6xl space-y-10">
      <DoctorHomeOverview />
      <section className="border-t border-gray-200 pt-8">
        <h2 className="text-xl font-bold text-gray-900">Practice metrics</h2>
        <p className="text-sm text-gray-600 mt-1 mb-6 max-w-2xl">
          Counts and revenue for visits where you are the primary dentist, for the period you
          choose. Revenue uses treatment lines on completed visits only.
        </p>
        <DoctorDashboardStats />
      </section>
    </div>
  );
}
