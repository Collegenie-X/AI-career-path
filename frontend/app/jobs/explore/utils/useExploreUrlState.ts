'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export type ExploreUrlPatch = Record<string, string | null | undefined>;

/**
 * 탐색 페이지 전역 URL 상태 헬퍼.
 * - searchParams: 현재 URL의 쿼리스트링 (reactive)
 * - patchUrl(patch): 일부 키만 갱신 (null/undefined 값은 제거). pushState 대신 replaceState 사용해 히스토리 오염 방지
 */
export function useExploreUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const patchUrl = useCallback(
    (patch: ExploreUrlPatch) => {
      const next = new URLSearchParams(searchParams?.toString() ?? '');
      for (const [key, value] of Object.entries(patch)) {
        if (value == null || value === '') {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      }
      const qs = next.toString();
      const url = qs ? `${pathname}?${qs}` : pathname;
      router.replace(url, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  return { searchParams, patchUrl };
}

/** 클립보드에 현재 URL 복사 — 성공 여부 boolean 반환 */
export async function copyCurrentUrl(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  const url = window.location.href;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return true;
    }
  } catch {
    // fallthrough to legacy fallback
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = url;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}
