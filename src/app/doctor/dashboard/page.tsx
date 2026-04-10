'use client';

import { useTranslation } from '@/i18n/I18nContext';
import DoctorHomeOverview from './_components/DoctorHomeOverview';
import DoctorDashboardStats from './_components/DoctorDashboardStats';

export default function DoctorDashboardPage() {
  const { t } = useTranslation();
  return (
    <div className="max-w-6xl space-y-10">
      <DoctorHomeOverview />
      <section className="border-t border-gray-200 pt-8">
        <h2 className="text-xl font-bold text-gray-900">{t('doctor.stats.metricsTitle')}</h2>
        <p className="text-sm text-gray-600 mt-1 mb-6 max-w-2xl">
          {t('doctor.stats.metricsIntro')}
        </p>
        <DoctorDashboardStats />
      </section>
    </div>
  );
}
