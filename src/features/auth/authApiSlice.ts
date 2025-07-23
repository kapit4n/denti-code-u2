import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials } from './authSlice';
import type { RootState } from '@/lib/redux/store';

export const authApiSlice = createApi({
  reducerPath: 'authApi',
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
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch (error) {
          console.error(error);
        }
      },
    }),
    register: builder.mutation({
      query: (user) => ({
        url: '/auth/register',
        method: 'POST',
        body: user,
      }),
    }),
    getProfile: builder.query({
      query: () => '/auth/profile',
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useGetProfileQuery } = authApiSlice;
