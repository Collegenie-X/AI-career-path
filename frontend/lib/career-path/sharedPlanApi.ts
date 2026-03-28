import { API_PATHS, buildApiUrl } from '@/lib/config/api';
import { getAccessToken } from '@/lib/auth/jwtStorage';
import { fetchWithAuthRetry } from '@/lib/auth/fetchWithAuthRetry';
import { isUuidString } from '@/lib/career-path/isUuidString';

/** 백엔드 `group_ids` 는 DB 그룹 UUID만 허용 — JSON 목업(`group-1` 등)은 제외 */
export function sanitizeSharedPlanGroupIds(ids: string[] | undefined): string[] {
  if (!ids?.length) return [];
  return ids.filter((id) => isUuidString(String(id).trim()));
}

export function hasCareerPathBackendAuth(): boolean {
  return Boolean(getAccessToken());
}

const JSON_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
} as const;

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  if (!token) return JSON_HEADERS;
  return {
    ...JSON_HEADERS,
    Authorization: `Bearer ${token}`,
  };
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

export type ApiSharedPlanListItem = {
  id: string;
  career_plan: string;
  user: {
    id: string;
    name: string;
    email: string;
    emoji: string;
    grade: string;
  };
  career_plan_title: string;
  job_name: string;
  job_emoji: string;
  star_name: string;
  star_color: string;
  share_type: string;
  description?: string | null;
  tags: string[];
  like_count: number;
  bookmark_count: number;
  view_count: number;
  comment_count: number;
  shared_at: string;
  updated_at: string;
  is_hidden: boolean;
};

export type ApiSharedPlanCommentRow = {
  id: string;
  author: {
    id: string;
    name: string;
    email: string;
    emoji: string;
    grade: string;
  };
  content: string;
  parent: string | null;
  created_at: string;
};

export type ApiSharedPlanDetail = ApiSharedPlanListItem & {
  career_plan: {
    id: string;
    title: string;
    description?: string | null;
    job_id: string;
    job_name: string;
    job_emoji: string;
    star_id: string;
    star_name: string;
    star_emoji: string;
    star_color: string;
    years: unknown[];
  };
  school?: {
    id: string;
    name: string;
    code: string;
  } | null;
  groups: Array<{
    id: string;
    name: string;
    emoji: string;
  }>;
  /** 상세 조회 시에만 포함 (댓글 목록) */
  comments?: ApiSharedPlanCommentRow[];
};

export type SharedPlanCreatePayload = {
  career_plan: string;
  school?: string | null;
  share_type: 'public' | 'school' | 'group' | 'private';
  description?: string;
  tags?: string[];
  group_ids?: string[];
};

export async function fetchMySharedPlans(): Promise<ApiSharedPlanListItem[]> {
  const url = buildApiUrl(`${API_PATHS.careerPathSharedPlans}mine/`);
  const res = await fetchWithAuthRetry(url, {
    method: 'GET',
    headers: authHeaders(),
    credentials: 'omit',
    cache: 'no-store',
  });
  const data = await parseJsonOrThrow(res, 'shared_plans_mine');
  return Array.isArray(data) ? (data as ApiSharedPlanListItem[]) : [];
}

export async function fetchSharedPlans(filters?: {
  share_type?: string;
  user_id?: string;
}): Promise<ApiSharedPlanListItem[]> {
  const params = new URLSearchParams({ page_size: '100' });
  if (filters?.share_type) params.set('share_type', filters.share_type);
  if (filters?.user_id) params.set('user', filters.user_id);
  
  const url = buildApiUrl(`${API_PATHS.careerPathSharedPlans}?${params.toString()}`);
  const res = await fetchWithAuthRetry(url, {
    method: 'GET',
    headers: authHeaders(),
    credentials: 'omit',
    cache: 'no-store',
  });
  const data = await parseJsonOrThrow(res, 'shared_plans_list');
  const raw = data as { results?: unknown[] };
  const rows = Array.isArray(raw.results) ? raw.results : Array.isArray(data) ? data : [];
  return rows as ApiSharedPlanListItem[];
}

export async function fetchSharedPlanDetailById(id: string): Promise<ApiSharedPlanDetail> {
  const url = buildApiUrl(`/api/v1/career-path/shared-plans/${id}/`);
  const res = await fetchWithAuthRetry(url, {
    method: 'GET',
    headers: authHeaders(),
    credentials: 'omit',
    cache: 'no-store',
  });
  const data = await parseJsonOrThrow(res, 'shared_plan_detail');
  return data as ApiSharedPlanDetail;
}

