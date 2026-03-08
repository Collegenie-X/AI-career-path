/**
 * 업데이트/활동 시간 표시 유틸
 * - 상대 시간: 방금, n분 전, n시간 전, 어제, n일 전
 * - 구체적 날짜: 3월 21일, 2025년 4월 10일
 */

const MS_MIN = 60 * 1000;
const MS_HOUR = 60 * MS_MIN;
const MS_DAY = 24 * MS_HOUR;

/** 상대 시간 (방금, 5분 전, 2시간 전, 어제, 3일 전) */
export function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 0) return '방금 전';
  const m = Math.floor(diff / MS_MIN);
  if (m < 1) return '방금 전';
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(diff / MS_HOUR);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(diff / MS_DAY);
  if (d === 1) return '어제';
  if (d < 7) return `${d}일 전`;
  return formatShortDate(iso);
}

/** 짧은 날짜 (3월 21일) */
export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

/** 긴 날짜 (2025년 4월 10일) */
export function formatLongDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** 24시간 이내인지 (NEW 뱃지용) */
export function isRecentlyUpdated(iso: string, withinHours = 24): boolean {
  return Date.now() - new Date(iso).getTime() < withinHours * MS_HOUR;
}

/** sharedAt과 updatedAt이 다른지 (수정됨 표시용) */
export function isEdited(sharedAt: string, updatedAt?: string): boolean {
  if (!updatedAt) return false;
  return new Date(updatedAt).getTime() > new Date(sharedAt).getTime();
}

const MS_WEEK = 7 * MS_DAY;

/** 1주일 이상 경과했는지 (선생님 확인용 뱃지) */
export function isOlderThanWeek(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() >= MS_WEEK;
}
