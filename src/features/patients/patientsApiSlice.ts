import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/lib/redux/store';
import { PatientProfile } from '@/types';

export const patientsApiSlice = createApi({
  reducerPath: 'patientsApi',
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
  tagTypes: ['Patient', 'MyProfile'],
  endpoints: (builder) => ({
    getPatients: builder.query<any[], void>({
      query: () => '/patients',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Patient' as const, id })),
              { type: 'Patient', id: 'LIST' },
            ]
          : [{ type: 'Patient', id: 'LIST' }],
    }),
    getMyProfile: builder.query<PatientProfile, void>({
      query: () => '/patients/me', // Assumes a backend route that gets the logged-in user's patient record
      providesTags: ['MyProfile'],
    }),
    updateMyProfile: builder.mutation<PatientProfile, Partial<PatientProfile>>({
      query: (profileData) => ({
        url: '/patients/me', // Assumes a backend route to update the logged-in user's patient record
        method: 'PATCH',
        body: profileData,
      }),
      invalidatesTags: ['MyProfile'], // Invalidate the profile cache on update
    }),
  }),
});

export const { useGetPatientsQuery, useGetMyProfileQuery, useUpdateMyProfileMutation } = patientsApiSlice;
