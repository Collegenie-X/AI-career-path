'use client';

import { useSyncExternalStore } from 'react';

/**
 * 고입 즐겨찾기 — 학교(카테고리별) + 청소년 활동 5대 영역 프로그램.
 * 같은 학교 id가 두 카테고리에 겹칠 수 있어(예: 특성화·비즈니스) 학교는 `카테고리:학교` 키로 저장한다.
 * 이 브라우저(localStorage)에만 남는다.
 * `pinnedAt` 이 있으면 카톡 대화방처럼 보관함 맨 위에 고정된다(나중에 고정한 것이 위).
 */
export type FavoriteSchool = { categoryId: string; schoolId: string; addedAt: string; pinnedAt?: string };
export type FavoriteYouth = { programId: string; addedAt: string; pinnedAt?: string };
export type HighSchoolFavorites = { schools: FavoriteSchool[]; youth: FavoriteYouth[] };

const STORAGE_KEY = 'careerpath.highschool.favorites.v1';
const EMPTY: HighSchoolFavorites = { schools: [], youth: [] };

let cache: HighSchoolFavorites | null = null;
const listeners = new Set<() => void>();

function read(): HighSchoolFavorites {
  if (cache) return cache;
  if (typeof window === 'undefined') return EMPTY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<HighSchoolFavorites>) : {};
    cache = {
      schools: Array.isArray(parsed.schools) ? parsed.schools.filter((s) => s?.categoryId && s?.schoolId) : [],
      youth: Array.isArray(parsed.youth) ? parsed.youth.filter((y) => y?.programId) : [],
    };
  } catch {
    cache = { schools: [], youth: [] };
  }
  return cache;
}

function write(next: HighSchoolFavorites) {
  cache = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore write error
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // 다른 탭에서 바뀌면 다시 읽는다
  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    cache = null;
    listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

export function toggleFavoriteSchool(categoryId: string, schoolId: string) {
  const cur = read();
  const has = cur.schools.some((s) => s.categoryId === categoryId && s.schoolId === schoolId);
  write({
    ...cur,
    schools: has
      ? cur.schools.filter((s) => !(s.categoryId === categoryId && s.schoolId === schoolId))
      : [{ categoryId, schoolId, addedAt: new Date().toISOString() }, ...cur.schools],
  });
}

export function toggleFavoriteYouth(programId: string) {
  const cur = read();
  const has = cur.youth.some((y) => y.programId === programId);
  write({
    ...cur,
    youth: has
      ? cur.youth.filter((y) => y.programId !== programId)
      : [{ programId, addedAt: new Date().toISOString() }, ...cur.youth],
  });
}

export function togglePinSchool(categoryId: string, schoolId: string) {
  const cur = read();
  write({
    ...cur,
    schools: cur.schools.map((s) =>
      s.categoryId === categoryId && s.schoolId === schoolId
        ? { ...s, pinnedAt: s.pinnedAt ? undefined : new Date().toISOString() }
        : s,
    ),
  });
}

export function togglePinYouth(programId: string) {
  const cur = read();
  write({
    ...cur,
    youth: cur.youth.map((y) =>
      y.programId === programId ? { ...y, pinnedAt: y.pinnedAt ? undefined : new Date().toISOString() } : y,
    ),
  });
}

export function clearFavorites(kind: 'schools' | 'youth') {
  write({ ...read(), [kind]: [] });
}

export function useHighSchoolFavorites() {
  const favorites = useSyncExternalStore(subscribe, read, () => EMPTY);
  return {
    favorites,
    isSchoolFavorite: (categoryId: string, schoolId: string) =>
      favorites.schools.some((s) => s.categoryId === categoryId && s.schoolId === schoolId),
    isYouthFavorite: (programId: string) => favorites.youth.some((y) => y.programId === programId),
  };
}
