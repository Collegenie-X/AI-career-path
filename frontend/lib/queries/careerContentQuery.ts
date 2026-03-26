import { useQuery } from '@tanstack/react-query';
import { buildApiUrl, API_PATHS } from '@/lib/config/api';
import type { Job, Kingdom } from '@/lib/types';

export const careerKingdomsQueryKey = ['careerKingdoms'] as const;

export function careerJobsQueryKey(kingdomId: string | undefined) {
  return ['careerJobs', kingdomId ?? 'all'] as const;
}

const STALE_MS = 5 * 60 * 1000;

function parseKingdomsPayload(data: unknown): Kingdom[] {
  if (!Array.isArray(data)) {
    throw new Error('career_kingdoms_invalid_payload');
  }
  return data as Kingdom[];
}

function parseJobsPayload(data: unknown): Job[] {
  if (!Array.isArray(data)) {
    throw new Error('career_jobs_invalid_payload');
  }
  return data as Job[];
}

export async function fetchCareerKingdoms(): Promise<Kingdom[]> {
  const url = buildApiUrl(API_PATHS.careerKingdoms);
  const res = await fetch(url, { credentials: 'omit', cache: 'no-store' });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`career_kingdoms_failed:${res.status}${text ? `:${text.slice(0, 200)}` : ''}`);
  }
  const json: unknown = await res.json();
  return parseKingdomsPayload(json);
}

export async function fetchCareerJobs(kingdomId?: string): Promise<Job[]> {
  const base = buildApiUrl(API_PATHS.careerJobs);
  const url = kingdomId ? `${base}?kingdom_id=${encodeURIComponent(kingdomId)}` : base;
  const res = await fetch(url, { credentials: 'omit', cache: 'no-store' });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`career_jobs_failed:${res.status}${text ? `:${text.slice(0, 200)}` : ''}`);
  }
  const json: unknown = await res.json();
  return parseJobsPayload(json);
}

export function useCareerKingdomsQuery() {
  return useQuery({
    queryKey: careerKingdomsQueryKey,
    queryFn: fetchCareerKingdoms,
    staleTime: STALE_MS,
  });
}

export function useCareerJobsQuery(kingdomId: string | undefined) {
  return useQuery({
    queryKey: careerJobsQueryKey(kingdomId),
    queryFn: () => fetchCareerJobs(kingdomId),
    enabled: kingdomId !== undefined && kingdomId.length > 0,
    staleTime: STALE_MS,
  });
}
