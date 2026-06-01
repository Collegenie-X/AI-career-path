'use client';

import { useState } from 'react';
import {
  ChevronLeft, X, Calendar, DollarSign, Building2, Flame,
  Link as LinkIcon, FileText, ExternalLink, Trash2, Send, BookOpen,
} from 'lucide-react';
import { ITEM_TYPES } from '../config';
import type { PlanItem } from './CareerPathBuilder';
import { useItemComments, type PlanItemCommentKind, type PlanItemComment } from '../hooks/useItemComments';

/* ─── Comment kind config ─── */
const KIND_CONFIG: Record<PlanItemCommentKind, { label: string; emoji: string; color: string; bg: string }> = {
  problem:    { label: '문제발견', emoji: '🔍', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  debug:      { label: '디버깅',  emoji: '🔧', color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  progress:   { label: '진행',    emoji: '✅', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  resource:   { label: '참고자료', emoji: '📎', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  reflection: { label: '배운점',  emoji: '💡', color: '#eab308', bg: 'rgba(234,179,8,0.12)' },
  note:       { label: '메모',    emoji: '📝', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
};

const KIND_KEYS = Object.keys(KIND_CONFIG) as PlanItemCommentKind[];

/* ─── Date formatter ─── */
function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return '방금 전';
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}시간 전`;
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const y = d.getFullYear();
  const nowY = now.getFullYear();
  return nowY === y ? `${m}월 ${day}일` : `${y}.${m}.${day}`;
}

/* ─── Single comment card ─── */
function CommentCard({
  comment,
  onDelete,
}: {
  comment: PlanItemComment;
  onDelete: (id: string) => void;
}) {
  const k = KIND_CONFIG[comment.kind];
  return (
    <div
      className="rounded-xl p-3 space-y-1.5 group relative"
      style={{ backgroundColor: k.bg, border: `1px solid ${k.color}30` }}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${k.color}22`, color: k.color }}
        >
          {k.emoji} {k.label}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-gray-500">{formatDate(comment.createdAt)}</span>
          <button
            onClick={() => onDelete(comment.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-lg flex items-center justify-center hover:bg-red-500/20"
            title="삭제"
          >
            <Trash2 className="w-3 h-3 text-red-400" />
          </button>
        </div>
      </div>
      <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap">{comment.body}</p>
      {comment.url && (
        <a
          href={comment.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 break-all"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="w-3 h-3 flex-shrink-0" />
          {comment.url}
        </a>
      )}
    </div>
  );
}

/* ─── Comment input form ─── */
function CommentForm({
  accentColor,
  onSubmit,
}: {
  accentColor: string;
  onSubmit: (draft: { kind: PlanItemCommentKind; body: string; url?: string }) => void;
}) {
  const [kind, setKind] = useState<PlanItemCommentKind>('note');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  const [showUrl, setShowUrl] = useState(false);

  function handleSubmit() {
    if (!body.trim()) return;
    onSubmit({ kind, body, url: url.trim() || undefined });
    setBody('');
    setUrl('');
    setShowUrl(false);
  }

  return (
    <div
      className="rounded-xl p-3 space-y-2.5"
      style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      {/* Kind selector */}
      <div className="flex flex-wrap gap-1.5">
        {KIND_KEYS.map((k) => {
          const conf = KIND_CONFIG[k];
          const active = kind === k;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className="text-[11px] font-semibold px-2 py-1 rounded-full transition-all"
              style={{
                backgroundColor: active ? conf.bg : 'rgba(255,255,255,0.06)',
                color: active ? conf.color : 'rgba(255,255,255,0.4)',
                border: active ? `1px solid ${conf.color}50` : '1px solid transparent',
              }}
            >
              {conf.emoji} {conf.label}
            </button>
          );
        })}
      </div>

      {/* Textarea */}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit();
        }}
        placeholder="발견한 문제, 디버깅 과정, 배운 점 등을 기록하세요..."
        rows={3}
        className="w-full bg-transparent text-xs text-white placeholder-gray-600 resize-none outline-none leading-relaxed"
      />

      {/* URL toggle + input */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowUrl((v) => !v)}
          className="text-[11px] text-gray-500 hover:text-blue-400 transition-colors flex items-center gap-1"
        >
          <LinkIcon className="w-3 h-3" />
          {showUrl ? '링크 숨기기' : '링크 추가'}
        </button>
        {showUrl && (
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            className="flex-1 bg-transparent text-xs text-blue-400 placeholder-gray-600 outline-none border-b border-white/10 pb-0.5"
          />
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!body.trim()}
          className="ml-auto flex items-center gap-1 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all disabled:opacity-30"
          style={{ backgroundColor: `${accentColor}33`, color: accentColor }}
        >
          <Send className="w-3 h-3" />
          기록
        </button>
      </div>
    </div>
  );
}

/* ─── Main dialog ─── */
type Props = {
  item: PlanItem;
  gradeLabel: string;
  color: string;
  onClose: () => void;
};

export function ItemDetailDialog({ item, gradeLabel, color, onClose }: Props) {
  const typeConf = ITEM_TYPES.find((t) => t.value === item.type);
  const accentColor = typeConf?.color ?? color;
  const primaryLink = item.links?.[0];
  const primaryUrl = item.url?.trim() || primaryLink?.url;
  const primaryLinkLabel = primaryLink?.title || primaryUrl;

  const monthLabel =
    item.months.length === 1
      ? `${item.months[0]}월`
      : item.months.length <= 3
      ? item.months.map((m) => `${m}월`).join(', ')
      : `${item.months[0]}월 ~ ${item.months[item.months.length - 1]}월`;

  const { comments, addComment, deleteComment } = useItemComments(item.id);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] rounded-t-3xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: '#0f0f23',
          border: '1px solid rgba(255,255,255,0.1)',
          maxHeight: '90vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="relative p-5 flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}08)`,
            borderBottom: `1px solid ${accentColor}33`,
          }}
        >
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
              aria-label="뒤로 가기"
            >
              <ChevronLeft className="w-5 h-5 text-gray-300" />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
              style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
              aria-label="닫기"
            >
              <X className="w-4 h-4 text-gray-300" />
            </button>
          </div>

          <div className="flex items-start gap-3 pt-10">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{
                backgroundColor: `${accentColor}20`,
                border: `1.5px solid ${accentColor}44`,
              }}
            >
              {typeConf?.emoji ?? '📌'}
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <div className="text-xs font-bold mb-1" style={{ color: accentColor }}>
                {typeConf?.label} · {gradeLabel}
              </div>
              <h3 className="text-lg font-black text-white leading-snug">{item.title}</h3>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {/* 2열 메타 그리드 */}
          <div
            className="grid grid-cols-2 gap-2"
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              padding: 12,
            }}
          >
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: accentColor }} />
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-bold text-gray-400 mb-0.5">목표 기간</div>
                <div className="text-xs font-semibold text-white">{monthLabel}</div>
                {item.months.length > 1 && (
                  <div className="text-[12px] text-gray-500">{item.months.length}개월</div>
                )}
              </div>
            </div>

            {item.difficulty > 0 && (
              <div className="flex items-start gap-2">
                <Flame className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold text-gray-400 mb-0.5">난이도</div>
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-xs">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} style={{ color: i < item.difficulty ? '#f59e0b' : '#374151' }}>★</span>
                      ))}
                    </span>
                    <span className="text-[12px] font-semibold text-white">
                      {['', '매우 쉬움', '쉬움', '보통', '어려움', '매우 어려움'][item.difficulty] ?? '보통'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {item.cost && (
              <div className="flex items-start gap-2">
                <DollarSign className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#22c55e' }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold text-gray-400 mb-0.5">비용</div>
                  <div className="text-xs font-semibold text-white">{item.cost}</div>
                </div>
              </div>
            )}

            {item.organizer && (
              <div className="flex items-start gap-2">
                <Building2 className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#8b5cf6' }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold text-gray-400 mb-0.5">주관/출처</div>
                  <div className="text-xs font-semibold text-white line-clamp-2">{item.organizer}</div>
                </div>
              </div>
            )}
          </div>

          {/* 공식 사이트 */}
          <div
            className="flex items-start gap-2 p-3 rounded-xl"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <LinkIcon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#60a5fa' }} />
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-bold text-gray-400 mb-0.5">공식 사이트</div>
              {primaryUrl ? (
                <a
                  href={primaryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300 underline break-all"
                >
                  {primaryLinkLabel}
                </a>
              ) : (
                <span className="text-xs text-gray-500 italic">정보 없음</span>
              )}
            </div>
          </div>

          {/* 상세 설명 */}
          <div
            className="flex items-start gap-2 p-3 rounded-xl"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#a78bfa' }} />
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-bold text-gray-400 mb-0.5">상세 설명</div>
              {item.description?.trim() ? (
                <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">{item.description}</div>
              ) : (
                <span className="text-xs text-gray-500 italic">정보 없음</span>
              )}
            </div>
          </div>

          {item.custom && (
            <div
              className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl"
              style={{ backgroundColor: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.25)' }}
            >
              <span className="text-xs text-purple-300">✏️ 직접 입력한 항목</span>
            </div>
          )}

          {/* ─── 연구 노트 ─── */}
          <div className="pt-1">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-4 h-4" style={{ color: accentColor }} />
              <span className="text-sm font-bold text-white">연구 노트</span>
              {comments.length > 0 && (
                <span
                  className="text-[11px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: `${accentColor}22`, color: accentColor }}
                >
                  {comments.length}
                </span>
              )}
            </div>

            <CommentForm accentColor={accentColor} onSubmit={addComment} />

            {comments.length > 0 && (
              <div className="mt-3 space-y-2">
                {comments.map((c) => (
                  <CommentCard key={c.id} comment={c} onDelete={deleteComment} />
                ))}
              </div>
            )}

            {comments.length === 0 && (
              <p className="text-center text-[12px] text-gray-600 mt-4 pb-2">
                문제발견, 디버깅 과정, 배운 점을 기록해보세요
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 flex-shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={onClose}
            className="w-full h-12 rounded-xl font-bold text-white transition-all active:scale-[0.98]"
            style={{ background: `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)` }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
