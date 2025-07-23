import { configureStore } from '@reduxjs/toolkit';
import { authApiSlice } from '@/features/auth/authApiSlice';
import authReducer from '@/features/auth/authSlice';
import { patientsApiSlice } from '@/features/patients/patientsApiSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      [authApiSlice.reducerPath]: authApiSlice.reducer,
      [patientsApiSlice.reducerPath]: patientsApiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .concat(authApiSlice.middleware)
        .concat(patientsApiSlice.middleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];