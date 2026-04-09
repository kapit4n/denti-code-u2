import DoctorPortalShell from '@/app/doctor/_components/DoctorPortalShell';

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  return <DoctorPortalShell>{children}</DoctorPortalShell>;
}
