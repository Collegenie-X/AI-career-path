'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ChevronRight, Plus } from 'lucide-react';
import librarySource from '@/data/high-school/resource-hub-library.json';
import { ResourceDetailPanel } from './ResourceDetailPanel';
import { HighSchoolResourceFormDialog } from './HighSchoolResourceFormDialog';
import { loadStoredFiles, saveStoredFiles } from './resource-hub-storage';
import { RESOURCE_CATEGORIES, type ResourceCategoryId, type ResourceFile, type ResourceLibraryDocument } from './resource-hub-types';
import type { ResourceListItem } from './resource-hub-view-model';

type HighSchoolResourceHubSectionProps = {
  onBack: () => void;
};

type ResourceLibrarySource = {
  header: {
    title: string;
    shortDescription: string;
    detailDescription: string;
  };
  documents: ResourceLibraryDocument[];
};

const resourceLibrarySource = librarySource as ResourceLibrarySource;

function getCategoryMeta(categoryId: ResourceCategoryId) {
  const category = RESOURCE_CATEGORIES.find((item) => item.id === categoryId);
  return { label: category?.label ?? '기타', color: category?.color ?? '#9ca3af' };
}

function getShareUrl(resourceId: string): string {
  if (typeof window === 'undefined') return '';
  const url = new URL(window.location.href);
  url.searchParams.set('resource', resourceId);
  return url.toString();
}

function normalizeLibraryItems(): ResourceListItem[] {
  return resourceLibrarySource.documents.map((documentItem) => ({
    id: documentItem.id,
    title: documentItem.title,
    summary: documentItem.summary,
    categoryId: documentItem.categoryId,
    fileType: 'md',
    source: 'library',
    uploadedAt: '2026-03-12T00:00:00.000Z',
    size: 0,
    tags: documentItem.tags,
    markdownPath: documentItem.markdownPath,
    difficultyLevel: documentItem.difficultyLevel,
    estimatedReadTime: documentItem.estimatedReadTime,
    isNew: documentItem.isNew,
  }));
}

function renderDifficultyDots(level: number): string {
  const filled = Math.max(0, Math.min(5, level));
  return '●'.repeat(filled) + '○'.repeat(5 - filled);
}

type RarityTier = { label: string; emoji: string; color: string; gradient: string };

function getRarity(level: number | undefined): RarityTier {
  switch (level) {
    case 5:
      return {
        label: '레전더리',
        emoji: '👑',
        color: '#facc15',
        gradient: 'linear-gradient(90deg, rgba(250,204,21,0.25), rgba(251,146,60,0.25))',
      };
    case 4:
      return {
        label: '에픽',
        emoji: '💎',
        color: '#c084fc',
        gradient: 'linear-gradient(90deg, rgba(192,132,252,0.22), rgba(167,139,250,0.22))',
      };
    case 3:
      return {
        label: '레어',
        emoji: '🔮',
        color: '#60a5fa',
        gradient: 'linear-gradient(90deg, rgba(96,165,250,0.2), rgba(34,211,238,0.2))',
      };
    case 2:
      return {
        label: '언커먼',
        emoji: '🌿',
        color: '#34d399',
        gradient: 'linear-gradient(90deg, rgba(52,211,153,0.2), rgba(16,185,129,0.2))',
      };
    case 1:
    default:
      return {
        label: '코먼',
        emoji: '📜',
        color: '#9ca3af',
        gradient: 'linear-gradient(90deg, rgba(156,163,175,0.18), rgba(107,114,128,0.18))',
      };
  }
}

function mapUserFilesToListItems(userFiles: ResourceFile[]): ResourceListItem[] {
  return userFiles.map((file) => ({
    id: file.id,
    title: file.name,
    summary: file.summary,
    categoryId: file.categoryId,
    fileType: file.fileType,
    source: 'user',
    uploadedAt: file.uploadedAt,
    size: file.size,
    tags: ['사용자업로드'],
    content: file.content,
  }));
}

