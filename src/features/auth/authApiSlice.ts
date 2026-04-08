import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
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
      async queryFn(credentials, _api, _extraOptions, fetchWithBQ) {
        const loginResult = await fetchWithBQ({
          url: '/auth/login',
          method: 'POST',
          body: credentials,
        });

        if (loginResult.error) return { error: loginResult.error };

        const { access_token } = loginResult.data as { access_token: string };

        const profileResult = await fetchWithBQ({
          url: '/auth/profile',
          method: 'GET',
          headers: { authorization: `Bearer ${access_token}` },
        });

        if (profileResult.error) return { error: profileResult.error };

        return {
          data: {
            access_token,
            user: profileResult.data,
          },
        };
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch {
          // Login errors are surfaced through RTK Query error state in the UI.
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
    refreshSession: builder.mutation<
      { access_token: string; user: unknown },
      void
    >({
      async queryFn(_arg, api, _extraOptions, fetchWithBQ) {
        const token = (api.getState() as RootState).auth.token;
        if (!token) {
          return {
            error: {
              status: 401,
              data: { message: 'No session token' },
            } as FetchBaseQueryError,
          };
        }
        const refreshResult = await fetchWithBQ({
          url: '/auth/refresh',
          method: 'POST',
          headers: { authorization: `Bearer ${token}` },
        });
        if (refreshResult.error) return { error: refreshResult.error };

        const { access_token } = refreshResult.data as { access_token: string };

        const profileResult = await fetchWithBQ({
          url: '/auth/profile',
          method: 'GET',
          headers: { authorization: `Bearer ${access_token}` },
        });
        if (profileResult.error) return { error: profileResult.error };

        return {
          data: {
            access_token,
            user: profileResult.data,
          },
        };
      },
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            setCredentials({
              access_token: data.access_token,
              user: data.user,
            }),
          );
        } catch {
          /* surfaced via mutation error */
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useRefreshSessionMutation,
} = authApiSlice;
