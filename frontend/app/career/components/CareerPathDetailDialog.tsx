'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Heart, Users, Calendar, Bookmark, BookmarkCheck,
  ExternalLink, Target, Sparkles, ThumbsUp, Edit2, Trash2,
  Flag, MessageCircle, MoreVertical,
} from 'lucide-react';
import { ITEM_TYPES, GRADE_YEARS } from '../config';
import templates from '@/data/career-path-templates.json';
import { ReportModal, type ReportTarget } from './ReportModal';

type Template = typeof templates[0];

type Comment = {
  id: string;
  userId: string;
  userName: string;
  userEmoji: string;
  content: string;
  timestamp: string;
  likes: number;
  liked: boolean;
};

type Props = {
  template: Template;
  onClose: () => void;
  onUseTemplate: () => void;
};

/* ─── Comment item ─── */
function CommentItem({
  comment,
  accentColor,
  onLike,
  onEdit,
  onDelete,
  onReport,
  isEditing,
  editText,
  onEditTextChange,
  onSaveEdit,
  onCancelEdit,
}: {
  comment: Comment;
  accentColor: string;
  onLike: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onReport: () => void;
  isEditing: boolean;
  editText: string;
  onEditTextChange: (v: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}) {
  const isOwn = comment.userId === 'current';

  return (
    <div className="flex gap-3">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
      >
        {comment.userEmoji}
      </div>

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">{comment.userName}</span>
            <span className="text-[11px] text-gray-500">{comment.timestamp}</span>
          </div>
          <div className="flex items-center gap-0.5 flex-shrink-0">
            {isOwn ? (
              <>
                <button
                  onClick={onEdit}
                  className="p-1.5 rounded-lg transition-all"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                  title="수정"
                >
                  <Edit2 style={{ width: 13, height: 13 }} />
                </button>
                <button
                  onClick={onDelete}
                  className="p-1.5 rounded-lg transition-all"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                  title="삭제"
                >
                  <Trash2 style={{ width: 13, height: 13 }} />
                </button>
              </>
            ) : (
              <button
                onClick={onReport}
                className="p-1.5 rounded-lg transition-all"
                style={{ color: 'rgba(255,255,255,0.25)' }}
                title="신고"
              >
                <Flag style={{ width: 13, height: 13 }} />
              </button>
            )}
          </div>
        </div>

        {/* Edit mode */}
        {isEditing ? (
          <div className="mt-2 space-y-2">
            <input
              type="text"
              value={editText}
              onChange={(e) => onEditTextChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSaveEdit();
                if (e.key === 'Escape') onCancelEdit();
              }}
              className="w-full px-3 py-2 rounded-xl text-sm text-white bg-transparent border outline-none"
              style={{ borderColor: 'rgba(255,255,255,0.2)' }}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={onCancelEdit}
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#fff' }}
              >
                취소
              </button>
              <button
                onClick={onSaveEdit}
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: accentColor, color: '#fff' }}
              >
                저장
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-300 mt-1 leading-relaxed">{comment.content}</p>
            <button
              onClick={onLike}
              className="flex items-center gap-1.5 mt-2 transition-all active:scale-95"
            >
              <ThumbsUp
                style={{
                  width: 14,
                  height: 14,
                  color: comment.liked ? accentColor : 'rgba(255,255,255,0.4)',
                  fill: comment.liked ? accentColor : 'none',
                }}
              />
              {comment.likes > 0 && (
                <span
                  className="text-xs font-semibold"
                  style={{ color: comment.liked ? accentColor : 'rgba(255,255,255,0.4)' }}
                >
                  {comment.likes}
                </span>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const TEMPLATE_BOOKMARKS_KEY = 'template_bookmarks_v1';

function loadTemplateBookmarks(): string[] {
  try {
    const raw = localStorage.getItem(TEMPLATE_BOOKMARKS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveTemplateBookmarks(ids: string[]): void {
  try {
    localStorage.setItem(TEMPLATE_BOOKMARKS_KEY, JSON.stringify(ids));
  } catch {}
}

/* ─── Main dialog ─── */
export function CareerPathDetailDialog({ template, onClose, onUseTemplate }: Props) {
  const [liked, setLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(template.likes);
  const [bookmarked, setBookmarked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const [showContentMenu, setShowContentMenu] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = loadTemplateBookmarks();
    setBookmarked(saved.includes(template.id));
  }, [template.id]);

  const [comments, setComments] = useState<Comment[]>([
    {
      id: 'c1',
      userId: 'u1',
      userName: '김진로',
      userEmoji: '👨‍🎓',
      content: '정말 체계적인 패스네요! 중학교 때부터 준비하면 좋을 것 같아요.',
      timestamp: '2일 전',
      likes: 12,
      liked: false,
    },
    {
      id: 'c2',
      userId: 'u2',
      userName: '이미래',
      userEmoji: '👩‍🔬',
      content: 'KBO 준비 일정이 구체적으로 나와있어서 도움이 많이 됐습니다!',
      timestamp: '5일 전',
      likes: 8,
      liked: false,
    },
  ]);

  const gradeOrder = GRADE_YEARS.reduce(
    (acc, g, i) => { acc[g.id] = i; return acc; },
    {} as Record<string, number>
  );
  const sortedYears = [...template.years].sort(
    (a, b) => (gradeOrder[a.gradeId] ?? 0) - (gradeOrder[b.gradeId] ?? 0)
  );

  /* handlers */
  const addComment = () => {
    if (!commentText.trim()) return;
    setComments([
      {
        id: `c${Date.now()}`,
        userId: 'current',
        userName: '나',
        userEmoji: '😊',
        content: commentText.trim(),
        timestamp: '방금',
        likes: 0,
        liked: false,
      },
      ...comments,
    ]);
    setCommentText('');
  };

  const toggleLikeComment = (id: string) => {
    setComments(comments.map(c =>
      c.id === id
        ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 }
        : c
    ));
  };

  const startEdit = (id: string) => {
    const c = comments.find(c => c.id === id);
    if (c) { setEditingId(id); setEditingText(c.content); }
  };

  const saveEdit = (id: string) => {
    if (!editingText.trim()) return;
    setComments(comments.map(c =>
      c.id === id ? { ...c, content: editingText.trim() } : c
    ));
    setEditingId(null);
    setEditingText('');
  };

  const cancelEdit = () => { setEditingId(null); setEditingText(''); };

  const deleteComment = (id: string) => {
    if (window.confirm('댓글을 삭제하시겠습니까?')) {
      setComments(comments.filter(c => c.id !== id));
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex flex-col justify-end"
      style={{ backgroundColor: 'rgba(0,0,0,0.82)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] mx-auto rounded-t-3xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: '#0d0d24',
          border: '1px solid rgba(255,255,255,0.08)',
          borderBottom: 'none',
          maxHeight: 'calc(100vh - 56px)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div
          className="flex-shrink-0 px-5 py-4"
          style={{
            background: `linear-gradient(135deg, ${template.starColor}28, ${template.starColor}0a)`,
            borderBottom: `1px solid ${template.starColor}30`,
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-13 h-13 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{
                width: 52, height: 52,
                background: `linear-gradient(135deg, ${template.starColor}40, ${template.starColor}18)`,
                border: `1.5px solid ${template.starColor}44`,
              }}
            >
              {template.jobEmoji}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-white leading-snug">{template.title}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs text-gray-400">{template.starEmoji} {template.starName}</span>
                <span className="text-xs text-gray-600">·</span>
                <span className="text-xs text-gray-500">{template.years.length}개 학년</span>
                <span className="text-xs text-gray-600">·</span>
                <span className="text-xs text-gray-500">{template.totalItems}개 항목</span>
                {template.authorType === 'official' && (
                  <span
                    className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: '#6C5CE720', color: '#a78bfa' }}
                  >
                    ✓ 공식
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>

        {/* ── Action bar ── */}
        <div
          className="flex-shrink-0 px-5 py-2.5 flex items-center justify-between"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setLiked(!liked); setLocalLikes(liked ? localLikes - 1 : localLikes + 1); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all active:scale-95"
              style={{ backgroundColor: liked ? 'rgba(255,100,119,0.15)' : 'rgba(255,255,255,0.07)' }}
            >
              <Heart
                style={{
                  width: 16, height: 16,
                  color: liked ? '#FF6477' : '#fff',
                  fill: liked ? '#FF6477' : 'none',
                }}
              />
              <span className="text-sm font-semibold text-white">{localLikes}</span>
            </button>

            <button
              onClick={() => {
                const next = !bookmarked;
                setBookmarked(next);
                const saved = loadTemplateBookmarks();
                const updated = next
                  ? [...saved.filter(id => id !== template.id), template.id]
                  : saved.filter(id => id !== template.id);
                saveTemplateBookmarks(updated);
              }}
              className="p-1.5 rounded-full transition-all active:scale-95"
              style={{ backgroundColor: bookmarked ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.07)' }}
              title={bookmarked ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            >
              {bookmarked
                ? <BookmarkCheck style={{ width: 16, height: 16, color: '#FBBF24' }} />
                : <Bookmark style={{ width: 16, height: 16, color: '#fff' }} />}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Users style={{ width: 13, height: 13 }} />
              <span>{template.uses}명 사용</span>
            </div>

            {/* Content menu (⋮) */}
            <div className="relative">
              <button
                onClick={() => setShowContentMenu(!showContentMenu)}
                className="p-1.5 rounded-full transition-all active:scale-95"
                style={{ backgroundColor: showContentMenu ? 'rgba(255,255,255,0.1)' : 'transparent' }}
              >
                <MoreVertical style={{ width: 16, height: 16, color: 'rgba(255,255,255,0.5)' }} />
              </button>

              {showContentMenu && (
                <>
                  {/* backdrop */}
                  <div
                    className="fixed inset-0 z-[210]"
                    onClick={() => setShowContentMenu(false)}
                  />
                  <div
                    className="absolute right-0 top-9 z-[220] rounded-2xl overflow-hidden w-44 shadow-2xl"
                    style={{
                      backgroundColor: '#1a1a38',
                      border: '1px solid rgba(255,255,255,0.12)',
                    }}
                  >
                    <button
                      onClick={() => {
                        setShowContentMenu(false);
                        setReportTarget({ kind: 'content', id: template.id, title: template.title });
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-all"
                      style={{ color: '#ef4444' }}
                    >
                      <Flag style={{ width: 14, height: 14, flexShrink: 0 }} />
                      콘텐츠 신고
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-4 space-y-5">

            {/* Description */}
            <p className="text-sm text-gray-400 leading-relaxed">{template.description}</p>

            {/* Timeline */}
            <div className="relative">
              <div
                className="absolute top-0 bottom-0 w-0.5"
                style={{ left: 19, backgroundColor: `${template.starColor}25` }}
              />
              <div className="space-y-0">
                {sortedYears.map((year) => {
                  const grade = GRADE_YEARS.find(g => g.id === year.gradeId);
                  return (
                    <div key={year.gradeId} className="relative pl-12 pb-6">
                      {/* Grade circle */}
                      <div
                        className="absolute top-0 flex items-center justify-center rounded-full text-xs font-black z-10"
                        style={{
                          left: 0, width: 38, height: 38,
                          backgroundColor: template.starColor,
                          color: '#fff',
                          boxShadow: `0 0 0 3px #0d0d24, 0 0 10px ${template.starColor}55`,
                          fontSize: 11,
                        }}
                      >
                        {year.gradeLabel}
                      </div>

                      {(() => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const yearAny = year as any;
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const allGroups: { goal: string; items: any[] }[] = [];
                        if (Array.isArray(yearAny.goalGroups) && yearAny.goalGroups.length > 0) {
                          allGroups.push(...yearAny.goalGroups);
                        }
                        if (Array.isArray(yearAny.semesterPlans)) {
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          yearAny.semesterPlans.forEach((sp: any) => {
                            if (Array.isArray(sp.goalGroups)) {
                              allGroups.push(...sp.goalGroups);
                            }
                          });
                        }
                        const totalItems = allGroups.reduce((acc, g) => acc + (g.items?.length ?? 0), 0);

                        return (
                          <div className="space-y-2.5 pt-1">
                            <div>
                              <div className="text-sm font-bold text-white">{grade?.fullLabel ?? year.gradeLabel}</div>
                              <div className="text-[11px] text-gray-500">{totalItems}개 항목</div>
                            </div>

                            {allGroups.map((group, gi) => (
                              <div key={gi} className="space-y-1.5">
                                {/* Goal label */}
                                <div
                                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
                                  style={{
                                    backgroundColor: `${template.starColor}12`,
                                    border: `1px solid ${template.starColor}1e`,
                                  }}
                                >
                                  <Target style={{ width: 10, height: 10, flexShrink: 0, color: template.starColor }} />
                                  <span className="text-gray-200 font-semibold">{group.goal}</span>
                                </div>

                                {/* Items under this goal */}
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {(group.items ?? []).map((item: any) => {
                                  const typeConf = ITEM_TYPES.find(t => t.value === item.type);
                                  const months: number[] = Array.isArray(item.months)
                                    ? item.months
                                    : typeof item.month === 'number' ? [item.month] : [];
                                  const monthLabel = months.length === 0
                                    ? '월 미정'
                                    : months.length === 1
                                      ? `${months[0]}월`
                                      : `${months[0]}~${months[months.length - 1]}월`;

                                  return (
                                    <div
                                      key={item.id ?? item.title}
                                      className="flex items-start gap-2.5 p-2.5 rounded-xl ml-3"
                                      style={{
                                        backgroundColor: `${typeConf?.color ?? template.starColor}0d`,
                                        border: `1px solid ${typeConf?.color ?? template.starColor}25`,
                                      }}
                                    >
                                      <div
                                        className="rounded-xl flex items-center justify-center text-base flex-shrink-0"
                                        style={{
                                          width: 34, height: 34,
                                          backgroundColor: `${typeConf?.color ?? template.starColor}18`,
                                          border: `1px solid ${typeConf?.color ?? template.starColor}28`,
                                        }}
                                      >
                                        {typeConf?.emoji ?? '📌'}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="text-sm font-semibold text-white leading-snug">{item.title}</div>
                                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                          <span
                                            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                            style={{
                                              backgroundColor: `${typeConf?.color ?? template.starColor}22`,
                                              color: typeConf?.color ?? template.starColor,
                                            }}
                                          >
                                            {typeConf?.label}
                                          </span>
                                          <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                                            <Calendar style={{ width: 9, height: 9 }} />
                                            {monthLabel}
                                          </span>
                                          {item.cost && (
                                            <span className="text-[10px] text-gray-600">{item.cost}</span>
                                          )}
                                          {item.difficulty > 0 && (
                                            <span className="text-[10px] text-gray-600">
                                              {'★'.repeat(item.difficulty)}{'☆'.repeat(5 - item.difficulty)}
                                            </span>
                                          )}
                                        </div>
                                        {item.organizer && (
                                          <div className="text-[10px] text-gray-600 mt-0.5">{item.organizer}</div>
                                        )}
                                        {/* Sub-items preview */}
                                        {Array.isArray(item.subItems) && item.subItems.length > 0 && (
                                          <div className="mt-1.5 space-y-0.5">
                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                            {item.subItems.slice(0, 3).map((sub: any) => (
                                              <div key={sub.id} className="flex items-center gap-1 text-[10px] text-gray-500">
                                                <span className="w-1 h-1 rounded-full bg-gray-600 flex-shrink-0" />
                                                {sub.title}
                                              </div>
                                            ))}
                                            {item.subItems.length > 3 && (
                                              <div className="text-[10px] text-gray-600">+{item.subItems.length - 3}개 더</div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tags */}
            <div className="flex gap-1.5 flex-wrap">
              {template.tags.map(tag => (
                <span
                  key={tag}
                  className="text-xs px-2.5 py-1 rounded-full text-gray-500"
                  style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* ── Comments ── */}
            <div
              className="pt-5 mt-1 border-t space-y-4"
              style={{ borderColor: 'rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center gap-2">
                <MessageCircle style={{ width: 16, height: 16, color: '#9ca3af' }} />
                <span className="text-sm font-bold text-white">댓글 {comments.length}개</span>
              </div>

              {/* Input */}
              <div className="flex gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  😊
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addComment(); }}
                    placeholder="댓글 추가..."
                    className="w-full py-2 text-sm text-white placeholder-gray-600 bg-transparent border-b outline-none"
                    style={{ borderColor: 'rgba(255,255,255,0.18)' }}
                  />
                  {commentText.trim() && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => setCommentText('')}
                        className="px-3 py-1 rounded-full text-xs font-semibold"
                        style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#ccc' }}
                      >
                        취소
                      </button>
                      <button
                        onClick={addComment}
                        className="px-3 py-1 rounded-full text-xs font-semibold active:scale-95 transition-all"
                        style={{ backgroundColor: template.starColor, color: '#fff' }}
                      >
                        댓글 작성
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* List */}
              {comments.length === 0 ? (
                <div className="py-8 text-center">
                  <MessageCircle style={{ width: 40, height: 40, color: '#374151', margin: '0 auto 8px' }} />
                  <p className="text-sm text-gray-500">첫 댓글을 작성해보세요!</p>
                </div>
              ) : (
                <div className="space-y-4 pb-2">
                  {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    comment={comment}
                    accentColor={template.starColor}
                    onLike={() => toggleLikeComment(comment.id)}
                    onEdit={() => startEdit(comment.id)}
                    onDelete={() => deleteComment(comment.id)}
                    onReport={() => setReportTarget({ kind: 'comment', id: comment.id, author: comment.userName })}
                      isEditing={editingId === comment.id}
                      editText={editingText}
                      onEditTextChange={setEditingText}
                      onSaveEdit={() => saveEdit(comment.id)}
                      onCancelEdit={cancelEdit}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ── Footer ── */}
        <div
          className="flex-shrink-0 p-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
        >
          <button
            onClick={onUseTemplate}
            className="w-full h-13 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{
              height: 52,
              background: `linear-gradient(135deg, ${template.starColor}, ${template.starColor}cc)`,
              boxShadow: `0 6px 20px ${template.starColor}44`,
            }}
          >
            이 패스 사용하기
            <ExternalLink style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>

      {/* ── Report modal ── */}
      {reportTarget && (
        <ReportModal
          target={reportTarget}
          accentColor={template.starColor}
          onClose={() => setReportTarget(null)}
        />
      )}
    </div>,
    document.body
  );
}
