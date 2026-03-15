'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Heart, Users, ChevronRight,
  Sparkles, BookOpen, Star, Globe, Bookmark, BookmarkCheck,
} from 'lucide-react';
import { AccordionSection } from '@/components/accordion';
import templates from '@/data/career-path-templates.json';
import communityData from '@/data/share-community.json';
import { CareerPathDetailDialog } from './CareerPathDetailDialog';
import type { CareerPlan } from './CareerPathBuilder';
import type { SharedPlan, UserReactionState } from './community/types';

type Template = typeof templates[0];

type CareerPathListProps = {
  onUseTemplate: (template: Template, customTitle: string) => void;
  onNewPath: () => void;
  myPublicPlans?: CareerPlan[];
  onViewMyPlan?: (plan: CareerPlan) => void;
};

const STAR_FILTERS = [
  { id: 'all',         label: '전체', emoji: '✨' },
  { id: 'explore',     label: '탐구', emoji: '🔬' },
  { id: 'create',      label: '창작', emoji: '🎨' },
  { id: 'tech',        label: '기술', emoji: '💻' },
  { id: 'nature',      label: '자연', emoji: '🌱' },
  { id: 'connect',     label: '연결', emoji: '🤝' },
  { id: 'order',       label: '질서', emoji: '⚖️' },
  { id: 'communicate', label: '소통', emoji: '📡' },
  { id: 'challenge',   label: '도전', emoji: '🚀' },
];

const COMMUNITY_REACTIONS_KEY = 'community_reactions_v1';
const TEMPLATE_BOOKMARKS_KEY  = 'template_bookmarks_v1';

