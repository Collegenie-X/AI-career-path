'use client';

import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { FilePlus2, GraduationCap, Info, Map, PlusCircle } from 'lucide-react';
import librarySource from '@/data/high-school/resource-hub-library.json';
import { ResourceDetailDialog } from './ResourceDetailDialog';
import { ResourceStrategyPathCards } from './ResourceStrategyPathCards';
import { formatFileSize, formatUploadedDate, loadStoredFiles, saveStoredFiles } from './resource-hub-storage';
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

function getDefaultMarkdownTemplate(): string {
  return ['# 새 고입 자료', '', '## 핵심 요약', '- 준비중', '', '## 세부 내용', '작성해 주세요.'].join('\n');
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
  }));
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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCategoryId, setUploadCategoryId] = useState<ResourceCategoryId>('admission_strategy');
  const [categoryFilter, setCategoryFilter] = useState<'all' | ResourceCategoryId>('all');
  const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null);
  const [startInEditModeResourceId, setStartInEditModeResourceId] = useState<string | null>(null);
  const [isGuideDialogOpen, setIsGuideDialogOpen] = useState(false);

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

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const pickedFile = event.target.files?.[0];
    if (!pickedFile) return;
    setIsUploading(true);
    try {
      const isMarkdownFile = pickedFile.name.toLowerCase().endsWith('.md');
      const isPdfFile = pickedFile.type === 'application/pdf' || pickedFile.name.toLowerCase().endsWith('.pdf');
      if (!isMarkdownFile && !isPdfFile) return;
      const content = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ''));
        reader.onerror = () => reject(new Error('read-error'));
        if (isMarkdownFile) reader.readAsText(pickedFile, 'utf-8');
        if (isPdfFile) reader.readAsDataURL(pickedFile);
      });
      const newFile: ResourceFile = {
        id: `user-resource-${Date.now()}`,
        name: pickedFile.name,
        fileType: isMarkdownFile ? 'md' : 'pdf',
        categoryId: uploadCategoryId,
        summary: '사용자 업로드 자료',
        size: pickedFile.size,
        uploadedAt: new Date().toISOString(),
        content,
      };
      setUserFiles((previous) => [newFile, ...previous]);
      setSelectedResourceId(newFile.id);
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  const handleCreateMarkdown = () => {
    const resourceId = `user-resource-${Date.now()}`;
    const newFile: ResourceFile = {
      id: resourceId,
      name: `새-자료-${new Date().toISOString().slice(0, 10)}.md`,
      fileType: 'md',
      categoryId: uploadCategoryId,
      summary: '직접 작성하는 새 자료',
      size: 0,
      uploadedAt: new Date().toISOString(),
      content: getDefaultMarkdownTemplate(),
    };
    setUserFiles((previous) => [newFile, ...previous]);
    setSelectedResourceId(resourceId);
    setStartInEditModeResourceId(resourceId);
  };

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

  return (
    <div className="space-y-3">
      <div className="rounded-2xl p-3" style={{ background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.25)' }}>
        <p className="text-sm font-bold text-cyan-300 mb-1 flex items-center gap-1.5">
          <Map className="w-4 h-4" />
          {resourceLibrarySource.header.title}
        </p>
        <p className="text-[12px] text-gray-300 leading-relaxed">{resourceLibrarySource.header.shortDescription}</p>
        <button
          onClick={() => setIsGuideDialogOpen(true)}
          className="mt-2 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-cyan-200 bg-cyan-500/15 inline-flex items-center gap-1"
        >
          <Info className="w-3.5 h-3.5" />
          자세히 보기
        </button>
      </div>

      <ResourceStrategyPathCards />

      <div className="rounded-2xl p-3 space-y-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <select
            value={uploadCategoryId}
            onChange={(event) => setUploadCategoryId(event.target.value as ResourceCategoryId)}
            className="rounded-lg px-2.5 py-2 text-[12px] bg-white/5 text-gray-100 border border-white/10"
          >
            {RESOURCE_CATEGORIES.map((category) => (
              <option key={category.id} value={category.id}>
                업로드 카테고리: {category.label}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <label className="flex-1 px-2.5 py-2 rounded-lg text-[11px] font-semibold cursor-pointer text-center" style={{ background: 'rgba(139,92,246,0.2)', color: '#c4b5fd' }}>
              <input type="file" className="hidden" accept=".md,.pdf,text/markdown,application/pdf" onChange={handleFileUpload} />
              <span className="inline-flex items-center gap-1.5">
                <FilePlus2 className="w-3.5 h-3.5" />
                {isUploading ? '업로드 중...' : '파일 업로드'}
              </span>
            </label>
            <button onClick={handleCreateMarkdown} className="px-2.5 py-2 rounded-lg text-[11px] font-semibold text-emerald-200 bg-emerald-500/15">
              <span className="inline-flex items-center gap-1">
                <PlusCircle className="w-3.5 h-3.5" />
                새 MD
              </span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setCategoryFilter('all')}
            className="px-2 py-1 rounded-lg text-[11px] font-semibold"
            style={{ background: categoryFilter === 'all' ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)', color: '#e5e7eb' }}
          >
            전체
          </button>
          {RESOURCE_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setCategoryFilter(category.id)}
              className="px-2 py-1 rounded-lg text-[11px] font-semibold"
              style={{ background: categoryFilter === category.id ? `${category.color}33` : 'rgba(255,255,255,0.06)', color: category.color }}
            >
              {category.label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {filteredResources.map((resourceItem) => {
            const categoryMeta = getCategoryMeta(resourceItem.categoryId);
            const isUserItem = resourceItem.source === 'user';
            return (
              <div key={resourceItem.id} className="rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-white truncate">{resourceItem.title}</p>
                    <p className="text-[12px] mt-0.5" style={{ color: categoryMeta.color }}>
                      {categoryMeta.label}
                    </p>
                    <p className="text-[12px] text-gray-400 mt-1 line-clamp-1">{resourceItem.summary}</p>
                    <p className="text-[12px] text-gray-500 mt-0.5">
                      {resourceItem.fileType.toUpperCase()} {isUserItem ? `· ${formatFileSize(resourceItem.size)} · ${formatUploadedDate(resourceItem.uploadedAt)}` : '· 기본 문서'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {isUserItem ? (
                      <button
                        onClick={async () => {
                          try {
                            const shareUrl = getShareUrl(resourceItem.id);
                            await navigator.clipboard.writeText(shareUrl);
                          } catch {
                            // optional clipboard support
                          }
                        }}
                        className="px-2 py-1 rounded-md text-[11px] text-cyan-200 bg-cyan-500/15"
                      >
                        링크복사
                      </button>
                    ) : null}
                    <button onClick={() => setSelectedResourceId(resourceItem.id)} className="px-2 py-1 rounded-md text-[11px] font-semibold text-violet-200 bg-violet-500/20">
                      상세보기
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {filteredResources.length === 0 ? (
            <p className="text-[12px] text-gray-500">선택한 카테고리에 자료가 없습니다.</p>
          ) : null}
        </div>
      </div>

      <button onClick={onBack} className="w-full py-2.5 rounded-xl text-[11px] font-semibold" style={{ background: 'rgba(255,255,255,0.06)', color: '#9ca3af' }}>
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

      <ResourceDetailDialog
        item={selectedResource}
        startInEditModeResourceId={startInEditModeResourceId}
        onConsumeStartInEditMode={(resourceId) => {
          if (startInEditModeResourceId === resourceId) {
            setStartInEditModeResourceId(null);
          }
        }}
        onClose={() => setSelectedResourceId(null)}
        onDownloadUserFile={handleDownloadUserFile}
        onDeleteUserFile={handleDeleteUserFile}
        onUpdateUserFile={handleUpdateUserFile}
      />
    </div>
  );
}
