import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/lib/redux/store';

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
  tagTypes: ['Patient'],
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
  }),
});

export const { useGetPatientsQuery } = patientsApiSlice;
