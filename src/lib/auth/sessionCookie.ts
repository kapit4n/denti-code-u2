const AUTH_TOKEN_COOKIE = 'dc_access_token';

/** Sliding session window (must match JWT expiry on auth service). */
export const SESSION_MAX_AGE_SECONDS = 600;

export function setAuthTokenCookie(token: string): void {
  if (typeof document === 'undefined') return;
  const encoded = encodeURIComponent(token);
  document.cookie = `${AUTH_TOKEN_COOKIE}=${encoded}; Path=/; Max-Age=${SESSION_MAX_AGE_SECONDS}; SameSite=Lax`;
}

export function getAuthTokenCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${AUTH_TOKEN_COOKIE}=([^;]*)`),
  );
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export function clearAuthTokenCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_TOKEN_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}
