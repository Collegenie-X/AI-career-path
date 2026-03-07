'use client';

import { useState, useRef, useEffect } from 'react';
import {
  X, Shield, Globe, MessageSquare, Send,
  Calendar, Target, Heart, Bookmark,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import { GRADE_YEARS, ITEM_TYPES } from '../../config';
import type { SharedPlan, OperatorComment, SharedPlanYear } from './types';

/* ─── Item type config helper ─── */
function getItemTypeConfig(type: string) {
  return ITEM_TYPES.find(t => t.value === type) ?? { label: type, color: '#888', emoji: '📌' };
}

/* ─── Difficulty stars ─── */
function DifficultyStars({ difficulty }: { difficulty: number }) {
  return (
    <span className="text-[10px] text-gray-500">
      {'★'.repeat(difficulty)}{'☆'.repeat(5 - difficulty)}
    </span>
  );
}

/* ─── Year section (accordion) ─── */
function YearSection({ year, starColor }: { year: SharedPlanYear; starColor: string }) {
  const [open, setOpen] = useState(true);
  const gradeInfo = GRADE_YEARS.find(g => g.id === year.gradeId);

  return (
    <div className="relative pl-12">
      {/* Grade circle */}
      <div
        className="absolute left-0 top-0 w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black z-10"
        style={{
          backgroundColor: starColor,
          color: '#fff',
          boxShadow: `0 0 0 3px #0e0e24, 0 0 10px ${starColor}55`,
        }}
      >
        {year.gradeLabel}
      </div>

      {/* Vertical line */}
      <div
        className="absolute left-[17px] top-9 bottom-0 w-0.5"
        style={{ backgroundColor: `${starColor}20` }}
      />

      <div className="pb-6">
        {/* Grade header */}
        <button
          onClick={() => setOpen(o => !o)}
          className="w-full flex items-center justify-between pt-1 pb-2"
        >
          <div>
            <div className="text-sm font-bold text-white text-left">
              {gradeInfo?.fullLabel ?? year.gradeLabel}
            </div>
            <div className="text-[10px] text-gray-500 text-left">
              목표 {year.goals.length}개 · 계획 {year.items.length}개
            </div>
          </div>
          {open
            ? <ChevronUp className="w-4 h-4 text-gray-600 flex-shrink-0" />
            : <ChevronDown className="w-4 h-4 text-gray-600 flex-shrink-0" />}
        </button>

        {open && (
          <div className="space-y-3">
            {/* Goals */}
            {year.goals.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <Target style={{ width: 10, height: 10 }} />목표
                </div>
                {year.goals.map((goal, gi) => (
                  <div
                    key={gi}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
                    style={{
                      backgroundColor: `${starColor}10`,
                      border: `1px solid ${starColor}1e`,
                    }}
                  >
                    <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: starColor }} />
                    <span className="text-gray-200">{goal}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Items */}
            {year.items.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  <Calendar style={{ width: 10, height: 10 }} />활동·수상·자격증
                </div>
                {year.items.map(item => {
                  const typeConf = getItemTypeConfig(item.type);
                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl"
                      style={{
                        backgroundColor: `${typeConf.color}0d`,
                        border: `1px solid ${typeConf.color}25`,
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                        style={{
                          backgroundColor: `${typeConf.color}18`,
                          border: `1px solid ${typeConf.color}28`,
                        }}
                      >
                        {typeConf.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white leading-snug">{item.title}</div>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: `${typeConf.color}22`, color: typeConf.color }}
                          >
                            {typeConf.label}
                          </span>
                          <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
                            <Calendar style={{ width: 9, height: 9 }} />{item.month}월
                          </span>
                          {item.cost && (
                            <span className="text-[10px] text-gray-600">{item.cost}</span>
                          )}
                          {item.difficulty > 0 && (
                            <DifficultyStars difficulty={item.difficulty} />
                          )}
                        </div>
                        {item.organizer && (
                          <div className="text-[10px] text-gray-600 mt-0.5">{item.organizer}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Comment bubble ─── */
function CommentBubble({ comment }: { comment: OperatorComment }) {
  const isOperator = comment.authorRole === 'operator';
  const timeLabel = new Date(comment.createdAt).toLocaleDateString('ko-KR', {
    month: 'short', day: 'numeric',
  });

  return (
    <div className={`flex gap-2.5 ${isOperator ? '' : 'flex-row-reverse'}`}>
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-base flex-shrink-0"
        style={{
          backgroundColor: isOperator ? 'rgba(108,92,231,0.2)' : 'rgba(59,130,246,0.15)',
          border: `1px solid ${isOperator ? 'rgba(108,92,231,0.3)' : 'rgba(59,130,246,0.25)'}`,
        }}
      >
        {comment.authorEmoji}
      </div>
      <div className={`flex-1 max-w-[80%] ${isOperator ? '' : 'flex flex-col items-end'}`}>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[11px] font-bold text-white">{comment.authorName}</span>
          {isOperator && (
            <span
              className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: 'rgba(108,92,231,0.2)', color: '#a78bfa' }}
            >
              운영자
            </span>
          )}
          <span className="text-[9px] text-gray-600">{timeLabel}</span>
        </div>
        <div
          className="px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed"
          style={{
            backgroundColor: isOperator ? 'rgba(108,92,231,0.1)' : 'rgba(59,130,246,0.08)',
            border: `1px solid ${isOperator ? 'rgba(108,92,231,0.2)' : 'rgba(59,130,246,0.15)'}`,
            color: 'rgba(255,255,255,0.85)',
            borderTopLeftRadius: isOperator ? 4 : undefined,
            borderTopRightRadius: !isOperator ? 4 : undefined,
          }}
        >
          {comment.content}
        </div>
      </div>
    </div>
  );
}

/* ─── Comment input ─── */
function CommentInput({ onSend, starColor }: { onSend: (text: string) => void; starColor: string }) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };

  return (
    <div
      className="flex gap-2 items-center pt-3"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
        placeholder="코멘트를 남겨보세요..."
        className="flex-1 h-10 px-4 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
        style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
      />
      <button
        onClick={handleSend}
        disabled={!text.trim()}
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-90 disabled:opacity-30"
        style={{ backgroundColor: starColor }}
      >
        <Send className="w-4 h-4 text-white" />
      </button>
    </div>
  );
}

/* ─── Main dialog ─── */
type Props = {
  plan: SharedPlan;
  isLiked: boolean;
  isBookmarked: boolean;
  likeCount: number;
  bookmarkCount: number;
  onToggleLike: () => void;
  onToggleBookmark: () => void;
  onClose: () => void;
  onAddComment: (planId: string, comment: OperatorComment) => void;
};

export function SharedPlanDetailDialog({
  plan, isLiked, isBookmarked, likeCount, bookmarkCount,
  onToggleLike, onToggleBookmark, onClose, onAddComment,
}: Props) {
  const [comments, setComments] = useState<OperatorComment[]>(plan.operatorComments);
  const [activeSection, setActiveSection] = useState<'timeline' | 'comments'>('timeline');
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeSection === 'comments') {
      commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments.length, activeSection]);

  const isOperatorOnly = plan.shareType === 'operator';
  const gradeInfo = GRADE_YEARS.find(g => g.id === plan.ownerGrade);
  const sharedDate = new Date(plan.sharedAt).toLocaleDateString('ko-KR', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const handleSendComment = (text: string) => {
    const newComment: OperatorComment = {
      id: `comment-${Date.now()}`,
      authorId: 'current-user',
      authorName: '나',
      authorEmoji: '🧑',
      authorRole: 'peer',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setComments(prev => [...prev, newComment]);
    onAddComment(plan.id, newComment);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative flex flex-col w-full max-w-[430px] mx-auto mt-10 flex-1 rounded-t-3xl overflow-hidden"
        style={{ backgroundColor: '#0e0e24', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* ── Header ── */}
        <div
          className="flex-shrink-0 px-5 pt-5 pb-4"
          style={{
            background: `linear-gradient(135deg, ${plan.starColor}18, ${plan.starColor}06)`,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Title row */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${plan.starColor}30, ${plan.starColor}12)`,
                  border: `1.5px solid ${plan.starColor}40`,
                }}
              >
                {plan.jobEmoji}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-black text-white leading-snug line-clamp-1">{plan.title}</h3>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="text-[11px] text-gray-400">{plan.ownerEmoji} {plan.ownerName}</span>
                  {gradeInfo && (
                    <>
                      <span className="text-[10px] text-gray-600">·</span>
                      <span className="text-[10px] text-gray-500">{gradeInfo.fullLabel}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ml-2"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Info chips */}
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            {isOperatorOnly ? (
              <span
                className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full"
                style={{ backgroundColor: 'rgba(108,92,231,0.15)', color: '#a78bfa', border: '1px solid rgba(108,92,231,0.25)' }}
              >
                <Shield className="w-3 h-3" />운영자 공유
              </span>
            ) : (
              <span
                className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full"
                style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.2)' }}
              >
                <Globe className="w-3 h-3" />전체 공유
              </span>
            )}
            <span className="text-[10px] text-gray-500">{plan.starEmoji} {plan.starName}</span>
            <span className="text-[10px] text-gray-600">·</span>
            <span className="text-[10px] text-gray-500">{plan.yearCount}학년 · {plan.itemCount}개</span>
            <span className="text-[10px] text-gray-600">·</span>
            <span className="flex items-center gap-0.5 text-[10px] text-gray-500">
              <Calendar className="w-2.5 h-2.5" />{sharedDate}
            </span>
          </div>

          {/* Reaction bar */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleLike}
              className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all active:scale-95"
              style={isLiked
                ? { backgroundColor: 'rgba(255,100,119,0.12)', border: '1px solid rgba(255,100,119,0.3)' }
                : { backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
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
              style={isBookmarked
                ? { backgroundColor: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)' }
                : { backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
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

        {/* ── Section tabs ── */}
        <div
          className="flex-shrink-0 flex gap-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          {[
            { id: 'timeline' as const, label: '📋 커리어 타임라인' },
            { id: 'comments' as const, label: `💬 코멘트 ${comments.length > 0 ? `(${comments.length})` : ''}` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className="flex-1 py-3 text-xs font-bold transition-all"
              style={activeSection === tab.id
                ? { color: '#a78bfa', borderBottom: `2px solid #a78bfa` }
                : { color: 'rgba(255,255,255,0.35)', borderBottom: '2px solid transparent' }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto">
          {activeSection === 'timeline' ? (
            <div className="px-5 py-4">
              {plan.years.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="text-4xl mb-3">📭</div>
                  <p className="text-sm text-gray-500">상세 계획 정보가 없어요</p>
                </div>
              ) : (
                <div className="relative">
                  {plan.years.map(year => (
                    <YearSection key={year.gradeId} year={year} starColor={plan.starColor} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="px-5 py-4 space-y-3">
              {comments.length === 0 ? (
                <div
                  className="py-8 text-center rounded-xl"
                  style={{ border: '1px dashed rgba(255,255,255,0.1)' }}
                >
                  <MessageSquare className="w-6 h-6 text-gray-700 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">아직 코멘트가 없어요</p>
                  <p className="text-[10px] text-gray-600 mt-0.5">첫 코멘트를 남겨보세요!</p>
                </div>
              ) : (
                comments.map(comment => (
                  <CommentBubble key={comment.id} comment={comment} />
                ))
              )}
              <div ref={commentsEndRef} />
            </div>
          )}
        </div>

        {/* ── Comment input (sticky bottom) ── */}
        <div
          className="flex-shrink-0 px-5 pb-8 pt-2"
          style={{ backgroundColor: '#0e0e24' }}
        >
          <CommentInput onSend={handleSendComment} starColor={plan.starColor} />
        </div>
      </div>
    </div>
  );
}
