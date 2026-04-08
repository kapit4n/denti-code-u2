import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/lib/redux/store';

type AuthState = {
  user: {
    id: string;
    email: string;
    roles: string[];
    firstName?: string;
    lastName?: string;
  } | null;
  token: string | null;
  /** Client-only: false until cookie/session restore attempt finishes */
  hydrated: boolean;
};

const initialState: AuthState = { user: null, token: null, hydrated: false };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: any; access_token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.access_token;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
    setAuthHydrated: (state, action: PayloadAction<boolean>) => {
      state.hydrated = action.payload;
    },
  },
});

export const { setCredentials, logout, setAuthHydrated } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectCurrentToken = (state: RootState) => state.auth.token;
export const selectAuthHydrated = (state: RootState) => state.auth.hydrated;
