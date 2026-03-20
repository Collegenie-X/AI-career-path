'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronUp, CornerDownRight, ExternalLink, MessageSquare, MoreVertical, Pencil, Send, Share2, Trash2, X, Flag } from 'lucide-react';
import { LABELS, PERIOD_FILTERS, ROADMAP_SHARE_VISIBILITY_OPTIONS } from '../config';
import type { DreamSpace, RoadmapComment, RoadmapShareChannel, SharedRoadmap } from '../types';
import { getShareChannelsFromRoadmap } from '../types';
import {
  buildChronologicalParentTree,
  type ParentTreeNode,
} from '@/lib/timelineTreeUtils';
import { RoadmapTreeView } from './RoadmapTreeView';
import { getRoadmapEffectiveTodoCounts } from '../utils/roadmapTodoCounts';
import { RoadmapReportDialog } from './RoadmapReportDialog';

interface RoadmapDetailDialogProps {
  roadmap: SharedRoadmap;
  isOwnedByCurrentUser: boolean;
  showTimelineProgressBars?: boolean;
  isReferenceViewOnlyMode?: boolean;
  isFeedDetailView?: boolean;
  availableSpaces: DreamSpace[];
  variant?: 'dialog' | 'page' | 'inline';
  onClose: () => void;
  onUseRoadmap: () => void;
  onShareRoadmap: (shareChannels: RoadmapShareChannel[], spaceIds: string[]) => void;
  onReportRoadmap: (reasonId: string, detail: string) => void;
  onEdit: () => void;
  onShare: () => void;
  onDelete: () => void;
  onCreateComment: (comment: string, parentId?: string) => void;
  onToggleTodoItem: (itemId: string, todoId: string) => void;
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
}

function hasRoadmapShareableResult(roadmap: SharedRoadmap): boolean {
  const hasFinalResultAsset = Boolean(roadmap.finalResultUrl?.trim() || roadmap.finalResultImageUrl?.trim());
  const hasMilestoneAsset = (roadmap.milestoneResults ?? []).some(result =>
    Boolean(result.resultUrl?.trim() || result.imageUrl?.trim()),
  );
  return hasFinalResultAsset || hasMilestoneAsset;
}

