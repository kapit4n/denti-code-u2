export default function DashboardPage() {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-4 text-gray-800">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600">Today's Appointments</h3>
          <p className="text-3xl font-bold text-blue-600">12</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600">New Patients (Month)</h3>
          <p className="text-3xl font-bold text-green-600">8</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600">Pending Tasks</h3>
          <p className="text-3xl font-bold text-yellow-600">3</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-600">Revenue (Today)</h3>
          <p className="text-3xl font-bold text-indigo-600">$2,450</p>
        </div>
      </div>
    </div>
  );
}
