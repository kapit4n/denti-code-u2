import { redirect } from 'next/navigation';

export default function DoctorSettingsRedirectPage() {
  redirect('/doctor/profile');
}
