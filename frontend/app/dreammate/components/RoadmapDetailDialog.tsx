'use client';

import { useMemo, useState } from 'react';
import { Bookmark, CornerDownRight, Heart, MessageSquare, Pencil, Send, Trash2, X } from 'lucide-react';
import { LABELS, PERIOD_FILTERS } from '../config';
import type { DreamSpace, RoadmapComment, RoadmapShareScope, SharedRoadmap } from '../types';
import {
  buildChronologicalParentTree,
  type ParentTreeNode,
} from '@/lib/timelineTreeUtils';
import { RoadmapCareerPathTimelineSection } from './RoadmapCareerPathTimelineSection';
import { RoadmapShareDialog } from './RoadmapShareDialog';

interface RoadmapDetailDialogProps {
  roadmap: SharedRoadmap;
  isLiked: boolean;
  isBookmarked: boolean;
  likeCount: number;
  bookmarkCount: number;
  isOwnedByCurrentUser: boolean;
  availableSpaces: DreamSpace[];
  onClose: () => void;
  onToggleLike: () => void;
  onToggleBookmark: () => void;
  onUseRoadmap: () => void;
  onShareRoadmap: (shareScope: RoadmapShareScope, spaceIds: string[]) => void;
  onEdit: () => void;
  onDelete: () => void;
  onCreateComment: (comment: string, parentId?: string) => void;
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

export function RoadmapDetailDialog({
  roadmap,
  isLiked,
  isBookmarked,
  likeCount,
  bookmarkCount,
  isOwnedByCurrentUser,
  availableSpaces,
  onClose,
  onToggleLike,
  onToggleBookmark,
  onUseRoadmap,
  onShareRoadmap,
  onEdit,
  onDelete,
  onCreateComment,
}: RoadmapDetailDialogProps) {
  const [activeSection, setActiveSection] = useState<'timeline' | 'comments'>('timeline');
  const [commentInput, setCommentInput] = useState('');
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);
  const [commentSortOrder, setCommentSortOrder] = useState<'oldest' | 'latest'>('oldest');
  const [showShareDialog, setShowShareDialog] = useState(false);
  const periodLabel = useMemo(
    () => PERIOD_FILTERS.find(item => item.id === roadmap.period)?.label ?? roadmap.period,
    [roadmap.period],
  );

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
        <div className="sticky top-0 z-10 px-5 pt-5 pb-4" style={{ backgroundColor: '#12122a', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{roadmap.ownerEmoji}</span>
                <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: `${roadmap.starColor}22`, color: roadmap.starColor }}>
                  {periodLabel}
                </span>
              </div>
              <h3 className="text-lg font-black text-white">{roadmap.title}</h3>
              <p className="text-xs text-gray-400 mt-1">{roadmap.ownerName} · {formatDateTime(roadmap.sharedAt)}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <X className="w-4 h-4 text-gray-300" />
            </button>
          </div>
        </div>

        <div className="px-5 py-2 border-b border-white/10">
          <div className="flex gap-1.5">
            {[
              { id: 'timeline' as const, label: LABELS.timelineViewLabel },
              { id: 'comments' as const, label: `${LABELS.commentLabel} ${roadmap.comments.length}` },
            ].map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className="flex-1 h-9 rounded-xl text-xs font-bold transition-all"
                style={activeSection === section.id
                  ? { backgroundColor: 'rgba(108,92,231,0.22)', color: '#ddd6fe', border: '1px solid rgba(168,85,247,0.5)' }
                  : { backgroundColor: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 py-4 space-y-4 overflow-y-auto" style={{ paddingBottom: 110 }}>
          <div className="rounded-2xl p-4" style={{ backgroundColor: `${roadmap.starColor}10`, border: `1px solid ${roadmap.starColor}24` }}>
            <p className="text-sm text-gray-200">{roadmap.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onToggleLike}
              className="h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              style={isLiked ? { backgroundColor: 'rgba(239,68,68,0.2)', color: '#f87171' } : { backgroundColor: 'rgba(255,255,255,0.05)', color: '#9ca3af' }}
            >
              <Heart className="w-3.5 h-3.5" fill={isLiked ? '#f87171' : 'none'} />
              {likeCount}
            </button>
            <button
              onClick={onToggleBookmark}
              className="h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              style={isBookmarked ? { backgroundColor: 'rgba(251,191,36,0.2)', color: '#facc15' } : { backgroundColor: 'rgba(255,255,255,0.05)', color: '#9ca3af' }}
            >
              <Bookmark className="w-3.5 h-3.5" fill={isBookmarked ? '#facc15' : 'none'} />
              {bookmarkCount}
            </button>
          </div>

          {isOwnedByCurrentUser && (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onEdit}
                className="h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                style={{ backgroundColor: 'rgba(168,85,247,0.2)', color: '#d8b4fe' }}
              >
                <Pencil className="w-3.5 h-3.5" />
                수정하기
              </button>
              <button
                onClick={onDelete}
                className="h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                style={{ backgroundColor: 'rgba(239,68,68,0.18)', color: '#f87171' }}
              >
                <Trash2 className="w-3.5 h-3.5" />
                삭제하기
              </button>
            </div>
          )}

          {activeSection === 'timeline' && (
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-white">{LABELS.timelineViewLabel}</h4>
              <RoadmapCareerPathTimelineSection roadmap={roadmap} />
            </div>
          )}

          {activeSection === 'comments' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-white">{LABELS.commentViewLabel}</h4>
                <button
                  onClick={() => setCommentSortOrder(previous => previous === 'oldest' ? 'latest' : 'oldest')}
                  className="h-7 px-2.5 rounded-lg text-[10px] font-bold"
                  style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {LABELS.chronologicalSortLabel} · {commentSortOrder === 'oldest' ? LABELS.oldestFirstLabel : LABELS.latestFirstLabel}
                </button>
              </div>
              <div className="space-y-2">
                {commentTree.length === 0 ? (
                  <p className="text-xs text-gray-500">{LABELS.noCommentLabel}</p>
                ) : (
                  commentTree.map(node => (
                    <CommentTreeNode
                      key={node.id}
                      node={node}
                      depth={0}
                      replyTargetId={replyTargetId}
                      onReply={(parentId) => setReplyTargetId(parentId)}
                      onReplyCancel={() => setReplyTargetId(null)}
                      onReplySubmit={(text, parentId) => onCreateComment(text, parentId)}
                    />
                  ))
                )}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
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
          )}
        </div>

        <div
          className="absolute left-0 right-0 bottom-0 px-5 pt-2"
          style={{
            background: 'linear-gradient(180deg, rgba(18,18,42,0.5), #12122a 36%)',
            paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {isOwnedByCurrentUser ? (
            <button
              onClick={() => setShowShareDialog(true)}
              className="w-full h-12 rounded-2xl text-sm font-black text-white"
              style={{ background: 'linear-gradient(135deg, #6C5CE7, #a855f7)' }}
            >
              {LABELS.shareRoadmapButtonLarge}
            </button>
          ) : (
            <button
              onClick={onUseRoadmap}
              className="w-full h-12 rounded-2xl text-sm font-black text-white"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)' }}
            >
              {LABELS.useRoadmapButton}
            </button>
          )}
        </div>
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

