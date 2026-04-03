/**
 * DreamMate 커리어 실행 — `apps.career_plan` API 클라이언트
 */

import { API_PATHS, buildApiUrl } from '@/lib/config/api';
import { getAccessToken } from '@/lib/auth/jwtStorage';
import { fetchWithAuthRetry } from '@/lib/auth/fetchWithAuthRetry';
import { hasCareerPathBackendAuth, sanitizeSharedPlanGroupIds } from '@/lib/career-path/sharedPlanApi';

export { hasCareerPathBackendAuth as hasDreamMateBackendAuth };

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

function unwrapPaged<T>(data: unknown): T[] {
  const raw = data as { results?: unknown[] };
  if (Array.isArray(raw.results)) return raw.results as T[];
  if (Array.isArray(data)) return data as T[];
  return [];
}

export type ApiAuthMeUser = {
  id: string;
  name: string;
  email?: string;
  emoji?: string;
  grade?: string;
};

export async function fetchDreamMateAuthMe(): Promise<ApiAuthMeUser> {
  const url = buildApiUrl(API_PATHS.auth.me);
  const res = await fetchWithAuthRetry(url, {
    method: 'GET',
    headers: authHeaders(),
    credentials: 'omit',
    cache: 'no-store',
  });
  const data = (await parseJsonOrThrow(res, 'dreammate_auth_me')) as ApiAuthMeUser;
  return data;
}

export type ApiRoadmapTodo = {
  id: string;
  week_label?: string | null;
  week_number?: number | null;
  entry_type: string;
  title: string;
  is_done: boolean;
  note?: string | null;
  output_ref?: string | null;
  sort_order: number;
};

export type ApiRoadmapItem = {
  id: string;
  type: string;
  title: string;
  months: number[];
  difficulty: number;
  target_output?: string | null;
  success_criteria?: string | null;
  sort_order: number;
  todos: ApiRoadmapTodo[];
};

export type ApiRoadmapMilestone = {
  id: string;
  title: string;
  description?: string | null;
  month_week_label?: string | null;
  time_log?: string | null;
  result_url?: string | null;
  image_url?: string | null;
  recorded_at?: string | null;
  sort_order: number;
};

export type ApiRoadmapDetail = {
  id: string;
  user: string;
  user_name: string;
  title: string;
  description?: string | null;
  period: string;
  star_color: string;
  focus_item_types: string[];
  final_result_title?: string | null;
  final_result_description?: string | null;
  final_result_url?: string | null;
  final_result_image_url?: string | null;
  items: ApiRoadmapItem[];
  milestones: ApiRoadmapMilestone[];
  created_at: string;
  updated_at: string;
};

export type ApiSharedDreamRoadmapRow = {
  id: string;
  user: string;
  user_name?: string;
  roadmap: ApiRoadmapDetail;
  roadmap_title?: string;
  share_type: 'private' | 'public' | 'space';
  tags: string[];
  group_ids?: string[];
  like_count: number;
  bookmark_count: number;
  view_count: number;
  comment_count: number;
  report_count: number;
  shared_at: string;
  is_hidden: boolean;
  liked_by_me?: boolean;
  bookmarked_by_me?: boolean;
  comments?: ApiSharedDreamRoadmapCommentRow[];
};

export type ApiSharedDreamRoadmapCommentRow = {
  id: string;
  author: {
    id: string;
    name: string;
    email?: string;
    emoji?: string;
    grade?: string;
  };
  content: string;
  parent: string | null;
  created_at: string;
};

export async function fetchDreamMateRoadmapsList(): Promise<ApiRoadmapDetail[]> {
  const url = buildApiUrl(`${API_PATHS.dreamMateRoadmaps}?page_size=200`);
  const res = await fetchWithAuthRetry(url, {
    method: 'GET',
    headers: authHeaders(),
    credentials: 'omit',
    cache: 'no-store',
  });
  const data = await parseJsonOrThrow(res, 'dreammate_roadmaps_list');
  return unwrapPaged<ApiRoadmapDetail>(data);
}

export async function fetchDreamMateRoadmapDetail(roadmapId: string): Promise<ApiRoadmapDetail> {
  const url = buildApiUrl(`/api/v1/career-plan/roadmaps/${roadmapId}/`);
  const res = await fetchWithAuthRetry(url, {
    method: 'GET',
    headers: authHeaders(),
    credentials: 'omit',
    cache: 'no-store',
  });
  const data = (await parseJsonOrThrow(res, 'dreammate_roadmap_detail')) as ApiRoadmapDetail;
  return data;
}

