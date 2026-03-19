'use client';

import { useState } from 'react';
import { Heart, Users, ChevronRight, Globe, Bookmark, BookmarkCheck } from 'lucide-react';
import type { CareerPlan } from './CareerPathBuilder';
import type { SharedPlan } from './community/types';
import careerPathTemplates from '@/data/career-path-templates-index';

export type TemplateCardItem = typeof careerPathTemplates[0];

/* ─── Template row card ─── */
export function TemplateRow({
  template,
  isBookmarked,
  isSelected,
  onShowDetail,
  onToggleBookmark,
}: {
  readonly template: TemplateCardItem;
  readonly isBookmarked: boolean;
  readonly isSelected?: boolean;
  readonly onShowDetail: () => void;
  readonly onToggleBookmark: (e: React.MouseEvent) => void;
}) {
  const [liked, setLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(template.likes);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(l => !l);
    setLocalLikes(n => liked ? n - 1 : n + 1);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className="group rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer active:scale-[0.99] hover:brightness-110"
      style={{
        border: `2px solid ${isSelected ? template.starColor + '80' : template.starColor + '30'}`,
        background: isSelected
          ? `linear-gradient(135deg, ${template.starColor}22, rgba(255,255,255,0.06))`
          : `linear-gradient(135deg, ${template.starColor}12, rgba(255,255,255,0.04))`,
        boxShadow: isSelected
          ? `0 4px 20px ${template.starColor}30, inset 0 1px 0 rgba(255,255,255,0.06)`
          : `0 4px 16px ${template.starColor}15, inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
      onClick={onShowDetail}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onShowDetail(); }}
    >
      <div className="w-full flex items-stretch gap-4 px-5 py-4">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${template.starColor}35, ${template.starColor}12)`,
            border: `2px solid ${template.starColor}40`,
            boxShadow: `0 0 20px ${template.starColor}25`,
          }}
        >
          {template.jobEmoji}
        </div>

        <div className="flex-1 min-w-0 flex items-center gap-3">
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <div className="font-bold text-white text-sm leading-snug line-clamp-2">{template.title}</div>
            {template.description && (
              <div className="text-[12px] text-gray-500 leading-snug line-clamp-1">{template.description}</div>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[12px] text-gray-400">{template.starEmoji} {template.starName}</span>
              <span className="text-[12px] text-gray-600">·</span>
              <span className="text-[12px] text-gray-500">{template.totalItems}개</span>
              <span className="text-[12px] text-gray-600">·</span>
              <span className="text-[12px] text-gray-500">{template.years.length}학년</span>
              {template.authorType === 'official' && (
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: '#6C5CE720', color: '#a78bfa' }}>공식</span>
              )}
              <span className="flex-1" />
              <button
                onClick={handleLike}
                className="flex items-center gap-1 px-2 py-1 rounded-lg transition-all active:scale-95"
                style={liked ? { color: '#FF6477' } : { color: '#555570' }}
              >
                <Heart className="w-3.5 h-3.5" fill={liked ? '#FF6477' : 'none'} />
                <span className="text-[12px] font-semibold">{localLikes}</span>
              </button>
              <button
                onClick={onToggleBookmark}
                className="p-1.5 rounded-lg transition-all active:scale-95"
                style={isBookmarked ? { color: '#FBBF24' } : { color: '#555570' }}
                title={isBookmarked ? '즐겨찾기 해제' : '즐겨찾기'}
              >
                {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 self-center transition-all duration-200 active:scale-95 group-hover:scale-110 group-hover:shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${template.starColor}60, ${template.starColor}35)`,
              border: `2px solid ${template.starColor}70`,
              boxShadow: `0 0 20px ${template.starColor}40, inset 0 1px 0 rgba(255,255,255,0.2)`,
            }}
          >
            <ChevronRight className="w-4 h-4 text-white drop-shadow-md" strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── My public plan card ─── */
export function MyPublicPlanCard({ plan, onClick }: { readonly plan: CareerPlan; readonly onClick: () => void }) {
  const totalItems = plan.years.reduce(
    (s, y) => s + y.items.length + (y.groups ?? []).reduce((gs, g) => gs + g.items.length, 0),
    0,
  );
  const sharedDate = plan.sharedAt
    ? new Date(plan.sharedAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
    : null;

  return (
    <div
      className="group rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 active:scale-[0.99] hover:brightness-110"
      style={{
        border: `2px solid ${plan.starColor}35`,
        background: `linear-gradient(135deg, ${plan.starColor}12, rgba(255,255,255,0.04))`,
        boxShadow: `0 4px 16px ${plan.starColor}15, inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
      onClick={onClick}
    >
      <div className="flex items-center gap-4 px-5 py-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${plan.starColor}35, ${plan.starColor}12)`,
            border: `2px solid ${plan.starColor}40`,
            boxShadow: `0 0 20px ${plan.starColor}25`,
          }}
        >
          {plan.jobEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-white text-sm leading-snug line-clamp-1">{plan.title}</div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[12px] text-gray-400">{plan.starEmoji} {plan.starName}</span>
            <span className="text-[12px] text-gray-600">·</span>
            <span className="text-[12px] text-gray-500">{plan.years.length}학년 · {totalItems}개</span>
            {sharedDate && (
              <>
                <span className="text-[12px] text-gray-600">·</span>
                <span className="text-[12px] text-gray-500">{sharedDate} 공개</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.25)' }}
          >
            <Globe style={{ width: 9, height: 9 }} />공개중
          </span>
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
    </div>
  );
}

