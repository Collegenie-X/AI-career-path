'use client';

import { ChevronLeft, X, Calendar, DollarSign, Building2, Flame, Link as LinkIcon, FileText } from 'lucide-react';
import { ITEM_TYPES } from '../config';
import type { PlanItem } from './CareerPathBuilder';

type Props = {
  item: PlanItem;
  gradeLabel: string;
  color: string;
  onClose: () => void;
};

export function ItemDetailDialog({ item, gradeLabel, color, onClose }: Props) {
  const typeConf = ITEM_TYPES.find((t) => t.value === item.type);
  const primaryLink = item.links?.[0];
  const primaryUrl = item.url?.trim() || primaryLink?.url;
  const primaryLinkLabel = primaryLink?.title || primaryUrl;

  const monthLabel =
    item.months.length === 1
      ? `${item.months[0]}월`
      : item.months.length <= 3
      ? item.months.map((m) => `${m}월`).join(', ')
      : `${item.months[0]}월 ~ ${item.months[item.months.length - 1]}월`;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center"
      style={{
        backgroundColor: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] rounded-t-3xl overflow-hidden"
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
            background: `linear-gradient(135deg, ${typeConf?.color ?? color}22, ${
              typeConf?.color ?? color
            }08)`,
            borderBottom: `1px solid ${typeConf?.color ?? color}33`,
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
                backgroundColor: `${typeConf?.color ?? color}20`,
                border: `1.5px solid ${typeConf?.color ?? color}44`,
              }}
            >
              {typeConf?.emoji ?? '📌'}
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <div
                className="text-xs font-bold mb-1"
                style={{ color: typeConf?.color ?? color }}
              >
                {typeConf?.label} · {gradeLabel}
              </div>
              <h3 className="text-lg font-black text-white leading-snug">
                {item.title}
              </h3>
            </div>
          </div>
        </div>

        {/* Content — 2열 그리드로 상하 공간 절약 (모바일 대응) */}
        <div className="p-5 space-y-3">
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
              <Calendar
                className="w-4 h-4 flex-shrink-0 mt-0.5"
                style={{ color: typeConf?.color ?? color }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-bold text-gray-400 mb-0.5">목표 기간</div>
                <div className="text-xs font-semibold text-white">{monthLabel}</div>
                {item.months.length > 1 && (
                  <div className="text-[12px] text-gray-500">{item.months.length}개월</div>
                )}
              </div>
            </div>

            {/* 난이도 */}
            {item.difficulty > 0 && (
              <div className="flex items-start gap-2">
                <Flame
                  className="w-4 h-4 flex-shrink-0 mt-0.5"
                  style={{ color: '#f59e0b' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold text-gray-400 mb-0.5">난이도</div>
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-xs">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span
                          key={i}
                          style={{
                            color: i < item.difficulty ? '#f59e0b' : '#374151',
                          }}
                        >
                          ★
                        </span>
                      ))}
                    </span>
                    <span className="text-[12px] font-semibold text-white">
                      {item.difficulty === 1 && '매우 쉬움'}
                      {item.difficulty === 2 && '쉬움'}
                      {item.difficulty === 3 && '보통'}
                      {item.difficulty === 4 && '어려움'}
                      {item.difficulty === 5 && '매우 어려움'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* 비용 */}
            {item.cost && (
              <div className="flex items-start gap-2">
                <DollarSign
                  className="w-4 h-4 flex-shrink-0 mt-0.5"
                  style={{ color: '#22c55e' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold text-gray-400 mb-0.5">비용</div>
                  <div className="text-xs font-semibold text-white">{item.cost}</div>
                </div>
              </div>
            )}

            {/* 주관/출처 */}
            {item.organizer && (
              <div className="flex items-start gap-2">
                <Building2
                  className="w-4 h-4 flex-shrink-0 mt-0.5"
                  style={{ color: '#8b5cf6' }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold text-gray-400 mb-0.5">주관/출처</div>
                  <div className="text-xs font-semibold text-white line-clamp-2">
                    {item.organizer}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* URL — 전체 너비 */}
          <div
            className="flex items-start gap-2 p-3 rounded-xl"
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <LinkIcon
              className="w-4 h-4 flex-shrink-0 mt-0.5"
              style={{ color: '#60a5fa' }}
            />
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
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <FileText
              className="w-4 h-4 flex-shrink-0 mt-0.5"
              style={{ color: '#a78bfa' }}
            />
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
              style={{
                backgroundColor: 'rgba(167,139,250,0.12)',
                border: '1px solid rgba(167,139,250,0.25)',
              }}
            >
              <span className="text-xs text-purple-300">✏️ 직접 입력한 항목</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="p-5"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <button
            onClick={onClose}
            className="w-full h-12 rounded-xl font-bold text-white transition-all active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${typeConf?.color ?? color}, ${
                typeConf?.color ?? color
              }bb)`,
            }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
