'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, FlaskConical, Loader2 } from 'lucide-react';
import { GRADE_YEARS } from '../../config';
import {
  AI_PATH_CONFIG,
  getAvailableHorizons,
  getOperationCost,
  getStyleOption,
  type AiPathSelection,
  type AiStyleId,
  type AiTestPreset,
} from '../../utils/aiPathGenerator';
import { AI_ACCENT, AI_ACCENT_SOFT } from './AiDraftContext';
import { AiErrorNotice } from './AiCreditBadge';
import { AiSelectionSummary } from './AiSelectionSummary';
import type { AiDraftError } from './useAiPathDraft';

type Props = {
  color: string;
  jobLabel: string;
  selection: AiPathSelection;
  onChange: (next: AiPathSelection) => void;
  credits: number;
  isRegenerate: boolean;
  hasExistingYears: boolean;
  busy: boolean;
  error: AiDraftError;
  onGenerate: () => void;
  onManual: () => void;
  onResetTestCredits: () => void;
};

function Question({ step, title, desc, children }: { step: number; title: string; desc: string; children: ReactNode }) {
  return (
    <section className="space-y-2.5">
      <div className="flex items-start gap-2.5">
        <span
          className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black flex-shrink-0 mt-0.5"
          style={{ backgroundColor: `${AI_ACCENT}30`, color: AI_ACCENT_SOFT, border: `1px solid ${AI_ACCENT}55` }}
        >
          {step}
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-white leading-snug">{title}</h3>
          <p className="text-[12px] text-gray-400 leading-snug mt-0.5">{desc}</p>
        </div>
      </div>
      <div className="pl-[34px]">{children}</div>
    </section>
  );
}

function Chip({
  active, disabled, onClick, children, color, hint,
}: {
  active: boolean; disabled?: boolean; onClick: () => void; children: ReactNode; color: string; hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      title={hint}
      className="px-3 py-2 rounded-xl text-[13px] font-bold transition-all active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed"
      style={{
        background: active ? `linear-gradient(135deg, ${color}66, ${color}3d)` : 'rgba(255,255,255,0.06)',
        border: `1.5px solid ${active ? color : 'rgba(255,255,255,0.12)'}`,
        color: active ? '#fff' : '#d1d5db',
        boxShadow: active ? `0 0 14px ${color}44` : undefined,
      }}
    >
      {children}
    </button>
  );
}

