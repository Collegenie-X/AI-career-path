/**
 * 주차 목표 코멘트 종류(진짜문제·바뀐변화 등) 공통 메타.
 * 편집기 입력 UI와 상세(읽기) 표시가 같은 정의를 공유한다.
 */
import type { RoadmapGoalCommentKind } from '../types';

export interface RoadmapGoalCommentKindMeta {
  key: RoadmapGoalCommentKind;
  label: string;
  emoji: string;
  color: string;
}

/** 수동 입력 가능한 코멘트 종류 — 진짜 문제·바뀐 변화를 맨 앞에 둬 핵심 추적을 유도. */
export const GOAL_COMMENT_KINDS: readonly RoadmapGoalCommentKindMeta[] = [
  { key: 'problem', label: '진짜문제', emoji: '🔍', color: '#ef4444' },
  { key: 'change', label: '바뀐변화', emoji: '🔄', color: '#22c55e' },
  { key: 'ai', label: 'AI활용', emoji: '🤖', color: '#6366f1' },
  { key: 'debug', label: '디버깅', emoji: '🔧', color: '#f97316' },
  { key: 'progress', label: '진행', emoji: '⏳', color: '#3b82f6' },
  { key: 'reflection', label: '배운점', emoji: '💡', color: '#eab308' },
  { key: 'note', label: '메모', emoji: '📝', color: '#8b5cf6' },
];

/** 상태 변경 자동 기록 코멘트 표시용 메타 (수동 picker에는 노출하지 않음). */
export const STATUS_COMMENT_META: RoadmapGoalCommentKindMeta = {
  key: 'status',
  label: '상태변경',
  emoji: '🔀',
  color: '#a78bfa',
};

const KIND_META_BY_KEY: Record<RoadmapGoalCommentKind, RoadmapGoalCommentKindMeta> = Object.fromEntries(
  [...GOAL_COMMENT_KINDS, STATUS_COMMENT_META].map(meta => [meta.key, meta]),
) as Record<RoadmapGoalCommentKind, RoadmapGoalCommentKindMeta>;

export function getGoalCommentKindMeta(kind: RoadmapGoalCommentKind): RoadmapGoalCommentKindMeta {
  return KIND_META_BY_KEY[kind] ?? KIND_META_BY_KEY.note;
}

/** ISO 시각을 "방금 전 / N분 전 / N시간 전 / M월 D일"로 표시. */
export function formatGoalCommentTime(iso: string): string {
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return '';
  const diffMinutes = Math.floor((Date.now() - target) / 60000);
  if (diffMinutes < 1) return '방금 전';
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  const date = new Date(iso);
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}
