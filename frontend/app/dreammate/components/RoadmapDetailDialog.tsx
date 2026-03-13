'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CornerDownRight, MessageSquare, MoreVertical, Pencil, Send, Trash2, X, Flag } from 'lucide-react';
import { LABELS, PERIOD_FILTERS } from '../config';
import type { DreamSpace, RoadmapComment, RoadmapShareScope, SharedRoadmap } from '../types';
import {
  buildChronologicalParentTree,
  type ParentTreeNode,
} from '@/lib/timelineTreeUtils';
import { RoadmapCareerPathTimelineSection } from './RoadmapCareerPathTimelineSection';
import { RoadmapReportDialog } from './RoadmapReportDialog';
import { RoadmapShareDialog } from './RoadmapShareDialog';

interface RoadmapDetailDialogProps {
  roadmap: SharedRoadmap;
  isOwnedByCurrentUser: boolean;
  isTodoListSimpleView?: boolean;
  availableSpaces: DreamSpace[];
  onClose: () => void;
  onUseRoadmap: () => void;
  onShareRoadmap: (shareScope: RoadmapShareScope, spaceIds: string[]) => void;
  onReportRoadmap: (reasonId: string, detail: string) => void;
  onEdit: () => void;
  onDelete: () => void;
  onCreateComment: (comment: string, parentId?: string) => void;
  onToggleTodoItem: (itemId: string, todoId: string) => void;
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

export function RoadmapDetailDialog({
  roadmap,
  isOwnedByCurrentUser,
  isTodoListSimpleView = false,
  availableSpaces,
  onClose,
  onUseRoadmap,
  onShareRoadmap,
  onReportRoadmap,
  onEdit,
  onDelete,
  onCreateComment,
  onToggleTodoItem,
}: RoadmapDetailDialogProps) {
  const [commentInput, setCommentInput] = useState('');
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);
  const [commentSortOrder, setCommentSortOrder] = useState<'oldest' | 'latest'>('oldest');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showDeleteConfirmationActions, setShowDeleteConfirmationActions] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const actionMenuRef = useRef<HTMLDivElement | null>(null);
  const periodLabel = useMemo(
    () => PERIOD_FILTERS.find(item => item.id === roadmap.period)?.label ?? roadmap.period,
    [roadmap.period],
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

  const commentTree = useMemo(() => {
    const chronologicalTree = buildChronologicalParentTree(roadmap.comments);
    return commentSortOrder === 'oldest'
      ? chronologicalTree
      : chronologicalTree.slice().reverse().map(reverseCommentTreeChronology);
  }, [commentSortOrder, roadmap.comments]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-[430px] rounded-t-3xl overflow-hidden flex flex-col"
        style={{ backgroundColor: '#12122a', border: '1px solid rgba(255,255,255,0.08)', maxHeight: 'calc(100vh - 56px)', marginBottom: 56 }}
      >
        <div className="sticky top-0 z-10 px-4 pt-4 pb-3 space-y-2" style={{ backgroundColor: '#12122a', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base">{roadmap.ownerEmoji}</span>
              <span className="text-[11px] font-semibold px-2 py-1 rounded-full whitespace-nowrap" style={{ backgroundColor: `${roadmap.starColor}22`, color: roadmap.starColor }}>
                {periodLabel}
              </span>
              <span className="text-[11px] text-gray-500 truncate">{formatDateTime(roadmap.sharedAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              {!isOwnedByCurrentUser && (
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
                <X className="w-4 h-4 text-gray-300" />
              </button>
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="text-xl font-black text-white leading-tight tracking-tight">{roadmap.title}</h3>
            <p className="text-[11px] text-gray-400 truncate">{roadmap.ownerName}</p>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3" style={{ paddingBottom: isOwnedByCurrentUser ? 116 : 110 }}>
          <div className="rounded-xl p-3" style={{ backgroundColor: `${roadmap.starColor}10`, border: `1px solid ${roadmap.starColor}24` }}>
            <p className="text-xs text-gray-200 leading-relaxed">{roadmap.description}</p>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white">{LABELS.timelineViewLabel}</h4>
            <RoadmapCareerPathTimelineSection
              roadmap={roadmap}
              isTodoListSimpleView={isTodoListSimpleView}
              onToggleTodoItem={isOwnedByCurrentUser && !isTodoListSimpleView ? onToggleTodoItem : undefined}
            />
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-white">{LABELS.commentViewLabel} {roadmap.comments.length}</h4>
              <button
                onClick={() => setCommentSortOrder(previous => previous === 'oldest' ? 'latest' : 'oldest')}
                className="h-7 px-2.5 rounded-lg text-[10px] font-bold"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {LABELS.chronologicalSortLabel} · {commentSortOrder === 'oldest' ? LABELS.oldestFirstLabel : LABELS.latestFirstLabel}
              </button>
            </div>

            {commentTree.length === 0 ? (
              <div className="rounded-xl p-4 text-center" style={{ border: '1px dashed rgba(255,255,255,0.12)' }}>
                <p className="text-sm text-gray-500">{LABELS.noCommentLabel}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {commentTree.map(node => (
                  <CommentTreeNode
                    key={node.id}
                    node={node}
                    depth={0}
                    replyTargetId={replyTargetId}
                    onReply={(parentId) => setReplyTargetId(parentId)}
                    onReplyCancel={() => setReplyTargetId(null)}
                    onReplySubmit={(text, parentId) => onCreateComment(text, parentId)}
                  />
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                value={commentInput}
                onChange={event => setCommentInput(event.target.value)}
                placeholder={LABELS.commentInputPlaceholder}
                className="flex-1 h-10 px-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
              />
              <button
                onClick={() => {
                  if (!commentInput.trim()) return;
                  onCreateComment(commentInput.trim());
                  setCommentInput('');
                }}
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'rgba(108,92,231,0.25)', color: '#ddd6fe' }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {!isOwnedByCurrentUser && (
          <div
            className="absolute left-0 right-0 bottom-0 px-4 pt-2"
            style={{
              background: 'linear-gradient(180deg, rgba(18,18,42,0.5), #12122a 36%)',
              paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
              borderTop: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <button
              onClick={onUseRoadmap}
              className="w-full h-12 rounded-2xl text-sm font-black text-white"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)' }}
            >
              {LABELS.useRoadmapButton}
            </button>
          </div>
        )}

        {isOwnedByCurrentUser && (
          <div
            className="absolute left-0 right-0 bottom-0 px-4 pt-2"
            style={{
              background: 'linear-gradient(180deg, rgba(18,18,42,0.5), #12122a 36%)',
              paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
              borderTop: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            {!showDeleteConfirmationActions ? (
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={onEdit}
                  className="h-11 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-1.5"
                  style={{ background: 'linear-gradient(135deg, #6C5CE7, #a855f7)', boxShadow: '0 8px 18px rgba(108,92,231,0.35)' }}
                >
                  <Pencil className="w-4 h-4" />
                  {LABELS.editButtonLabel}
                </button>
                <button
                  onClick={() => setShowShareDialog(true)}
                  className="h-11 rounded-2xl text-sm font-bold text-white/80"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
                >
                  {LABELS.shareRoadmapButtonLarge}
                </button>
                <button
                  onClick={() => setShowDeleteConfirmationActions(true)}
                  className="h-11 rounded-2xl text-sm font-bold flex items-center justify-center gap-1.5"
                  style={{ backgroundColor: 'rgba(239,68,68,0.18)', color: '#f87171', border: '1px solid rgba(239,68,68,0.35)' }}
                >
                  <Trash2 className="w-4 h-4" />
                  {LABELS.deleteButtonLabel}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowDeleteConfirmationActions(false)}
                  className="h-11 rounded-2xl text-sm font-bold"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.75)' }}
                >
                  {LABELS.cancelButtonLabel}
                </button>
                <button
                  onClick={onDelete}
                  className="h-11 rounded-2xl text-sm font-black text-white"
                  style={{ backgroundColor: '#ef4444' }}
                >
                  {LABELS.deleteConfirmButtonLabel}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showShareDialog && (
        <RoadmapShareDialog
          currentScope={roadmap.shareScope ?? 'private'}
          currentSpaceIds={roadmap.groupIds}
          spaces={availableSpaces}
          onClose={() => setShowShareDialog(false)}
          onSave={(shareScope, selectedSpaceIds) => {
            onShareRoadmap(shareScope, selectedSpaceIds);
            setShowShareDialog(false);
          }}
        />
      )}

      {showReportDialog && !isOwnedByCurrentUser && (
        <RoadmapReportDialog
          roadmapTitle={roadmap.title}
          onClose={() => setShowReportDialog(false)}
          onSubmit={(reasonId, detail) => onReportRoadmap(reasonId, detail)}
        />
      )}
    </div>
  );
}

function CommentTreeNode({
  node,
  depth,
  replyTargetId,
  onReply,
  onReplyCancel,
  onReplySubmit,
}: {
  node: ParentTreeNode<RoadmapComment>;
  depth: number;
  replyTargetId: string | null;
  onReply: (parentId: string) => void;
  onReplyCancel: () => void;
  onReplySubmit: (comment: string, parentId: string) => void;
}) {
  const [replyText, setReplyText] = useState('');
  const isReplyMode = replyTargetId === node.id;

  return (
    <div className={depth > 0 ? 'pl-4' : ''}>
      <div
        className="rounded-xl p-3"
        style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <p className="text-xs text-white">
          <span className="mr-1">{node.authorEmoji}</span>
          <span className="font-semibold">{node.authorName}</span>
        </p>
        <p className="text-xs text-gray-300 mt-1">{node.content}</p>
        <div className="mt-1 flex items-center gap-2">
          <p className="text-[10px] text-gray-500">{formatDateTime(node.createdAt)}</p>
          <button
            onClick={() => onReply(node.id)}
            className="text-[10px] font-semibold text-gray-400 flex items-center gap-1"
          >
            <MessageSquare className="w-3 h-3" />
            답글
          </button>
        </div>
      </div>

      {isReplyMode && (
        <div className="mt-1 pl-4 flex items-center gap-1">
          <CornerDownRight className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" />
          <input
            value={replyText}
            onChange={event => setReplyText(event.target.value)}
            placeholder={LABELS.replyInputPlaceholder}
            className="flex-1 h-8 px-2.5 rounded-lg text-xs text-white placeholder-gray-600 outline-none"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          <button
            onClick={() => {
              if (!replyText.trim()) return;
              onReplySubmit(replyText.trim(), node.id);
              setReplyText('');
              onReplyCancel();
            }}
            className="text-[10px] px-2 py-1 rounded-lg"
            style={{ backgroundColor: 'rgba(108,92,231,0.22)', color: '#ddd6fe' }}
          >
            등록
          </button>
        </div>
      )}

      {node.children.length > 0 && (
        <div className="mt-1 space-y-1">
          {node.children.map(child => (
            <CommentTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              replyTargetId={replyTargetId}
              onReply={onReply}
              onReplyCancel={onReplyCancel}
              onReplySubmit={onReplySubmit}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function reverseCommentTreeChronology<T extends RoadmapComment>(
  node: ParentTreeNode<T>,
): ParentTreeNode<T> {
  return {
    ...node,
    children: node.children.slice().reverse().map(child => reverseCommentTreeChronology(child as ParentTreeNode<T>)),
  };
}

