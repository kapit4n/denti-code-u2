import AdminPortalShell from '@/app/admin/_components/AdminPortalShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminPortalShell>{children}</AdminPortalShell>;
}
