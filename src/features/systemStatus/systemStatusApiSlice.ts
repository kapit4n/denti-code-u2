import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/lib/redux/store';

export type ServiceApiEndpoint = {
  method: string;
  path: string;
  gatewayPath?: string;
  summary?: string;
};

export type ServiceStatusRow = {
  id: string;
  displayName: string;
  baseUrl: string | null;
  status: 'up' | 'down' | 'not_configured';
  detail?: string;
  /** Present when gateway returns the catalog (omit on older gateway builds). */
  endpoints?: ServiceApiEndpoint[];
};

export type SystemServicesStatusResponse = {
  checkedAt: string;
  services: ServiceStatusRow[];
};

export const systemStatusApiSlice = createApi({
  reducerPath: 'systemStatusApi',
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
    getSystemServicesStatus: builder.query<SystemServicesStatusResponse, void>({
      query: () => '/services/status',
    }),
  }),
});

export const { useGetSystemServicesStatusQuery } = systemStatusApiSlice;
