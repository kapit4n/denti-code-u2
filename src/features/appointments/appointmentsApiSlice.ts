import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/lib/redux/store';
import type { Appointment, CreateAppointmentInput, PatientProfile } from '@/types';

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
    getAppointments: builder.query<Appointment[], void>({
      query: () => '/appointments',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ AppointmentID }) => ({ type: 'Appointment' as const, id: AppointmentID })),
              { type: 'Appointment', id: 'LIST' },
            ]
          : [{ type: 'Appointment', id: 'LIST' }],
    }),
    createAppointment: builder.mutation<Appointment, CreateAppointmentInput>({
      query: (body) => ({
        url: '/appointments',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Appointment', id: 'LIST' }],
    }),
    getMyAppointments: builder.query<Appointment[], void>({
      async queryFn(_arg, _api, _extraOptions, fetchWithBQ) {
        const profileResult = await fetchWithBQ('/patients/me');
        if (profileResult.error) return { error: profileResult.error };

        const patientProfile = profileResult.data as PatientProfile;
        const patientId = patientProfile.PatientID;

        const appointmentsResult = await fetchWithBQ('/appointments');
        if (appointmentsResult.error) return { error: appointmentsResult.error };

        const allAppointments = appointmentsResult.data as Appointment[];
        const myAppointments = allAppointments.filter(
          (appointment) => appointment.PatientID === patientId,
        );

        return { data: myAppointments };
      },
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

export const {
  useGetMyAppointmentsQuery,
  useGetAppointmentsQuery,
  useCreateAppointmentMutation,
} = appointmentsApiSlice;