export function HighSchoolResourceHubSection({ onBack }: HighSchoolResourceHubSectionProps) {
  const [userFiles, setUserFiles] = useState<ResourceFile[]>([]);
  const [uploadCategoryId, setUploadCategoryId] = useState<ResourceCategoryId>('admission_strategy');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ResourceCategoryId>('all');
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [startInEditModeResourceId, setStartInEditModeResourceId] = useState<string | null>(null);
  const [isGuideDialogOpen, setIsGuideDialogOpen] = useState(false);
  const [isResourceFormDialogOpen, setIsResourceFormDialogOpen] = useState(false);

  const libraryItems = useMemo(() => normalizeLibraryItems(), []);
  const userItems = useMemo(() => mapUserFilesToListItems(userFiles), [userFiles]);
  const resourceList = useMemo(() => [...libraryItems, ...userItems], [libraryItems, userItems]);

  useEffect(() => {
    const loadedUserFiles = loadStoredFiles();
    setUserFiles(loadedUserFiles);
    const sharedResourceId = new URLSearchParams(window.location.search).get('resource');
    if (sharedResourceId) setSelectedResourceId(sharedResourceId);
  }, []);

  useEffect(() => {
    saveStoredFiles(userFiles);
  }, [userFiles]);

  const filteredResources = useMemo(() => {
    if (categoryFilter === 'all') return resourceList;
    return resourceList.filter((item) => item.categoryId === categoryFilter);
  }, [resourceList, categoryFilter]);

  const selectedResource = useMemo(
    () => resourceList.find((item) => item.id === selectedResourceId) ?? null,
    [resourceList, selectedResourceId]
  );

  const handleDownloadUserFile = (file: ResourceFile) => {
    const anchor = document.createElement('a');
    anchor.download = file.name;
    if (file.fileType === 'md') {
      const blob = new Blob([file.content], { type: 'text/markdown;charset=utf-8' });
      anchor.href = URL.createObjectURL(blob);
      anchor.click();
      URL.revokeObjectURL(anchor.href);
      return;
    }
    anchor.href = file.content;
    anchor.click();
  };

  const handleDeleteUserFile = (fileId: string) => {
    setUserFiles((previous) => previous.filter((file) => file.id !== fileId));
    setSelectedResourceId((previous) => (previous === fileId ? null : previous));
  };

  const handleUpdateUserFile = (
    fileId: string,
    update: { name: string; summary: string; categoryId: ResourceCategoryId; content: string }
  ) => {
    setUserFiles((previous) =>
      previous.map((file) =>
        file.id === fileId
          ? {
              ...file,
              name: update.name.trim() || file.name,
              summary: update.summary.trim(),
              categoryId: update.categoryId,
              content: file.fileType === 'md' ? update.content : file.content,
            }
          : file
      )
    );
  };

  const hasDetailSelection = selectedResource !== null;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center gap-2 shrink-0 mb-3">
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 text-gray-200"
          aria-label="고입 탐색으로 뒤로가기"
          title="뒤로가기"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <p className="text-sm font-bold text-white inline-flex items-center gap-1">
          <span>🎒</span>
          <span>고입 자료 상점</span>
          <span className="text-[10px] font-medium text-amber-300/80 ml-1">{resourceLibrarySource.documents.length}개 아이템</span>
        </p>
      </div>

      <div className="flex gap-3 flex-1 min-h-0">
        {/* 왼쪽: 리스트 */}
        <div
          className={`flex flex-col min-w-0 ${hasDetailSelection ? 'w-[45%] shrink-0' : 'flex-1'}`}
          style={{ minWidth: hasDetailSelection ? 180 : undefined }}
        >
          <div className="rounded-xl p-2.5 space-y-2 shrink-0" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex flex-wrap gap-1.5">
              <select
                value={uploadCategoryId}
                onChange={(event) => setUploadCategoryId(event.target.value as ResourceCategoryId)}
                className="rounded-lg px-2 py-1.5 text-[11px] bg-white/5 text-gray-100 border border-white/10"
              >
                {RESOURCE_CATEGORIES.map((category) => (
                  <option key={category.id} value={category.id}>
                    업로드: {category.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setIsResourceFormDialogOpen(true)}
                className="h-8 px-2.5 rounded-lg text-[11px] font-semibold inline-flex items-center justify-center gap-1"
                style={{ background: 'linear-gradient(135deg, rgba(108,92,231,0.35), rgba(139,92,246,0.35))', color: '#ddd6fe', border: '1px solid rgba(196,181,253,0.4)' }}
              >
                <Plus className="w-3.5 h-3.5" />
                추가
              </button>
            </div>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setCategoryFilter('all')}
                className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                style={{ background: categoryFilter === 'all' ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)', color: '#e5e7eb' }}
              >
                전체
              </button>
              {RESOURCE_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setCategoryFilter(category.id)}
                  className="px-1.5 py-0.5 rounded text-[10px] font-semibold"
                  style={{ background: categoryFilter === category.id ? `${category.color}33` : 'rgba(255,255,255,0.06)', color: category.color }}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto mt-2 space-y-1.5 min-h-0">
            {filteredResources.map((resourceItem) => {
              const categoryMeta = getCategoryMeta(resourceItem.categoryId);
              const isUserItem = resourceItem.source === 'user';
              const isSelected = resourceItem.id === selectedResourceId;
              const rarity = getRarity(resourceItem.difficultyLevel);

              return (
                <div
                  key={resourceItem.id}
                  onClick={() => setSelectedResourceId(resourceItem.id)}
                  className={`relative rounded-xl p-2.5 transition-all cursor-pointer text-left active:scale-[0.99] hover:scale-[1.01] overflow-hidden ${resourceItem.isNew ? 'resource-card-new-shimmer' : ''}`}
                  style={{
                    background: isSelected
                      ? 'rgba(139,92,246,0.2)'
                      : `${rarity.gradient}, linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))`,
                    border: `1px solid ${isSelected ? 'rgba(139,92,246,0.5)' : rarity.color + '40'}`,
                    boxShadow: isSelected ? '0 0 18px rgba(139,92,246,0.25)' : `0 0 6px ${rarity.color}18`,
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="text-[12px] font-bold text-white truncate">{resourceItem.title}</p>
                        {resourceItem.isNew ? (
                          <span
                            className="px-1 py-px rounded text-[9px] font-bold flex-shrink-0 inline-flex items-center gap-0.5"
                            style={{
                              background: 'linear-gradient(90deg, rgba(244,114,182,0.4), rgba(168,85,247,0.4))',
                              color: '#fff',
                              border: '1px solid rgba(244,114,182,0.6)',
                              textShadow: '0 0 6px rgba(244,114,182,0.6)',
                            }}
                          >
                            ✨ NEW
                          </span>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span
                          className="text-[9px] font-bold px-1 py-px rounded inline-flex items-center gap-0.5"
                          style={{
                            background: `${rarity.color}1f`,
                            color: rarity.color,
                            border: `1px solid ${rarity.color}55`,
                          }}
                          title={`난이도 ${resourceItem.difficultyLevel ?? 1}/5`}
                        >
                          <span>{rarity.emoji}</span>
                          <span>{rarity.label}</span>
                        </span>
                        <span className="text-[10px] font-semibold" style={{ color: categoryMeta.color }}>
                          {categoryMeta.label}
                        </span>
                        {resourceItem.difficultyLevel ? (
                          <span
                            className="text-[9px] font-mono"
                            style={{ color: rarity.color }}
                          >
                            {renderDifficultyDots(resourceItem.difficultyLevel)}
                          </span>
                        ) : null}
                        {resourceItem.estimatedReadTime ? (
                          <span className="text-[9px] text-gray-400">⏱ {resourceItem.estimatedReadTime}</span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {isUserItem ? (
                        <button
                          type="button"
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await navigator.clipboard.writeText(getShareUrl(resourceItem.id));
                            } catch {}
                          }}
                          className="px-1.5 py-0.5 rounded text-[9px] text-cyan-200 bg-cyan-500/15"
                        >
                          링크
                        </button>
                      ) : null}
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredResources.length === 0 ? (
              <p className="text-[11px] text-gray-500 py-4">선택한 카테고리에 자료가 없습니다.</p>
            ) : null}
          </div>
        </div>

        {/* 오른쪽: 디테일 */}
        <div className="flex-1 min-w-0 flex flex-col rounded-xl overflow-hidden" style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.1)' }}>
          {hasDetailSelection && selectedResource ? (
            <ResourceDetailPanel
              item={selectedResource}
              startInEditModeResourceId={startInEditModeResourceId}
              onConsumeStartInEditMode={(resourceId) => {
                if (startInEditModeResourceId === resourceId) setStartInEditModeResourceId(null);
              }}
              onClearSelection={() => setSelectedResourceId(null)}
              onDownloadUserFile={handleDownloadUserFile}
              onDeleteUserFile={handleDeleteUserFile}
              onUpdateUserFile={handleUpdateUserFile}
            />
          ) : (
            <div className="flex flex-col items-center justify-center flex-1 min-h-[200px] gap-2 text-center px-4">
              <p className="text-[12px] font-bold text-white/60">자료를 선택하세요</p>
              <p className="text-[11px] text-gray-500">왼쪽 목록에서 항목을 클릭하면 상세 내용이 여기에 표시됩니다</p>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={onBack}
        className="w-full mt-3 py-2 rounded-xl text-[11px] font-semibold shrink-0"
        style={{ background: 'rgba(255,255,255,0.06)', color: '#9ca3af' }}
      >
        고입 탐색 메인으로 돌아가기
      </button>

      {isGuideDialogOpen ? (
        <div
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/60 p-3"
          style={{ zIndex: 2147483647 }}
        >
          <div className="w-full max-w-xl rounded-2xl overflow-hidden" style={{ background: '#0b1020', border: '1px solid rgba(255,255,255,0.12)' }}>
            <div className="px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(6,182,212,0.15)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-sm font-bold text-white">자료실 안내</p>
              <button onClick={() => setIsGuideDialogOpen(false)} className="px-2 py-1 rounded-lg text-[11px] bg-white/10 text-gray-300">
                닫기
              </button>
            </div>
            <div className="p-4">
              <p className="text-[12px] text-gray-200 leading-relaxed">{resourceLibrarySource.header.detailDescription}</p>
            </div>
          </div>
        </div>
      ) : null}

      <style jsx global>{`
        .resource-card-new-shimmer::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            115deg,
            transparent 30%,
            rgba(244, 114, 182, 0.2) 45%,
            rgba(168, 85, 247, 0.18) 55%,
            transparent 70%
          );
          background-size: 200% 100%;
          animation: resource-card-shimmer 2.4s linear infinite;
          pointer-events: none;
        }
        @keyframes resource-card-shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
      `}</style>

      {isResourceFormDialogOpen && (
        <HighSchoolResourceFormDialog
          defaultCategoryId={uploadCategoryId}
          onClose={() => setIsResourceFormDialogOpen(false)}
          onSubmit={(payload) => {
            const resourceId = `user-resource-${Date.now()}`;
            const newFile: ResourceFile = {
              id: resourceId,
              name: payload.fileName.trim() || payload.title.trim(),
              fileType: payload.fileType,
              categoryId: payload.categoryId,
              summary: payload.summary.trim(),
              size: payload.size,
              uploadedAt: new Date().toISOString(),
              content: payload.content,
            };
            setUploadCategoryId(payload.categoryId);
            setUserFiles((previous) => [newFile, ...previous]);
            setSelectedResourceId(resourceId);
            if (payload.fileType === 'md' && payload.size === 0) {
              setStartInEditModeResourceId(resourceId);
            }
            setIsResourceFormDialogOpen(false);
          }}
        />
      )}
    </div>
  );
}
