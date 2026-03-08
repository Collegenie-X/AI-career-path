'use client';

import { Heart, Bookmark, MessageSquare, Shield, Globe, ChevronRight, Clock } from 'lucide-react';
import { GRADE_YEARS, ITEM_TYPES } from '../../config';
import type { SharedPlan } from './types';
import communityData from '@/data/share-community.json';
import { formatTimeAgo, formatShortDate, isRecentlyUpdated, isEdited, isOlderThanWeek } from './formatTime';

type Props = {
  plan: SharedPlan;
  isLiked: boolean;
  isBookmarked: boolean;
  likeCount: number;
  bookmarkCount: number;
  /** ISO string when user last viewed this plan; used to hide "확인 필요" badge */
  checkedAt?: string;
  onToggleLike: () => void;
  onToggleBookmark: () => void;
  onViewDetail: () => void;
};

export function SharedPlanCardWithReactions({
  plan, isLiked, isBookmarked, likeCount, bookmarkCount,
  checkedAt,
  onToggleLike, onToggleBookmark, onViewDetail,
}: Props) {
  const isOperatorOnly = plan.shareType === 'operator';
  const commentCount = plan.operatorComments.length;
  const gradeInfo = GRADE_YEARS.find(g => g.id === plan.ownerGrade);
  const displayTime = plan.updatedAt ?? plan.sharedAt;
  const sharedDate = formatShortDate(plan.sharedAt);
  const timeAgo = formatTimeAgo(displayTime);
  const showNewBadge = isRecentlyUpdated(displayTime);
  const showEdited = isEdited(plan.sharedAt, plan.updatedAt);
  const isChecked = Boolean(checkedAt && checkedAt >= displayTime);
  const showCheckNeededBadge = isOlderThanWeek(displayTime) && !isChecked;

  /* 첫 번째 학년의 첫 번째 항목 미리보기 */
  const firstYear = plan.years?.[0];
  const previewItems = firstYear?.items.slice(0, 2) ?? [];

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{
        backgroundColor: 'rgba(255,255,255,0.03)',
        border: `1px solid ${plan.starColor}22`,
      }}
    >
      {/* ── Main clickable area ── */}
      <button
        onClick={onViewDetail}
        className="w-full p-4 pb-3 text-left transition-all active:scale-[0.99]"
      >
        {/* Top row: emoji + info + chevron */}
        <div className="flex items-start gap-3">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${plan.starColor}28, ${plan.starColor}10)`,
              border: `1px solid ${plan.starColor}35`,
            }}
          >
            {plan.jobEmoji}
          </div>

          <div className="flex-1 min-w-0">
            <span className="text-sm font-bold text-white line-clamp-1">{plan.title}</span>
            <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
              <span className="text-[10px] text-gray-400">{plan.ownerEmoji} {plan.ownerName}</span>
              {gradeInfo && (
                <>
                  <span className="text-[10px] text-gray-600">·</span>
                  <span className="text-[10px] text-gray-500">{gradeInfo.label}</span>
                </>
              )}
              <span className="text-[10px] text-gray-600">·</span>
              <span className="text-[10px] text-gray-500">{plan.starEmoji} {plan.jobName}</span>
            </div>

            {/* Badges row */}
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              {showNewBadge && (
                <span
                  className="text-[9px] font-black px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(34,197,94,0.2)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.35)' }}
                >
                  NEW
                </span>
              )}
              {showCheckNeededBadge && !showNewBadge && (
                <span
                  className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(251,191,36,0.15)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.3)' }}
                  title={String((communityData.meta?.ui as Record<string, string>)?.checkNeededBadgeTitle ?? '1주일 이상 경과 · 확인 필요')}
                >
                  {String((communityData.meta?.ui as Record<string, string>)?.checkNeededBadge ?? '확인 필요')}
                </span>
              )}
              {isOperatorOnly ? (
                <span
                  className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(108,92,231,0.15)', color: '#a78bfa', border: '1px solid rgba(108,92,231,0.25)' }}
                >
                  <Shield className="w-2.5 h-2.5" />운영자 공유
                </span>
              ) : (
                <span
                  className="flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}
                >
                  <Globe className="w-2.5 h-2.5" />전체 공유
                </span>
              )}
              <span className="text-[10px] text-gray-500">{plan.yearCount}학년 · {plan.itemCount}개</span>
              <span className="text-[10px] text-gray-600">·</span>
              <span className="flex items-center gap-0.5 text-[10px] text-gray-500" title={showEdited ? `수정됨 · ${sharedDate}` : sharedDate}>
                {showEdited && <Clock className="w-2.5 h-2.5" />}
                {timeAgo}
              </span>
              {commentCount > 0 && (
                <>
                  <span className="text-[10px] text-gray-600">·</span>
                  <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                    <MessageSquare className="w-2.5 h-2.5" />{commentCount}
                  </span>
                </>
              )}
            </div>
          </div>

          <ChevronRight className="w-4 h-4 text-gray-600 flex-shrink-0 mt-2" />
        </div>

        {/* Preview items (첫 학년 첫 2개 항목) */}
        {previewItems.length > 0 && (
          <div className="mt-3 space-y-1">
            {previewItems.map(item => {
              const typeConf = ITEM_TYPES.find(t => t.value === item.type);
              return (
                <div
                  key={item.id}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
                  style={{ backgroundColor: `${typeConf?.color ?? plan.starColor}0a` }}
                >
                  <span className="text-sm flex-shrink-0">{typeConf?.emoji ?? '📌'}</span>
                  <span className="text-[11px] text-gray-300 line-clamp-1 flex-1">{item.title}</span>
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: `${typeConf?.color ?? plan.starColor}20`, color: typeConf?.color ?? plan.starColor }}
                  >
                    {item.month}월
                  </span>
                </div>
              );
            })}
            {(firstYear?.items.length ?? 0) > 2 && (
              <div className="text-[10px] text-gray-600 pl-2">
                +{(firstYear?.items.length ?? 0) - 2}개 더 보기
              </div>
            )}
          </div>
        )}
      </button>

      {/* ── Reaction bar ── */}
      <div
        className="flex items-center gap-1 px-4 pb-3 pt-1"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        <button
          onClick={e => { e.stopPropagation(); onToggleLike(); }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all active:scale-90"
          style={isLiked
            ? { backgroundColor: 'rgba(255,100,119,0.12)', border: '1px solid rgba(255,100,119,0.25)' }
            : { backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <Heart
            className="w-3.5 h-3.5 transition-all"
            style={{ color: isLiked ? '#FF6477' : '#555570' }}
            fill={isLiked ? '#FF6477' : 'none'}
          />
          <span className="text-[10px] font-bold" style={{ color: isLiked ? '#FF6477' : '#555570' }}>
            {likeCount}
          </span>
        </button>

        <button
          onClick={e => { e.stopPropagation(); onToggleBookmark(); }}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all active:scale-90"
          style={isBookmarked
            ? { backgroundColor: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.25)' }
            : { backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <Bookmark
            className="w-3.5 h-3.5 transition-all"
            style={{ color: isBookmarked ? '#FBBF24' : '#555570' }}
            fill={isBookmarked ? '#FBBF24' : 'none'}
          />
          <span className="text-[10px] font-bold" style={{ color: isBookmarked ? '#FBBF24' : '#555570' }}>
            {bookmarkCount}
          </span>
        </button>

        <span className="flex-1" />

        <button
          onClick={onViewDetail}
          className="text-[10px] text-gray-600 flex items-center gap-0.5 transition-all hover:text-gray-400"
        >
          자세히 보기 <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
