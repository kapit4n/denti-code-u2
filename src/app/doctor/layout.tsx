import Link from 'next/link';
import AuthChecker from '@/components/AuthChecker';
import LogoutButton from '@/components/LogoutButton';
import DoctorPortalHeader from '@/app/doctor/_components/DoctorPortalHeader';

const navClass =
  'flex items-center gap-3 py-2 px-3 rounded-md hover:bg-gray-100 text-gray-700 font-medium text-sm';

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthChecker>
      <div className="flex h-screen bg-gray-50">
        <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 font-bold text-lg border-b border-gray-200 text-gray-900">
            Denti-Code
          </div>
          <nav className="flex-1 p-3 space-y-0.5">
            <Link href="/doctor/dashboard" className={navClass}>
              Home
            </Link>
            <Link href="/doctor/appointments" className={navClass}>
              Visits
            </Link>
            <Link href="/doctor/calendar" className={navClass}>
              Calendar
            </Link>
            <Link href="/doctor/patients" className={navClass}>
              Patients
            </Link>
            <Link href="/doctor/profile" className={navClass}>
              Account
            </Link>
          </nav>
          <div className="p-3 border-t border-gray-200">
            <LogoutButton />
          </div>
        </aside>
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <DoctorPortalHeader />
          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>
      </div>
    </AuthChecker>
  );
}
