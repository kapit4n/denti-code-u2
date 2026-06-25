import { renderWithProviders, screen } from '../test-utils';
import DoctorPortalShell from '@/app/doctor/_components/DoctorPortalShell';
import DoctorPortalHeader from '@/app/doctor/_components/DoctorPortalHeader';
import DoctorHomeOverview from '@/app/doctor/dashboard/_components/DoctorHomeOverview';
import DoctorDashboardStats from '@/app/doctor/dashboard/_components/DoctorDashboardStats';
import DoctorCalendarPage from '@/app/doctor/calendar/page';
import DoctorPatientsPage from '@/app/doctor/patients/page';

describe('Doctor Portal Smoke Tests', () => {
  describe('DoctorPortalShell', () => {
    it('renders children content', () => {
      renderWithProviders(
        <DoctorPortalShell>
          <div>Test Content</div>
        </DoctorPortalShell>,
        {
          preloadedState: {
            auth: {
              user: { id: '1', email: 'john@example.com', roles: ['DOCTOR'], firstName: 'John', lastName: 'Doe' },
              token: 'test-token',
              hydrated: true,
            },
          },
        },
      );
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  describe('DoctorPortalHeader', () => {
    it('renders header with portal key', () => {
      renderWithProviders(<DoctorPortalHeader />, {
        preloadedState: {
          auth: {
            user: { id: '1', email: 'john@example.com', roles: ['DOCTOR'], firstName: 'John', lastName: 'Doe' },
            token: 'test-token',
            hydrated: true,
          },
        },
      });
      expect(screen.getByText('portal.dr')).toBeInTheDocument();
    });
  });

  describe('DoctorHomeOverview', () => {
    it('renders home overview container', () => {
      renderWithProviders(<DoctorHomeOverview />);
      expect(screen.getByText('doctor.home.title')).toBeInTheDocument();
    });
  });

  describe('DoctorDashboardStats', () => {
    it('renders stats section or no-doctor warning', () => {
      renderWithProviders(<DoctorDashboardStats />);
      const hasStats = screen.queryByText('doctor.stats.metricsTitle');
      const hasNoDoctorWarning = screen.queryByText('doctor.stats.metricsNoDoctor');
      expect(hasStats || hasNoDoctorWarning).toBeTruthy();
    });
  });

  describe('DoctorCalendarPage', () => {
    it('renders calendar title', () => {
      renderWithProviders(<DoctorCalendarPage />);
      expect(screen.getByText('doctor.calendar.title')).toBeInTheDocument();
    });
  });

  describe('DoctorPatientsPage', () => {
    it('renders patients list title', () => {
      renderWithProviders(<DoctorPatientsPage />);
      expect(screen.getByText('doctor.patients.listTitle')).toBeInTheDocument();
    });
  });
});
