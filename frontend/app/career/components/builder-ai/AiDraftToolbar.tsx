'use client';

import { useState } from 'react';
import { Sparkles, RefreshCw, Undo2, SlidersHorizontal, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { AI_PATH_CONFIG, getOperationCost, type AiIntensityId, type AiPathSelection } from '../../utils/aiPathGenerator';
import { AI_ACCENT, AI_ACCENT_SOFT } from './AiDraftContext';
import { AiCreditBadge, AiErrorNotice, FreeBadge } from './AiCreditBadge';
import { AiSelectionSummary } from './AiSelectionSummary';
import type { AiDraftError } from './useAiPathDraft';

type Props = {
  color: string;
  jobLabel: string;
  selection: AiPathSelection | null;
  summary: string;
  assumptions: string[];
  credits: number;
  busy: boolean;
  canUndo: boolean;
  error: AiDraftError;
  onChangeIntensity: (id: AiIntensityId) => void;
  onRegenerateAll: () => void;
  onUndo: () => void;
  onEditSelection: () => void;
  onResetTestCredits: () => void;
};

/** 여정 편집 화면 상단 — AI 초안 상태와 전체 단위 도구 */
export function AiDraftToolbar({
  color, jobLabel, selection, summary, assumptions, credits, busy, canUndo, error,
  onChangeIntensity, onRegenerateAll, onUndo, onEditSelection, onResetTestCredits,
}: Props) {
  const [open, setOpen] = useState(false);
  const regenCost = getOperationCost('regenerateAll');

  // 수동으로 만든 여정 — AI로 전환할 수 있는 입구만 보여 준다
  if (!selection) {
    return (
      <div
        className="rounded-2xl px-3.5 py-3 flex items-center gap-3"
        style={{ border: `1px solid ${AI_ACCENT}40`, backgroundColor: `${AI_ACCENT}0d` }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[13px] font-bold text-white">직접 만들기</span>
            <FreeBadge />
          </div>
          <p className="text-[12px] text-gray-400 leading-snug mt-0.5">무엇을 넣을지 막막하면 AI 초안으로 시작해 보세요</p>
        </div>
        <button
          type="button"
          onClick={onEditSelection}
          className="flex items-center gap-1.5 px-3 h-10 rounded-xl text-xs font-bold text-white flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${AI_ACCENT}, #6366f1)` }}
        >
          <Sparkles className="w-3.5 h-3.5" />AI 자동 생성
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div
        className="rounded-2xl overflow-hidden"
        style={{ border: `1px solid ${AI_ACCENT}55`, background: `linear-gradient(160deg, ${AI_ACCENT}1f 0%, ${AI_ACCENT}08 100%)` }}
      >
        <button type="button" onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-2 px-3.5 py-3 text-left" aria-expanded={open}>
          <Sparkles className="w-4 h-4 flex-shrink-0" style={{ color: AI_ACCENT_SOFT }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[13px] font-bold text-white">AI 초안</span>
              <AiCreditBadge credits={credits} />
            </div>
            <div className="text-[12px] text-gray-400 truncate mt-0.5">{summary}</div>
          </div>
          {busy && <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" style={{ color: AI_ACCENT_SOFT }} />}
          {open ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
        </button>

        <div className="px-3.5 pb-3 space-y-2.5">
          {/* 강도 조절 — 크레딧 없이 분량만 바꾼다 */}
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-gray-400 flex-shrink-0">분량</span>
            <div className="flex-1 grid grid-cols-3 gap-1.5">
              {AI_PATH_CONFIG.intensities.map((opt) => {
                const active = selection.intensityId === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={busy}
                    aria-pressed={active}
                    onClick={() => onChangeIntensity(opt.id)}
                    className="h-9 rounded-lg text-[12.5px] font-bold transition-all active:scale-95 disabled:opacity-50"
                    style={{
                      backgroundColor: active ? `${color}55` : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${active ? color : 'rgba(255,255,255,0.12)'}`,
                      color: active ? '#fff' : '#d1d5db',
                    }}
                  >
                    {opt.emoji} {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button" disabled={busy} onClick={onRegenerateAll}
              className="h-9 rounded-lg text-[12px] font-bold text-white flex items-center justify-center gap-1 disabled:opacity-50"
              style={{ backgroundColor: `${AI_ACCENT}33`, border: `1px solid ${AI_ACCENT}66` }}
              title={`크레딧 ${regenCost}개 사용`}
            >
              <RefreshCw className="w-3.5 h-3.5" />전체 다시 ({regenCost})
            </button>
            <button
              type="button" disabled={busy} onClick={onEditSelection}
              className="h-9 rounded-lg text-[12px] font-bold text-gray-200 flex items-center justify-center gap-1 disabled:opacity-50"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />선택 바꾸기
            </button>
            <button
              type="button" disabled={busy || !canUndo} onClick={onUndo}
              className="h-9 rounded-lg text-[12px] font-bold text-gray-200 flex items-center justify-center gap-1 disabled:opacity-35"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <Undo2 className="w-3.5 h-3.5" />되돌리기
            </button>
          </div>

          {open && (
            <div className="space-y-2.5 pt-1">
              <AiSelectionSummary selection={selection} jobLabel={jobLabel} credits={credits} nextCost={regenCost} />
              {assumptions.length > 0 && (
                <ul className="space-y-1 px-1">
                  {assumptions.map((a) => (
                    <li key={a} className="text-[12px] text-gray-400 leading-snug">· {a}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <p className="text-[11.5px] leading-relaxed" style={{ color: `${AI_ACCENT_SOFT}cc` }}>{AI_PATH_CONFIG.notice}</p>
        </div>
      </div>
      {error && <AiErrorNotice kind={error.kind} message={error.message} onResetTestCredits={onResetTestCredits} />}
    </div>
  );
}
