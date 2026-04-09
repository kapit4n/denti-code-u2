import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/lib/redux/store';

export type AuthUser = {
  id: string;
  email: string;
  roles: string[];
  firstName?: string;
  lastName?: string;
  /** Null or absent: follow organization default from AppSettings. */
  preferredLocale?: string | null;
  /** If the auth profile ever returns a photo URL, it will be used in the header avatar */
  avatarUrl?: string;
  imageUrl?: string;
  photoUrl?: string;
};

type AuthState = {
  user: AuthUser | null;
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
    updateAuthUser: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { setCredentials, logout, setAuthHydrated, updateAuthUser } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectCurrentToken = (state: RootState) => state.auth.token;
export const selectAuthHydrated = (state: RootState) => state.auth.hydrated;
