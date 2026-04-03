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

export async function fetchCareerPlanTemplates(): Promise<ApiCareerPlanDetail[]> {
  const url = buildApiUrl(`${API_PATHS.careerPlans}?page_size=100&is_template=true`);
  const res = await fetchWithAuthRetry(url, {
    method: 'GET',
    headers: authHeaders(),
    credentials: 'omit',
    cache: 'no-store',
  });
  const data = await parseJsonOrThrow(res, 'career_plan_templates');
  const raw = data as { results?: unknown[] };
  const rows = Array.isArray(raw.results) ? raw.results : Array.isArray(data) ? data : [];
  return rows as ApiCareerPlanDetail[];
}

export async function useTemplateApi(
  templateId: string,
  customTitle: string
): Promise<ApiCareerPlanDetail> {
  const url = buildApiUrl(`${API_PATHS.careerPlans}${templateId}/use_template/`);
  const res = await fetchWithAuthRetry(url, {
    method: 'POST',
    headers: authHeaders(),
    credentials: 'omit',
    body: JSON.stringify({ title: customTitle }),
  });
  const data = await parseJsonOrThrow(res, 'use_template');
  return data as ApiCareerPlanDetail;
}
