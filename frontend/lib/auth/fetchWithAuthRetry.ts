/**
 * access 만료(401) 시 refresh_token 으로 갱신 후 요청을 한 번 재시도합니다.
 * 동시 401 에 대해 refresh 는 단일 비행(single-flight)으로 처리합니다.
 */

import { API_PATHS, buildApiUrl } from '@/lib/config/api';
import {
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
  clearAuthTokens,
} from '@/lib/auth/jwtStorage';

const JSON_HEADERS: HeadersInit = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

function buildAuthHeaders(): Headers {
  const h = new Headers(JSON_HEADERS);
  const t = getAccessToken();
  if (t) h.set('Authorization', `Bearer ${t}`);
  return h;
}

function mergeInitHeaders(initHeaders: HeadersInit | undefined, base: Headers): Headers {
  const out = new Headers(base);
  if (!initHeaders) return out;
  const incoming = new Headers(initHeaders);
  incoming.forEach((v, k) => {
    out.set(k, v);
  });
  return out;
}

let refreshInFlight: Promise<boolean> | null = null;

async function refreshAccessTokenOnce(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) {
    clearAuthTokens();
    return false;
  }
  const url = buildApiUrl(API_PATHS.auth.tokenRefresh);
  const res = await fetch(url, {
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ refresh_token: refresh }),
    credentials: 'omit',
  });
  if (!res.ok) {
    clearAuthTokens();
    return false;
  }
  let data: { access_token?: string; refresh_token?: string };
  try {
    data = (await res.json()) as { access_token?: string; refresh_token?: string };
  } catch {
    clearAuthTokens();
    return false;
  }
  if (data.access_token) setAccessToken(data.access_token);
  if (data.refresh_token) setRefreshToken(data.refresh_token);
  return Boolean(data.access_token);
}

export async function refreshAccessTokenWithLock(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = refreshAccessTokenOnce().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

/**
 * 401 이고 refresh_token 이 있으면 갱신 후 동일 요청을 한 번 더 보냅니다.
 */
export async function fetchWithAuthRetry(url: string, init: RequestInit = {}): Promise<Response> {
  const baseHeaders = mergeInitHeaders(init.headers, buildAuthHeaders());
  const res = await fetch(url, {
    ...init,
    headers: baseHeaders,
    credentials: init.credentials ?? 'omit',
  });
  if (res.status !== 401) return res;
  if (!getRefreshToken()) return res;
  const ok = await refreshAccessTokenWithLock();
  if (!ok) return res;
  const retryHeaders = mergeInitHeaders(init.headers, buildAuthHeaders());
  return fetch(url, {
    ...init,
    headers: retryHeaders,
    credentials: init.credentials ?? 'omit',
  });
}
