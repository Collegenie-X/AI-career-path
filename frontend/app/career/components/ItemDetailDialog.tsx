'use client';

import { X, Calendar, DollarSign, Building2, Flame, Link as LinkIcon, FileText } from 'lucide-react';
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

  const monthLabel =
    item.months.length === 1
      ? `${item.months[0]}월`
      : item.months.length <= 3
      ? item.months.map((m) => `${m}월`).join(', ')
      : `${item.months[0]}월 ~ ${item.months[item.months.length - 1]}월`;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
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

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* 기간 */}
          <div
            className="flex items-start gap-3 p-4 rounded-xl"
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Calendar
              className="w-5 h-5 flex-shrink-0 mt-0.5"
              style={{ color: typeConf?.color ?? color }}
            />
            <div className="flex-1">
              <div className="text-xs font-bold text-gray-400 mb-1">목표 기간</div>
              <div className="text-sm font-semibold text-white">{monthLabel}</div>
              {item.months.length > 1 && (
                <div className="text-xs text-gray-500 mt-1">
                  총 {item.months.length}개월 진행
                </div>
              )}
            </div>
          </div>

          {/* 난이도 */}
          {item.difficulty > 0 && (
            <div
              className="flex items-start gap-3 p-4 rounded-xl"
              style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <Flame
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                style={{ color: '#f59e0b' }}
              />
              <div className="flex-1">
                <div className="text-xs font-bold text-gray-400 mb-1">난이도</div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span
                        key={i}
                        className="text-base"
                        style={{
                          color: i < item.difficulty ? '#f59e0b' : '#374151',
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-white">
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
            <div
              className="flex items-start gap-3 p-4 rounded-xl"
              style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <DollarSign
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                style={{ color: '#22c55e' }}
              />
              <div className="flex-1">
                <div className="text-xs font-bold text-gray-400 mb-1">비용</div>
                <div className="text-sm font-semibold text-white">{item.cost}</div>
              </div>
            </div>
          )}

          {/* 주관/출처 */}
          {item.organizer && (
            <div
              className="flex items-start gap-3 p-4 rounded-xl"
              style={{
                backgroundColor: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <Building2
                className="w-5 h-5 flex-shrink-0 mt-0.5"
                style={{ color: '#8b5cf6' }}
              />
              <div className="flex-1">
                <div className="text-xs font-bold text-gray-400 mb-1">주관/출처</div>
                <div className="text-sm font-semibold text-white">
                  {item.organizer}
                </div>
              </div>
            </div>
          )}

          {/* URL - 항상 표시 */}
          <div
            className="flex items-start gap-3 p-4 rounded-xl"
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <LinkIcon
              className="w-5 h-5 flex-shrink-0 mt-0.5"
              style={{ color: '#60a5fa' }}
            />
            <div className="flex-1">
              <div className="text-xs font-bold text-gray-400 mb-1">공식 사이트</div>
              {item.url?.trim() ? (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-blue-400 hover:text-blue-300 underline break-all"
                >
                  {item.url}
                </a>
              ) : (
                <span className="text-sm text-gray-500 italic">정보 없음</span>
              )}
            </div>
          </div>

          {/* 설명 - 항상 표시 */}
          <div
            className="flex items-start gap-3 p-4 rounded-xl"
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <FileText
              className="w-5 h-5 flex-shrink-0 mt-0.5"
              style={{ color: '#a78bfa' }}
            />
            <div className="flex-1">
              <div className="text-xs font-bold text-gray-400 mb-1">상세 설명</div>
              {item.description?.trim() ? (
                <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {item.description}
                </div>
              ) : (
                <span className="text-sm text-gray-500 italic">정보 없음</span>
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
