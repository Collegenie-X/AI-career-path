/**
 * JWT access token (Django REST + simplejwt).
 * 소셜 로그인 연동 시 응답의 access 토큰을 저장하면 `/api/v1/` 보호 API를 사용할 수 있습니다.
 */
const ACCESS_TOKEN_KEY = 'dreampath_access_token';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAccessToken(token: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
    else localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    // ignore
  }
}
