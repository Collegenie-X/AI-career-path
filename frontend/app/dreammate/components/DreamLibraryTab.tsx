'use client';

import { useEffect, useState } from 'react';
import { Search, Heart, Bookmark, Plus } from 'lucide-react';
import { TwoColumnPanelLayout, DetailPanelScrollContainer } from '@/components/TwoColumnPanelLayout';
import { RESOURCE_CATEGORIES, DREAM_LIST_ITEMS_PER_PAGE, LABELS } from '../config';
import { ListPagination } from './ListPagination';
import type { DreamResource, DreamResourceComment, ResourceCategoryId } from '../types';
import {
  DreamLibraryResourceFormDialog,
  type DreamLibraryResourceFormPayload,
} from './DreamLibraryResourceFormDialog';
import { DreamLibraryResourceDetailDialog } from './DreamLibraryResourceDetailDialog';

function hasDisplayableResourceSource(resource: DreamResource): boolean {
  const hasValidUrl = Boolean(resource.resourceUrl?.trim());
  const hasMarkdownAttachment = Boolean(resource.attachmentMarkdownContent?.trim());
  const hasPdfAttachmentData = Boolean(resource.attachmentDataUrl?.trim());
  return hasValidUrl || hasMarkdownAttachment || hasPdfAttachmentData;
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return `${Math.floor(days / 7)}주 전`;
}

