import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '@/lib/redux/store';

export type LocaleOptionDto = { code: string; label: string };

export type LocaleSettingsDto = {
  defaultLocale: string;
  supportedLocales: LocaleOptionDto[];
};

export const localeApiSlice = createApi({
  reducerPath: 'localeApi',
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
  tagTypes: ['LocaleSettings'],
  endpoints: (builder) => ({
    getLocaleSettings: builder.query<LocaleSettingsDto, void>({
      query: () => '/auth/locale',
      providesTags: ['LocaleSettings'],
    }),
    updateDefaultLocale: builder.mutation<LocaleSettingsDto, { defaultLocale: string }>({
      query: (body) => ({
        url: '/auth/locale/default',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['LocaleSettings'],
    }),
    updateMyPreferredLocale: builder.mutation<Record<string, unknown>, { preferredLocale: string | null }>(
      {
        query: (body) => ({
          url: '/auth/me',
          method: 'PATCH',
          body,
        }),
      },
    ),
  }),
});

export const {
  useGetLocaleSettingsQuery,
  useUpdateDefaultLocaleMutation,
  useUpdateMyPreferredLocaleMutation,
} = localeApiSlice;