export type RoadmapCreateBody = Record<string, unknown>;

export async function createDreamMateRoadmapApi(
  body: RoadmapCreateBody,
): Promise<ApiRoadmapDetail> {
  const url = buildApiUrl(API_PATHS.dreamMateRoadmaps);
  const res = await fetchWithAuthRetry(url, {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'omit',
    body: JSON.stringify(body),
  });
  const data = (await parseJsonOrThrow(res, 'dreammate_roadmap_create')) as ApiRoadmapDetail;
  return data;
}

export async function updateDreamMateRoadmapApi(
  roadmapId: string,
  body: Partial<RoadmapCreateBody>,
): Promise<ApiRoadmapDetail> {
  const url = buildApiUrl(`/api/v1/career-plan/roadmaps/${roadmapId}/`);
  const res = await fetchWithAuthRetry(url, {
    method: 'PATCH',
    headers: authHeaders(),
    credentials: 'omit',
    body: JSON.stringify(body),
  });
  const data = (await parseJsonOrThrow(res, 'dreammate_roadmap_update')) as ApiRoadmapDetail;
  return data;
}

export async function toggleDreamMateRoadmapTodoApi(todoId: string): Promise<{ is_done: boolean }> {
  const url = buildApiUrl(`/api/v1/career-plan/roadmap-todos/${todoId}/toggle_done/`);
  const res = await fetchWithAuthRetry(url, {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'omit',
  });
  const data = (await parseJsonOrThrow(res, 'dreammate_todo_toggle')) as { is_done: boolean };
  return data;
}

export async function deleteDreamMateRoadmapApi(roadmapId: string): Promise<void> {
  const url = buildApiUrl(`/api/v1/career-plan/roadmaps/${roadmapId}/`);
  const res = await fetchWithAuthRetry(url, {
    method: 'DELETE',
    headers: authHeaders(),
    credentials: 'omit',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`dreammate_roadmap_delete:${res.status}:${text.slice(0, 400)}`);
  }
}

export async function fetchSharedDreamRoadmapsFeed(): Promise<ApiSharedDreamRoadmapRow[]> {
  const url = buildApiUrl(`${API_PATHS.dreamMateSharedDreamRoadmaps}?page_size=200`);
  const res = await fetchWithAuthRetry(url, {
    method: 'GET',
    headers: authHeaders(),
    credentials: 'omit',
    cache: 'no-store',
  });
  const data = await parseJsonOrThrow(res, 'dreammate_shared_feed');
  return unwrapPaged<ApiSharedDreamRoadmapRow>(data);
}

export type ApiSharedDreamRoadmapDetail = ApiSharedDreamRoadmapRow & {
  roadmap: ApiRoadmapDetail;
  comments?: ApiSharedDreamRoadmapCommentRow[];
  liked_by_me?: boolean;
  bookmarked_by_me?: boolean;
};

export async function fetchSharedDreamRoadmapDetail(
  sharedId: string,
): Promise<ApiSharedDreamRoadmapDetail> {
  const url = buildApiUrl(`/api/v1/career-plan/shared-dream-roadmaps/${sharedId}/`);
  const res = await fetchWithAuthRetry(url, {
    method: 'GET',
    headers: authHeaders(),
    credentials: 'omit',
    cache: 'no-store',
  });
  return (await parseJsonOrThrow(res, 'dreammate_shared_detail')) as ApiSharedDreamRoadmapDetail;
}

export async function fetchSharedDreamRoadmapByRoadmapId(
  roadmapId: string,
): Promise<ApiSharedDreamRoadmapRow | null> {
  const url = buildApiUrl(
    `${API_PATHS.dreamMateSharedDreamRoadmaps}?roadmap=${encodeURIComponent(roadmapId)}`,
  );
  const res = await fetchWithAuthRetry(url, {
    method: 'GET',
    headers: authHeaders(),
    credentials: 'omit',
    cache: 'no-store',
  });
  const data = await parseJsonOrThrow(res, 'dreammate_shared_by_roadmap');
  const rows = unwrapPaged<ApiSharedDreamRoadmapRow>(data);
  return rows[0] ?? null;
}

export type SharedDreamRoadmapUpsertPayload = {
  roadmap: string;
  share_type: 'private' | 'public' | 'space';
  description?: string;
  tags?: string[];
  is_hidden?: boolean;
  group_ids?: string[];
};

