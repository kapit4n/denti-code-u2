import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import { authApiSlice } from '@/features/auth/authApiSlice';
import authReducer, { setCredentials, logout } from '@/features/auth/authSlice';
import { patientsApiSlice } from '@/features/patients/patientsApiSlice';
import { appointmentsApiSlice } from '@/features/appointments/appointmentsApiSlice';
import { doctorsApiSlice } from '@/features/doctors/doctorsApiSlice';
import { proceduresApiSlice } from '@/features/procedures/proceduresApiSlice';
import { localeApiSlice } from '@/features/locale/localeApiSlice';
import {
  setAuthTokenCookie,
  clearAuthTokenCookie,
} from '@/lib/auth/sessionCookie';

const authSessionListener = createListenerMiddleware();
authSessionListener.startListening({
  actionCreator: setCredentials,
  effect: (action) => {
    setAuthTokenCookie(action.payload.access_token);
  },
});
authSessionListener.startListening({
  actionCreator: logout,
  effect: () => {
    clearAuthTokenCookie();
  },
});

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      [authApiSlice.reducerPath]: authApiSlice.reducer,
      [patientsApiSlice.reducerPath]: patientsApiSlice.reducer,
      [appointmentsApiSlice.reducerPath]: appointmentsApiSlice.reducer,
      [doctorsApiSlice.reducerPath]: doctorsApiSlice.reducer,
      [proceduresApiSlice.reducerPath]: proceduresApiSlice.reducer,
      [localeApiSlice.reducerPath]: localeApiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .prepend(authSessionListener.middleware)
        .concat(authApiSlice.middleware)
        .concat(patientsApiSlice.middleware)
        .concat(appointmentsApiSlice.middleware)
        .concat(doctorsApiSlice.middleware)
        .concat(proceduresApiSlice.middleware)
        .concat(localeApiSlice.middleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];