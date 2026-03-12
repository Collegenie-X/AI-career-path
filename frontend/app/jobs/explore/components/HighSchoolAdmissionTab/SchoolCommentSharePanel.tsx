'use client';

import { useEffect, useMemo, useState } from 'react';
import { MessageCircleMore, MessageSquare, Send, Trash2 } from 'lucide-react';
import {
  SchoolCommentsDialog,
  type CommentCategory,
  type HighSchoolComment,
  type HighSchoolCommentReply,
} from './SchoolCommentsDialog';

type SchoolCommentSharePanelProps = {
  schoolId: string;
  schoolName: string;
  categoryColor: string;
};

type CommentFilter = 'all' | CommentCategory;
type StoredCommentsBySchool = Record<string, HighSchoolComment[]>;
type DummyRepliesBySchool = Record<string, Record<string, HighSchoolCommentReply[]>>;

const COMMENT_STORAGE_KEY = 'high_school_detail_comments_v3';
const DUMMY_REPLY_STORAGE_KEY = 'high_school_dummy_replies_v1';
const COMMENT_PREVIEW_LIMIT = 4;

const COMMENT_CATEGORY_META: Record<CommentCategory, { label: string; color: string }> = {
  question: { label: '질문', color: '#60a5fa' },
  review: { label: '후기', color: '#34d399' },
  tip: { label: '팁', color: '#f59e0b' },
  warning: { label: '주의', color: '#f87171' },
};

function normalizeCategory(value: unknown): CommentCategory {
  if (value === 'question' || value === 'review' || value === 'tip' || value === 'warning') return value;
  return 'review';
}

function normalizeReplies(value: unknown): HighSchoolCommentReply[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((reply) => reply && typeof reply === 'object')
    .map((reply) => {
      const parsed = reply as Partial<HighSchoolCommentReply>;
      return {
        id: typeof parsed.id === 'string' ? parsed.id : `reply-${Date.now()}`,
        content: typeof parsed.content === 'string' ? parsed.content.trim() : '',
        createdAt: typeof parsed.createdAt === 'string' ? parsed.createdAt : new Date().toISOString(),
      };
    })
    .filter((reply) => reply.content.length > 0);
}

function loadStoredComments(): StoredCommentsBySchool {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(COMMENT_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Array<Partial<HighSchoolComment>>>;
    const normalized: StoredCommentsBySchool = {};

    for (const [schoolId, comments] of Object.entries(parsed)) {
      normalized[schoolId] = (comments ?? [])
        .filter((comment) => typeof comment?.content === 'string' && comment.content.trim().length > 0)
        .map((comment) => ({
          id: typeof comment.id === 'string' ? comment.id : `comment-${Date.now()}`,
          schoolId,
          category: normalizeCategory(comment.category),
          content: comment.content!.trim(),
          createdAt: typeof comment.createdAt === 'string' ? comment.createdAt : new Date().toISOString(),
          source: 'user',
          replies: normalizeReplies(comment.replies),
        }));
    }

    return normalized;
  } catch {
    return {};
  }
}

function saveStoredComments(commentsBySchool: StoredCommentsBySchool) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(COMMENT_STORAGE_KEY, JSON.stringify(commentsBySchool));
  } catch {
    // ignore write errors
  }
}

function loadDummyRepliesBySchool(): DummyRepliesBySchool {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(DUMMY_REPLY_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, Record<string, unknown>>;
    const normalized: DummyRepliesBySchool = {};

    for (const [schoolId, repliesByCommentId] of Object.entries(parsed)) {
      normalized[schoolId] = {};
      for (const [commentId, replies] of Object.entries(repliesByCommentId ?? {})) {
        normalized[schoolId][commentId] = normalizeReplies(replies);
      }
    }

    return normalized;
  } catch {
    return {};
  }
}

function saveDummyRepliesBySchool(dummyRepliesBySchool: DummyRepliesBySchool) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DUMMY_REPLY_STORAGE_KEY, JSON.stringify(dummyRepliesBySchool));
  } catch {
    // ignore write errors
  }
}

function timeAgo(isoTime: string): string {
  const diff = Date.now() - new Date(isoTime).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
}

