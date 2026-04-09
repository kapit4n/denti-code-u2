import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/lib/redux/store';
import type {
  Appointment,
  AppointmentDetail,
  CreateAppointmentInput,
  CreatePerformedActionInput,
  PatientProfile,
  PerformedAction,
  UpdateAppointmentInput,
} from '@/types';

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
    updateAppointment: builder.mutation<
      Appointment,
      { id: number; body: UpdateAppointmentInput }
    >({
      query: ({ id, body }) => ({
        url: `/appointments/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Appointment', id },
        { type: 'Appointment', id: 'LIST' },
      ],
    }),
    getAppointment: builder.query<AppointmentDetail, number>({
      query: (id) => `/appointments/${id}`,
      providesTags: (result, _err, id) => [{ type: 'Appointment', id }],
    }),
    addPerformedAction: builder.mutation<
      PerformedAction,
      { appointmentId: number; body: CreatePerformedActionInput }
    >({
      query: ({ appointmentId, body }) => ({
        url: `/appointments/${appointmentId}/actions`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { appointmentId }) => [
        { type: 'Appointment', id: appointmentId },
        { type: 'Appointment', id: 'LIST' },
      ],
    }),
    removePerformedAction: builder.mutation<
      void,
      { actionId: number; appointmentId: number }
    >({
      query: ({ actionId }) => ({
        url: `/actions/${actionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { appointmentId }) => [
        { type: 'Appointment', id: appointmentId },
        { type: 'Appointment', id: 'LIST' },
      ],
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
  useUpdateAppointmentMutation,
  useGetAppointmentQuery,
  useAddPerformedActionMutation,
  useRemovePerformedActionMutation,
} = appointmentsApiSlice;
