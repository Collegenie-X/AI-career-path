'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Lightbulb, Repeat2, Lock, LockOpen, RefreshCw, Sparkles, Loader2, ListPlus, X } from 'lucide-react';
import type { GoalActivityGroup, PlanItem, YearPlan } from '../CareerPathBuilder';
import { rotateGoalItems, swapItemWithAlternative } from '../../utils/aiPathGenerator';
import { AI_ACCENT, AI_ACCENT_SOFT, useAiDraft } from './AiDraftContext';

/* ─── 활동 1개: 추천 이유 · 교체 · 고정 ─── */
export function AiItemAssist({
  item, onUpdate, goalReason,
}: {
  item: PlanItem;
  onUpdate: (updated: PlanItem) => void;
  /** 목표에 이미 표시한 이유 — 같으면 활동에서는 반복하지 않는다 */
  goalReason?: string;
}) {
  const [showAlternatives, setShowAlternatives] = useState(false);
  const alternatives = item.aiAlternatives ?? [];
  const isAiItem = !!item.aiSource || alternatives.length > 0;
  if (!isAiItem && !item.locked) return null;
  const ownReason = item.aiReason && item.aiReason !== goalReason ? item.aiReason : '';

  return (
    <div className="px-3 pb-2.5 space-y-2">
      {ownReason && (
        <div className="flex items-start gap-1.5">
          <Lightbulb className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: AI_ACCENT_SOFT }} />
          <p className="text-[12px] leading-snug text-gray-300">{ownReason}</p>
        </div>
      )}
      <div className="flex items-center gap-1.5">
        {alternatives.length > 0 && (
          <button
            type="button"
            disabled={item.locked}
            onClick={() => setShowAlternatives((s) => !s)}
            aria-expanded={showAlternatives}
            className="flex items-center gap-1 px-2.5 h-8 rounded-lg text-[12px] font-bold disabled:opacity-35"
            style={{ backgroundColor: `${AI_ACCENT}22`, border: `1px solid ${AI_ACCENT}55`, color: AI_ACCENT_SOFT }}
          >
            <Repeat2 className="w-3.5 h-3.5" />다른 활동으로 교체
          </button>
        )}
        <button
          type="button"
          onClick={() => { onUpdate({ ...item, locked: !item.locked }); setShowAlternatives(false); }}
          aria-pressed={!!item.locked}
          title={item.locked ? '고정 해제' : '다시 추천해도 이 활동은 유지'}
          className="flex items-center gap-1 px-2.5 h-8 rounded-lg text-[12px] font-bold"
          style={item.locked
            ? { backgroundColor: 'rgba(250,204,21,0.18)', border: '1px solid rgba(250,204,21,0.55)', color: '#fde047' }
            : { backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#d1d5db' }}
        >
          {item.locked ? <Lock className="w-3.5 h-3.5" /> : <LockOpen className="w-3.5 h-3.5" />}
          {item.locked ? '고정됨' : '고정'}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {showAlternatives && !item.locked && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl p-2 space-y-1.5" style={{ backgroundColor: 'rgba(0,0,0,0.25)', border: `1px solid ${AI_ACCENT}33` }}>
              <div className="flex items-center justify-between px-1">
                <span className="text-[11.5px] font-bold" style={{ color: AI_ACCENT_SOFT }}>교체 후보 {alternatives.length}개 · 크레딧 사용 없음</span>
                <button type="button" onClick={() => setShowAlternatives(false)} aria-label="교체 후보 닫기">
                  <X className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>
              {alternatives.map((alt) => (
                <button
                  key={alt.title}
                  type="button"
                  onClick={() => { onUpdate(swapItemWithAlternative(item, alt)); setShowAlternatives(false); }}
                  className="w-full text-left rounded-lg px-2.5 py-2 transition-colors hover:bg-white/5 active:bg-white/10"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  <div className="text-[12.5px] font-bold text-white leading-snug">{alt.title}</div>
                  {alt.description && <div className="text-[11.5px] text-gray-400 leading-snug mt-0.5 line-clamp-2">{alt.description}</div>}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── 목표 1개: 왜 이 목표인지 ─── */
export function AiGoalReason({ group }: { group: GoalActivityGroup }) {
  if (!group.aiReason) return null;
  return (
    <div
      className="flex items-start gap-1.5 mt-2.5 rounded-lg px-2.5 py-2"
      style={{ backgroundColor: `${AI_ACCENT}12`, border: `1px solid ${AI_ACCENT}30` }}
    >
      <Lightbulb className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: AI_ACCENT_SOFT }} />
      <p className="text-[12px] leading-snug text-gray-300">
        <span className="font-bold" style={{ color: AI_ACCENT_SOFT }}>추천 이유 </span>
        {group.aiReason}
      </p>
    </div>
  );
}

/* ─── 목표 1개: 활동만 다시 추천 ─── */
export function AiGoalAssist({ group, onUpdate }: { group: GoalActivityGroup; onUpdate: (updated: GoalActivityGroup) => void }) {
  if (!group.aiSource) return null;
  const canRotate = group.items.some((it) => !it.locked && (it.aiAlternatives ?? []).length > 0);
  if (!canRotate) return null;
  return (
    <button
      type="button"
      onClick={() => onUpdate(rotateGoalItems(group))}
      className="w-full flex items-center justify-center gap-1.5 h-9 rounded-xl text-[12px] font-bold"
      style={{ backgroundColor: `${AI_ACCENT}18`, border: `1px dashed ${AI_ACCENT}66`, color: AI_ACCENT_SOFT }}
      title="고정한 활동은 그대로 두고 나머지를 교체 후보로 바꿔요"
    >
      <RefreshCw className="w-3.5 h-3.5" />이 목표의 활동 다시 추천
    </button>
  );
}

/* ─── 학년 1개: 한 줄 주제 · 역산 이유 · 재추천 ─── */
export function AiYearAssist({ yearPlan }: { yearPlan: YearPlan }) {
  const ai = useAiDraft();
  if (!yearPlan.aiTheme) return null;
  const isBusy = ai.busyTarget === yearPlan.gradeId || ai.busyTarget === 'all';
  const isOutline = yearPlan.aiDetail === 'outline';
  const regenCost = ai.costOf('regenerateYear');
  const expandCost = ai.costOf('expandYear');

  return (
    <div
      className="mt-3 rounded-xl px-3 py-2.5 space-y-2"
      style={{ backgroundColor: `${AI_ACCENT}12`, border: `1px solid ${AI_ACCENT}3d` }}
    >
      <div className="flex items-start gap-1.5">
        <Sparkles className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: AI_ACCENT_SOFT }} />
        <div className="min-w-0">
          <div className="text-[12.5px] font-bold text-white leading-snug">
            {yearPlan.gradeLabel}의 주제: {yearPlan.aiTheme}
          </div>
          {yearPlan.aiThemeReason && <p className="text-[12px] text-gray-300 leading-snug mt-0.5">{yearPlan.aiThemeReason}</p>}
        </div>
      </div>
      {ai.enabled && (
        <div className="flex gap-1.5 flex-wrap">
          {isOutline && (
            <button
              type="button" disabled={isBusy} onClick={() => ai.expandYear(yearPlan.gradeId)}
              className="flex items-center gap-1 px-2.5 h-8 rounded-lg text-[12px] font-bold text-white disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${AI_ACCENT}, #6366f1)` }}
            >
              {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ListPlus className="w-3.5 h-3.5" />}
              자세히 채우기{expandCost > 0 ? ` (${expandCost})` : ''}
            </button>
          )}
          <button
            type="button" disabled={isBusy} onClick={() => ai.regenerateYear(yearPlan.gradeId)}
            className="flex items-center gap-1 px-2.5 h-8 rounded-lg text-[12px] font-bold disabled:opacity-50"
            style={{ backgroundColor: `${AI_ACCENT}22`, border: `1px solid ${AI_ACCENT}55`, color: AI_ACCENT_SOFT }}
            title={`크레딧 ${regenCost}개 사용 · 고정한 활동은 유지`}
          >
            {isBusy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            이 학년 다시 추천{regenCost > 0 ? ` (${regenCost})` : ''}
          </button>
        </div>
      )}
    </div>
  );
}
