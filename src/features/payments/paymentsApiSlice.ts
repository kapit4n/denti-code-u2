import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/lib/redux/store';
import type { CreatePaymentInput, Payment } from '@/types';

export const paymentsApiSlice = createApi({
  reducerPath: 'paymentsApi',
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
  tagTypes: ['Payment'],
  endpoints: (builder) => ({
    getPatientPayments: builder.query<Payment[], number>({
      query: (patientId) => ({
        url: '/payments',
        params: { patientId },
      }),
      providesTags: (result, _err, patientId) =>
        result
          ? [
              ...result.map(({ PaymentID }) => ({
                type: 'Payment' as const,
                id: PaymentID,
              })),
              { type: 'Payment', id: `PATIENT:${patientId}` },
            ]
          : [{ type: 'Payment', id: `PATIENT:${patientId}` }],
    }),
    createPayment: builder.mutation<Payment, CreatePaymentInput>({
      query: (body) => ({
        url: '/payments',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, body) => [{ type: 'Payment', id: `PATIENT:${body.PatientID}` }],
    }),
  }),
});

export const { useGetPatientPaymentsQuery, useCreatePaymentMutation } = paymentsApiSlice;

