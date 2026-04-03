'use client';

/**
 * 공통 공유 패스 상세 UI
 * - CommunityDetailPanel(2열 패널)과 SharedPlanDetailDialog(모달)에서 공통 사용
 */

import { useState, useRef, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  X, Shield, Globe, MessageSquare, Calendar,
  Heart, Bookmark, Flag, MoreVertical,
} from 'lucide-react';
import { GRADE_YEARS } from '../../config';
import type { SharedPlan, OperatorComment, OperatorCommentNode } from './types';
import { ReportModal, type ReportTarget } from '../ReportModal';
import { buildChronologicalParentTree, type ParentTreeNode } from '@/lib/timelineTreeUtils';
import { SharedPlanMyPathStyleTimeline } from './SharedPlanMyPathStyleTimeline';
import { CommunityCommentBubble } from './CommunityDetailPanelCommentBubble';
import { CareerPathDetailExpandHeaderButton } from '../expandable-detail';
import { postSharedPlanComment, hasCareerPathBackendAuth } from '@/lib/career-path/sharedPlanApi';
import { isUuidString } from '@/lib/career-path/isUuidString';
import { sharedPlanCommunityDetailQueryKey } from '@/app/career/hooks/useSharedPlanCommunityDetailQuery';
import { CAREER_SHARED_PLANS_QUERY_KEY } from '@/app/career/hooks/useSharedPlansQuery';

/* ─── Comment input ─── */
function CommentInput({
  onSend,
  starColor,
  disabled,
  busy,
  placeholder = '코멘트를 남겨보세요...',
}: {
  readonly onSend: (text: string, parentId?: string) => void;
  readonly starColor: string;
  readonly disabled?: boolean;
  readonly busy?: boolean;
  readonly placeholder?: string;
}) {
  const [text, setText] = useState('');
  const locked = Boolean(disabled || busy);
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl"
      style={{
        backgroundColor: 'rgba(255,255,255,0.05)',
        opacity: locked ? 0.55 : 1,
      }}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0"
        style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
      >
        🧑
      </div>
      <input
        value={text}
        disabled={locked}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (locked) return;
          if (e.key === 'Enter' && !e.shiftKey && text.trim()) {
            e.preventDefault();
            onSend(text.trim());
            setText('');
          }
        }}
        placeholder={busy ? '전송 중…' : placeholder}
        className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 outline-none disabled:cursor-not-allowed"
      />
      {text.trim() && !locked && (
        <button
          type="button"
          onClick={() => {
            onSend(text.trim());
            setText('');
          }}
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
          style={{ background: `linear-gradient(135deg, ${starColor}, ${starColor}cc)` }}
        >
          <span className="text-white text-xs font-bold">↑</span>
        </button>
      )}
    </div>
  );
}

export type SharedPlanDetailContentProps = {
  readonly plan: SharedPlan;
  readonly isLiked: boolean;
  readonly isBookmarked: boolean;
  readonly likeCount: number;
  readonly bookmarkCount: number;
  readonly onToggleLike: () => void;
  readonly onToggleBookmark: () => void;
  readonly onClose: () => void;
  readonly onAddComment: (planId: string, comment: OperatorComment) => void;
  /** 패널: md에서 닫기 버튼 숨김, 다이얼로그: 항상 표시 */
  readonly variant?: 'panel' | 'dialog';
  /** 닫기 버튼 표시 여부 (variant=panel일 때 md 이상에서 false) */
  readonly showCloseButton?: boolean;
  /** 2열 패널에서만 — 상단 확대(580px 다이얼로그) */
  readonly onExpand?: () => void;
};

