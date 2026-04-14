import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/lib/redux/store';
import type { ClinicDoctor } from '@/types';

export const doctorsApiSlice = createApi({
  reducerPath: 'doctorsApi',
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
  tagTypes: ['Doctor'],
  endpoints: (builder) => ({
    getDoctors: builder.query<ClinicDoctor[], void>({
      query: () => '/doctors',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ DoctorID }) => ({ type: 'Doctor' as const, id: DoctorID })),
              { type: 'Doctor', id: 'LIST' },
            ]
          : [{ type: 'Doctor', id: 'LIST' }],
    }),
    patchMyDoctorAvatar: builder.mutation<ClinicDoctor, { AvatarUrl: string }>({
      query: (body) => ({
        url: '/doctors/me/avatar',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [{ type: 'Doctor', id: 'LIST' }],
    }),
  }),
});

export const { useGetDoctorsQuery, usePatchMyDoctorAvatarMutation } = doctorsApiSlice;
