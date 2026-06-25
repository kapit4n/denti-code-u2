import { renderWithProviders, screen } from '../test-utils';
import AdminPortalShell from '@/app/admin/_components/AdminPortalShell';
import AdminPortalHeader from '@/app/admin/_components/AdminPortalHeader';
import DashboardPage from '@/app/admin/dashboard/page';
import PatientsPage from '@/app/admin/patients/page';
import DoctorsPage from '@/app/admin/doctors/page';
import AppointmentsPage from '@/app/admin/appointments/page';
import ServicesPage from '@/app/admin/services/page';
import InventoryPage from '@/app/admin/inventory/page';

describe('Admin Portal Smoke Tests', () => {
  describe('AdminPortalShell', () => {
    it('renders children content', () => {
      renderWithProviders(
        <AdminPortalShell>
          <div>Test Content</div>
        </AdminPortalShell>,
        {
          preloadedState: {
            auth: {
              user: { id: '1', email: 'admin@example.com', roles: ['ADMIN'], firstName: 'Admin', lastName: 'User' },
              token: 'test-token',
              hydrated: true,
            },
          },
        },
      );
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
  });

  describe('AdminPortalHeader', () => {
    it('renders header with portal key', () => {
      renderWithProviders(<AdminPortalHeader />, {
        preloadedState: {
          auth: {
            user: { id: '1', email: 'admin@example.com', roles: ['ADMIN'], firstName: 'Admin', lastName: 'User' },
            token: 'test-token',
            hydrated: true,
          },
        },
      });
      expect(screen.getByText('portal.administration')).toBeInTheDocument();
    });
  });

  describe('DashboardPage', () => {
    it('renders dashboard title', () => {
      renderWithProviders(<DashboardPage />);
      expect(screen.getByText('adminDashboard.title')).toBeInTheDocument();
    });
  });

  describe('PatientsPage', () => {
    it('renders patients page', () => {
      renderWithProviders(<PatientsPage />);
      expect(screen.getByText('adminPatients.title')).toBeInTheDocument();
    });
  });

  describe('DoctorsPage', () => {
    it('renders doctors page', () => {
      renderWithProviders(<DoctorsPage />);
      expect(screen.getByText('adminDoctors.title')).toBeInTheDocument();
    });
  });

  describe('AppointmentsPage', () => {
    it('renders appointments page', () => {
      renderWithProviders(<AppointmentsPage />);
      expect(screen.getByText('adminAppointments.title')).toBeInTheDocument();
    });
  });

  describe('ServicesPage', () => {
    it('renders services page', () => {
      renderWithProviders(<ServicesPage />);
      expect(screen.getByText('adminServices.title')).toBeInTheDocument();
    });
  });

  describe('InventoryPage', () => {
    it('renders inventory page', () => {
      renderWithProviders(<InventoryPage />);
      expect(screen.getByText('adminInventory.title')).toBeInTheDocument();
    });
  });
});