export async function upsertSharedDreamRoadmapApi(
  payload: SharedDreamRoadmapUpsertPayload,
): Promise<ApiSharedDreamRoadmapRow> {
  const url = buildApiUrl(API_PATHS.dreamMateSharedDreamRoadmaps);
  const body = {
    ...payload,
    group_ids: sanitizeSharedPlanGroupIds(payload.group_ids),
  };
  const res = await fetchWithAuthRetry(url, {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'omit',
    body: JSON.stringify(body),
  });
  const data = (await parseJsonOrThrow(res, 'dreammate_shared_upsert')) as ApiSharedDreamRoadmapRow;
  return data;
}

export async function patchSharedDreamRoadmapApi(
  sharedId: string,
  payload: Partial<Omit<SharedDreamRoadmapUpsertPayload, 'roadmap'>>,
): Promise<ApiSharedDreamRoadmapRow> {
  const url = buildApiUrl(`/api/v1/career-plan/shared-dream-roadmaps/${sharedId}/`);
  const body =
    payload.group_ids !== undefined
      ? { ...payload, group_ids: sanitizeSharedPlanGroupIds(payload.group_ids) }
      : payload;
  const res = await fetchWithAuthRetry(url, {
    method: 'PATCH',
    headers: authHeaders(),
    credentials: 'omit',
    body: JSON.stringify(body),
  });
  const data = (await parseJsonOrThrow(res, 'dreammate_shared_patch')) as ApiSharedDreamRoadmapRow;
  return data;
}

export async function deleteSharedDreamRoadmapApi(sharedId: string): Promise<void> {
  const url = buildApiUrl(`/api/v1/career-plan/shared-dream-roadmaps/${sharedId}/`);
  const res = await fetchWithAuthRetry(url, {
    method: 'DELETE',
    headers: authHeaders(),
    credentials: 'omit',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`dreammate_shared_delete:${res.status}:${text.slice(0, 400)}`);
  }
}

export async function toggleSharedDreamRoadmapLike(
  sharedId: string,
): Promise<{ like_count: number; liked: boolean }> {
  const url = buildApiUrl(`/api/v1/career-plan/shared-dream-roadmaps/${sharedId}/like/`);
  const res = await fetchWithAuthRetry(url, {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'omit',
  });
  const data = (await parseJsonOrThrow(res, 'dreammate_shared_like')) as {
    like_count: number;
    liked: boolean;
  };
  return data;
}

export async function toggleSharedDreamRoadmapBookmark(
  sharedId: string,
): Promise<{ bookmark_count: number; bookmarked: boolean }> {
  const url = buildApiUrl(`/api/v1/career-plan/shared-dream-roadmaps/${sharedId}/bookmark/`);
  const res = await fetchWithAuthRetry(url, {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'omit',
  });
  const data = (await parseJsonOrThrow(res, 'dreammate_shared_bookmark')) as {
    bookmark_count: number;
    bookmarked: boolean;
  };
  return data;
}

export async function postSharedDreamRoadmapComment(
  sharedId: string,
  payload: { content: string; parent?: string | null },
): Promise<ApiSharedDreamRoadmapCommentRow> {
  const url = buildApiUrl(`/api/v1/career-plan/shared-dream-roadmaps/${sharedId}/comments/`);
  const res = await fetchWithAuthRetry(url, {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'omit',
    body: JSON.stringify({
      content: payload.content,
      ...(payload.parent ? { parent: payload.parent } : {}),
    }),
  });
  const data = (await parseJsonOrThrow(res, 'dreammate_shared_comment')) as ApiSharedDreamRoadmapCommentRow;
  return data;
}

export async function deleteSharedDreamRoadmapComment(
  sharedId: string,
  commentId: string,
): Promise<void> {
  const url = buildApiUrl(
    `/api/v1/career-plan/shared-dream-roadmaps/${sharedId}/comments/${commentId}/`,
  );
  const res = await fetchWithAuthRetry(url, {
    method: 'DELETE',
    headers: authHeaders(),
    credentials: 'omit',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`dreammate_comment_delete:${res.status}:${text.slice(0, 400)}`);
  }
}

/**
 * 커리어 패스 `fetchSharedPlans` 와 동일 — 비로그인도 공유 피드 목록 API 호출 가능
 * (백엔드는 비인증 시 `share_type=public` 만 반환).
 */
export function isDreamMateCareerPlanApiFetchEnabled(): boolean {
  return true;
}

/** @deprecated `isDreamMateCareerPlanApiFetchEnabled` 사용 (로그인 여부와 무관하게 피드 조회) */
export function dreamMateRoadmapApiAvailable(): boolean {
  return isDreamMateCareerPlanApiFetchEnabled();
}
