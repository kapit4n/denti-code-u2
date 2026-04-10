import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/lib/redux/store';
import type { ProcedureType, TreatmentFacilityDto } from '@/types';

export const proceduresApiSlice = createApi({
  reducerPath: 'proceduresApi',
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
  tagTypes: ['ProcedureType', 'TreatmentFacility'],
  endpoints: (builder) => ({
    getProcedureTypes: builder.query<ProcedureType[], void>({
      query: () => '/procedures/types',
      providesTags: [{ type: 'ProcedureType', id: 'LIST' }],
    }),
    getTreatmentFacilities: builder.query<TreatmentFacilityDto[], void>({
      query: () => '/treatment-facilities',
      providesTags: [{ type: 'TreatmentFacility', id: 'LIST' }],
    }),
  }),
});

export const { useGetProcedureTypesQuery, useGetTreatmentFacilitiesQuery } = proceduresApiSlice;
