'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Bookmark, ExternalLink, Flag, Heart, MessageCircle, MoreVertical, Trash2, X } from 'lucide-react';
import { LABELS, RESOURCE_CATEGORIES } from '../config';
import type { DreamResource, DreamResourceComment } from '../types';
import { RoadmapReportDialog } from './RoadmapReportDialog';
import { DreamLibraryMarkdownViewer } from './DreamLibraryMarkdownViewer';

interface DreamLibraryResourceDetailDialogProps {
  resource: DreamResource;
  comments: DreamResourceComment[];
  isLiked: boolean;
  isBookmarked: boolean;
  canManage: boolean;
  onClose: () => void;
  onToggleLike: () => void;
  onToggleBookmark: () => void;
  onDelete: () => void;
  onEditRequest: () => void;
  onCreateComment: (content: string) => void;
  onReport: (reasonId: string, detail: string) => void;
}

function formatDateTime(dateText: string): string {
  const parsed = new Date(dateText);
  if (Number.isNaN(parsed.getTime())) return dateText;
  return parsed.toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export function DreamLibraryResourceDetailDialog({
  resource,
  comments,
  isLiked,
  isBookmarked,
  canManage,
  onClose,
  onToggleLike,
  onToggleBookmark,
  onDelete,
  onEditRequest,
  onCreateComment,
  onReport,
}: DreamLibraryResourceDetailDialogProps) {
  const [newComment, setNewComment] = useState('');
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const actionMenuRef = useRef<HTMLDivElement | null>(null);

  const category = useMemo(
    () => RESOURCE_CATEGORIES.find(item => item.id === resource.category),
    [resource.category],
  );

  useEffect(() => {
    if (!showActionMenu) return;
    const closeActionMenuWhenClickedOutside = (event: MouseEvent) => {
      if (!actionMenuRef.current) return;
      if (!actionMenuRef.current.contains(event.target as Node)) {
        setShowActionMenu(false);
      }
    };
    document.addEventListener('mousedown', closeActionMenuWhenClickedOutside);
    return () => {
      document.removeEventListener('mousedown', closeActionMenuWhenClickedOutside);
    };
  }, [showActionMenu]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-[430px] rounded-t-3xl overflow-y-auto"
        style={{ backgroundColor: '#12122a', border: '1px solid rgba(255,255,255,0.08)', maxHeight: 'calc(100vh - 70px)', marginBottom: 80 }}
      >
        <div className="sticky top-0 z-10 px-5 pt-5 pb-4" style={{ backgroundColor: 'rgba(18,18,42,0.92)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span
                className="inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full mb-2"
                style={{ backgroundColor: `${category?.color ?? '#6C5CE7'}22`, color: category?.color ?? '#6C5CE7' }}
              >
                {category?.emoji ?? '📄'} {category?.label ?? LABELS.libraryDefaultCategory}
              </span>
              <h3 className="text-base font-bold text-white">{resource.title}</h3>
              <p className="text-xs text-gray-500 mt-1">{formatDateTime(resource.createdAt)}</p>
            </div>
            <div className="flex items-center gap-2">
              {!canManage && (
                <div ref={actionMenuRef} className="relative">
                  <button
                    onClick={() => setShowActionMenu(previousState => !previousState)}
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                    aria-label={LABELS.roadmapMoreActionLabel}
                  >
                    <MoreVertical className="w-4 h-4 text-gray-300" />
                  </button>
                  {showActionMenu && (
                    <div
                      className="absolute right-0 top-10 min-w-[120px] rounded-xl p-1 z-20"
                      style={{ backgroundColor: '#101026', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      <button
                        onClick={() => {
                          setShowActionMenu(false);
                          setShowReportDialog(true);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-semibold text-red-300"
                        style={{ backgroundColor: 'rgba(239,68,68,0.08)' }}
                      >
                        <Flag className="w-3.5 h-3.5" />
                        {LABELS.roadmapReportMenuLabel}
                      </button>
                    </div>
                  )}
                </div>
              )}
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{resource.description}</div>

          {resource.resourceUrl && (
            <a
              href={resource.resourceUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between rounded-xl px-3 py-2 text-sm"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#c4b5fd' }}
            >
              <span className="truncate">{resource.resourceUrl}</span>
              <ExternalLink className="w-4 h-4 flex-shrink-0" />
            </a>
          )}

          {resource.attachmentFileName && (
            <div className="rounded-xl p-3" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <p className="text-xs text-gray-400 mb-2">{LABELS.libraryAttachmentTitle}: {resource.attachmentFileName}</p>
              {resource.attachmentFileType === 'md' && resource.attachmentMarkdownContent ? (
                <DreamLibraryMarkdownViewer markdownContent={resource.attachmentMarkdownContent} />
              ) : resource.attachmentFileType === 'pdf' && resource.attachmentDataUrl ? (
                <iframe title={resource.attachmentFileName} src={resource.attachmentDataUrl} className="w-full h-80 rounded-lg bg-white/90" />
              ) : resource.attachmentFileType === 'pdf' && resource.resourceUrl ? (
                <iframe title={resource.attachmentFileName} src={resource.resourceUrl} className="w-full h-80 rounded-lg bg-white/90" />
              ) : (
                <p className="text-xs text-gray-500">{LABELS.libraryAttachmentNoPreview}</p>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button onClick={onToggleLike} className="h-9 px-3 rounded-xl text-sm flex items-center gap-1.5" style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: isLiked ? '#f87171' : '#9ca3af' }}>
              <Heart className="w-4 h-4" fill={isLiked ? '#f87171' : 'none'} />
              {resource.likes + (isLiked ? 1 : 0)}
            </button>
            <button onClick={onToggleBookmark} className="h-9 px-3 rounded-xl text-sm flex items-center gap-1.5" style={{ backgroundColor: 'rgba(251,191,36,0.15)', color: isBookmarked ? '#fbbf24' : '#9ca3af' }}>
              <Bookmark className="w-4 h-4" fill={isBookmarked ? '#fbbf24' : 'none'} />
              {resource.bookmarks + (isBookmarked ? 1 : 0)}
            </button>
            {canManage && (
              <>
                <button onClick={onEditRequest} className="h-9 px-3 rounded-xl text-sm" style={{ backgroundColor: 'rgba(108,92,231,0.22)', color: '#c4b5fd' }}>
                  {LABELS.libraryEditButton}
                </button>
                <button onClick={onDelete} className="h-9 px-3 rounded-xl text-sm flex items-center gap-1.5" style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#fca5a5' }}>
                  <Trash2 className="w-4 h-4" />
                  {LABELS.libraryDeleteButton}
                </button>
              </>
            )}
          </div>

          <div className="rounded-xl p-3 space-y-2" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="flex items-center gap-1.5 text-sm font-bold text-white">
              <MessageCircle className="w-4 h-4 text-indigo-300" />
              {LABELS.libraryCommentTitle} ({comments.length})
            </div>
            <div className="space-y-2 max-h-52 overflow-auto">
              {comments.length === 0 ? (
                <p className="text-xs text-gray-500">{LABELS.libraryCommentEmpty}</p>
              ) : comments.map(comment => (
                <div key={comment.id} className="rounded-lg px-3 py-2" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                  <p className="text-xs text-gray-300">{comment.authorEmoji} {comment.authorName}</p>
                  <p className="text-sm text-gray-100 mt-1 whitespace-pre-wrap">{comment.content}</p>
                  <p className="text-[11px] text-gray-500 mt-1">{formatDateTime(comment.createdAt)}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                value={newComment}
                onChange={event => setNewComment(event.target.value)}
                placeholder={LABELS.libraryCommentPlaceholder}
                className="flex-1 h-10 px-3 rounded-lg text-sm text-white placeholder-gray-600 outline-none"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <button
                onClick={() => {
                  if (!newComment.trim()) return;
                  onCreateComment(newComment);
                  setNewComment('');
                }}
                className="h-10 px-3 rounded-lg text-xs font-bold"
                style={{ backgroundColor: 'rgba(108,92,231,0.25)', color: '#ddd6fe' }}
              >
                {LABELS.libraryCommentSubmitButton}
              </button>
            </div>
          </div>

        </div>
      </div>

      {showReportDialog && !canManage && (
        <RoadmapReportDialog
          roadmapTitle={resource.title}
          onClose={() => setShowReportDialog(false)}
          onSubmit={(reasonId, detail) => onReport(reasonId, detail)}
        />
      )}
    </div>
  );
}