/* ─── localStorage helpers ─── */
function loadTemplateBookmarkIds(): string[] {
  try {
    const raw = localStorage.getItem(TEMPLATE_BOOKMARKS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch { return []; }
}

function saveTemplateBookmarkIds(ids: string[]): void {
  try { localStorage.setItem(TEMPLATE_BOOKMARKS_KEY, JSON.stringify(ids)); } catch {}
}

/* ─── Template row card ─── */
function TemplateRow({
  template,
  isBookmarked,
  onShowDetail,
  onToggleBookmark,
}: {
  template: Template;
  isBookmarked: boolean;
  onShowDetail: () => void;
  onToggleBookmark: (e: React.MouseEvent) => void;
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
      className="group rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer active:scale-[0.99] hover:brightness-110"
      style={{
        border: `2px solid ${template.starColor}30`,
        background: `linear-gradient(135deg, ${template.starColor}12, rgba(255,255,255,0.04))`,
        boxShadow: `0 4px 16px ${template.starColor}15, inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
      onClick={onShowDetail}
    >
      <div className="w-full flex items-stretch gap-4 px-5 py-4">
        {/* 큰 아이콘: 전체 좌측 고정 */}
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

        {/* 우측: 제목 + 메타 + 액션 */}
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <div className="flex-1 min-w-0 flex flex-col gap-1">
            <div className="font-bold text-white text-sm leading-snug line-clamp-2">
              {template.title}
            </div>
            {template.description && (
              <div className="text-[12px] text-gray-500 leading-snug line-clamp-1">
                {template.description}
              </div>
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
                {isBookmarked
                  ? <BookmarkCheck className="w-3.5 h-3.5" />
                  : <Bookmark className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          {/* 화살표: 2줄 옆 우측, 수직 중앙 정렬 */}
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
function MyPublicPlanCard({ plan, onClick }: { plan: CareerPlan; onClick: () => void }) {
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

/* ─── Bookmarked template card (탐색 즐겨찾기) ─── */
function BookmarkedTemplateCard({
  template,
  onShowDetail,
  onRemoveBookmark,
}: {
  template: Template;
  onShowDetail: () => void;
  onRemoveBookmark: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      className="group rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 active:scale-[0.99] hover:brightness-110"
      style={{
        border: `2px solid ${template.starColor}30`,
        background: `linear-gradient(135deg, ${template.starColor}12, rgba(255,255,255,0.04))`,
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
function BookmarkedCommunityCard({
  plan,
  isLiked,
  likeCount,
  bookmarkCount,
  onToggleLike,
  onToggleBookmark,
}: {
  plan: SharedPlan;
  isLiked: boolean;
  likeCount: number;
  bookmarkCount: number;
  onToggleLike: () => void;
  onToggleBookmark: () => void;
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

/* ─── Main list ─── */
export function CareerPathList({ onUseTemplate, onNewPath, myPublicPlans, onViewMyPlan }: CareerPathListProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  /* ─── Template bookmarks ─── */
  const [templateBookmarkIds, setTemplateBookmarkIds] = useState<string[]>([]);

  /* ─── Community reactions ─── */
  const [reactions, setReactions] = useState<UserReactionState>({ likedPlanIds: [], bookmarkedPlanIds: [] });
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    (communityData.sharedPlans as SharedPlan[]).forEach(p => { counts[p.id] = p.likes; });
    return counts;
  });
  const [bookmarkCounts, setBookmarkCounts] = useState<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    (communityData.sharedPlans as SharedPlan[]).forEach(p => { counts[p.id] = p.bookmarks; });
    return counts;
  });

  /* Load from localStorage on mount */
  useEffect(() => {
    setTemplateBookmarkIds(loadTemplateBookmarkIds());

    try {
      const raw = localStorage.getItem(COMMUNITY_REACTIONS_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as UserReactionState;
      setReactions(saved);
      setLikeCounts(() => {
        const counts: Record<string, number> = {};
        (communityData.sharedPlans as SharedPlan[]).forEach(p => {
          counts[p.id] = p.likes + (saved.likedPlanIds.includes(p.id) ? 1 : 0);
        });
        return counts;
      });
      setBookmarkCounts(() => {
        const counts: Record<string, number> = {};
        (communityData.sharedPlans as SharedPlan[]).forEach(p => {
          counts[p.id] = p.bookmarks + (saved.bookmarkedPlanIds.includes(p.id) ? 1 : 0);
        });
        return counts;
      });
    } catch {}
  }, []);

  /* Template bookmark toggle */
  const handleToggleTemplateBookmark = useCallback((templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTemplateBookmarkIds(prev => {
      const next = prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId];
      saveTemplateBookmarkIds(next);
      return next;
    });
  }, []);

  /* Community like toggle */
  const handleToggleLike = useCallback((planId: string) => {
    setReactions(prev => {
      const wasLiked = prev.likedPlanIds.includes(planId);
      const updated: UserReactionState = {
        ...prev,
        likedPlanIds: wasLiked
          ? prev.likedPlanIds.filter(id => id !== planId)
          : [...prev.likedPlanIds, planId],
      };
      localStorage.setItem(COMMUNITY_REACTIONS_KEY, JSON.stringify(updated));
      const base = (communityData.sharedPlans as SharedPlan[]).find(p => p.id === planId)?.likes ?? 0;
      setLikeCounts(prevCounts => ({ ...prevCounts, [planId]: base + (wasLiked ? 0 : 1) }));
      return updated;
    });
  }, []);

  /* Community bookmark toggle */
  const handleToggleCommunityBookmark = useCallback((planId: string) => {
    setReactions(prev => {
      const wasBookmarked = prev.bookmarkedPlanIds.includes(planId);
      const updated: UserReactionState = {
        ...prev,
        bookmarkedPlanIds: wasBookmarked
          ? prev.bookmarkedPlanIds.filter(id => id !== planId)
          : [...prev.bookmarkedPlanIds, planId],
      };
      localStorage.setItem(COMMUNITY_REACTIONS_KEY, JSON.stringify(updated));
      const base = (communityData.sharedPlans as SharedPlan[]).find(p => p.id === planId)?.bookmarks ?? 0;
      setBookmarkCounts(prevCounts => ({ ...prevCounts, [planId]: base + (wasBookmarked ? 0 : 1) }));
      return updated;
    });
  }, []);

  /* Derived data */
  const allSharedPlans = communityData.sharedPlans as SharedPlan[];
  const bookmarkedTemplates = templates.filter(t => templateBookmarkIds.includes(t.id));
  const bookmarkedCommunityPlans = allSharedPlans.filter(p => reactions.bookmarkedPlanIds.includes(p.id));
  const totalBookmarkCount = bookmarkedTemplates.length + bookmarkedCommunityPlans.length;

  const filtered = useMemo(() => {
    return activeFilter === 'all' ? templates : templates.filter(t => t.starId === activeFilter);
  }, [activeFilter]);

  const handleUseTemplate = (customTitle: string) => {
    if (selectedTemplate) {
      onUseTemplate(selectedTemplate, customTitle);
      setSelectedTemplate(null);
    }
  };

  /* When detail dialog closes, re-sync template bookmarks (dialog also writes to localStorage) */
  const handleDetailClose = useCallback(() => {
    setTemplateBookmarkIds(loadTemplateBookmarkIds());
    setSelectedTemplate(null);
  }, []);

  return (
    <>
      <div className="space-y-4 pb-24">

        {/* ── Hero header ── */}
        <div
          className="relative rounded-3xl overflow-hidden px-5 py-6"
          style={{
            background: 'linear-gradient(135deg, rgba(108,92,231,0.28) 0%, rgba(168,85,247,0.18) 50%, rgba(59,130,246,0.12) 100%)',
            border: '1.5px solid rgba(108,92,231,0.35)',
          }}
        >
          <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #a855f7, transparent)' }} />
          <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full opacity-15 pointer-events-none"
            style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4" style={{ color: '#a78bfa' }} />
              <span className="text-xs font-bold" style={{ color: '#a78bfa' }}>커리어 패스 탐색</span>
            </div>
            <h2 className="text-2xl font-black text-white leading-tight mb-1.5">
              나의 진로 로드맵,<br />
              <span className="bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                여기서 찾아보세요
              </span>
            </h2>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              다양한 직업의 커리어 패스를 참고하거나<br />나만의 패스를 직접 만들어 보세요.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(108,92,231,0.25)' }}>
                  <BookOpen className="w-3.5 h-3.5" style={{ color: '#a78bfa' }} />
                </div>
                <div>
                  <div className="text-sm font-black text-white">{templates.length}</div>
                  <div className="text-[12px] text-gray-500 -mt-0.5">커리어 패스</div>
                </div>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(59,130,246,0.2)' }}>
                  <Star className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div>
                  <div className="text-sm font-black text-white">8</div>
                  <div className="text-[12px] text-gray-500 -mt-0.5">왕국</div>
                </div>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(34,197,94,0.18)' }}>
                  <Users className="w-3.5 h-3.5 text-green-400" />
                </div>
                <div>
                  <div className="text-sm font-black text-white">
                    {templates.reduce((s, t) => s + t.uses, 0).toLocaleString()}
                  </div>
                  <div className="text-[12px] text-gray-500 -mt-0.5">총 사용</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 즐겨찾기 섹션 (아코디언) ── */}
        {totalBookmarkCount > 0 && (
          <AccordionSection
            defaultOpen={true}
            header={
              <div className="flex items-center gap-2">
                <Bookmark className="w-3.5 h-3.5" style={{ color: '#FBBF24' }} />
                <span className="text-xs font-bold text-white">즐겨찾기</span>
                <span className="text-[12px] text-gray-500">{totalBookmarkCount}개 저장됨</span>
              </div>
            }
          >
            {bookmarkedTemplates.map(template => (
              <BookmarkedTemplateCard
                key={template.id}
                template={template}
                onShowDetail={() => setSelectedTemplate(template)}
                onRemoveBookmark={e => handleToggleTemplateBookmark(template.id, e)}
              />
            ))}
            {bookmarkedCommunityPlans.map(plan => (
              <BookmarkedCommunityCard
                key={plan.id}
                plan={plan}
                isLiked={reactions.likedPlanIds.includes(plan.id)}
                likeCount={likeCounts[plan.id] ?? plan.likes}
                bookmarkCount={bookmarkCounts[plan.id] ?? plan.bookmarks}
                onToggleLike={() => handleToggleLike(plan.id)}
                onToggleBookmark={() => handleToggleCommunityBookmark(plan.id)}
              />
            ))}
            <div className="h-px mt-3" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
          </AccordionSection>
        )}

        {/* ── 내가 공유한 패스 섹션 (아코디언) ── */}
        {(myPublicPlans ?? []).length > 0 && (
          <AccordionSection
            defaultOpen={true}
            header={
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5" style={{ color: '#22C55E' }} />
                <span className="text-xs font-bold text-white">내가 공유한 패스</span>
                <span className="text-[12px] text-gray-500">{(myPublicPlans ?? []).length}개 공개중</span>
              </div>
            }
          >
            {(myPublicPlans ?? []).map(plan => (
              <MyPublicPlanCard
                key={plan.id}
                plan={plan}
                onClick={() => onViewMyPlan?.(plan)}
              />
            ))}
            <div className="h-px mt-3" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
          </AccordionSection>
        )}

        {/* ── 커리어 패스 목록 (아코디언) ── */}
        <AccordionSection
          defaultOpen={true}
          header={
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" style={{ color: '#a78bfa' }} />
              <span className="text-xs font-bold text-white">커리어 패스</span>
              <span className="text-[12px] text-gray-500">{filtered.length}개</span>
            </div>
          }
        >
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-hide mb-3">
            {STAR_FILTERS.map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={activeFilter === f.id
                  ? { backgroundColor: '#6C5CE7', color: '#fff', boxShadow: '0 0 10px #6C5CE755' }
                  : { backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {f.emoji} {f.label}
              </button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <Sparkles className="w-8 h-8 text-gray-700 mx-auto mb-3" />
              <p className="text-sm text-gray-500">해당 왕국의 커리어 패스가 없어요</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(template => (
                <TemplateRow
                  key={template.id}
                  template={template}
                  isBookmarked={templateBookmarkIds.includes(template.id)}
                  onShowDetail={() => setSelectedTemplate(template)}
                  onToggleBookmark={e => handleToggleTemplateBookmark(template.id, e)}
                />
              ))}
            </div>
          )}
        </AccordionSection>
      </div>

      {/* Detail dialog — onClose re-syncs bookmark state */}
      {selectedTemplate && (
        <CareerPathDetailDialog
          template={selectedTemplate}
          onClose={handleDetailClose}
          onUseTemplate={handleUseTemplate}
        />
      )}
    </>
  );
}
