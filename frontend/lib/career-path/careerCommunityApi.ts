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

function formatDrfErrorBody(text: string): string {
  try {
    const j = JSON.parse(text) as { detail?: unknown; non_field_errors?: unknown[] };
    if (typeof j.detail === 'string') return j.detail;
    if (Array.isArray(j.detail)) return j.detail.map(String).join('; ');
    if (j.detail && typeof j.detail === 'object') {
      return Object.entries(j.detail as Record<string, unknown>)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`)
        .join('; ');
    }
    if (Array.isArray(j.non_field_errors)) return j.non_field_errors.map(String).join('; ');
  } catch {
    /* fall through */
  }
  return text.slice(0, 400);
}

async function parseJsonOrThrow(res: Response, label: string): Promise<unknown> {
  const text = await res.text().catch(() => '');
  if (!res.ok) {
    const detail = formatDrfErrorBody(text);
    throw new Error(`${label}:${res.status}:${detail}`);
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
  max_members?: number;
  category?: string;
  mode?: string;
  tags?: string[];
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

export type CreateCareerPathGroupPayload = {
  name: string;
  emoji: string;
  description: string;
  max_members?: number;
  category?: string;
  mode?: string;
  tags?: string[];
  /** 목록 노출용 — 기본 true (커뮤니티 탐색) */
  is_public?: boolean;
};

/** 로그인 필요 — 생성자는 자동으로 그룹 관리자 멤버로 등록됩니다. */
export async function createCareerPathGroup(
  payload: CreateCareerPathGroupPayload,
): Promise<ApiCareerPathGroup> {
  const url = buildApiUrl(API_PATHS.careerPathGroups);
  const res = await fetchWithAuthRetry(url, {
    method: 'POST',
    headers: optionalAuthHeaders(),
    credentials: 'omit',
    body: JSON.stringify({
      name: payload.name,
      emoji: payload.emoji,
      description: payload.description,
      max_members: payload.max_members,
      category: payload.category,
      mode: payload.mode,
      tags: payload.tags ?? [],
      is_public: payload.is_public ?? true,
    }),
  });
  const data = await parseJsonOrThrow(res, 'career_path_group_create');
  return data as ApiCareerPathGroup;
}

export type UpdateCareerPathGroupPayload = Partial<CreateCareerPathGroupPayload>;

export async function updateCareerPathGroup(
  groupId: string,
  payload: UpdateCareerPathGroupPayload,
): Promise<ApiCareerPathGroup> {
  const url = buildApiUrl(`${API_PATHS.careerPathGroups}${groupId}/`);
  const res = await fetchWithAuthRetry(url, {
    method: 'PATCH',
    headers: optionalAuthHeaders(),
    credentials: 'omit',
    body: JSON.stringify(payload),
  });
  const data = await parseJsonOrThrow(res, 'career_path_group_patch');
  return data as ApiCareerPathGroup;
}

export async function deleteCareerPathGroup(groupId: string): Promise<void> {
  const url = buildApiUrl(`${API_PATHS.careerPathGroups}${groupId}/`);
  const res = await fetchWithAuthRetry(url, {
    method: 'DELETE',
    headers: optionalAuthHeaders(),
    credentials: 'omit',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`career_path_group_delete:${res.status}:${text.slice(0, 400)}`);
  }
}
