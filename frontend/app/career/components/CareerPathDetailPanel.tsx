'use client';

import { useState, useEffect } from 'react';
import {
  X, Heart, Users, Bookmark, BookmarkCheck,
  ExternalLink, Flag, MessageCircle, MoreVertical,
} from 'lucide-react';
import type { CareerPathTemplate } from '@/data/career-path-templates-index';
import { ReportModal, type ReportTarget } from './ReportModal';
import { DetailRichInfoSection } from './DetailRichInfoSection';
import { CareerPathDetailPanelTimeline } from './CareerPathDetailPanelTimeline';
import { CareerPathDetailPanelComment, type DetailPanelComment } from './CareerPathDetailPanelComment';
import { AdmissionTypeStrategiesSection, SuccessStoriesSection } from './CareerPathDetailPanelSections';
import { UseTemplateDialog } from './UseTemplateDialog';

type Template = CareerPathTemplate;

type Comment = DetailPanelComment;

type CareerPathDetailPanelProps = {
  readonly template: Template;
  readonly onClose: () => void;
  readonly onUseTemplate: (customTitle: string) => void;
};

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


/* ─── Main panel (no createPortal, no fixed overlay) ─── */
export function CareerPathDetailPanel({ template, onClose, onUseTemplate }: CareerPathDetailPanelProps) {
  const [liked, setLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(template.likes);
  const [bookmarked, setBookmarked] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);
  const [showContentMenu, setShowContentMenu] = useState(false);
  const [showUseTemplateDialog, setShowUseTemplateDialog] = useState(false);
  const [collapsedGoalKeys, setCollapsedGoalKeys] = useState<Set<string>>(new Set());
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 'c1', userId: 'u1', userName: '김진로', userEmoji: '👨‍🎓',
      content: '정말 체계적인 패스네요! 중학교 때부터 준비하면 좋을 것 같아요.',
      timestamp: '2일 전', likes: 12, liked: false,
    },
    {
      id: 'c2', userId: 'u2', userName: '이미래', userEmoji: '👩‍🔬',
      content: '준비 일정이 구체적으로 나와있어서 도움이 많이 됐습니다!',
      timestamp: '5일 전', likes: 8, liked: false,
    },
  ]);

  useEffect(() => {
    setLiked(false);
    setLocalLikes(template.likes);
    setCollapsedGoalKeys(new Set());
    const saved = loadTemplateBookmarks();
    setBookmarked(saved.includes(template.id));
  }, [template.id, template.likes]);

  const toggleGoalExpand = (key: string) => {
    setCollapsedGoalKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const addComment = () => {
    if (!commentText.trim()) return;
    setComments(prev => [
      {
        id: `c${Date.now()}`, userId: 'current', userName: '나', userEmoji: '😊',
        content: commentText.trim(), timestamp: '방금', likes: 0, liked: false,
      },
      ...prev,
    ]);
    setCommentText('');
  };

  const toggleLikeComment = (id: string) => {
    setComments(prev => prev.map(c =>
      c.id === id ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 } : c
    ));
  };

  const startEdit = (id: string) => {
    const c = comments.find(c => c.id === id);
    if (c) { setEditingId(id); setEditingText(c.content); }
  };

  const saveEdit = (id: string) => {
    if (!editingText.trim()) return;
    setComments(prev => prev.map(c => c.id === id ? { ...c, content: editingText.trim() } : c));
    setEditingId(null);
    setEditingText('');
  };

  const cancelEdit = () => { setEditingId(null); setEditingText(''); };

  const deleteComment = (id: string) => {
    if (window.confirm('댓글을 삭제하시겠습니까?')) {
      setComments(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleToggleBookmark = () => {
    const next = !bookmarked;
    setBookmarked(next);
    const saved = loadTemplateBookmarks();
    const updated = next
      ? [...saved.filter(id => id !== template.id), template.id]
      : saved.filter(id => id !== template.id);
    saveTemplateBookmarks(updated);
  };

  return (
    <div>
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
            className="rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
            style={{
              width: 56, height: 56,
              background: `linear-gradient(135deg, ${template.starColor}40, ${template.starColor}18)`,
              border: `1.5px solid ${template.starColor}44`,
            }}
          >
            {template.jobEmoji}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-white leading-snug">{template.title}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-[13px] text-gray-400">{template.starEmoji} {template.starName}</span>
              <span className="text-[13px] text-gray-600">·</span>
              <span className="text-[13px] text-gray-500">{template.years.length}개 학년</span>
              <span className="text-[13px] text-gray-600">·</span>
              <span className="text-[13px] text-gray-500">{template.totalItems}개 항목</span>
              {template.authorType === 'official' && (
                <span
                  className="text-[13px] font-bold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: '#6C5CE720', color: '#a78bfa' }}
                >
                  ✓ 공식
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 md:hidden"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            title="닫기"
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
            <span className="text-[13px] font-semibold text-white">{localLikes}</span>
          </button>

          <button
            onClick={handleToggleBookmark}
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
          <div className="flex items-center gap-1 text-[13px] text-gray-500">
            <Users style={{ width: 14, height: 14 }} />
            <span>{template.uses}명 사용</span>
          </div>

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
                <div className="fixed inset-0 z-[210]" onClick={() => setShowContentMenu(false)} />
                <div
                  className="absolute right-0 top-9 z-[220] rounded-2xl overflow-hidden w-44 shadow-2xl"
                  style={{ backgroundColor: '#1a1a38', border: '1px solid rgba(255,255,255,0.12)' }}
                >
                  <button
                    onClick={() => {
                      setShowContentMenu(false);
                      setReportTarget({ kind: 'content', id: template.id, title: template.title });
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-[13px] text-left transition-all"
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

      {/* ── Body ── */}
      <div>
        <div className="px-5 py-4 space-y-5">
          <p className="text-[13px] text-gray-400 leading-relaxed">{template.description}</p>

          <DetailRichInfoSection template={template} />

          <AdmissionTypeStrategiesSection template={template} />
          <SuccessStoriesSection template={template} />

          <CareerPathDetailPanelTimeline
            template={template}
            collapsedGoalKeys={collapsedGoalKeys}
            onToggleGoalExpand={toggleGoalExpand}
          />

          {/* Tags */}
          <div className="flex gap-1.5 flex-wrap">
            {template.tags.map(tag => (
              <span
                key={tag}
                className="text-[13px] px-2.5 py-1 rounded-full text-gray-500"
                style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Comments */}
          <div className="pt-5 mt-1 border-t space-y-4" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-2">
              <MessageCircle style={{ width: 16, height: 16, color: '#9ca3af' }} />
              <span className="text-[14px] font-bold text-white">댓글 {comments.length}개</span>
            </div>

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
                  className="w-full py-2 text-[13px] text-white placeholder-gray-600 bg-transparent border-b outline-none"
                  style={{ borderColor: 'rgba(255,255,255,0.18)' }}
                />
                {commentText.trim() && (
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => setCommentText('')}
                      className="px-3 py-1 rounded-full text-[13px] font-semibold"
                      style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#ccc' }}
                    >
                      취소
                    </button>
                    <button
                      onClick={addComment}
                      className="px-3 py-1 rounded-full text-[13px] font-semibold active:scale-95 transition-all"
                      style={{ backgroundColor: template.starColor, color: '#fff' }}
                    >
                      댓글 작성
                    </button>
                  </div>
                )}
              </div>
            </div>

            {comments.length === 0 ? (
              <div className="py-8 text-center">
                <MessageCircle style={{ width: 40, height: 40, color: '#374151', margin: '0 auto 8px' }} />
                <p className="text-[13px] text-gray-500">첫 댓글을 작성해보세요!</p>
              </div>
            ) : (
              <div className="space-y-4 pb-2">
                {comments.map((comment) => (
                  <CareerPathDetailPanelComment
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

      {/* ── Footer: 하단 고정 ── */}
      <div className="flex-shrink-0 p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.10)' }}>
        <button
          onClick={() => setShowUseTemplateDialog(true)}
          className="w-full rounded-2xl font-bold text-[15px] text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          style={{
            height: 56,
            background: `linear-gradient(135deg, ${template.starColor}, ${template.starColor}cc)`,
            boxShadow: `0 6px 20px ${template.starColor}44`,
          }}
        >
          이 패스 사용하기
          <ExternalLink style={{ width: 17, height: 17 }} />
        </button>
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
        <UseTemplateDialog
          templateTitle={template.title}
          starColor={template.starColor}
          onConfirm={(customTitle) => {
            onUseTemplate(customTitle);
            setShowUseTemplateDialog(false);
          }}
          onClose={() => setShowUseTemplateDialog(false)}
        />
      )}
    </div>
  );
}
