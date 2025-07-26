import Link from 'next/link';
import AuthChecker from './_components/AuthChecker';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthChecker>

      <div className="flex h-screen bg-gray-50">
        <aside className="w-64 bg-white border-r flex flex-col">
           <div className="p-4 font-bold text-2xl border-b text-gray-800">Denti-Code</div>
           <nav className="flex-1 p-4 space-y-1">
            <Link href="dashboard" className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-gray-100 text-gray-700 font-medium">
                <span>Dashboard</span>
            </Link>
            <Link href="appointments" className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-gray-100 text-gray-700 font-medium">
                <span>Appointments</span>
            </Link>
            <Link href="settings" className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-gray-100 text-gray-700 font-medium">
                <span>Settings</span>
            </Link>
           </nav>
           <div className="p-4 border-t">
             {/* Profile/Logout button can go here */}
           </div>
        </aside>
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white shadow-sm border-b p-4">
            <h1 className="text-xl font-semibold text-gray-800">Welcome, Patient!</h1>
          </header>
          <main className="p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </AuthChecker>
  );
}
