'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks';
import {
  setCredentials,
  logout,
  setAuthHydrated,
  selectCurrentToken,
} from '@/features/auth/authSlice';
import { useRefreshSessionMutation } from '@/features/auth/authApiSlice';
import {
  getAuthTokenCookie,
  clearAuthTokenCookie,
  SESSION_MAX_AGE_SECONDS,
} from '@/lib/auth/sessionCookie';

const IDLE_MS = SESSION_MAX_AGE_SECONDS * 1000;
const RENEW_THROTTLE_MS = 60_000;

async function fetchProfile(
  accessToken: string,
): Promise<Record<string, unknown> | null> {
  const base = process.env.NEXT_PUBLIC_API_GATEWAY_URL;
  if (!base) return null;
  const res = await fetch(`${base}/auth/profile`, {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  return res.json() as Promise<Record<string, unknown>>;
}

export default function SessionManager({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const token = useAppSelector(selectCurrentToken);
  const [refreshSession] = useRefreshSessionMutation();
  const lastActivityRef = useRef(Date.now());
  const lastRenewRef = useRef(0);

  const tryRenewSession = useCallback(() => {
    if (!token) return;
    const now = Date.now();
    if (now - lastRenewRef.current < RENEW_THROTTLE_MS) return;
    lastRenewRef.current = now;
    void refreshSession()
      .unwrap()
      .catch(() => {
        dispatch(logout());
      });
  }, [token, refreshSession, dispatch]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const cookieToken = getAuthTokenCookie();
      if (!cookieToken) {
        if (!cancelled) dispatch(setAuthHydrated(true));
        return;
      }

      const user = await fetchProfile(cookieToken);
      if (cancelled) return;

      if (!user) {
        clearAuthTokenCookie();
        dispatch(setAuthHydrated(true));
        return;
      }

      dispatch(
        setCredentials({
          access_token: cookieToken,
          user,
        }),
      );
      dispatch(setAuthHydrated(true));
    })();

    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  useEffect(() => {
    const bump = () => {
      lastActivityRef.current = Date.now();
      tryRenewSession();
    };

    const opts = { passive: true } as AddEventListenerOptions;
    window.addEventListener('pointerdown', bump, opts);
    window.addEventListener('keydown', bump);
    window.addEventListener('scroll', bump, opts);
    window.addEventListener('click', bump);
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') bump();
    });

    const interval = window.setInterval(() => {
      if (!token) return;
      if (Date.now() - lastActivityRef.current > IDLE_MS) {
        dispatch(logout());
      }
    }, 15_000);

    return () => {
      window.removeEventListener('pointerdown', bump);
      window.removeEventListener('keydown', bump);
      window.removeEventListener('scroll', bump);
      window.removeEventListener('click', bump);
      window.removeEventListener('visibilitychange', bump);
      window.clearInterval(interval);
    };
  }, [dispatch, token, tryRenewSession]);

  return <>{children}</>;
}
