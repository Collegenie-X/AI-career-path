'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Maximize2, PencilLine, Save, Trash2, X } from 'lucide-react';
import { ResourceMarkdownViewer } from './ResourceMarkdownViewer';
import {
  RESOURCE_CATEGORIES,
  type ResourceCategoryId,
  type ResourceFile,
} from './resource-hub-types';
import type { ResourceListItem } from './resource-hub-view-model';

type ResourceDetailPanelProps = {
  readonly item: ResourceListItem;
  readonly startInEditModeResourceId: string | null;
  readonly onConsumeStartInEditMode: (resourceId: string) => void;
  readonly onClearSelection: () => void;
  readonly onDownloadUserFile: (file: ResourceFile) => void;
  readonly onDeleteUserFile: (fileId: string) => void;
  readonly onUpdateUserFile: (
    fileId: string,
    update: { name: string; summary: string; categoryId: ResourceCategoryId; content: string }
  ) => void;
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

export function ResourceDetailPanel({
  item,
  startInEditModeResourceId,
  onConsumeStartInEditMode,
  onClearSelection,
  onDownloadUserFile,
  onDeleteUserFile,
  onUpdateUserFile,
}: ResourceDetailPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [libraryMarkdown, setLibraryMarkdown] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<EditingDraft>(EMPTY_DRAFT);
  const [isExpandedView, setIsExpandedView] = useState(false);
  const previousItemIdRef = useRef<string | null>(null);

  useEffect(() => {
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
    const shouldStartInEditMode = item.id === startInEditModeResourceId && item.source === 'user';
    if (!shouldStartInEditMode) return;
    setIsEditing(true);
    onConsumeStartInEditMode(item.id);
  }, [item, startInEditModeResourceId, onConsumeStartInEditMode]);

  useEffect(() => {
    if (item.source !== 'library' || item.fileType !== 'md' || !item.markdownPath) {
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
    if (item.source !== 'user') return null;
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

  const canEditUserMarkdown = item.source === 'user' && item.fileType === 'md';
  const resolvedMarkdown = item.source === 'library' ? libraryMarkdown : item.content ?? '';

  return (
    <>
      <div className="flex flex-col h-full min-h-0">
        <div
          className="px-3 py-2.5 flex items-center justify-between shrink-0"
          style={{ background: 'rgba(99,102,241,0.15)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-white truncate">{item.title}</p>
            <p className="text-[11px] text-gray-300 mt-0.5 truncate">{item.summary}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            {item.fileType === 'md' && !isEditing && !isLoading ? (
              <button
                onClick={() => setIsExpandedView(true)}
                className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-500/20 text-indigo-200 hover:bg-indigo-500/30 transition-colors"
                aria-label="넓게 보기"
                title="넓게 보기"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            ) : null}
            {userFileForActions ? (
              <>
                <button
                  onClick={() => onDownloadUserFile(userFileForActions)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 text-gray-200"
                  aria-label="다운로드"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => (isEditing ? onUpdateUserFile(item.id, draft) : setIsEditing(true))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-violet-500/20 text-violet-200"
                  aria-label={isEditing ? '저장' : '수정'}
                >
                  {isEditing ? <Save className="w-4 h-4" /> : <PencilLine className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => onDeleteUserFile(item.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-500/20 text-rose-200"
                  aria-label="삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            ) : null}
            <button
              onClick={onClearSelection}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 text-gray-300"
              aria-label="선택 해제"
              title="선택 해제"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 min-h-0 resource-detail-content">
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
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, categoryId: event.target.value as ResourceCategoryId }))
                }
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
                    className="w-full min-h-[200px] rounded-lg px-2.5 py-2 text-[12px] leading-relaxed bg-white/5 text-gray-100 border border-white/10"
                  />
                </div>
              ) : (
                <p className="text-[12px] text-gray-400">PDF 파일은 메타 정보만 수정할 수 있습니다.</p>
              )}
              <div className="flex justify-end">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-2.5 py-1.5 rounded-lg text-[12px] text-gray-300 bg-white/5"
                >
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
                  <ResourceMarkdownViewer markdownText={resolvedMarkdown} />
                )
              ) : (
                <iframe title={item.title} src={item.content} className="w-full h-[360px] rounded-lg bg-white" />
              )}
            </>
          )}
        </div>
      </div>

      {isExpandedView ? (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/85 p-4"
          style={{ zIndex: 2147483647 }}
          onClick={() => setIsExpandedView(false)}
        >
          <div
            className="w-full max-h-[92vh] rounded-2xl overflow-hidden flex flex-col"
            style={{
              maxWidth: 'min(1100px, calc(100vw - 3rem))',
              background: '#0b1020',
              border: '1px solid rgba(139,92,246,0.3)',
              boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 40px rgba(139,92,246,0.15)',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="px-5 py-3 flex items-center justify-between shrink-0"
              style={{ background: 'rgba(99,102,241,0.15)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-bold text-white truncate">{item.title}</p>
                <p className="text-[12px] text-gray-300 mt-0.5 truncate">{item.summary}</p>
              </div>
              <button
                onClick={() => setIsExpandedView(false)}
                className="w-9 h-9 rounded-lg flex items-center justify-center bg-white/10 text-gray-200 hover:bg-white/20 transition-colors flex-shrink-0 ml-3"
                aria-label="닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 min-h-0 resource-expanded-content">
              <ResourceMarkdownViewer markdownText={resolvedMarkdown} />
            </div>
          </div>
        </div>
      ) : null}

      <style jsx global>{`
        /* ─── Shared table & content styles ─── */
        .resource-detail-content .prose,
        .resource-expanded-content .prose {
          color: #d1d5db;
        }

        .resource-detail-content .prose {
          font-size: 13px;
          line-height: 1.75;
        }

        /* ── Headings ── */
        .resource-detail-content .prose h1,
        .resource-detail-content .prose h2,
        .resource-detail-content .prose h3 {
          position: relative;
          padding-left: 12px;
          margin-top: 1.6em;
          margin-bottom: 0.6em;
        }
        .resource-detail-content .prose h1::before,
        .resource-detail-content .prose h2::before,
        .resource-detail-content .prose h3::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0.15em;
          bottom: 0.15em;
          width: 3px;
          border-radius: 2px;
          background: linear-gradient(180deg, #8b5cf6, #6366f1);
        }
        .resource-detail-content .prose h1 { font-size: 1.25em; }
        .resource-detail-content .prose h2 { font-size: 1.1em; }
        .resource-detail-content .prose h3 { font-size: 1em; }

        /* ── Tables ── */
        .resource-detail-content .prose table {
          display: block;
          overflow-x: auto;
          font-size: 11.5px;
          border-collapse: separate;
          border-spacing: 0;
          border-radius: 10px;
          border: 1px solid rgba(139,92,246,0.25);
          margin: 1em 0 1.5em;
        }
        .resource-detail-content .prose thead {
          position: sticky;
          top: 0;
          z-index: 1;
        }
        .resource-detail-content .prose th {
          padding: 8px 12px;
          background: linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.22));
          font-weight: 700;
          color: #e0e7ff;
          text-align: left;
          border-bottom: 1.5px solid rgba(139,92,246,0.35);
          white-space: nowrap;
        }
        .resource-detail-content .prose th:not(:last-child) {
          border-right: 1px solid rgba(139,92,246,0.18);
        }
        .resource-detail-content .prose td {
          padding: 7px 12px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          white-space: normal;
          min-width: 70px;
          color: #cbd5e1;
          vertical-align: top;
        }
        .resource-detail-content .prose td:not(:last-child) {
          border-right: 1px solid rgba(255,255,255,0.06);
        }
        .resource-detail-content .prose tbody tr {
          transition: background 0.15s;
        }
        .resource-detail-content .prose tbody tr:nth-child(odd) {
          background: rgba(255,255,255,0.02);
        }
        .resource-detail-content .prose tbody tr:nth-child(even) {
          background: rgba(139,92,246,0.04);
        }
        .resource-detail-content .prose tbody tr:hover {
          background: rgba(139,92,246,0.12);
        }
        .resource-detail-content .prose tbody tr:last-child td {
          border-bottom: none;
        }

        /* ── Lists ── */
        .resource-detail-content .prose ul {
          padding-left: 1.2em;
          margin: 0.5em 0;
        }
        .resource-detail-content .prose ul li {
          margin: 0.35em 0;
          line-height: 1.65;
        }
        .resource-detail-content .prose ul li::marker {
          color: #8b5cf6;
        }
        .resource-detail-content .prose ol li::marker {
          color: #a78bfa;
          font-weight: 600;
        }

        /* ── Blockquotes ── */
        .resource-detail-content .prose blockquote {
          border-left: 3px solid rgba(139,92,246,0.5);
          background: rgba(139,92,246,0.06);
          border-radius: 0 8px 8px 0;
          padding: 8px 14px;
          margin: 1em 0;
          color: #c4b5fd;
        }

        /* ── Code blocks ── */
        .resource-detail-content .prose pre {
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.08);
          padding: 12px 16px;
          margin: 1em 0;
        }
        .resource-detail-content .prose code:not(pre code) {
          background: rgba(139,92,246,0.15);
          border: 1px solid rgba(139,92,246,0.2);
          border-radius: 4px;
          padding: 1px 5px;
          font-size: 0.9em;
        }

        /* ── HR ── */
        .resource-detail-content .prose hr {
          border-color: rgba(139,92,246,0.2);
          margin: 1.5em 0;
        }

        .resource-detail-content .prose img,
        .resource-detail-content .prose svg {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
        }

        /* ─── Expanded view ─── */
        .resource-expanded-content .prose {
          font-size: 15px;
          line-height: 1.85;
        }

        .resource-expanded-content .prose h1,
        .resource-expanded-content .prose h2,
        .resource-expanded-content .prose h3 {
          position: relative;
          padding-left: 14px;
        }
        .resource-expanded-content .prose h1::before,
        .resource-expanded-content .prose h2::before,
        .resource-expanded-content .prose h3::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0.15em;
          bottom: 0.15em;
          width: 3.5px;
          border-radius: 2px;
          background: linear-gradient(180deg, #8b5cf6, #6366f1);
        }
        .resource-expanded-content .prose h1 {
          font-size: 1.6em;
          margin-top: 1.2em;
          margin-bottom: 0.6em;
        }
        .resource-expanded-content .prose h2 {
          font-size: 1.35em;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        .resource-expanded-content .prose h3 {
          font-size: 1.15em;
          margin-top: 1.2em;
          margin-bottom: 0.4em;
        }

        .resource-expanded-content .prose table {
          display: table;
          width: 100%;
          font-size: 14px;
          border-collapse: separate;
          border-spacing: 0;
          border-radius: 12px;
          border: 1px solid rgba(139,92,246,0.25);
          overflow: hidden;
          margin: 1.2em 0 1.8em;
        }
        .resource-expanded-content .prose th {
          padding: 10px 16px;
          background: linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.22));
          font-weight: 700;
          color: #e0e7ff;
          text-align: left;
          border-bottom: 1.5px solid rgba(139,92,246,0.35);
        }
        .resource-expanded-content .prose th:not(:last-child) {
          border-right: 1px solid rgba(139,92,246,0.18);
        }
        .resource-expanded-content .prose td {
          padding: 9px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          color: #cbd5e1;
          vertical-align: top;
        }
        .resource-expanded-content .prose td:not(:last-child) {
          border-right: 1px solid rgba(255,255,255,0.06);
        }
        .resource-expanded-content .prose tbody tr:nth-child(odd) {
          background: rgba(255,255,255,0.02);
        }
        .resource-expanded-content .prose tbody tr:nth-child(even) {
          background: rgba(139,92,246,0.04);
        }
        .resource-expanded-content .prose tbody tr:hover {
          background: rgba(139,92,246,0.12);
        }
        .resource-expanded-content .prose tbody tr:last-child td {
          border-bottom: none;
        }

        .resource-expanded-content .prose ul li::marker {
          color: #8b5cf6;
        }
        .resource-expanded-content .prose ol li::marker {
          color: #a78bfa;
          font-weight: 600;
        }
        .resource-expanded-content .prose blockquote {
          border-left: 3px solid rgba(139,92,246,0.5);
          background: rgba(139,92,246,0.06);
          border-radius: 0 8px 8px 0;
          padding: 10px 18px;
          margin: 1.2em 0;
          color: #c4b5fd;
        }
        .resource-expanded-content .prose code:not(pre code) {
          background: rgba(139,92,246,0.15);
          border: 1px solid rgba(139,92,246,0.2);
          border-radius: 4px;
          padding: 1px 5px;
          font-size: 0.9em;
        }
        .resource-expanded-content .prose hr {
          border-color: rgba(139,92,246,0.2);
          margin: 1.8em 0;
        }
      `}</style>
    </>
  );
}