export function RoadmapDetailDialog({
  roadmap,
  isOwnedByCurrentUser,
  showTimelineProgressBars = true,
  isReferenceViewOnlyMode = false,
  isFeedDetailView = false,
  availableSpaces,
  variant = 'dialog',
  onClose,
  onUseRoadmap,
  onShareRoadmap,
  onReportRoadmap,
  onEdit,
  onShare,
  onDelete,
  onCreateComment,
  onToggleTodoItem,
}: RoadmapDetailDialogProps) {
  const [commentInput, setCommentInput] = useState('');
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);
  const [commentSortOrder, setCommentSortOrder] = useState<'oldest' | 'latest'>('oldest');
  const [showDeleteConfirmationActions, setShowDeleteConfirmationActions] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [showUseRoadmapCustomizeDialog, setShowUseRoadmapCustomizeDialog] = useState(false);
  const [isMilestoneResultsOpen, setIsMilestoneResultsOpen] = useState(true);
  const [isFinalResultOpen, setIsFinalResultOpen] = useState(true);
  const [expandedMilestoneIds, setExpandedMilestoneIds] = useState<Set<string>>(() => {
    const firstResult = (roadmap.milestoneResults ?? [])[0];
    return firstResult ? new Set([firstResult.id]) : new Set();
  });
  const actionMenuRef = useRef<HTMLDivElement | null>(null);
  const periodLabel = useMemo(
    () => PERIOD_FILTERS.find(item => item.id === roadmap.period)?.label ?? roadmap.period,
    [roadmap.period],
  );
  const executionSummary = useMemo(() => {
    const allTodoItems = roadmap.items.flatMap(item => item.subItems ?? []);
    const { total: totalActionableTodoCount, done: doneActionableTodoCount } = getRoadmapEffectiveTodoCounts(roadmap.items);
    const outputDefinedItemCount = roadmap.items.filter(item => item.targetOutput || item.successCriteria).length;
    const evidenceCount = allTodoItems.filter(todoItem => Boolean(todoItem.outputRef?.trim())).length;
    return {
      outputDefinedItemCount,
      evidenceCount,
      doneActionableTodoCount,
      totalActionableTodoCount,
    };
  }, [roadmap.items]);

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
  const canSharePublicly = hasRoadmapShareableResult(roadmap);
  const isPageVariant = variant === 'page';
  const isInlineVariant = variant === 'inline';

  const shareChannels = getShareChannelsFromRoadmap(roadmap);
  const shareBadgeLabel = (() => {
    const privateOpt = ROADMAP_SHARE_VISIBILITY_OPTIONS.find((o) => o.id === 'private');
    const publicOpt = ROADMAP_SHARE_VISIBILITY_OPTIONS.find((o) => o.id === 'public');
    const spaceOpt = ROADMAP_SHARE_VISIBILITY_OPTIONS.find((o) => o.id === 'space');
    if (shareChannels.length === 0) {
      return { label: privateOpt?.label ?? '비공개', emoji: privateOpt?.emoji ?? '🔒', color: privateOpt?.color ?? '#94A3B8' };
    }
    const labels: string[] = [];
    if (shareChannels.includes('public')) labels.push(publicOpt?.label ?? '전체 공유');
    if (shareChannels.includes('space')) {
      const groupCount = (roadmap.groupIds ?? []).length;
      labels.push(groupCount > 0 ? `그룹 ${groupCount}개` : (spaceOpt?.label ?? '그룹 공유'));
    }
    return {
      label: labels.join(' · '),
      emoji: shareChannels.includes('public') ? (publicOpt?.emoji ?? '🌐') : (spaceOpt?.emoji ?? '🤝'),
      color: shareChannels.includes('public') ? (publicOpt?.color ?? '#22C55E') : (spaceOpt?.color ?? '#60A5FA'),
    };
  })();

  const wrapperClass = isInlineVariant
    ? 'w-full flex flex-col min-h-0'
    : isPageVariant
      ? 'min-h-screen w-full max-w-[645px] mx-auto flex flex-col'
      : 'fixed inset-0 z-50 flex items-end justify-center';

  const innerClass = isInlineVariant
    ? 'relative w-full flex flex-col min-h-0 overflow-y-auto'
    : isPageVariant
      ? 'relative w-full flex flex-col min-h-screen'
      : 'relative w-full flex flex-col max-w-[645px] rounded-t-3xl overflow-hidden';

  const innerStyle = isInlineVariant
    ? { backgroundColor: 'transparent' }
    : isPageVariant
      ? { backgroundColor: '#12122a' }
      : { backgroundColor: '#12122a', border: '1px solid rgba(255,255,255,0.08)', maxHeight: 'calc(100vh - 56px)', marginBottom: 56 };

  return (
    <div className={wrapperClass}>
      {!isPageVariant && !isInlineVariant && (
        <>
          <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" onClick={onClose} />
        </>
      )}
      <div className={innerClass} style={innerStyle}>
        <div className="sticky top-0 z-10 px-4 pt-4 pb-3 space-y-2" style={{ backgroundColor: '#12122a', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {isPageVariant ? (
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
                  style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                  aria-label="뒤로 가기"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-300" />
                </button>
              ) : null}
              <span className="text-base">{roadmap.ownerEmoji}</span>
              <span className="text-sm font-semibold px-2 py-1 rounded-full whitespace-nowrap" style={{ backgroundColor: `${roadmap.starColor}22`, color: roadmap.starColor }}>
                {periodLabel}
              </span>
              <span
                className="text-sm font-semibold px-2 py-1 rounded-full whitespace-nowrap flex items-center gap-1"
                style={{ backgroundColor: `${shareBadgeLabel.color}22`, color: shareBadgeLabel.color }}
              >
                <span>{shareBadgeLabel.emoji}</span>
                {shareBadgeLabel.label}
              </span>
              <span className="text-sm text-gray-500 truncate">{formatDateTime(roadmap.sharedAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              {!isOwnedByCurrentUser && !isReferenceViewOnlyMode && (
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
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm font-semibold text-red-300"
                        style={{ backgroundColor: 'rgba(239,68,68,0.08)' }}
                      >
                        <Flag className="w-3.5 h-3.5" />
                        {LABELS.roadmapReportMenuLabel}
                      </button>
                    </div>
                  )}
                </div>
              )}
              {!isPageVariant && !isInlineVariant && (
                <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} aria-label="닫기">
                  <X className="w-4 h-4 text-gray-300" />
                </button>
              )}
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="text-xl font-black text-white leading-tight tracking-tight">{roadmap.title}</h3>
            <p className="text-sm text-gray-400 truncate">{roadmap.ownerName}</p>
          </div>

          {isOwnedByCurrentUser && !isReferenceViewOnlyMode && (
            <div className="flex flex-wrap gap-2 pt-3 border-t border-white/8 mt-3">
              <button
                onClick={onEdit}
                className="flex items-center justify-center gap-1.5 h-9 px-4 rounded-xl text-sm font-bold transition-all active:scale-[0.98]"
                style={{
                  backgroundColor: `${roadmap.starColor}22`,
                  color: roadmap.starColor,
                  border: `1px solid ${roadmap.starColor}44`,
                }}
              >
                <Pencil className="w-3.5 h-3.5" />
                {LABELS.roadmapEditButtonLabel ?? LABELS.editButtonLabel ?? '수정하기'}
              </button>
              <button
                onClick={onShare}
                className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98]"
                style={{
                  backgroundColor: shareChannels.length > 0 ? `${shareBadgeLabel.color}18` : 'rgba(255,255,255,0.07)',
                  color: shareChannels.length > 0 ? shareBadgeLabel.color : 'rgba(255,255,255,0.5)',
                  border: shareChannels.length > 0 ? `1px solid ${shareBadgeLabel.color}40` : '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <Share2 className="w-3.5 h-3.5" />
                {LABELS.shareRoadmapButtonLarge ?? '공유'}
              </button>
              {!showDeleteConfirmationActions ? (
                <button
                  onClick={() => setShowDeleteConfirmationActions(true)}
                  className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl text-sm font-bold transition-all active:scale-[0.98]"
                  style={{
                    backgroundColor: 'rgba(239,68,68,0.12)',
                    color: '#ef4444',
                    border: '1px solid rgba(239,68,68,0.28)',
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {LABELS.deleteButtonLabel ?? '삭제'}
                </button>
              ) : (
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setShowDeleteConfirmationActions(false)}
                    className="h-9 px-3 rounded-xl text-sm font-semibold"
                    style={{ backgroundColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}
                  >
                    {LABELS.cancelButtonLabel ?? '취소'}
                  </button>
                  <button
                    onClick={onDelete}
                    className="h-9 px-3 rounded-xl text-sm font-bold text-white"
                    style={{ backgroundColor: '#ef4444' }}
                  >
                    {LABELS.deleteConfirmButtonLabel ?? '삭제 확인'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-3"
          style={{ paddingBottom: isReferenceViewOnlyMode ? 16 : 12 }}
        >
          <div className="rounded-xl p-3" style={{ backgroundColor: `${roadmap.starColor}10`, border: `1px solid ${roadmap.starColor}24` }}>
            <p className="text-sm text-gray-200 leading-relaxed">{roadmap.description}</p>
          </div>
          <div className="rounded-xl p-3 space-y-1.5" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p className="text-sm font-bold text-white">실행 검증 요약</p>
            <p className="text-sm text-violet-200">산출물/완료기준 정의 항목: {executionSummary.outputDefinedItemCount}개</p>
            <p className="text-sm text-emerald-200">업무 증빙: {executionSummary.evidenceCount}건</p>
            <p className="text-sm text-cyan-200">
              실행 진행률: {executionSummary.doneActionableTodoCount}/{executionSummary.totalActionableTodoCount}
            </p>
          </div>

          {/* 중간 결과물 - 데이터 있을 때만 표시 */}
          {(roadmap.milestoneResults ?? []).length > 0 && (
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(56,189,248,0.07) 0%, rgba(99,102,241,0.07) 100%)', border: '1px solid rgba(56,189,248,0.2)' }}
            >
              <button
                type="button"
                onClick={() => setIsMilestoneResultsOpen(prev => !prev)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🏁</span>
                  <div>
                    <p className="text-sm font-bold text-sky-200">{LABELS.roadmapMilestoneResultSectionLabel ?? '중간 결과물'}</p>
                    <p className="text-sm text-sky-400/70 mt-0.5">{(roadmap.milestoneResults ?? []).length}개 기록됨</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(56,189,248,0.2)', color: '#7dd3fc' }}>
                    {(roadmap.milestoneResults ?? []).length}
                  </span>
                  {isMilestoneResultsOpen ? (
                    <ChevronUp className="w-4 h-4 text-sky-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-sky-400" />
                  )}
                </div>
              </button>

              {isMilestoneResultsOpen && (
                <div className="px-3 pb-3 space-y-2 border-t" style={{ borderColor: 'rgba(56,189,248,0.1)' }}>
                  {(roadmap.milestoneResults ?? []).map((result, index) => {
                    const isExpanded = expandedMilestoneIds.has(result.id);
                    return (
                      <article
                        key={result.id}
                        className="rounded-xl overflow-hidden"
                        style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(56,189,248,0.12)' }}
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedMilestoneIds(prev => {
                            const next = new Set(prev);
                            if (next.has(result.id)) next.delete(result.id);
                            else next.add(result.id);
                            return next;
                          })}
                          className="w-full flex items-center justify-between px-3 py-2.5 text-left"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className="w-5 h-5 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                              style={{ backgroundColor: 'rgba(56,189,248,0.2)', color: '#7dd3fc' }}
                            >
                              {index + 1}
                            </span>
                            <span className="text-sm font-semibold text-white truncate">
                              {result.title || `${LABELS.roadmapMilestoneResultItemLabel ?? '중간 결과물'} ${index + 1}`}
                            </span>
                            {result.monthWeekLabel && (
                              <span className="text-sm text-sky-400/60 whitespace-nowrap flex-shrink-0">
                                {result.monthWeekLabel}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {result.imageUrl && <span className="text-sm">🖼️</span>}
                            {result.resultUrl && <span className="text-sm">🔗</span>}
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="px-3 pb-3 space-y-2 border-t" style={{ borderColor: 'rgba(56,189,248,0.08)' }}>
                            {result.description && (
                              <p className="pt-2 text-sm text-gray-300 leading-relaxed whitespace-pre-line">{result.description}</p>
                            )}
                            {result.imageUrl && (
                              <img
                                src={result.imageUrl}
                                alt={result.title || `${LABELS.roadmapMilestoneResultItemLabel ?? '중간 결과물'} ${index + 1}`}
                                className="w-full max-h-52 object-cover rounded-lg border border-white/10"
                              />
                            )}
                            {result.resultUrl && (
                              <a
                                href={result.resultUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1.5 text-sm font-semibold text-cyan-300 hover:text-cyan-200 break-all"
                              >
                                <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="underline underline-offset-2 truncate">{result.resultUrl}</span>
                              </a>
                            )}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 최종 결과물 - 데이터 있을 때만 표시 */}
          {(roadmap.finalResultTitle || roadmap.finalResultDescription || roadmap.finalResultUrl || roadmap.finalResultImageUrl) && (
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(6,182,212,0.06) 100%)', border: '1px solid rgba(16,185,129,0.28)' }}
            >
              <button
                type="button"
                onClick={() => setIsFinalResultOpen(prev => !prev)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">🏆</span>
                  <div>
                    <p className="text-sm font-bold text-emerald-200">{LABELS.roadmapFinalResultSectionLabel ?? '최종 결과물'}</p>
                    {roadmap.finalResultTitle && (
                      <p className="text-sm text-emerald-400/70 mt-0.5 truncate max-w-[200px]">{roadmap.finalResultTitle}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {(roadmap.finalResultUrl || roadmap.finalResultImageUrl) && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  )}
                  {isFinalResultOpen ? (
                    <ChevronUp className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
              </button>

              {isFinalResultOpen && (
                <div className="px-4 pb-4 space-y-2.5 border-t" style={{ borderColor: 'rgba(16,185,129,0.12)' }}>
                  {roadmap.finalResultDescription && (
                    <p className="pt-2 text-sm text-gray-300 leading-relaxed whitespace-pre-line">{roadmap.finalResultDescription}</p>
                  )}
                  {roadmap.finalResultImageUrl && (
                    <img
                      src={roadmap.finalResultImageUrl}
                      alt={roadmap.finalResultTitle ?? '최종 결과물 이미지'}
                      className="w-full max-h-56 object-cover rounded-xl border border-white/10"
                    />
                  )}
                  {roadmap.finalResultUrl && (
                    <a
                      href={roadmap.finalResultUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-sm font-semibold text-cyan-300 hover:text-cyan-200"
                    >
                      <ExternalLink className="w-4 h-4 flex-shrink-0" />
                      <span className="underline underline-offset-2 break-all">{roadmap.finalResultUrl}</span>
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white">{LABELS.timelineViewLabel}</h4>
            <RoadmapTreeView
              roadmap={roadmap}
              showProgressBars={showTimelineProgressBars}
              showTodoCheckboxes={!isFeedDetailView}
              onToggleTodoItem={
                isReferenceViewOnlyMode || isFeedDetailView
                  ? undefined
                  : (isOwnedByCurrentUser ? onToggleTodoItem : undefined)
              }
            />
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-white">{LABELS.commentViewLabel} {roadmap.comments.length}</h4>
              <button
                onClick={() => setCommentSortOrder(previous => previous === 'oldest' ? 'latest' : 'oldest')}
                className="h-8 px-3 rounded-lg text-sm font-bold"
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

        {!isOwnedByCurrentUser && !isReferenceViewOnlyMode && (
          <div
            className="w-full px-4 pt-3 pb-4 shrink-0"
            style={{
              backgroundColor: '#12122a',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
            }}
          >
            <button
              onClick={() => setShowUseRoadmapCustomizeDialog(true)}
              className="w-full h-12 rounded-none text-sm font-black text-white"
              style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)' }}
            >
              {LABELS.useRoadmapButton}
            </button>
          </div>
        )}

      </div>

      {showReportDialog && !isOwnedByCurrentUser && !isReferenceViewOnlyMode && (
        <RoadmapReportDialog
          roadmapTitle={roadmap.title}
          onClose={() => setShowReportDialog(false)}
          onSubmit={(reasonId, detail) => onReportRoadmap(reasonId, detail)}
        />
      )}

      {showUseRoadmapCustomizeDialog && (
        <RoadmapUseCustomizeDialog
          onClose={() => setShowUseRoadmapCustomizeDialog(false)}
          onConfirm={() => {
            setShowUseRoadmapCustomizeDialog(false);
            onUseRoadmap();
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
        <p className="text-sm text-white">
          <span className="mr-1">{node.authorEmoji}</span>
          <span className="font-semibold">{node.authorName}</span>
        </p>
        <p className="text-sm text-gray-300 mt-1">{node.content}</p>
        <div className="mt-1 flex items-center gap-2">
          <p className="text-sm text-gray-500">{formatDateTime(node.createdAt)}</p>
          <button
            onClick={() => onReply(node.id)}
            className="text-sm font-semibold text-gray-400 flex items-center gap-1"
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
            className="flex-1 h-8 px-2.5 rounded-lg text-sm text-white placeholder-gray-600 outline-none"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          <button
            onClick={() => {
              if (!replyText.trim()) return;
              onReplySubmit(replyText.trim(), node.id);
              setReplyText('');
              onReplyCancel();
            }}
            className="text-sm px-2.5 py-1.5 rounded-lg"
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

function RoadmapUseCustomizeDialog({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-[645px] rounded-t-3xl px-5 pt-6 pb-6"
        style={{ backgroundColor: '#12122a', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <div className="flex flex-col items-center text-center gap-3 mb-5">
          <span className="text-4xl">✏️</span>
          <h3 className="text-base font-black text-white leading-snug">
            {LABELS.useRoadmapCustomizeDialogTitle}
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
            {LABELS.useRoadmapCustomizeDialogMessage}
          </p>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={onConfirm}
            className="w-full h-12 rounded-2xl text-sm font-black text-white transition-all active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #6C5CE7, #a855f7)' }}
          >
            {LABELS.useRoadmapCustomizeConfirmButton}
          </button>
          <button
            onClick={onClose}
            className="w-full h-11 rounded-2xl text-sm font-bold"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {LABELS.useRoadmapCustomizeCancelButton}
          </button>
        </div>
      </div>
    </div>
  );
}