/* ─── Resource Card ─── */
function ResourceCard({
  resource,
  isLiked,
  isBookmarked,
  isSelected,
  onOpen,
  onToggleLike,
  onToggleBookmark,
}: {
  resource: DreamResource;
  isLiked: boolean;
  isBookmarked: boolean;
  isSelected?: boolean;
  onOpen: () => void;
  onToggleLike: () => void;
  onToggleBookmark: () => void;
}) {
  const cat = RESOURCE_CATEGORIES.find(c => c.id === resource.category);

  return (
    <div
      onClick={onOpen}
      onKeyDown={event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen();
        }
      }}
      role="button"
      tabIndex={0}
      className="rounded-2xl p-4 transition-all"
      style={{
        backgroundColor: isSelected ? `${cat?.color ?? '#6C5CE7'}18` : `${cat?.color ?? '#6C5CE7'}06`,
        border: `1px solid ${isSelected ? `${cat?.color ?? '#6C5CE7'}45` : `${cat?.color ?? '#6C5CE7'}18`}`,
        boxShadow: isSelected ? `inset 3px 0 0 0 ${cat?.color ?? '#6C5CE7'}` : undefined,
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
          style={{ backgroundColor: `${cat?.color ?? '#6C5CE7'}18` }}
        >
          {cat?.emoji ?? '📄'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span
              className="text-sm font-bold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: `${cat?.color ?? '#6C5CE7'}18`, color: cat?.color ?? '#6C5CE7' }}
            >
              {cat?.label}
            </span>
            <span className="text-sm text-gray-500">{formatTimeAgo(resource.createdAt)}</span>
          </div>
          <h4 className="text-sm font-bold text-white mb-1 line-clamp-2">{resource.title}</h4>
          <p className="text-sm text-gray-400 line-clamp-2 mb-2">{resource.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-2">
            {resource.tags.slice(0, 4).map(tag => (
              <span
                key={tag}
                className="text-sm px-1.5 py-0.5 rounded-md"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Author & actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{resource.authorEmoji}</span>
              <span className="text-sm text-gray-400">{resource.authorName}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={event => {
                  event.stopPropagation();
                  onToggleLike();
                }}
                className="flex items-center gap-1 text-sm transition-all"
                style={{ color: isLiked ? '#EF4444' : '#6B7280' }}
              >
                <Heart className="w-3 h-3" fill={isLiked ? '#EF4444' : 'none'} />
                {resource.likes + (isLiked ? 1 : 0)}
              </button>
              <button
                onClick={event => {
                  event.stopPropagation();
                  onToggleBookmark();
                }}
                className="flex items-center gap-1 text-sm transition-all"
                style={{ color: isBookmarked ? '#FBBF24' : '#6B7280' }}
              >
                <Bookmark className="w-3 h-3" fill={isBookmarked ? '#FBBF24' : 'none'} />
                {resource.bookmarks + (isBookmarked ? 1 : 0)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main export ─── */
interface DreamLibraryTabProps {
  resources?: DreamResource[];
  currentUserId: string;
  resourceCommentsByResourceId: Record<string, DreamResourceComment[]>;
  likedResourceIds?: string[];
  bookmarkedResourceIds?: string[];
  onToggleLikeResource: (id: string) => void;
  onToggleBookmarkResource: (id: string) => void;
  onCreateResource: (payload: DreamLibraryResourceFormPayload) => void;
  onUpdateResource: (resourceId: string, payload: DreamLibraryResourceFormPayload) => void;
  onDeleteResource: (resourceId: string) => void;
  onCreateResourceComment: (resourceId: string, content: string) => void;
  onReportResource: (resourceId: string, reasonId: string, detail: string) => void;
  /** 히어로 섹션 "자료 올리기" 버튼 클릭 시 다이얼로그 열기 */
  openCreateDialog?: boolean;
  onOpenCreateDialogDismiss?: () => void;
}

export function DreamLibraryTab({
  resources = [],
  currentUserId,
  resourceCommentsByResourceId,
  likedResourceIds = [],
  bookmarkedResourceIds = [],
  onToggleLikeResource,
  onToggleBookmarkResource,
  onCreateResource,
  onUpdateResource,
  onDeleteResource,
  onCreateResourceComment,
  onReportResource,
  openCreateDialog = false,
  onOpenCreateDialogDismiss,
}: DreamLibraryTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategoryId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    if (openCreateDialog) {
      setIsCreateDialogOpen(true);
      onOpenCreateDialogDismiss?.();
    }
  }, [openCreateDialog, onOpenCreateDialogDismiss]);

  const allCategories: { id: ResourceCategoryId | 'all'; label: string; emoji: string; color: string }[] = [
    { id: 'all', label: '전체', emoji: '✨', color: '#6C5CE7' },
    ...RESOURCE_CATEGORIES,
  ];

  const resourcesWithSource = resources.filter(hasDisplayableResourceSource);

  const filtered = resourcesWithSource.filter(res => {
    if (selectedCategory !== 'all' && res.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = res.title.toLowerCase().includes(q);
      const matchesTags = res.tags.some(t => t.toLowerCase().includes(q));
      const matchesDesc = res.description.toLowerCase().includes(q);
      if (!matchesTitle && !matchesTags && !matchesDesc) return false;
    }
    return true;
  });

  const categoryCounts = RESOURCE_CATEGORIES.map(cat => ({
    ...cat,
    count: resourcesWithSource.filter(r => r.category === cat.id).length,
  }));

  const selectedResource = resourcesWithSource.find(resource => resource.id === selectedResourceId) ?? null;
  const editingResource = resourcesWithSource.find(resource => resource.id === editingResourceId) ?? null;

  const paginatedFiltered = filtered.slice(
    (currentPage - 1) * DREAM_LIST_ITEMS_PER_PAGE,
    currentPage * DREAM_LIST_ITEMS_PER_PAGE,
  );

  const listColumnInner = (
    <div className="space-y-4 pb-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-white">{LABELS.libraryTitle}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{LABELS.librarySubtitle}</p>
        </div>
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="h-8 px-3 rounded-lg text-sm font-bold flex items-center gap-1.5 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #6C5CE7, #a855f7)', color: '#fff' }}
        >
          <Plus className="w-3.5 h-3.5" />
          {LABELS.uploadResourceButton}
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={LABELS.librarySearchPlaceholder}
          className="w-full h-10 pl-10 pr-4 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {allCategories.map(cat => {
          const isActive = selectedCategory === cat.id;
          const count = cat.id === 'all' ? resourcesWithSource.length : categoryCounts.find(c => c.id === cat.id)?.count ?? 0;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="flex flex-col items-center gap-1 py-3 rounded-xl text-center transition-all"
              style={isActive
                ? { background: `linear-gradient(135deg, ${cat.color}28, ${cat.color}10)`, border: `1.5px solid ${cat.color}50` }
                : { backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <span className="text-lg">{cat.emoji}</span>
              <span className="text-sm font-bold" style={{ color: isActive ? cat.color : 'rgba(255,255,255,0.5)' }}>
                {cat.label}
              </span>
              <span className="text-sm text-gray-500">{count}건</span>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
          <span className="text-4xl">📚</span>
          <div>
            <p className="text-sm font-bold text-white">{LABELS.libraryEmpty}</p>
            <p className="text-sm text-gray-400 mt-1">{LABELS.libraryEmptyDesc}</p>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {paginatedFiltered.map(res => (
              <ResourceCard
                key={res.id}
                resource={res}
                isLiked={likedResourceIds.includes(res.id)}
                isBookmarked={bookmarkedResourceIds.includes(res.id)}
                isSelected={selectedResourceId === res.id}
                onOpen={() => setSelectedResourceId(res.id)}
                onToggleLike={() => onToggleLikeResource(res.id)}
                onToggleBookmark={() => onToggleBookmarkResource(res.id)}
              />
            ))}
          </div>
          <ListPagination
            totalItems={filtered.length}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );

  const emptyDetailTitle = String(LABELS.libraryDetailEmptyTitle ?? '자료를 선택하세요');
  const emptyDetailSub = String(LABELS.libraryDetailEmptySub ?? '왼쪽 목록에서 자료를 클릭하면 상세 내용이 여기에 표시됩니다');

  return (
    <div className="pb-28 md:pb-8">
      <TwoColumnPanelLayout
        hasSelection={selectedResource !== null}
        onClearSelection={() => setSelectedResourceId(null)}
        emptyPlaceholderText={emptyDetailTitle}
        emptyPlaceholderSubText={emptyDetailSub}
        emptyPlaceholderIllustration="sparkles"
        detailPanelClassName="rounded-none"
        listSlot={
          <div
            className="rounded-none border px-4 py-4 md:px-5 md:py-5"
            style={{
              borderColor: 'rgba(255,255,255,0.12)',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
              boxShadow: '0 20px 55px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            {listColumnInner}
          </div>
        }
        detailSlot={
          selectedResource ? (
            <DetailPanelScrollContainer scrollKey={selectedResourceId}>
              <DreamLibraryResourceDetailDialog
                variant="inline"
                resource={selectedResource}
                comments={resourceCommentsByResourceId[selectedResource.id] ?? []}
                isLiked={likedResourceIds.includes(selectedResource.id)}
                isBookmarked={bookmarkedResourceIds.includes(selectedResource.id)}
                canManage={selectedResource.authorId === currentUserId}
                onClose={() => setSelectedResourceId(null)}
                onToggleLike={() => onToggleLikeResource(selectedResource.id)}
                onToggleBookmark={() => onToggleBookmarkResource(selectedResource.id)}
                onDelete={() => {
                  if (!window.confirm(LABELS.libraryDeleteConfirm)) return;
                  onDeleteResource(selectedResource.id);
                  setSelectedResourceId(null);
                }}
                onEditRequest={() => {
                  setEditingResourceId(selectedResource.id);
                  setSelectedResourceId(null);
                }}
                onCreateComment={(content) => onCreateResourceComment(selectedResource.id, content)}
                onReport={(reasonId, detail) => onReportResource(selectedResource.id, reasonId, detail)}
              />
            </DetailPanelScrollContainer>
          ) : null
        }
      />

      {isCreateDialogOpen && (
        <DreamLibraryResourceFormDialog
          title={LABELS.libraryUploadDialogTitle}
          submitLabel={LABELS.uploadResourceButton}
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={(payload) => {
            onCreateResource(payload);
            setIsCreateDialogOpen(false);
          }}
        />
      )}

      {editingResource && (
        <DreamLibraryResourceFormDialog
          title={LABELS.libraryEditButton}
          submitLabel={LABELS.libraryEditButton}
          initialResource={editingResource}
          onClose={() => setEditingResourceId(null)}
          onSubmit={(payload) => {
            onUpdateResource(editingResource.id, payload);
            setEditingResourceId(null);
          }}
        />
      )}
    </div>
  );
}
