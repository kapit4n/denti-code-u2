'use client';
import { useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from './store';
import SessionManager from './SessionManager';
import { I18nProvider } from '@/i18n/I18nContext';

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }

  return (
    <Provider store={storeRef.current}>
      <SessionManager>
        <I18nProvider>{children}</I18nProvider>
      </SessionManager>
    </Provider>
  );
}
