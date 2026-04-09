import PatientPortalShell from '@/app/patient/_components/PatientPortalShell';

export default function PatientLayout({ children }: { children: React.ReactNode }) {
  return <PatientPortalShell>{children}</PatientPortalShell>;
}
