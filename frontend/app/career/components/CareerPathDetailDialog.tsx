'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  X, Heart, Users, Calendar, Bookmark, BookmarkCheck,
  ExternalLink, Target, Sparkles, ThumbsUp, Edit2, Trash2,
  Flag, MessageCircle, MoreVertical, Link as LinkIcon,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { ITEM_TYPES, GRADE_YEARS, LABELS } from '../config';
import type { CareerPathTemplate } from '@/data/career-path-templates-index';
import { ReportModal, type ReportTarget } from './ReportModal';
import { DetailRichInfoSection } from './DetailRichInfoSection';

type Template = CareerPathTemplate;

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
  onUseTemplate: (customTitle: string) => void;
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
            <span className="text-[12px] text-gray-500">{comment.timestamp}</span>
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
  const [showUseTemplateDialog, setShowUseTemplateDialog] = useState(false);
  const [copiedPlanTitle, setCopiedPlanTitle] = useState(template.title);
  const [mounted, setMounted] = useState(false);
  const [collapsedGoalKeys, setCollapsedGoalKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    setCopiedPlanTitle(template.title);
  }, [template.title]);

  const toggleGoalExpand = (key: string) => {
    setCollapsedGoalKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

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
                    className="text-[12px] font-bold px-2 py-0.5 rounded-full"
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

            <DetailRichInfoSection template={template} />

            {/* 수시·정시·유학 전략 (대입 템플릿) */}
            {(template as { admissionTypeStrategies?: Record<string, string> }).admissionTypeStrategies && (
              <div className="rounded-2xl overflow-hidden space-y-2"
                style={{ border: `1px solid ${template.starColor}30`, backgroundColor: `${template.starColor}0c` }}>
                <div className="px-4 py-2.5 font-bold text-sm text-white whitespace-nowrap"
                  style={{ backgroundColor: `${template.starColor}20` }}>
                  수시 · 정시 · 유학 전략
                </div>
                <div className="px-4 pb-4 space-y-2">
                  {Object.entries((template as { admissionTypeStrategies: Record<string, string> }).admissionTypeStrategies).map(([type, strategy]) => (
                    strategy && (
                      <div key={type} className="flex gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: `${template.starColor}30`, color: template.starColor }}>
                          {type}
                        </span>
                        <span className="text-xs text-gray-300 leading-relaxed">{strategy}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* 합격 후기 */}
            {(template as { successStories?: Array<{ year: string; admissionType?: string; schoolName?: string; quote: string; strategy: string; tips?: string[] }> }).successStories?.length ? (
              <div className="rounded-2xl overflow-hidden space-y-2"
                style={{ border: '1px solid rgba(251,191,36,0.3)', backgroundColor: 'rgba(251,191,36,0.06)' }}>
                <div className="px-4 py-2.5 font-bold text-sm text-white flex items-center gap-2"
                  style={{ backgroundColor: 'rgba(251,191,36,0.15)' }}>
                  <ThumbsUp style={{ width: 14, height: 14, color: '#FBBF24' }} />
                  합격 후기
                </div>
                <div className="px-4 pb-4 space-y-4">
                  {(template as { successStories: Array<{ year: string; admissionType?: string; schoolName?: string; quote: string; strategy: string; tips?: string[] }> }).successStories.map((s, i) => (
                    <div key={i} className="rounded-xl p-3 space-y-2"
                      style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold text-amber-400">{s.year}</span>
                        {(s.admissionType || s.schoolName) && (
                          <span className="text-[11px] text-gray-500">
                            {s.admissionType ?? s.schoolName}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-amber-100/90 italic leading-relaxed">&ldquo;{s.quote}&rdquo;</p>
                      <p className="text-xs text-gray-400 leading-relaxed">{s.strategy}</p>
                      {s.tips?.length ? (
                        <ul className="text-[11px] text-gray-500 space-y-0.5 list-disc list-inside">
                          {s.tips.map((tip, j) => <li key={j}>{tip}</li>)}
                        </ul>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

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
                          fontSize: 12,
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
                        // 템플릿 형식(goals + items) 지원: goalGroups가 없을 때 — 모든 목표 표시, 첫 목표에 items 연결
                        if (allGroups.length === 0) {
                          const goals = Array.isArray(yearAny.goals) && yearAny.goals.length > 0
                            ? yearAny.goals
                            : ['활동 목록'];
                          const items = Array.isArray(yearAny.items) ? yearAny.items : [];
                          goals.forEach((goal: string, idx: number) => {
                            allGroups.push({
                              goal,
                              items: idx === 0 ? items : [],
                            });
                          });
                        }
                        const totalItems = allGroups.reduce((acc, g) => acc + (g.items?.length ?? 0), 0);

                        return (
                          <div className="space-y-3 pt-1" key={year.gradeId}>
                            {/* Year header */}
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-bold text-white">{grade?.fullLabel ?? year.gradeLabel}</div>
                            </div>

                            {allGroups
                              .filter((group) => (group.items ?? []).length > 0)
                              .map((group, gi) => {
                              const goalKey = `${year.gradeId}-${gi}`;
                              const isExpanded = !collapsedGoalKeys.has(goalKey);
                              return (
                              <div key={gi} className="rounded-xl overflow-hidden"
                                style={{ border: `1px solid ${template.starColor}20` }}>

                                {/* ── 목표 섹션 헤더 (아코디언) ── */}
                                <button
                                  type="button"
                                  className="w-full flex items-center gap-2 px-3 py-2 text-left"
                                  style={{ backgroundColor: `${template.starColor}18` }}
                                  onClick={() => toggleGoalExpand(goalKey)}
                                >
                                  <div
                                    className="flex items-center justify-center rounded-md flex-shrink-0"
                                    style={{
                                      width: 20, height: 20,
                                      backgroundColor: `${template.starColor}30`,
                                    }}
                                  >
                                    <Target style={{ width: 11, height: 11, color: template.starColor }} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div
                                      className="text-[12px] font-bold uppercase tracking-wider mb-0.5"
                                      style={{ color: template.starColor }}
                                    >
                                      목표
                                    </div>
                                    <div className="text-xs font-semibold text-white leading-snug">{group.goal}</div>
                                  </div>
                                  {isExpanded ? <ChevronUp style={{ width: 14, height: 14, color: '#6B7280' }} /> : <ChevronDown style={{ width: 14, height: 14, color: '#6B7280' }} />}
                                </button>

                                {/* ── 활동·수상·자격증 섹션 ── */}
                                {isExpanded && (group.items ?? []).length > 0 && (
                                  <div className="px-2 py-2 space-y-1.5"
                                    style={{ backgroundColor: `${template.starColor}06` }}>
                                    {/* 섹션 라벨 */}
                                    <div className="flex items-center gap-1 px-1 mb-1">
                                      <Sparkles style={{ width: 10, height: 10, color: '#6b7280' }} />
                                      <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                                        활동 · 수상 · 자격증
                                      </span>
                                    </div>

                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {(group.items ?? []).map((item: any, itemIndex) => {
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
                                          key={item.id ?? `${goalKey}-${itemIndex}`}
                                          className="flex items-start gap-2.5 p-2.5 rounded-lg"
                                          style={{
                                            backgroundColor: `${typeConf?.color ?? template.starColor}0d`,
                                            border: `1px solid ${typeConf?.color ?? template.starColor}22`,
                                          }}
                                        >
                                          <div
                                            className="rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                                            style={{
                                              width: 32, height: 32,
                                              backgroundColor: `${typeConf?.color ?? template.starColor}18`,
                                              border: `1px solid ${typeConf?.color ?? template.starColor}28`,
                                            }}
                                          >
                                            {typeConf?.emoji ?? '📌'}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <div className="text-xs font-semibold text-white leading-snug">{item.title}</div>
                                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                              <span
                                                className="text-[12px] font-bold px-1.5 py-0.5 rounded-full"
                                                style={{
                                                  backgroundColor: `${typeConf?.color ?? template.starColor}22`,
                                                  color: typeConf?.color ?? template.starColor,
                                                }}
                                              >
                                                {typeConf?.label}
                                              </span>
                                              <span className="text-[12px] text-gray-500 flex items-center gap-0.5">
                                                <Calendar style={{ width: 9, height: 9 }} />
                                                {monthLabel}
                                              </span>
                                              {item.cost && (
                                                <span className="text-[12px] text-gray-600">{item.cost}</span>
                                              )}
                                              {item.difficulty > 0 && (
                                                <span className="text-[12px] text-gray-600">
                                                  {'★'.repeat(item.difficulty)}{'☆'.repeat(5 - item.difficulty)}
                                                </span>
                                              )}
                                            </div>
                                            {item.organizer && (
                                              <div className="text-[12px] text-gray-600 mt-0.5">🏢 {item.organizer}</div>
                                            )}
                                            {(item.url || item.links?.[0]?.url) && (
                                              <a
                                                href={item.url ?? item.links?.[0]?.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 mt-1 text-[12px] text-blue-400 hover:underline"
                                              >
                                                <LinkIcon style={{ width: 9, height: 9 }} />
                                                {item.links?.[0]?.title ?? item.url ?? item.links?.[0]?.url}
                                              </a>
                                            )}
                                            {item.description && (
                                              <div className="text-[12px] text-gray-500 mt-1 leading-relaxed">{item.description}</div>
                                            )}
                                            {/* Sub-items preview */}
                                            {Array.isArray(item.subItems) && item.subItems.length > 0 && (
                                              <div className="mt-1.5 pl-1 border-l-2 space-y-0.5"
                                                style={{ borderColor: `${typeConf?.color ?? template.starColor}40` }}>
                                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                {item.subItems.slice(0, 3).map((sub: any) => (
                                                  <div key={sub.id} className="flex items-center gap-1 text-[12px] text-gray-500">
                                                    <span className="w-1 h-1 rounded-full bg-gray-600 flex-shrink-0" />
                                                    {sub.title}
                                                  </div>
                                                ))}
                                                {item.subItems.length > 3 && (
                                                  <div className="text-[12px] text-gray-600">+{item.subItems.length - 3}개 더</div>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            );
                            })}
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
            onClick={() => setShowUseTemplateDialog(true)}
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

      {showUseTemplateDialog && (
        <div
          className="fixed inset-0 z-[10020] flex items-end justify-center"
          onClick={(event) => event.stopPropagation()}
        >
          <div
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
            onClick={(event) => {
              event.stopPropagation();
              setShowUseTemplateDialog(false);
            }}
          />
          <div
            className="relative w-full max-w-[430px] rounded-t-3xl p-5 space-y-4"
            style={{ backgroundColor: '#0d0d24', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="space-y-1.5">
              <h3 className="text-base font-black text-white">
                {(LABELS.explore_use_path_dialog_title as string) ?? '나만의 패스로 바로 적용할까요?'}
              </h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                {(LABELS.explore_use_path_dialog_notice as string) ?? '원본을 그대로 복사하기보다, 내 목표와 일정에 맞게 수정해서 사용하는 것을 추천해요.'}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400">
                {(LABELS.explore_use_path_dialog_title_label as string) ?? '카피 제목'}
              </label>
              <input
                value={copiedPlanTitle}
                onChange={(event) => setCopiedPlanTitle(event.target.value)}
                placeholder={(LABELS.explore_use_path_dialog_title_placeholder as string) ?? '예: 나의 AI 연구원 커리어 패스'}
                className="w-full h-11 px-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: `1px solid ${template.starColor}45` }}
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowUseTemplateDialog(false)}
                className="h-11 rounded-xl text-sm font-bold text-white/75"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
              >
                {(LABELS.explore_use_path_dialog_cancel as string) ?? '취소'}
              </button>
              <button
                onClick={() => {
                  const trimmedTitle = copiedPlanTitle.trim();
                  onUseTemplate(trimmedTitle.length > 0 ? trimmedTitle : template.title);
                  setShowUseTemplateDialog(false);
                }}
                className="h-11 rounded-xl text-sm font-black text-white"
                style={{ background: `linear-gradient(135deg, ${template.starColor}, ${template.starColor}cc)` }}
              >
                {(LABELS.explore_use_path_dialog_confirm as string) ?? '나만의 패스로 적용하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
