import { renderWithProviders, screen } from '../test-utils';
import PatientPortalShell from '@/app/patient/_components/PatientPortalShell';
import PatientPortalHeader from '@/app/patient/_components/PatientPortalHeader';
import PatientDashboardPage from '@/app/patient/dashboard/page';
import PatientAppointmentsPage from '@/app/patient/appointments/page';
import PatientProfilePage from '@/app/patient/profile/page';

const patientAuthState = {
  auth: {
    user: { id: '10', email: 'patient1@example.com', roles: ['PATIENT'], firstName: 'Peter', lastName: 'Parker' },
    token: 'test-token',
    hydrated: true,
  },
};

describe('Patient Portal Smoke Tests', () => {
  describe('PatientPortalShell', () => {
    it('renders children content', () => {
      renderWithProviders(
        <PatientPortalShell>
          <div>Test Content</div>
        </PatientPortalShell>,
        { preloadedState: patientAuthState },
      );
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  describe('PatientPortalHeader', () => {
    it('renders greeting with portal.hi key', () => {
      renderWithProviders(<PatientPortalHeader />, {
        preloadedState: patientAuthState,
      });
      expect(screen.getByText('portal.hi')).toBeInTheDocument();
    });

    it('renders patient subtitle', () => {
      renderWithProviders(<PatientPortalHeader />, {
        preloadedState: patientAuthState,
      });
      expect(screen.getByText('portal.patientSubtitle')).toBeInTheDocument();
    });
  });

  describe('PatientDashboardPage', () => {
    it('renders dashboard title', () => {
      renderWithProviders(<PatientDashboardPage />, {
        preloadedState: patientAuthState,
      });
      expect(screen.getByText('patientPortal.dashboard.title')).toBeInTheDocument();
    });
  });

  describe('PatientAppointmentsPage', () => {
    it('renders appointments title', () => {
      renderWithProviders(<PatientAppointmentsPage />, {
        preloadedState: patientAuthState,
      });
      expect(screen.getByText('patientPortal.appointmentsPage.title')).toBeInTheDocument();
    });

    it('shows empty state when no appointments', () => {
      renderWithProviders(<PatientAppointmentsPage />, {
        preloadedState: patientAuthState,
      });
      expect(screen.getByText('patientPortal.appointmentsPage.empty')).toBeInTheDocument();
    });
  });

  describe('PatientProfilePage', () => {
    it('renders profile title', () => {
      renderWithProviders(<PatientProfilePage />, {
        preloadedState: patientAuthState,
      });
      expect(screen.getByText('patientPortal.profilePage.title')).toBeInTheDocument();
    });
  });
});