export function SharedPlanDetailContent({
  plan,
  isLiked,
  isBookmarked,
  likeCount,
  bookmarkCount,
  onToggleLike,
  onToggleBookmark,
  onClose,
  onAddComment,
  variant = 'panel',
  showCloseButton = true,
  onExpand,
}: SharedPlanDetailContentProps) {
  const queryClient = useQueryClient();
  const [comments, setComments] = useState<OperatorComment[]>(plan.operatorComments);
  const [activeSection, setActiveSection] = useState<'timeline' | 'comments'>('timeline');
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const [showContentMenu, setShowContentMenu] = useState(false);
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const isBackendPlan = isUuidString(plan.id);
  const canPostToServer = hasCareerPathBackendAuth() && isBackendPlan;

  const postCommentMut = useMutation({
    mutationFn: ({ text, parentId }: { text: string; parentId?: string }) =>
      postSharedPlanComment(plan.id, { content: text, parent: parentId ?? null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sharedPlanCommunityDetailQueryKey(plan.id) });
      queryClient.invalidateQueries({ queryKey: CAREER_SHARED_PLANS_QUERY_KEY });
    },
  });

  useEffect(() => {
    setComments(plan.operatorComments);
    setActiveSection('timeline');
    setReplyTargetId(null);
  }, [plan.id, plan.operatorComments]);

  useEffect(() => {
    if (activeSection === 'comments') {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments.length, activeSection]);

  const isOperatorOnly = (plan.shareType as string) === 'operator';
  const gradeInfo = GRADE_YEARS.find((g) => g.id === plan.ownerGrade);
  const sharedDate = new Date(plan.sharedAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleSendComment = (text: string, parentId?: string) => {
    if (canPostToServer) {
      postCommentMut.mutate({ text, parentId });
      return;
    }
    const newComment: OperatorComment = {
      id: `comment-${Date.now()}`,
      parentId,
      authorId: 'current-user',
      authorName: '나',
      authorEmoji: '🧑',
      authorRole: 'peer',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [...prev, newComment]);
    onAddComment(plan.id, newComment);
  };

  const mapNodeToOperatorCommentNode = (
    node: ParentTreeNode<OperatorComment>
  ): OperatorCommentNode => ({
    ...node,
    replies: node.children.map(mapNodeToOperatorCommentNode),
  });

  const commentTree = buildChronologicalParentTree(comments).map(mapNodeToOperatorCommentNode);

  const bodyPaddingClass = variant === 'dialog'
    ? 'px-5 py-4'
    : 'px-5 py-4';
  const bodyPaddingBottom = variant === 'dialog'
    ? 'max(6rem, calc(6rem + env(safe-area-inset-bottom, 0px)))'
    : undefined;

  return (
    <>
      <div
        className={`flex flex-col min-h-0 flex-1 overflow-hidden ${variant === 'dialog' ? 'h-full max-h-full' : 'h-full'}`}
      >
      {/* ── Header ── */}
      <div
        className="flex-shrink-0 px-5 pt-5 pb-4 relative"
        style={{
          background: `linear-gradient(135deg, ${plan.starColor}28, ${plan.starColor}0a)`,
          borderBottom: `1px solid ${plan.starColor}30`,
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{
                width: 52,
                height: 52,
                background: `linear-gradient(135deg, ${plan.starColor}40, ${plan.starColor}18)`,
                border: `1.5px solid ${plan.starColor}44`,
              }}
            >
              {plan.jobEmoji}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-black text-white leading-snug line-clamp-1">
                {plan.title}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className="text-[12px] text-gray-400">
                  {plan.ownerEmoji} {plan.ownerName}
                </span>
                {gradeInfo && (
                  <>
                    <span className="text-[12px] text-gray-600">·</span>
                    <span className="text-[12px] text-gray-500">{gradeInfo.fullLabel}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            {variant === 'panel' && onExpand && (
              <CareerPathDetailExpandHeaderButton onExpand={onExpand} />
            )}
            <button
              onClick={() => setShowContentMenu((m) => !m)}
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
              title="더보기"
            >
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </button>
            {showCloseButton && (
              <button
                onClick={onClose}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${variant === 'panel' ? 'md:hidden' : ''}`}
                style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                title="닫기"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
          {showContentMenu && (
            <>
              <div className="fixed inset-0 z-[101]" onClick={() => setShowContentMenu(false)} />
              <div
                className="absolute right-4 top-14 z-[102] rounded-2xl overflow-hidden w-40 shadow-2xl"
                style={{
                  backgroundColor: '#1a1a38',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <button
                  onClick={() => {
                    setShowContentMenu(false);
                    setReportTarget({ kind: 'content', id: plan.id, title: plan.title });
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-all"
                  style={{ color: '#ef4444' }}
                >
                  <Flag className="w-3.5 h-3.5 flex-shrink-0" />
                  콘텐츠 신고
                </button>
              </div>
            </>
          )}
        </div>

        {/* Info chips */}
        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          {isOperatorOnly ? (
            <span
              className="flex items-center gap-1 text-[12px] font-bold px-2 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(108,92,231,0.12)', color: '#a78bfa' }}
            >
              <Shield className="w-3 h-3" />운영자 공유
            </span>
          ) : (
            <span
              className="flex items-center gap-1 text-[12px] font-bold px-2 py-1 rounded-full"
              style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#22C55E' }}
            >
              <Globe className="w-3 h-3" />전체 공유
            </span>
          )}
          <span className="text-[12px] text-gray-500">
            {plan.starEmoji} {plan.starName}
          </span>
          <span className="text-[12px] text-gray-600">·</span>
          <span className="text-[12px] text-gray-500">
            {plan.yearCount}학년 · {plan.itemCount}개
          </span>
          <span className="text-[12px] text-gray-600">·</span>
          <span className="flex items-center gap-0.5 text-[12px] text-gray-500">
            <Calendar className="w-2.5 h-2.5" />
            {sharedDate}
          </span>
        </div>

        {/* Reaction bar */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleLike}
            className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all active:scale-95"
            style={
              isLiked
                ? { backgroundColor: 'rgba(255,100,119,0.12)' }
                : { backgroundColor: 'rgba(255,255,255,0.05)' }
            }
          >
            <Heart
              className="w-4 h-4 transition-all"
              style={{ color: isLiked ? '#FF6477' : '#666' }}
              fill={isLiked ? '#FF6477' : 'none'}
            />
            <span className="text-xs font-bold" style={{ color: isLiked ? '#FF6477' : '#888' }}>
              좋아요 {likeCount}
            </span>
          </button>
          <button
            onClick={onToggleBookmark}
            className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all active:scale-95"
            style={
              isBookmarked
                ? { backgroundColor: 'rgba(251,191,36,0.12)' }
                : { backgroundColor: 'rgba(255,255,255,0.05)' }
            }
          >
            <Bookmark
              className="w-4 h-4 transition-all"
              style={{ color: isBookmarked ? '#FBBF24' : '#666' }}
              fill={isBookmarked ? '#FBBF24' : 'none'}
            />
            <span className="text-xs font-bold" style={{ color: isBookmarked ? '#FBBF24' : '#888' }}>
              즐겨찾기 {bookmarkCount}
            </span>
          </button>
        </div>
      </div>

      {/* ── Section tabs (내 패스 PlanActionBar 영역과 동일한 색조) ── */}
      <div
        className="flex-shrink-0 flex gap-0"
        style={{ borderBottom: `1px solid ${plan.starColor}22` }}
      >
        {[
          { id: 'timeline' as const, label: '📋 커리어 타임라인' },
          {
            id: 'comments' as const,
            label: `💬 코멘트 ${comments.length > 0 ? `(${comments.length})` : ''}`,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className="flex-1 py-3 text-xs font-bold transition-all"
            style={
              activeSection === tab.id
                ? { color: '#a78bfa', borderBottom: '2px solid #a78bfa' }
                : {
                    color: 'rgba(255,255,255,0.35)',
                    borderBottom: '2px solid transparent',
                  }
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Scrollable body (min-h-0: flex 안에서 스크롤 영역 높이 제한) ── */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        {activeSection === 'timeline' ? (
          <div
            className={bodyPaddingClass}
            style={bodyPaddingBottom ? { paddingBottom: bodyPaddingBottom } : undefined}
          >
            <SharedPlanMyPathStyleTimeline sharedPlan={plan} />
          </div>
        ) : (
          <div
            className="px-5 py-4 space-y-3"
            style={bodyPaddingBottom ? { paddingBottom: bodyPaddingBottom } : undefined}
          >
            {comments.length === 0 ? (
              <div
                className="py-8 text-center rounded-xl"
                style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
              >
                <MessageSquare className="w-6 h-6 text-gray-700 mx-auto mb-2" />
                <p className="text-xs text-gray-500">아직 코멘트가 없어요</p>
                <p className="text-[12px] text-gray-600 mt-0.5">첫 코멘트를 남겨보세요!</p>
              </div>
            ) : (
              commentTree.map((node) => (
                <CommunityCommentBubble
                  key={node.id}
                  node={node}
                  depth={0}
                  onReport={(c) =>
                    setReportTarget({ kind: 'comment', id: c.id, author: c.authorName })
                  }
                  onReply={setReplyTargetId}
                  replyTargetId={replyTargetId}
                  onReplySubmit={(parentId, text) => handleSendComment(text, parentId)}
                  onReplyCancel={() => setReplyTargetId(null)}
                  starColor={plan.starColor}
                />
              ))
            )}
            <div ref={commentsEndRef} />
          </div>
        )}
      </div>

      {/* ── Comment input ── */}
      <div
        className="flex-shrink-0 px-5 py-3"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.07)',
          ...(variant === 'dialog'
            ? { paddingBottom: 'max(2rem, env(safe-area-inset-bottom, 0px))' }
            : {}),
        }}
      >
        <CommentInput
          onSend={handleSendComment}
          starColor={plan.starColor}
          disabled={isBackendPlan && !hasCareerPathBackendAuth()}
          busy={postCommentMut.isPending}
          placeholder={
            isBackendPlan && !hasCareerPathBackendAuth()
              ? '로그인 후 댓글을 작성할 수 있어요'
              : '코멘트를 남겨보세요...'
          }
        />
      </div>
      </div>

      {reportTarget && (
        <ReportModal
          target={reportTarget}
          accentColor={plan.starColor}
          onClose={() => setReportTarget(null)}
        />
      )}
    </>
  );
}