/* ─── Bookmarked template card ─── */
export function BookmarkedTemplateCard({
  template,
  isSelected,
  onShowDetail,
  onRemoveBookmark,
}: {
  readonly template: TemplateCardItem;
  readonly isSelected?: boolean;
  readonly onShowDetail: () => void;
  readonly onRemoveBookmark: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      className="group rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 active:scale-[0.99] hover:brightness-110"
      style={{
        border: `2px solid ${isSelected ? template.starColor + '80' : template.starColor + '30'}`,
        background: isSelected
          ? `linear-gradient(135deg, ${template.starColor}22, rgba(255,255,255,0.06))`
          : `linear-gradient(135deg, ${template.starColor}12, rgba(255,255,255,0.04))`,
        boxShadow: `0 4px 16px ${template.starColor}15, inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
      onClick={onShowDetail}
    >
      <div className="flex items-center gap-4 px-5 py-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${template.starColor}35, ${template.starColor}12)`,
            border: `2px solid ${template.starColor}40`,
            boxShadow: `0 0 20px ${template.starColor}25`,
          }}
        >
          {template.jobEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-white text-sm leading-snug line-clamp-1">{template.title}</div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[12px] text-gray-400">{template.starEmoji} {template.starName}</span>
            <span className="text-[12px] text-gray-600">·</span>
            <span className="text-[12px] text-gray-500">{template.totalItems}개 · {template.years.length}학년</span>
            {template.authorType === 'official' && (
              <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: '#6C5CE720', color: '#a78bfa' }}>공식</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onRemoveBookmark}
            className="p-1.5 rounded-lg transition-all active:scale-95 flex-shrink-0"
            style={{ color: '#FBBF24' }}
            title="즐겨찾기 해제"
          >
            <BookmarkCheck className="w-4 h-4" />
          </button>
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 active:scale-95 group-hover:scale-110"
            style={{
              background: `linear-gradient(135deg, ${template.starColor}60, ${template.starColor}35)`,
              border: `2px solid ${template.starColor}70`,
              boxShadow: `0 0 20px ${template.starColor}40, inset 0 1px 0 rgba(255,255,255,0.2)`,
            }}
          >
            <ChevronRight className="w-5 h-5 text-white drop-shadow-md" strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Bookmarked community plan card ─── */
export function BookmarkedCommunityCard({
  plan,
  isLiked,
  likeCount,
  bookmarkCount,
  onToggleLike,
  onToggleBookmark,
}: {
  readonly plan: SharedPlan;
  readonly isLiked: boolean;
  readonly likeCount: number;
  readonly bookmarkCount: number;
  readonly onToggleLike: () => void;
  readonly onToggleBookmark: () => void;
}) {
  const sharedDate = new Date(plan.sharedAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });

  return (
    <div
      className="group rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 active:scale-[0.99] hover:brightness-110"
      style={{
        border: `2px solid ${plan.starColor}30`,
        background: `linear-gradient(135deg, ${plan.starColor}12, rgba(255,255,255,0.04))`,
        boxShadow: `0 4px 16px ${plan.starColor}15, inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
    >
      <div className="flex items-center gap-4 px-5 py-4">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${plan.starColor}35, ${plan.starColor}12)`,
            border: `2px solid ${plan.starColor}40`,
            boxShadow: `0 0 20px ${plan.starColor}25`,
          }}
        >
          {plan.jobEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-white text-sm leading-snug line-clamp-1">{plan.title}</div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[12px] text-gray-400">{plan.ownerEmoji} {plan.ownerName}</span>
            <span className="text-[12px] text-gray-600">·</span>
            <span className="text-[12px] text-gray-500">{plan.jobEmoji} {plan.jobName}</span>
            <span className="text-[12px] text-gray-600">·</span>
            <span className="text-[12px] text-gray-500">{sharedDate}</span>
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
            className="flex items-center gap-1 px-2 py-1 rounded-lg transition-all active:scale-95"
            style={{ color: '#FBBF24' }}
            title="즐겨찾기 해제"
          >
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span className="text-[12px] font-semibold">{bookmarkCount}</span>
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
    </div>
  );
}
