import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/lib/redux/store';

// Define a type for a single appointment for better type safety
interface Appointment {
  AppointmentID: number;
  ScheduledDateTime: string; // ISO string
  AppointmentPurpose: string;
  Status: string;
  // You can add doctor and other details here if your API returns them
}

// This is a new API slice specifically for appointment data
export const appointmentsApiSlice = createApi({
  reducerPath: 'appointmentsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_GATEWAY_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Appointment'],
  endpoints: (builder) => ({
    // Endpoint to get appointments for the currently logged-in user
    // The backend uses the X-User-Id header to filter the data
    getMyAppointments: builder.query<Appointment[], void>({
      query: () => '/appointments/me', // Assumes a backend route like this exists
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ AppointmentID }) => ({ type: 'Appointment' as const, id: AppointmentID })),
              { type: 'Appointment', id: 'LIST' },
            ]
          : [{ type: 'Appointment', id: 'LIST' }],
    }),
  }),
});

export const { useGetMyAppointmentsQuery } = appointmentsApiSlice;
