import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/lib/redux/store';

type AuthState = {
  user: { id: string; email: string; roles: string[] } | null;
  token: string | null;
};

const initialState: AuthState = { user: null, token: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: any; access_token: string }>
    ) => {
      console.log(action.payload)
      console.log(action.payload)
      console.log(action.payload)
      console.log(action.payload)
      console.log(action.payload)
      state.user = action.payload.user;
      state.token = action.payload.access_token;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectCurrentToken = (state: RootState) => state.auth.token;