function getDummyComments(
  schoolId: string,
  schoolName: string,
  extraRepliesByCommentId: Record<string, HighSchoolCommentReply> | Record<string, HighSchoolCommentReply[]>
): HighSchoolComment[] {
  const now = Date.now();
  const dummyComments: HighSchoolComment[] = [
    {
      id: `dummy-${schoolId}-1`,
      schoolId,
      category: 'question',
      content: `${schoolName}는 수시 준비 시 교과와 활동 중 어디에 더 비중을 두면 좋을까요?`,
      createdAt: new Date(now - 50 * 60000).toISOString(),
      source: 'dummy',
      replies: [
        {
          id: `dummy-reply-${schoolId}-1`,
          content: '보통은 교과 안정 후 활동 깊이를 늘리는 방식이 더 안정적이었어요.',
          createdAt: new Date(now - 35 * 60000).toISOString(),
        },
      ],
    },
    {
      id: `dummy-${schoolId}-2`,
      schoolId,
      category: 'review',
      content: '프로그램은 좋지만 루틴이 없으면 중간에 흔들리기 쉬워요.',
      createdAt: new Date(now - 6 * 3600000).toISOString(),
      source: 'dummy',
      replies: [],
    },
    {
      id: `dummy-${schoolId}-3`,
      schoolId,
      category: 'tip',
      content: '중학교 때 내신 + 활동 기록을 같이 남기면 고입 준비가 훨씬 편해요.',
      createdAt: new Date(now - 24 * 3600000).toISOString(),
      source: 'dummy',
      replies: [],
    },
  ];

  return dummyComments.map((comment) => ({
    ...comment,
    replies: [...comment.replies, ...((extraRepliesByCommentId[comment.id] as HighSchoolCommentReply[] | undefined) ?? [])],
  }));
}

