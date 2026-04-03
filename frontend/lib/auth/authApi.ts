import { buildApiUrl, API_PATHS } from '@/lib/config/api';
import { fetchWithAuthRetry } from '@/lib/auth/fetchWithAuthRetry';

const JSON_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
} as const;

async function parseJsonOrThrow(res: Response, label: string): Promise<unknown> {
  const text = await res.text().catch(() => '');
  if (!res.ok) {
    throw new Error(`${label}:${res.status}:${text.slice(0, 400)}`);
  }
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    throw new Error(`${label}:invalid_json`);
  }
}

export type EmailSignupPayload = {
  email: string;
  password: string;
  name: string;
  grade?: string;
  emoji?: string;
};

export type EmailLoginPayload = {
  email: string;
  password: string;
};

export type AuthMeUser = {
  id: string;
  email: string;
  name: string;
  grade: string;
  emoji: string;
  social_provider?: string;
  profile_image_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AuthResponse = {
  access_token: string;
  refresh_token: string;
  user: AuthMeUser;
};

/** 로그인된 사용자 프로필 (JWT 필요) */
export async function fetchAuthMe(): Promise<AuthMeUser> {
  const url = buildApiUrl(API_PATHS.auth.me);
  const res = await fetchWithAuthRetry(url, {
    method: 'GET',
    credentials: 'omit',
    cache: 'no-store',
  });
  const data = await parseJsonOrThrow(res, 'auth_me');
  return data as AuthMeUser;
}

export async function emailSignupApi(payload: EmailSignupPayload): Promise<AuthResponse> {
  const url = buildApiUrl(API_PATHS.auth.emailSignup);
  const res = await fetch(url, {
    method: 'POST',
    headers: JSON_HEADERS,
    credentials: 'omit',
    body: JSON.stringify(payload),
  });
  const data = await parseJsonOrThrow(res, 'email_signup');
  return data as AuthResponse;
}

export async function emailLoginApi(payload: EmailLoginPayload): Promise<AuthResponse> {
  const url = buildApiUrl(API_PATHS.auth.emailLogin);
  const res = await fetch(url, {
    method: 'POST',
    headers: JSON_HEADERS,
    credentials: 'omit',
    body: JSON.stringify(payload),
  });
  const data = await parseJsonOrThrow(res, 'email_login');
  return data as AuthResponse;
}