function LoadingView() {
  const messages = AI_PATH_CONFIG.loadingMessages;
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIdx((i) => Math.min(i + 1, messages.length - 1)), 450);
    return () => clearInterval(timer);
  }, [messages.length]);
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-5" role="status" aria-live="polite">
      <motion.div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ background: `radial-gradient(circle, ${AI_ACCENT}55, ${AI_ACCENT}11)`, border: `1.5px solid ${AI_ACCENT}88` }}
        animate={{ scale: [1, 1.08, 1], boxShadow: [`0 0 0 0 ${AI_ACCENT}55`, `0 0 0 18px ${AI_ACCENT}00`, `0 0 0 0 ${AI_ACCENT}00`] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
      >
        <Sparkles className="w-8 h-8" style={{ color: AI_ACCENT_SOFT }} />
      </motion.div>
      <div className="text-center space-y-2">
        <div className="text-base font-black text-white">여정 초안을 만들고 있어요</div>
        <ul className="space-y-1">
          {messages.map((m, i) => (
            <li key={m} className="text-[12.5px] transition-colors" style={{ color: i <= idx ? AI_ACCENT_SOFT : 'rgba(255,255,255,0.25)' }}>
              {i < idx ? '✓ ' : i === idx ? '· ' : ''}{m}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function AutoGenerateForm({
  color, jobLabel, selection, onChange, credits, isRegenerate, hasExistingYears, busy, error, onGenerate, onManual, onResetTestCredits,
}: Props) {
  const { questions, intensities, testPresets } = AI_PATH_CONFIG;
  const horizons = selection.currentGradeId ? getAvailableHorizons(selection.currentGradeId) : questions.horizon.options;
  const currentStage = AI_PATH_CONFIG.stageByGrade[selection.currentGradeId];
  const cost = getOperationCost(isRegenerate ? 'regenerateAll' : 'generate');
  const isComplete = !!selection.currentGradeId && !!selection.horizonId && selection.styleIds.length > 0;
  const missing = [
    !selection.currentGradeId && '현재 학년',
    !selection.horizonId && '계획 범위',
    selection.styleIds.length === 0 && '준비 방식',
  ].filter(Boolean) as string[];

  const setGrade = (gradeId: string) => {
    const allowed = getAvailableHorizons(gradeId);
    const keep = allowed.some((h) => h.id === selection.horizonId);
    onChange({ ...selection, currentGradeId: gradeId, horizonId: keep ? selection.horizonId : allowed.length === 1 ? allowed[0].id : '' });
  };

  const toggleStyle = (id: AiStyleId) => {
    const has = selection.styleIds.includes(id);
    onChange({ ...selection, styleIds: has ? selection.styleIds.filter((s) => s !== id) : [...selection.styleIds, id] });
  };

  const applyPreset = (preset: AiTestPreset) => {
    onChange({
      currentGradeId: preset.currentGradeId,
      horizonId: preset.horizonId,
      styleIds: preset.styleIds,
      intensityId: preset.intensityId,
      freeText: preset.freeText,
    });
  };

  const isPresetActive = (preset: AiTestPreset) =>
    preset.currentGradeId === selection.currentGradeId &&
    preset.horizonId === selection.horizonId &&
    preset.intensityId === selection.intensityId &&
    preset.freeText === selection.freeText &&
    preset.styleIds.length === selection.styleIds.length &&
    preset.styleIds.every((s) => selection.styleIds.includes(s));

  if (busy) return <LoadingView />;

  const gradeGroups = [
    { label: '초등', ids: questions.currentGrade.gradeIds.filter((id) => id.startsWith('elem')) },
    { label: '중학교', ids: questions.currentGrade.gradeIds.filter((id) => id.startsWith('mid')) },
    { label: '고등·대학', ids: questions.currentGrade.gradeIds.filter((id) => id.startsWith('high') || id === 'univ') },
  ];

  return (
    <div className="space-y-5">
      {/* 테스트용 예시 선택 (더미) */}
      <div
        className="rounded-2xl px-3.5 py-3 space-y-2"
        style={{ border: '1px dashed rgba(255,255,255,0.22)', backgroundColor: 'rgba(255,255,255,0.03)' }}
      >
        <div className="flex items-center gap-1.5">
          <FlaskConical className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs font-bold text-gray-300">{testPresets.title}</span>
        </div>
        <p className="text-[11.5px] text-gray-500 leading-snug">{testPresets.desc}</p>
        <div className="flex gap-2 flex-wrap">
          {testPresets.items.map((preset) => (
            <Chip key={preset.id} active={isPresetActive(preset)} onClick={() => applyPreset(preset)} color={AI_ACCENT}>
              {preset.emoji} {preset.label}
            </Chip>
          ))}
        </div>
      </div>

      <Question step={1} title={questions.currentGrade.title} desc={questions.currentGrade.desc}>
        <div className="space-y-2">
          {gradeGroups.map((group) => (
            <div key={group.label} className="flex items-center gap-2 flex-wrap">
              <span className="w-[52px] text-[12px] text-gray-500 font-semibold flex-shrink-0">{group.label}</span>
              {group.ids.map((id) => (
                <Chip key={id} active={selection.currentGradeId === id} onClick={() => setGrade(id)} color={color}>
                  {GRADE_YEARS.find((g) => g.id === id)?.label ?? id}
                </Chip>
              ))}
            </div>
          ))}
        </div>
      </Question>

      <Question step={2} title={questions.horizon.title} desc={questions.horizon.desc}>
        <div className="flex gap-2 flex-wrap">
          {questions.horizon.options.map((opt) => {
            const available = horizons.some((h) => h.id === opt.id);
            return (
              <Chip
                key={opt.id}
                active={selection.horizonId === opt.id}
                disabled={!available}
                hint={available ? undefined : '현재 학년보다 앞선 범위예요'}
                onClick={() => onChange({ ...selection, horizonId: opt.id })}
                color={color}
              >
                {opt.emoji} {opt.label}
              </Chip>
            );
          })}
        </div>
      </Question>

      <Question step={3} title={questions.styles.title} desc={questions.styles.desc}>
        <div className="flex gap-2 flex-wrap">
          {questions.styles.options.map((opt) => (
            <Chip key={opt.id} active={selection.styleIds.includes(opt.id)} onClick={() => toggleStyle(opt.id)} color={color}>
              {opt.emoji} {opt.label}
            </Chip>
          ))}
        </div>
        {currentStage && selection.styleIds.some((id) => {
          const min = getStyleOption(id)?.minStage ?? 'elemLow';
          return AI_PATH_CONFIG.stageOrder.indexOf(min) > AI_PATH_CONFIG.stageOrder.indexOf(currentStage);
        }) && (
          <p className="text-[11.5px] text-gray-500 mt-2 leading-snug">
            대회·자격증은 학년 수준에 맞춰 초등 고학년·중학교 이후 학년부터 넣어 드려요.
          </p>
        )}
      </Question>

      <Question step={4} title={questions.intensity.title} desc={questions.intensity.desc}>
        <div className="grid grid-cols-3 gap-2">
          {intensities.map((opt) => {
            const active = selection.intensityId === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ ...selection, intensityId: opt.id })}
                className="flex flex-col items-center gap-0.5 py-2.5 rounded-xl transition-all active:scale-95"
                style={{
                  background: active ? `linear-gradient(135deg, ${color}66, ${color}3d)` : 'rgba(255,255,255,0.06)',
                  border: `1.5px solid ${active ? color : 'rgba(255,255,255,0.12)'}`,
                }}
              >
                <span className="text-lg leading-none">{opt.emoji}</span>
                <span className="text-[13px] font-bold text-white">{opt.label}</span>
                <span className="text-[11px] text-gray-400">{opt.desc}</span>
              </button>
            );
          })}
        </div>
      </Question>

      <Question step={5} title={questions.freeText.title} desc={questions.freeText.desc}>
        <textarea
          value={selection.freeText}
          onChange={(e) => onChange({ ...selection, freeText: e.target.value.slice(0, questions.freeText.maxLength) })}
          placeholder={questions.freeText.placeholder}
          rows={3}
          className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-gray-600 outline-none resize-none"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.12)' }}
        />
        <div className="text-right text-[11px] text-gray-600">{selection.freeText.length}/{questions.freeText.maxLength}</div>
      </Question>

      <AiSelectionSummary selection={selection} jobLabel={jobLabel} credits={credits} nextCost={cost} />

      {error && <AiErrorNotice kind={error.kind} message={error.message} onManual={onManual} onResetTestCredits={onResetTestCredits} />}

      <div className="space-y-2">
        <button
          type="button"
          onClick={onGenerate}
          disabled={!isComplete}
          className="w-full h-14 rounded-2xl font-black text-base text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40"
          style={isComplete
            ? { background: `linear-gradient(135deg, ${AI_ACCENT}, #6366f1)`, boxShadow: `0 6px 24px ${AI_ACCENT}55` }
            : { backgroundColor: 'rgba(255,255,255,0.08)' }}
        >
          {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {isRegenerate ? '이 선택으로 다시 만들기' : 'AI로 여정 만들기'}
          <span className="text-xs font-bold opacity-80">크레딧 {cost}</span>
        </button>
        <p className="text-center text-[12px] text-gray-500 leading-snug">
          {!isComplete
            ? `${missing.join(', ')}을(를) 골라 주세요`
            : hasExistingYears
              ? '지금 여정을 새 초안으로 바꿔요. 고정한 활동은 남고, 되돌리기로 복구할 수 있어요'
              : '만든 뒤에 활동 교체·학년별 재추천·직접 수정이 모두 가능해요'}
        </p>
        <button type="button" onClick={onManual} className="w-full py-2 text-[12.5px] font-semibold text-gray-400 underline underline-offset-2">
          AI 없이 무료로 직접 만들기
        </button>
      </div>
    </div>
  );
}
