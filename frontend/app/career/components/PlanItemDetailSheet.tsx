'use client';

import { useState } from 'react';
import { X, Calendar, DollarSign, Building2, Flame, Link as LinkIcon, FileText, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { ITEM_TYPES } from '../config';

/* ─── Types ─── */
export type PlanItemSubDetail = { id: string; title: string; done?: boolean; url?: string; description?: string };

export type PlanItemDetail = {
  type: string;
  title: string;
  months?: number[];
  month?: number;
  difficulty?: number;
  cost?: string;
  organizer?: string;
  url?: string;
  links?: Array<{ title: string; url: string; kind?: string }>;
  description?: string;
  custom?: boolean;
  subItems?: PlanItemSubDetail[];
};

type Props = {
  item: PlanItemDetail;
  gradeLabel: string;
  color: string;
  onClose: () => void;
};

/* ─── Difficulty label ─── */
const DIFFICULTY_LABELS: Record<number, string> = {
  1: '매우 쉬움',
  2: '쉬움',
  3: '보통',
  4: '어려움',
  5: '매우 어려움',
};

/* ─── Shared item row card (아이콘 없음, 2열 그리드 메타, 하위 상세 아코디언) ─── */
export function PlanItemRowCard({
  item,
  color,
  isTitleDone = false,
  variant = 'default',
  showTodoReadOnly = false,
}: {
  item: PlanItemDetail;
  color: string;
  isTitleDone?: boolean;
  /** minimal: 커뮤니티 등 트리 내부용 — 테두리 없음, 배경만 */
  variant?: 'default' | 'minimal';
  /** true: 커뮤니티 그룹 — todo 리스트 보기 전용, 체크 상태 표시 (수정 불가) */
  showTodoReadOnly?: boolean;
}) {
  const typeConf = ITEM_TYPES.find((t) => t.value === item.type) ?? { label: item.type, color, emoji: '📌' };
  const months = item.months ?? (item.month != null ? [item.month] : []);
  const monthLabel =
    months.length === 0 ? '월 미정'
    : months.length === 1 ? `${months[0]}월`
    : months.length <= 3 ? months.map((m) => `${m}월`).join('·')
    : `${months[0]}~${months[months.length - 1]}월`;
  const subItems = item.subItems ?? [];
  const [subExpanded, setSubExpanded] = useState(showTodoReadOnly);

  const isMinimal = variant === 'minimal';

  return (
    <div
      className={`overflow-hidden transition-colors ${isMinimal ? 'rounded-lg hover:bg-white/[0.04]' : 'rounded-xl'}`}
      style={{
        backgroundColor: isMinimal ? `${typeConf.color}06` : `${typeConf.color}0d`,
        ...(isMinimal ? {} : { border: `1px solid ${typeConf.color}25` }),
      }}
    >
      <div className={`flex items-start gap-2.5 ${isMinimal ? 'p-2' : 'p-2.5'}`}>
        <div className="flex-1 min-w-0">
          <div
            className={`text-sm font-semibold leading-snug ${isTitleDone ? 'text-gray-400 line-through decoration-1 decoration-gray-500' : 'text-white'}`}
          >
            {item.title}
          </div>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span
              className="text-[12px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: `${typeConf.color}22`, color: typeConf.color }}
            >
              {typeConf.label}
            </span>
            <span className="flex items-center gap-0.5 text-[12px] text-gray-500">
              <Calendar style={{ width: 9, height: 9 }} />{monthLabel}
            </span>
            {item.cost && item.cost !== '무료' && item.cost !== '자체 제작' && (
              <span className="text-[12px] text-gray-600">{item.cost}</span>
            )}
            {(item.difficulty ?? 0) > 0 && (
              <span className="text-[12px] text-gray-500">
                {'★'.repeat(item.difficulty!)}{'☆'.repeat(5 - item.difficulty!)}
              </span>
            )}
            {subItems.length > 0 && !showTodoReadOnly && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setSubExpanded((prev) => !prev); }}
                className="flex items-center gap-1.5 text-[12px] font-semibold transition-all rounded-lg px-2 py-0.5 -mx-1 hover:bg-white/5"
                style={{ color: subExpanded ? typeConf.color : 'rgba(255,255,255,0.5)' }}
                title={subExpanded ? '하위 상세 접기' : '하위 상세 보기'}
              >
                {subExpanded ? <ChevronUp style={{ width: 10, height: 10 }} /> : <ChevronDown style={{ width: 10, height: 10 }} />}
                하위 {subItems.length}개
              </button>
            )}
            {subItems.length > 0 && showTodoReadOnly && (
              <span className="text-[11px] text-gray-500">할 일 {subItems.length}개</span>
            )}
          </div>
          {item.organizer && (
            <div className="text-[12px] text-gray-600 mt-0.5">{item.organizer}</div>
          )}
        </div>
      </div>

      {/* 하위활동(todo) — showTodoReadOnly: 체크박스 없이 읽기 전용 표시 */}
      {(subExpanded || showTodoReadOnly) && subItems.length > 0 && (
        <div
          className="px-2.5 pb-2.5 pt-1 space-y-1"
          style={{ borderTop: `1px solid ${typeConf.color}18` }}
          onClick={(e) => e.stopPropagation()}
        >
          {subItems.map((sub) => (
            <div
              key={sub.id}
              className="flex items-start gap-2 px-2 py-1.5 rounded-lg"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
            >
              <div className="flex-1 min-w-0">
                <span
                  className={`text-[12px] leading-snug ${sub.done ? 'text-gray-500 line-through decoration-1 decoration-gray-600' : 'text-white/80'}`}
                >
                  {sub.title}
                </span>
                {sub.description && (
                  <div className="text-[12px] text-gray-500 mt-0.5 line-clamp-2">{sub.description}</div>
                )}
                {sub.url && (
                  <a
                    href={sub.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-[12px] text-blue-400 hover:text-blue-300 mt-0.5 break-all"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLink style={{ width: 9, height: 9 }} />
                    {sub.url}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Full detail bottom sheet ─── */
export function PlanItemDetailSheet({ item, gradeLabel, color, onClose }: Props) {
  const typeConf = ITEM_TYPES.find((t) => t.value === item.type) ?? { label: item.type, color, emoji: '📌' };
  const accentColor = typeConf.color ?? color;
  const primaryLink = item.links?.[0];
  const primaryUrl = item.url?.trim() || primaryLink?.url;
  const primaryLinkLabel = primaryLink?.title || primaryUrl;

  const months = item.months ?? (item.month != null ? [item.month] : []);
  const monthLabel =
    months.length === 0 ? '월 미정'
    : months.length === 1 ? `${months[0]}월`
    : months.length <= 3 ? months.map((m) => `${m}월`).join(', ')
    : `${months[0]}월 ~ ${months[months.length - 1]}월`;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[645px] rounded-t-3xl overflow-hidden"
        style={{
          backgroundColor: '#0f0f23',
          border: '1px solid rgba(255,255,255,0.1)',
          maxHeight: '85vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="relative p-5"
          style={{
            background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}08)`,
            borderBottom: `1px solid ${accentColor}33`,
          }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
          >
            <X className="w-4 h-4 text-gray-300" />
          </button>

          <div className="flex items-start gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{
                backgroundColor: `${accentColor}20`,
                border: `1.5px solid ${accentColor}44`,
              }}
            >
              {typeConf.emoji}
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <div className="text-xs font-bold mb-1" style={{ color: accentColor }}>
                {typeConf.label} · {gradeLabel}
              </div>
              <h3 className="text-lg font-black text-white leading-snug">{item.title}</h3>
            </div>
          </div>
        </div>

        {/* Content — 2열 그리드로 상하 공간 절약 */}
        <div className="p-5 space-y-3 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 180px)' }}>
          {/* 기간·난이도·비용·주관 — 2열 그리드 */}
          <div
            className="grid grid-cols-2 gap-2"
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 12,
              padding: 12,
            }}
          >
            {/* 기간 */}
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: accentColor }} />
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-bold text-gray-400 mb-0.5">목표 기간</div>
                <div className="text-xs font-semibold text-white">{monthLabel}</div>
                {months.length > 1 && (
                  <div className="text-[12px] text-gray-500">{months.length}개월</div>
                )}
              </div>
            </div>

            {/* 난이도 */}
            {(item.difficulty ?? 0) > 0 && (
              <div className="flex items-start gap-2">
                <Flame className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold text-gray-400 mb-0.5">난이도</div>
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-xs">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} style={{ color: i < item.difficulty! ? '#f59e0b' : '#374151' }}>★</span>
                      ))}
                    </span>
                    <span className="text-[12px] font-semibold text-white">
                      {DIFFICULTY_LABELS[item.difficulty!] ?? '보통'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 비용 */}
            {item.cost && (
              <div className="flex items-start gap-2">
                <DollarSign className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#22c55e' }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold text-gray-400 mb-0.5">비용</div>
                  <div className="text-xs font-semibold text-white">{item.cost}</div>
                </div>
              </div>
            )}

            {/* 주관/출처 */}
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

          {/* URL — 전체 너비 */}
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

          {/* 설명 — 전체 너비 */}
          <div
            className="flex items-start gap-2 p-3 rounded-xl"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <FileText className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#a78bfa' }} />
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-bold text-gray-400 mb-0.5">상세 설명</div>
              {item.description?.trim() ? (
                <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {item.description}
                </div>
              ) : (
                <span className="text-xs text-gray-500 italic">정보 없음</span>
              )}
            </div>
          </div>

          {/* 직접 입력 뱃지 */}
          {item.custom && (
            <div
              className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl"
              style={{ backgroundColor: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.25)' }}
            >
              <span className="text-xs text-purple-300">✏️ 직접 입력한 항목</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
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
