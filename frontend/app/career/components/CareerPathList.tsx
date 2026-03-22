'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Bookmark, Globe, Sparkles } from 'lucide-react';
import { AccordionSection } from '@/components/accordion';
import { TwoColumnPanelLayout } from '@/components/TwoColumnPanelLayout';
import careerPathTemplates from '@/data/career-path-templates-index';
import communityData from '@/data/share-community.json';
import { LABELS } from '../config';
import { CareerPathDetailPanel } from './CareerPathDetailPanel';
import { CareerPathDetailDialog } from './CareerPathDetailDialog';
import type { CareerPlan } from './CareerPathBuilder';
import type { SharedPlan, UserReactionState } from './community/types';
import {
  TemplateRow,
  MyPublicPlanCard,
  BookmarkedTemplateCard,
  BookmarkedCommunityCard,
} from './CareerPathListCards';

type Template = typeof careerPathTemplates[0];

type CareerPathListProps = {
  onUseTemplate: (template: Template, customTitle: string) => void;
  onNewPath?: () => void;
  myPublicPlans?: CareerPlan[];
  onViewMyPlan?: (plan: CareerPlan) => void;
  /** 현재 선택된 템플릿 ID (controlled — 부모에서 관리) */
  selectedTemplateId?: string | null;
  /** 템플릿 선택 콜백 (controlled — 부모에서 관리) */
  onSelectTemplate?: (template: Template | null) => void;
};

const STAR_FILTERS = [
  { id: 'all',         label: '전체', emoji: '✨' },
  { id: 'highschool',  label: '고입', emoji: '🏫' },
  { id: 'admission',   label: '대입', emoji: '🎓' },
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

/* ─── Main list ─── */
export function CareerPathList({
  onUseTemplate,
  onNewPath,
  myPublicPlans,
  onViewMyPlan,
  selectedTemplateId,
  onSelectTemplate,
}: CareerPathListProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [internalSelectedTemplate, setInternalSelectedTemplate] = useState<Template | null>(null);
  const [showExpandDialog, setShowExpandDialog] = useState(false);

  const isControlled = onSelectTemplate !== undefined;
  const selectedTemplate = isControlled
    ? (careerPathTemplates.find(t => t.id === selectedTemplateId) ?? null)
    : internalSelectedTemplate;

  const handleSelectTemplate = (template: Template | null) => {
    if (isControlled) {
      onSelectTemplate?.(template);
    } else {
      setInternalSelectedTemplate(template);
    }
  };

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
  const bookmarkedTemplates = careerPathTemplates.filter(t => templateBookmarkIds.includes(t.id));
  const bookmarkedCommunityPlans = allSharedPlans.filter(p => reactions.bookmarkedPlanIds.includes(p.id));
  const totalBookmarkCount = bookmarkedTemplates.length + bookmarkedCommunityPlans.length;

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return careerPathTemplates;
    if (activeFilter === 'highschool') {
      return careerPathTemplates.filter(t => (t as { category?: string }).category === 'highschool');
    }
    if (activeFilter === 'admission') {
      return careerPathTemplates.filter(t => (t as { category?: string }).category === 'admission');
    }
    return careerPathTemplates.filter(t => t.starId === activeFilter);
  }, [activeFilter]);

  const handleUseTemplate = (customTitle: string) => {
    if (selectedTemplate) {
      onUseTemplate(selectedTemplate, customTitle);
      handleSelectTemplate(null);
    }
  };

  /* 상세 패널 닫기 — 북마크 동기화 (패널과 동일 localStorage 키) */
  const handleDetailClose = useCallback(() => {
    setTemplateBookmarkIds(loadTemplateBookmarkIds());
    handleSelectTemplate(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isControlled, onSelectTemplate]);

  const exploreListColumn = (
    <div className="space-y-4 pb-4">

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
                isSelected={selectedTemplate?.id === template.id}
                onShowDetail={() => handleSelectTemplate(template)}
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
                  isSelected={selectedTemplate?.id === template.id}
                  onShowDetail={() => handleSelectTemplate(template)}
                  onToggleBookmark={e => handleToggleTemplateBookmark(template.id, e)}
                />
              ))}
            </div>
          )}
        </AccordionSection>
    </div>
  );

  /* controlled: 부모가 오른쪽 패널을 렌더링 — 여기서는 목록만 */
  if (isControlled) {
    return exploreListColumn;
  }

  const emptyDetailTitle = String(LABELS.explore_detail_empty_title ?? '커리어 패스를 선택하세요');
  const emptyDetailSub = String(
    LABELS.explore_detail_empty_sub ?? '왼쪽 목록에서 패스를 누르면 상세 설명이 여기에 표시됩니다',
  );

  return (
    <>
    <TwoColumnPanelLayout
      hasSelection={selectedTemplate !== null}
      onClearSelection={handleDetailClose}
      emptyPlaceholderText={emptyDetailTitle}
      emptyPlaceholderSubText={emptyDetailSub}
      listSlot={exploreListColumn}
      detailSlot={
        selectedTemplate ? (
          <CareerPathDetailPanel
            template={selectedTemplate}
            onClose={handleDetailClose}
            onUseTemplate={handleUseTemplate}
            onExpand={() => setShowExpandDialog(true)}
          />
        ) : null
      }
    />
    {showExpandDialog && selectedTemplate && (
      <CareerPathDetailDialog
        template={selectedTemplate}
        onClose={() => setShowExpandDialog(false)}
        onUseTemplate={(customTitle) => {
          handleUseTemplate(customTitle);
          setShowExpandDialog(false);
        }}
      />
    )}
    </>
  );
}
