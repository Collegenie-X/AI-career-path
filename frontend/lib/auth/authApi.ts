import { buildApiUrl, API_PATHS } from '@/lib/config/api';

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

export type AuthResponse = {
  access_token: string;
  refresh_token: string;
  user: {
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
};

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
