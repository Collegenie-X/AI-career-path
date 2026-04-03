import { API_PATHS, buildApiUrl } from '@/lib/config/api';
import { getAccessToken } from '@/lib/auth/jwtStorage';
import { fetchWithAuthRetry } from '@/lib/auth/fetchWithAuthRetry';
import type { ApiCareerPlanDetail } from '@/lib/career-path/mapCareerPlanApi';

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

/** 목록(페이지네이션)에서 내 패스 id만 수집 후 상세 병렬 로드 */
export async function fetchMyCareerPlanDetails(): Promise<ApiCareerPlanDetail[]> {
  const listUrl = buildApiUrl(
    `${API_PATHS.careerPlans}?page_size=100&is_template=false`
  );
  const res = await fetchWithAuthRetry(listUrl, {
    method: 'GET',
    headers: authHeaders(),
    credentials: 'omit',
    cache: 'no-store',
  });
  const data = await parseJsonOrThrow(res, 'career_plans_list');
  const raw = data as { results?: unknown[] };
  const rows = Array.isArray(raw.results) ? raw.results : Array.isArray(data) ? data : [];
  const ids = rows
    .map((r) => (r && typeof r === 'object' && 'id' in r ? String((r as { id: unknown }).id) : ''))
    .filter(Boolean);

  const details = await Promise.all(ids.map((id) => fetchCareerPlanDetailById(id)));
  return details;
}

export async function fetchCareerPlanDetailById(id: string): Promise<ApiCareerPlanDetail> {
  const url = buildApiUrl(`${API_PATHS.careerPlans}${id}/`);
  const res = await fetchWithAuthRetry(url, {
    method: 'GET',
    headers: authHeaders(),
    credentials: 'omit',
    cache: 'no-store',
  });
  const data = await parseJsonOrThrow(res, 'career_plan_detail');
  return data as ApiCareerPlanDetail;
}

export async function createCareerPlanApi(
  body: Record<string, unknown>
): Promise<ApiCareerPlanDetail> {
  const url = buildApiUrl(API_PATHS.careerPlans);
  const res = await fetchWithAuthRetry(url, {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'omit',
    body: JSON.stringify(body),
  });
  const data = (await parseJsonOrThrow(res, 'career_plan_create')) as { id?: string };
  const id = typeof data.id === 'string' ? data.id : '';
  if (!id) throw new Error('career_plan_create:no_id');
  return fetchCareerPlanDetailById(id);
}

export async function updateCareerPlanApi(
  id: string,
  body: Record<string, unknown>
): Promise<ApiCareerPlanDetail> {
  const url = buildApiUrl(`${API_PATHS.careerPlans}${id}/`);
  const res = await fetchWithAuthRetry(url, {
    method: 'PATCH',
    headers: authHeaders(),
    credentials: 'omit',
    body: JSON.stringify(body),
  });
  await parseJsonOrThrow(res, 'career_plan_update');
  return fetchCareerPlanDetailById(id);
}

export async function deleteCareerPlanApi(id: string): Promise<void> {
  const url = buildApiUrl(`${API_PATHS.careerPlans}${id}/`);
  const res = await fetchWithAuthRetry(url, {
    method: 'DELETE',
    headers: authHeaders(),
    credentials: 'omit',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`career_plan_delete:${res.status}:${text.slice(0, 400)}`);
  }
}

export function hasCareerPathBackendAuth(): boolean {
  return Boolean(getAccessToken());
}
