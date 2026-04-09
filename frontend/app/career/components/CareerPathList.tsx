'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { Bookmark, Globe, Sparkles } from 'lucide-react';
import { AccordionSection } from '@/components/accordion';
import { TwoColumnPanelLayout } from '@/components/TwoColumnPanelLayout';
import { ListPagination } from '@/components/shared/ListPagination';
import careerPathTemplates from '@/data/career-path-templates-index';
import { LABELS } from '../config';
import { CareerPathDetailPanel } from './CareerPathDetailPanel';
import { CareerPathDetailDialog } from './CareerPathDetailDialog';
import type { CareerPlan } from './CareerPathBuilder';
import type { SharedPlan } from './community/types';
import {
  TemplateRow,
  MyPublicPlanCard,
  BookmarkedTemplateCard,
  BookmarkedCommunityCard,
} from './CareerPathListCards';
import { useSharedPlansQuery } from '../hooks/useSharedPlansQuery';
import { useSharedPlanReactions } from '../hooks/useSharedPlanReactions';

type Template = typeof careerPathTemplates[0];

type CareerPathListProps = {
  onUseTemplate: (template: Template, customTitle: string) => void | Promise<void>;
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
  { id: 'job',         label: '취업', emoji: '💼' },
  { id: 'explore',     label: '탐구', emoji: '🔬' },
  { id: 'create',      label: '창작', emoji: '🎨' },
  { id: 'tech',        label: '기술', emoji: '💻' },
  { id: 'nature',      label: '자연', emoji: '🌱' },
  { id: 'connect',     label: '연결', emoji: '🤝' },
  { id: 'order',       label: '질서', emoji: '⚖️' },
  { id: 'communicate', label: '소통', emoji: '📡' },
  { id: 'challenge',   label: '도전', emoji: '🚀' },
];

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
  const { data: sharedPlansFromApi } = useSharedPlansQuery();
  const { reactions, toggleLike, toggleBookmark } = useSharedPlanReactions();

  const [activeFilter, setActiveFilter] = useState('all');
  const [internalSelectedTemplate, setInternalSelectedTemplate] = useState<Template | null>(null);
  const [showExpandDialog, setShowExpandDialog] = useState(false);
  const [bookmarkedTemplatePage, setBookmarkedTemplatePage] = useState(1);
  const [myPublicPage, setMyPublicPage] = useState(1);
  const [templateListPage, setTemplateListPage] = useState(1);

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

  /* ─── Community counts (백엔드 피드 기준, 파생값 — effect+setState로 두면 data 참조 불안정 시 무한 루프 위험) ─── */
  const { likeCounts, bookmarkCounts } = useMemo(() => {
    const like: Record<string, number> = {};
    const bm: Record<string, number> = {};
    sharedPlansFromApi.forEach((p) => {
      like[p.id] = p.likes;
      bm[p.id] = p.bookmarks;
    });
    return { likeCounts: like, bookmarkCounts: bm };
  }, [sharedPlansFromApi]);

  useEffect(() => {
    setTemplateBookmarkIds(loadTemplateBookmarkIds());
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

  const handleToggleLike = useCallback(
    (planId: string) => {
      toggleLike(planId);
    },
    [toggleLike]
  );

  const handleToggleCommunityBookmark = useCallback(
    (planId: string) => {
      toggleBookmark(planId);
    },
    [toggleBookmark]
  );

  const allSharedPlans = sharedPlansFromApi;
  const bookmarkedTemplates = careerPathTemplates.filter(t => templateBookmarkIds.includes(t.id));
  const bookmarkedCommunityPlans = allSharedPlans.filter(p => reactions.bookmarkedPlanIds.includes(p.id));
  const totalBookmarkCount = bookmarkedTemplates.length + bookmarkedCommunityPlans.length;

  useEffect(() => {
    setTemplateListPage(1);
  }, [activeFilter]);

  const ITEMS_PER_PAGE = 10;

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return careerPathTemplates;
    if (activeFilter === 'highschool') {
      return careerPathTemplates.filter(t => (t as { category?: string }).category === 'highschool');
    }
    if (activeFilter === 'admission') {
      return careerPathTemplates.filter(t => (t as { category?: string }).category === 'admission');
    }
    if (activeFilter === 'job') {
      return careerPathTemplates.filter(t => (t as { category?: string }).category === 'job');
    }
    return careerPathTemplates.filter(t => t.starId === activeFilter);
  }, [activeFilter]);

  const paginatedBookmarkedTemplates = useMemo(() => {
    const start = (bookmarkedTemplatePage - 1) * ITEMS_PER_PAGE;
    return bookmarkedTemplates.slice(start, start + ITEMS_PER_PAGE);
  }, [bookmarkedTemplates, bookmarkedTemplatePage]);

  const paginatedMyPublicPlans = useMemo(() => {
    const plans = myPublicPlans ?? [];
    const start = (myPublicPage - 1) * ITEMS_PER_PAGE;
    return plans.slice(start, start + ITEMS_PER_PAGE);
  }, [myPublicPlans, myPublicPage]);

  const paginatedFiltered = useMemo(() => {
    const start = (templateListPage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, templateListPage]);

  const handleUseTemplate = async (customTitle: string) => {
    if (selectedTemplate) {
      await onUseTemplate(selectedTemplate, customTitle);
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
            {paginatedBookmarkedTemplates.map(template => (
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
            <ListPagination
              totalItems={totalBookmarkCount}
              currentPage={bookmarkedTemplatePage}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setBookmarkedTemplatePage}
            />
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
            {paginatedMyPublicPlans.map(plan => (
              <MyPublicPlanCard
                key={plan.id}
                plan={plan}
                onClick={() => onViewMyPlan?.(plan)}
              />
            ))}
            <ListPagination
              totalItems={(myPublicPlans ?? []).length}
              currentPage={myPublicPage}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setMyPublicPage}
            />
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
            <>
              <div className="space-y-3">
                {paginatedFiltered.map(template => (
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
              <ListPagination
                totalItems={filtered.length}
                currentPage={templateListPage}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={setTemplateListPage}
              />
            </>
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
