'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, PencilLine, Save, Trash2, X } from 'lucide-react';
import { ResourceMarkdownViewer } from './ResourceMarkdownViewer';
import { RESOURCE_CATEGORIES, type ResourceCategoryId, type ResourceFile } from './resource-hub-types';
import type { ResourceListItem } from './resource-hub-view-model';

type ResourceDetailDialogProps = {
  item: ResourceListItem | null;
  startInEditModeResourceId: string | null;
  onConsumeStartInEditMode: (resourceId: string) => void;
  onClose: () => void;
  onDownloadUserFile: (file: ResourceFile) => void;
  onDeleteUserFile: (fileId: string) => void;
  onUpdateUserFile: (fileId: string, update: { name: string; summary: string; categoryId: ResourceCategoryId; content: string }) => void;
};

type EditingDraft = {
  name: string;
  summary: string;
  categoryId: ResourceCategoryId;
  content: string;
};

const EMPTY_DRAFT: EditingDraft = {
  name: '',
  summary: '',
  categoryId: 'other',
  content: '',
};

export function ResourceDetailDialog({
  item,
  startInEditModeResourceId,
  onConsumeStartInEditMode,
  onClose,
  onDownloadUserFile,
  onDeleteUserFile,
  onUpdateUserFile,
}: ResourceDetailDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [libraryMarkdown, setLibraryMarkdown] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<EditingDraft>(EMPTY_DRAFT);
  const previousItemIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!item) return;
    if (previousItemIdRef.current !== item.id) {
      setIsEditing(false);
      previousItemIdRef.current = item.id;
    }
    setDraft({
      name: item.title,
      summary: item.summary,
      categoryId: item.categoryId,
      content: item.content ?? '',
    });
  }, [item]);

  useEffect(() => {
    if (!item) return;
    const shouldStartInEditMode = item.id === startInEditModeResourceId && item.source === 'user';
    if (!shouldStartInEditMode) return;
    setIsEditing(true);
    onConsumeStartInEditMode(item.id);
  }, [item, startInEditModeResourceId, onConsumeStartInEditMode]);

  useEffect(() => {
    if (!item || item.source !== 'library' || item.fileType !== 'md' || !item.markdownPath) {
      setLibraryMarkdown('');
      return;
    }
    let mounted = true;
    setIsLoading(true);
    fetch(item.markdownPath)
      .then((response) => response.text())
      .then((text) => {
        if (mounted) setLibraryMarkdown(text);
      })
      .catch(() => {
        if (mounted) setLibraryMarkdown('# 문서를 불러오지 못했습니다.\n\n잠시 후 다시 시도해 주세요.');
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [item]);

  const userFileForActions = useMemo<ResourceFile | null>(() => {
    if (!item || item.source !== 'user') return null;
    return {
      id: item.id,
      name: item.title,
      fileType: item.fileType,
      categoryId: item.categoryId,
      summary: item.summary,
      size: item.size,
      uploadedAt: item.uploadedAt,
      content: item.content ?? '',
    };
  }, [item]);

  if (!item) return null;

  const canEditUserMarkdown = item.source === 'user' && item.fileType === 'md';

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-3"
      style={{ zIndex: 2147483647 }}
    >
      <div
        className="w-full h-[100dvh] sm:h-auto sm:max-h-[92vh] max-w-3xl rounded-none sm:rounded-2xl overflow-hidden flex flex-col"
        style={{ background: '#0b1020', border: '1px solid rgba(255,255,255,0.12)' }}
      >
        <div
          className="px-4 pt-[max(12px,env(safe-area-inset-top))] pb-3 flex items-center justify-between"
          style={{ background: 'rgba(99,102,241,0.15)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate">{item.title}</p>
            <p className="text-[12px] text-gray-300 mt-0.5 truncate">{item.summary}</p>
          </div>
          <div className="flex items-center gap-1">
            {userFileForActions ? (
              <>
                <button onClick={() => onDownloadUserFile(userFileForActions)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 text-gray-200" aria-label="다운로드">
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => (isEditing ? onUpdateUserFile(item.id, draft) : setIsEditing(true))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-violet-500/20 text-violet-200"
                  aria-label={isEditing ? '저장' : '수정'}
                >
                  {isEditing ? <Save className="w-4 h-4" /> : <PencilLine className="w-4 h-4" />}
                </button>
                <button onClick={() => onDeleteUserFile(item.id)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-500/20 text-rose-200" aria-label="삭제">
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            ) : null}
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 text-gray-300" aria-label="닫기">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 pb-[max(12px,env(safe-area-inset-bottom))]">
          {isEditing ? (
            <div className="space-y-2">
              <input
                value={draft.name}
                onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
                className="w-full rounded-lg px-2.5 py-2 text-[12px] bg-white/5 text-gray-100 border border-white/10"
                placeholder="자료명"
              />
              <select
                value={draft.categoryId}
                onChange={(event) => setDraft((prev) => ({ ...prev, categoryId: event.target.value as ResourceCategoryId }))}
                className="w-full rounded-lg px-2.5 py-2 text-[12px] bg-white/5 text-gray-100 border border-white/10"
              >
                {RESOURCE_CATEGORIES.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
              <input
                value={draft.summary}
                onChange={(event) => setDraft((prev) => ({ ...prev, summary: event.target.value }))}
                className="w-full rounded-lg px-2.5 py-2 text-[12px] bg-white/5 text-gray-100 border border-white/10"
                placeholder="요약"
              />
              {canEditUserMarkdown ? (
                <div className="space-y-1.5">
                  <p className="text-[12px] text-gray-400">본문 작성</p>
                  <textarea
                    value={draft.content}
                    onChange={(event) => setDraft((prev) => ({ ...prev, content: event.target.value }))}
                    className="w-full h-[52vh] sm:h-[58vh] rounded-lg px-2.5 py-2 text-[12px] leading-relaxed bg-white/5 text-gray-100 border border-white/10"
                  />
                </div>
              ) : (
                <p className="text-[12px] text-gray-400">PDF 파일은 메타 정보만 수정할 수 있습니다.</p>
              )}
              <div className="flex justify-end">
                <button onClick={() => setIsEditing(false)} className="px-2.5 py-1.5 rounded-lg text-[12px] text-gray-300 bg-white/5">
                  편집 닫기
                </button>
              </div>
            </div>
          ) : (
            <>
              {item.fileType === 'md' ? (
                isLoading ? (
                  <p className="text-[12px] text-gray-400">문서를 불러오는 중...</p>
                ) : (
                  <ResourceMarkdownViewer markdownText={item.source === 'library' ? libraryMarkdown : item.content ?? ''} />
                )
              ) : (
                <iframe title={item.title} src={item.content} className="w-full h-[420px] rounded-lg bg-white" />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
