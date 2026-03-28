'use client';

import { Heart, Bookmark, MessageSquare, Shield, Globe, ChevronRight, Clock } from 'lucide-react';
import { GRADE_YEARS, ITEM_TYPES } from '../../config';
import type { SharedPlan } from './types';
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
  const isOperatorOnly = (plan.shareType as string) === 'operator';
  const commentCount = plan.commentCount ?? plan.operatorComments.length;
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
      className="group rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer active:scale-[0.99] hover:brightness-110"
      style={{
        border: `2px solid ${plan.starColor}30`,
        background: `linear-gradient(135deg, ${plan.starColor}12, rgba(255,255,255,0.04))`,
        boxShadow: `0 4px 16px ${plan.starColor}15, inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
      onClick={onViewDetail}
    >
      {/* ── Main row: emoji + info + reactions + circular arrow ── */}
      <div className="flex items-center gap-4 px-5 py-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${plan.starColor}35, ${plan.starColor}12)`,
            border: `2px solid ${plan.starColor}40`,
            boxShadow: `0 0 20px ${plan.starColor}25`,
          }}
        >
          {plan.jobEmoji}
        </div>

        <div className="flex-1 min-w-0">
          <span className="text-sm font-bold text-white line-clamp-1 block">{plan.title}</span>
          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
            <span className="text-[12px] text-gray-400">{plan.ownerEmoji} {plan.ownerName}</span>
            {gradeInfo && (
              <>
                <span className="text-[12px] text-gray-600">·</span>
                <span className="text-[12px] text-gray-500">{gradeInfo.label}</span>
              </>
            )}
            <span className="text-[12px] text-gray-600">·</span>
            <span className="text-[12px] text-gray-500">{plan.starEmoji} {plan.jobName}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {showNewBadge && (
              <span className="text-[11px] font-black px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(34,197,94,0.2)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.35)' }}>NEW</span>
            )}
            {showCheckNeededBadge && !showNewBadge && (
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(251,191,36,0.15)', color: '#FBBF24', border: '1px solid rgba(251,191,36,0.3)' }} title="1주일 이상 경과 · 확인 필요">
                확인 필요
              </span>
            )}
            {isOperatorOnly ? (
              <span className="flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(108,92,231,0.15)', color: '#a78bfa', border: '1px solid rgba(108,92,231,0.25)' }}>
                <Shield className="w-2.5 h-2.5" />운영자 공유
              </span>
            ) : (
              <span className="flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}>
                <Globe className="w-2.5 h-2.5" />전체 공유
              </span>
            )}
            <span className="text-[12px] text-gray-500">{plan.yearCount}학년 · {plan.itemCount}개</span>
            <span className="text-[12px] text-gray-600">·</span>
            <span className="flex items-center gap-0.5 text-[12px] text-gray-500" title={showEdited ? `수정됨 · ${sharedDate}` : sharedDate}>
              {showEdited && <Clock className="w-2.5 h-2.5" />}{timeAgo}
            </span>
            {commentCount > 0 && (
              <>
                <span className="text-[12px] text-gray-600">·</span>
                <span className="flex items-center gap-0.5 text-[12px] text-gray-400"><MessageSquare className="w-2.5 h-2.5" />{commentCount}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onToggleLike(); }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg transition-all active:scale-95"
            style={isLiked ? { color: '#FF6477' } : { color: '#555570' }}
          >
            <Heart className="w-3.5 h-3.5" fill={isLiked ? '#FF6477' : 'none'} />
            <span className="text-[12px] font-semibold">{likeCount}</span>
          </button>
          <button
            onClick={e => { e.stopPropagation(); onToggleBookmark(); }}
            className="p-1.5 rounded-lg transition-all active:scale-95"
            style={isBookmarked ? { color: '#FBBF24' } : { color: '#555570' }}
            title={isBookmarked ? '즐겨찾기 해제' : '즐겨찾기'}
          >
            <Bookmark className="w-3.5 h-3.5" fill={isBookmarked ? '#FBBF24' : 'none'} />
          </button>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 active:scale-95 group-hover:scale-110"
            style={{
              background: `linear-gradient(135deg, ${plan.starColor}60, ${plan.starColor}35)`,
              border: `2px solid ${plan.starColor}70`,
              boxShadow: `0 0 20px ${plan.starColor}40, inset 0 1px 0 rgba(255,255,255,0.2)`,
            }}
          >
            <ChevronRight className="w-5 h-5 text-white drop-shadow-md" strokeWidth={2.5} />
          </div>
        </div>
      </div>

      {/* Preview items (첫 학년 첫 2개 항목) */}
      {previewItems.length > 0 && (
        <div className="px-5 pb-4 pt-0 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          {previewItems.map(item => {
            const typeConf = ITEM_TYPES.find(t => t.value === item.type);
            return (
              <div key={item.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg" style={{ backgroundColor: `${typeConf?.color ?? plan.starColor}0a` }}>
                <span className="text-[12px] text-gray-300 line-clamp-1 flex-1">{item.title}</span>
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: `${typeConf?.color ?? plan.starColor}20`, color: typeConf?.color ?? plan.starColor }}>{item.month}월</span>
              </div>
            );
          })}
          {(firstYear?.items.length ?? 0) > 2 && (
            <div className="text-[12px] text-gray-600 pl-2">+{(firstYear?.items.length ?? 0) - 2}개 더 보기</div>
          )}
        </div>
      )}
    </div>
  );
}
