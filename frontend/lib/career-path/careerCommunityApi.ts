import { API_PATHS, buildApiUrl } from '@/lib/config/api';
import { getAccessToken } from '@/lib/auth/jwtStorage';
import { fetchWithAuthRetry } from '@/lib/auth/fetchWithAuthRetry';

const JSON_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
} as const;

function optionalAuthHeaders(): HeadersInit {
  const token = getAccessToken();
  if (!token) return JSON_HEADERS;
  return { ...JSON_HEADERS, Authorization: `Bearer ${token}` };
}

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

export type ApiCareerPathSchool = {
  id: string;
  name: string;
  code: string;
  operator?: string | null;
  operator_name?: string | null;
  description?: string | null;
  member_count: number;
  region?: string | null;
  school_type?: string | null;
  grades?: unknown[];
  created_at?: string;
  updated_at?: string;
};

export type ApiCareerPathGroup = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  creator: string;
  creator_name?: string;
  creator_emoji?: string;
  invite_code: string;
  member_count: number;
  is_public: boolean;
  created_at?: string;
  updated_at?: string;
};

export async function fetchCareerPathSchools(): Promise<ApiCareerPathSchool[]> {
  const url = buildApiUrl(`${API_PATHS.careerPathSchools}?page_size=100`);
  const res = await fetchWithAuthRetry(url, {
    method: 'GET',
    headers: optionalAuthHeaders(),
    credentials: 'omit',
    cache: 'no-store',
  });
  const data = await parseJsonOrThrow(res, 'career_path_schools');
  const raw = data as { results?: unknown[] };
  const rows = Array.isArray(raw.results) ? raw.results : Array.isArray(data) ? data : [];
  return rows as ApiCareerPathSchool[];
}

export async function fetchCareerPathGroups(): Promise<ApiCareerPathGroup[]> {
  const url = buildApiUrl(`${API_PATHS.careerPathGroups}?page_size=100`);
  const res = await fetchWithAuthRetry(url, {
    method: 'GET',
    headers: optionalAuthHeaders(),
    credentials: 'omit',
    cache: 'no-store',
  });
  const data = await parseJsonOrThrow(res, 'career_path_groups');
  const raw = data as { results?: unknown[] };
  const rows = Array.isArray(raw.results) ? raw.results : Array.isArray(data) ? data : [];
  return rows as ApiCareerPathGroup[];
}
