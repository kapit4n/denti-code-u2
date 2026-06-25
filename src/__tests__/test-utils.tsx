import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/authSlice';
import { I18nProvider } from '@/i18n/I18nContext';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/doctor/dashboard',
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={(props.alt as string) || ''} {...props} />;
  },
}));

// Mock useTranslation - returns translation keys for testing
jest.mock('@/i18n/I18nContext', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    setLocale: jest.fn(),
    locale: 'en',
    supportedLocales: [
      { code: 'en', label: 'English' },
      { code: 'es', label: 'Español' },
    ],
    orgDefaultLocale: 'en',
    isAuthenticated: true,
    setDisplayLanguage: jest.fn(),
    userPreferredLocale: null,
    intlLocale: 'en-US',
  }),
  I18nProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock all API slices
jest.mock('@/features/appointments/appointmentsApiSlice', () => ({
  appointmentsApiSlice: { reducerPath: 'appointmentsApi', reducer: () => ({}), middleware: () => (next: (action: unknown) => unknown) => (action: unknown) => next(action) },
  useGetAppointmentsQuery: () => ({ data: [], isLoading: false, isError: false }),
  useGetMyAppointmentsQuery: () => ({ data: [], isLoading: false, isError: false }),
}));

jest.mock('@/features/doctors/doctorsApiSlice', () => ({
  doctorsApiSlice: { reducerPath: 'doctorsApi', reducer: () => ({}), middleware: () => (next: (action: unknown) => unknown) => (action: unknown) => next(action) },
  useGetDoctorsQuery: () => ({ data: [], isLoading: false, isError: false }),
}));

jest.mock('@/features/patients/patientsApiSlice', () => ({
  patientsApiSlice: { reducerPath: 'patientsApi', reducer: () => ({}), middleware: () => (next: (action: unknown) => unknown) => (action: unknown) => next(action) },
  useGetPatientsQuery: () => ({ data: [], isLoading: false, isError: false }),
  useCreatePatientMutation: () => [jest.fn(), { isLoading: false }],
  useGetMyProfileQuery: () => ({ data: undefined, isLoading: false, isError: false }),
}));

jest.mock('@/features/procedures/proceduresApiSlice', () => ({
  proceduresApiSlice: { reducerPath: 'proceduresApi', reducer: () => ({}), middleware: () => (next: (action: unknown) => unknown) => (action: unknown) => next(action) },
  useGetAppointmentProceduresQuery: () => ({ data: [], isLoading: false, isError: false }),
  useGetTreatmentFacilitiesQuery: () => ({ data: [], isLoading: false }),
}));

jest.mock('@/features/notifications/notificationsApiSlice', () => ({
  notificationsApiSlice: { reducerPath: 'notificationsApi', reducer: () => ({}), middleware: () => (next: (action: unknown) => unknown) => (action: unknown) => next(action) },
  useGetNotificationsQuery: () => ({ data: [], isLoading: false, isError: false }),
  useMarkAsReadMutation: () => [jest.fn(), { isLoading: false }],
  useMarkAllAsReadMutation: () => [jest.fn(), { isLoading: false }],
}));

jest.mock('@/features/payments/paymentsApiSlice', () => ({
  paymentsApiSlice: { reducerPath: 'paymentsApi', reducer: () => ({}), middleware: () => (next: (action: unknown) => unknown) => (action: unknown) => next(action) },
  useGetPaymentsQuery: () => ({ data: [], isLoading: false, isError: false }),
  useCreatePaymentMutation: () => [jest.fn(), { isLoading: false }],
}));

jest.mock('@/features/systemStatus/systemStatusApiSlice', () => ({
  systemStatusApiSlice: { reducerPath: 'systemStatusApi', reducer: () => ({}), middleware: () => (next: (action: unknown) => unknown) => (action: unknown) => next(action) },
  useGetSystemStatusQuery: () => ({ data: [], isLoading: false, isError: false }),
  useGetSystemServicesStatusQuery: () => ({ data: [], isLoading: false, isError: false }),
}));

jest.mock('@/features/inventory/inventoryApiSlice', () => ({
  inventoryApiSlice: { reducerPath: 'inventoryApi', reducer: () => ({}), middleware: () => (next: (action: unknown) => unknown) => (action: unknown) => next(action) },
  useGetConsultoriesQuery: () => ({ data: [], isLoading: false }),
  useGetInventoryLinesQuery: () => ({ data: [], isLoading: false, isError: false }),
  useGetInventoryMovementsQuery: () => ({ data: [], isLoading: false, isError: false }),
  useGetTreatmentFacilitiesQuery: () => ({ data: [], isLoading: false }),
  useAdjustInventoryMutation: () => [jest.fn(), { isLoading: false }],
  useCreateConsultoryMutation: () => [jest.fn(), { isLoading: false }],
  useCreateInventoryLineMutation: () => [jest.fn(), { isLoading: false }],
  useDeleteInventoryLineMutation: () => [jest.fn(), { isLoading: false }],
}));

jest.mock('@/features/locale/localeApiSlice', () => ({
  localeApiSlice: { reducerPath: 'localeApi', reducer: () => ({}), middleware: () => (next: (action: unknown) => unknown) => (action: unknown) => next(action) },
  useGetLocaleSettingsQuery: () => ({ data: { defaultLocale: 'en' }, isLoading: false, isError: false }),
}));

export function createTestStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState,
  });
}

export function renderWithProviders(
  ui: React.ReactElement,
  { preloadedState = {}, store = createTestStore(preloadedState) } = {},
) {
  return {
    store,
    ...render(
      <Provider store={store}>
        <I18nProvider>{ui}</I18nProvider>
      </Provider>,
    ),
  };
}

export { screen };