export function SchoolCommentSharePanel({ schoolId, schoolName, categoryColor }: SchoolCommentSharePanelProps) {
  const [commentsBySchool, setCommentsBySchool] = useState<StoredCommentsBySchool>({});
  const [dummyRepliesBySchool, setDummyRepliesBySchool] = useState<DummyRepliesBySchool>({});
  const [newCommentText, setNewCommentText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CommentCategory>('review');
  const [activeFilter, setActiveFilter] = useState<CommentFilter>('all');
  const [showDialog, setShowDialog] = useState(false);
  const [replyComposerCommentId, setReplyComposerCommentId] = useState<string | null>(null);
  const [replyDraftByCommentId, setReplyDraftByCommentId] = useState<Record<string, string>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCommentsBySchool(loadStoredComments());
    setDummyRepliesBySchool(loadDummyRepliesBySchool());
  }, []);

  useEffect(() => {
    if (!mounted) return;
    saveStoredComments(commentsBySchool);
  }, [commentsBySchool, mounted]);

  useEffect(() => {
    if (!mounted) return;
    saveDummyRepliesBySchool(dummyRepliesBySchool);
  }, [dummyRepliesBySchool, mounted]);

  const userComments = useMemo(
    () => [...(commentsBySchool[schoolId] ?? [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [commentsBySchool, schoolId]
  );
  const dummyComments = useMemo(
    () => getDummyComments(schoolId, schoolName, dummyRepliesBySchool[schoolId] ?? {}),
    [schoolId, schoolName, dummyRepliesBySchool]
  );
  const allComments = useMemo(
    () => [...dummyComments, ...userComments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [dummyComments, userComments]
  );
  const filteredComments = useMemo(
    () => (activeFilter === 'all' ? allComments : allComments.filter((comment) => comment.category === activeFilter)),
    [activeFilter, allComments]
  );

  const previewComments = filteredComments.slice(0, COMMENT_PREVIEW_LIMIT);
  const hasMoreComments = filteredComments.length > COMMENT_PREVIEW_LIMIT;

  const addComment = () => {
    const trimmed = newCommentText.trim();
    if (!trimmed) return;

    const comment: HighSchoolComment = {
      id: `comment-${Date.now()}`,
      schoolId,
      category: selectedCategory,
      content: trimmed,
      createdAt: new Date().toISOString(),
      source: 'user',
      replies: [],
    };

    setCommentsBySchool((prev) => ({ ...prev, [schoolId]: [...(prev[schoolId] ?? []), comment] }));
    setNewCommentText('');
  };

  const deleteComment = (commentId: string) => {
    setCommentsBySchool((prev) => ({
      ...prev,
      [schoolId]: (prev[schoolId] ?? []).filter((comment) => comment.id !== commentId),
    }));
  };

  const addReply = (commentId: string, replyText: string) => {
    const trimmed = replyText.trim();
    if (!trimmed) return;

    const reply: HighSchoolCommentReply = {
      id: `reply-${Date.now()}`,
      content: trimmed,
      createdAt: new Date().toISOString(),
    };

    const isDummyComment = commentId.startsWith('dummy-');

    if (isDummyComment) {
      setDummyRepliesBySchool((prev) => ({
        ...prev,
        [schoolId]: {
          ...(prev[schoolId] ?? {}),
          [commentId]: [...((prev[schoolId]?.[commentId] ?? [])), reply],
        },
      }));
      return;
    }

    setCommentsBySchool((prev) => ({
      ...prev,
      [schoolId]: (prev[schoolId] ?? []).map((comment) =>
        comment.id === commentId ? { ...comment, replies: [...comment.replies, reply] } : comment
      ),
    }));
  };

  const deleteReply = (commentId: string, replyId: string) => {
    const isDummyComment = commentId.startsWith('dummy-');

    if (isDummyComment) {
      setDummyRepliesBySchool((prev) => ({
        ...prev,
        [schoolId]: {
          ...(prev[schoolId] ?? {}),
          [commentId]: (prev[schoolId]?.[commentId] ?? []).filter((reply) => reply.id !== replyId),
        },
      }));
      return;
    }

    setCommentsBySchool((prev) => ({
      ...prev,
      [schoolId]: (prev[schoolId] ?? []).map((comment) =>
        comment.id === commentId ? { ...comment, replies: comment.replies.filter((reply) => reply.id !== replyId) } : comment
      ),
    }));
  };

  const submitInlineReply = (commentId: string) => {
    const replyText = (replyDraftByCommentId[commentId] ?? '').trim();
    if (!replyText) return;
    addReply(commentId, replyText);
    setReplyDraftByCommentId((prev) => ({ ...prev, [commentId]: '' }));
    setReplyComposerCommentId(null);
  };

  if (!mounted) return null;

  return (
    <div className="rounded-2xl p-3 space-y-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold flex items-center gap-1.5" style={{ color: categoryColor }}>
          <MessageSquare className="w-3.5 h-3.5" />
          내용 공유 댓글
        </p>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${categoryColor}20`, color: categoryColor }}>
          {allComments.length}개
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {[{ id: 'all', label: '전체' }, ...Object.entries(COMMENT_CATEGORY_META).map(([id, meta]) => ({ id, label: meta.label }))].map((item) => {
          const isActive = activeFilter === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveFilter(item.id as CommentFilter)}
              className="text-[10px] px-2.5 py-1 rounded-full font-semibold"
              style={{
                background: isActive ? `${categoryColor}22` : 'rgba(255,255,255,0.06)',
                color: isActive ? categoryColor : '#9ca3af',
                border: `1px solid ${isActive ? `${categoryColor}66` : 'rgba(255,255,255,0.1)'}`,
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {filteredComments.length === 0 ? (
        <p className="text-[11px] text-gray-500 py-2 text-center">아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
      ) : (
        <div className="space-y-2">
          {previewComments.map((comment) => {
            const meta = COMMENT_CATEGORY_META[comment.category];
            const isReplyComposerOpen = replyComposerCommentId === comment.id;
            const replyDraft = replyDraftByCommentId[comment.id] ?? '';

            return (
              <div key={comment.id} className="rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: meta.color, background: `${meta.color}20` }}>
                      {meta.label}
                    </span>
                    {comment.source === 'dummy' ? (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-violet-300 bg-violet-400/15">
                        더미
                      </span>
                    ) : null}
                    <span className="text-[10px] text-gray-500">{timeAgo(comment.createdAt)}</span>
                  </div>
                  {comment.source !== 'dummy' ? (
                    <button onClick={() => deleteComment(comment.id)} className="p-1 rounded-md text-gray-500 hover:text-gray-300" aria-label="댓글 삭제">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  ) : null}
                </div>

                <p className="text-[11px] text-gray-300 leading-relaxed break-words">{comment.content}</p>
                {comment.replies.length > 0 ? <p className="text-[10px] text-gray-500 mt-1.5">답글 {comment.replies.length}개</p> : null}

                <div className="mt-2">
                  <button
                    onClick={() => setReplyComposerCommentId(isReplyComposerOpen ? null : comment.id)}
                    className="text-[10px] font-semibold px-2 py-1 rounded-full"
                    style={{ background: `${categoryColor}20`, color: categoryColor }}
                  >
                    {isReplyComposerOpen ? '답글 닫기' : '댓글 달기'}
                  </button>
                </div>

                {isReplyComposerOpen ? (
                  <div className="mt-2 flex gap-2">
                    <input
                      value={replyDraft}
                      onChange={(event) => setReplyDraftByCommentId((prev) => ({ ...prev, [comment.id]: event.target.value }))}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          submitInlineReply(comment.id);
                        }
                      }}
                      placeholder="답글을 입력하세요"
                      className="flex-1 rounded-lg px-2.5 py-2 text-[11px] bg-white/5 border border-white/10 text-gray-100 outline-none"
                    />
                    <button
                      onClick={() => submitInlineReply(comment.id)}
                      disabled={!replyDraft.trim()}
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={replyDraft.trim()
                        ? { background: `linear-gradient(135deg, ${categoryColor}, ${categoryColor}cc)`, color: '#fff' }
                        : { background: 'rgba(255,255,255,0.07)', color: '#6b7280' }}
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {hasMoreComments ? (
        <button
          onClick={() => setShowDialog(true)}
          className="w-full py-2.5 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5"
          style={{ background: 'rgba(255,255,255,0.06)', color: '#d1d5db', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <MessageCircleMore className="w-3.5 h-3.5" />
          댓글 더보기 ({filteredComments.length}개)
        </button>
      ) : null}

      <div className="rounded-xl p-2.5 space-y-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-[10px] text-gray-500">댓글 작성 (하단 영역)</p>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(COMMENT_CATEGORY_META).map(([categoryId, meta]) => {
            const isSelected = selectedCategory === categoryId;
            return (
              <button
                key={categoryId}
                onClick={() => setSelectedCategory(categoryId as CommentCategory)}
                className="text-[10px] px-2.5 py-1 rounded-full font-semibold"
                style={{
                  background: isSelected ? `${meta.color}20` : 'rgba(255,255,255,0.06)',
                  color: isSelected ? meta.color : '#9ca3af',
                  border: `1px solid ${isSelected ? `${meta.color}70` : 'rgba(255,255,255,0.1)'}`,
                }}
              >
                {meta.label}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <input
            value={newCommentText}
            onChange={(event) => setNewCommentText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addComment();
              }
            }}
            placeholder="학교 선택 팁이나 후기를 댓글로 공유해보세요"
            className="flex-1 rounded-lg px-2.5 py-2 text-[11px] bg-white/5 border border-white/10 text-gray-100 outline-none"
          />
          <button
            onClick={addComment}
            disabled={!newCommentText.trim()}
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={newCommentText.trim()
              ? { background: `linear-gradient(135deg, ${categoryColor}, ${categoryColor}cc)`, color: '#fff' }
              : { background: 'rgba(255,255,255,0.07)', color: '#6b7280' }}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <SchoolCommentsDialog
        isOpen={showDialog}
        schoolName={schoolName}
        categoryColor={categoryColor}
        comments={filteredComments}
        formatRelativeTime={timeAgo}
        categoryMeta={COMMENT_CATEGORY_META}
        onClose={() => setShowDialog(false)}
        onDeleteComment={deleteComment}
        onAddReply={addReply}
        onDeleteReply={deleteReply}
      />
    </div>
  );
}