export async function createSharedPlanApi(
  payload: SharedPlanCreatePayload
): Promise<ApiSharedPlanDetail> {
  const url = buildApiUrl('/api/v1/career-path/shared-plans/');
  const bodyPayload: SharedPlanCreatePayload = {
    ...payload,
    group_ids: sanitizeSharedPlanGroupIds(payload.group_ids),
  };
  const res = await fetchWithAuthRetry(url, {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'omit',
    body: JSON.stringify(bodyPayload),
  });
  const data = (await parseJsonOrThrow(res, 'shared_plan_create')) as { id?: string };
  const id = typeof data.id === 'string' ? data.id : '';
  if (!id) throw new Error('shared_plan_create:no_id');
  return fetchSharedPlanDetailById(id);
}

export async function updateSharedPlanApi(
  id: string,
  payload: Partial<SharedPlanCreatePayload>
): Promise<ApiSharedPlanDetail> {
  const url = buildApiUrl(`/api/v1/career-path/shared-plans/${id}/`);
  const bodyPayload =
    payload.group_ids !== undefined
      ? { ...payload, group_ids: sanitizeSharedPlanGroupIds(payload.group_ids) }
      : payload;
  const res = await fetchWithAuthRetry(url, {
    method: 'PATCH',
    headers: authHeaders(),
    credentials: 'omit',
    body: JSON.stringify(bodyPayload),
  });
  await parseJsonOrThrow(res, 'shared_plan_update');
  return fetchSharedPlanDetailById(id);
}

export async function deleteSharedPlanApi(id: string): Promise<void> {
  const url = buildApiUrl(`/api/v1/career-path/shared-plans/${id}/`);
  const res = await fetchWithAuthRetry(url, {
    method: 'DELETE',
    headers: authHeaders(),
    credentials: 'omit',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`shared_plan_delete:${res.status}:${text.slice(0, 400)}`);
  }
}

export async function likeSharedPlanApi(id: string): Promise<{ like_count: number }> {
  const url = buildApiUrl(`/api/v1/career-path/shared-plans/${id}/like/`);
  const res = await fetchWithAuthRetry(url, {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'omit',
  });
  const data = await parseJsonOrThrow(res, 'shared_plan_like');
  return data as { like_count: number };
}

export async function bookmarkSharedPlanApi(id: string): Promise<{ bookmark_count: number }> {
  const url = buildApiUrl(`/api/v1/career-path/shared-plans/${id}/bookmark/`);
  const res = await fetchWithAuthRetry(url, {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'omit',
  });
  const data = await parseJsonOrThrow(res, 'shared_plan_bookmark');
  return data as { bookmark_count: number };
}

export type SharedPlanCommentPostPayload = {
  content: string;
  parent?: string | null;
};

export async function postSharedPlanComment(
  sharedPlanId: string,
  payload: SharedPlanCommentPostPayload,
): Promise<ApiSharedPlanCommentRow> {
  const url = buildApiUrl(`/api/v1/career-path/shared-plans/${sharedPlanId}/comments/`);
  const res = await fetchWithAuthRetry(url, {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'omit',
    body: JSON.stringify({
      content: payload.content,
      ...(payload.parent ? { parent: payload.parent } : {}),
    }),
  });
  const data = await parseJsonOrThrow(res, 'shared_plan_comment_post');
  return data as ApiSharedPlanCommentRow;
}

export async function deleteSharedPlanComment(sharedPlanId: string, commentId: string): Promise<void> {
  const url = buildApiUrl(`/api/v1/career-path/shared-plans/${sharedPlanId}/comments/${commentId}/`);
  const res = await fetchWithAuthRetry(url, {
    method: 'DELETE',
    headers: authHeaders(),
    credentials: 'omit',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`shared_plan_comment_delete:${res.status}:${text.slice(0, 400)}`);
  }
}

export async function fetchSharedPlanByCareerPlanId(careerPlanId: string): Promise<ApiSharedPlanDetail | null> {
  const url = buildApiUrl(`/api/v1/career-path/shared-plans/by-career-plan/${careerPlanId}/`);
  const res = await fetchWithAuthRetry(url, {
    method: 'GET',
    headers: authHeaders(),
    credentials: 'omit',
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  const data = await parseJsonOrThrow(res, 'shared_plan_by_career_plan');
  return data as ApiSharedPlanDetail;
}
