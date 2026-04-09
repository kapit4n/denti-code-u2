import DoctorDashboardStats from './_components/DoctorDashboardStats';

export default function DashboardPage() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Dashboard overview</h2>
      <DoctorDashboardStats />
    </div>
  );
}
