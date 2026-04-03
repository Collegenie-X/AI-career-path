'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Sparkles, X } from 'lucide-react';
import executionPlanAiConfig from '@/data/dreammate/config/executionPlanAi.json';
import { useExecutionPlanAiGenerate } from '../../hooks/useExecutionPlanAiGenerate';
import { mapExecutionPlanAiWeeksToRoadmapTodoItems } from '../../utils/mapExecutionPlanAiWeeksToRoadmapTodoItems';
import type { RoadmapTodoItem } from '../../types';
import type { ExecutionPlanAiPlanDepthId } from '@/lib/dreammate/executionPlanAiTypes';
import { roadmapEditorSoftInsetPanelClassName } from '../roadmap-editor-ui/roadmapEditorUiTokens';
import { ExecutionPlanAiDepthPicker } from './ExecutionPlanAiDepthPicker';

const HISTORY_STORAGE_KEY = 'dreammate.executionPlanAi.history.v1';

type MilestoneRow = { title: string; date_iso: string };

interface HistoryEntry {
  at: string;
  summary: string;
}

function readHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { entries?: HistoryEntry[] };
    return Array.isArray(parsed.entries) ? parsed.entries.slice(0, 5) : [];
  } catch {
    return [];
  }
}

function pushHistory(summary: string) {
  if (typeof window === 'undefined' || !summary.trim()) return;
  const prev = readHistory();
  const next = [{ at: new Date().toISOString(), summary: summary.trim() }, ...prev].slice(0, 5);
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify({ entries: next }));
}

function formatApplicableMonthsKorean(months: number[]): string {
  if (months.length === 0) return '';
  return months.map(m => `${m}월`).join(', ');
}

/** API `final_goal` — UI에서 별도 입력 없이 활동 목표·적용 월로 자동 구성 */
function buildAutoFinalGoalForApi(
  template: string,
  activityTitle: string,
  monthsSorted: number[],
): string {
  const title = activityTitle.trim() || '활동';
  const months = formatApplicableMonthsKorean(monthsSorted);
  return template.replaceAll('{title}', title).replaceAll('{months}', months);
}

export interface ExecutionPlanAiGenerateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonths: number[];
  defaultPlanTitle: string;
  onApplySubItems: (subItems: RoadmapTodoItem[]) => void;
}

export function ExecutionPlanAiGenerateDialog({
  isOpen,
  onClose,
  selectedMonths,
  defaultPlanTitle,
  onApplySubItems,
}: ExecutionPlanAiGenerateDialogProps) {
  const cfg = executionPlanAiConfig as typeof executionPlanAiConfig & {
    planDepthOptions: readonly { id: string; label: string; hint: string; emoji?: string }[];
    gameHeaderBadge?: string;
    milestoneDateAriaLabel?: string;
    titleFieldHint?: string;
    applicableMonthsLabel?: string;
    applicableMonthsEmptyHint?: string;
    autoFinalGoalTemplate?: string;
  };
  const mutation = useExecutionPlanAiGenerate();

  const [planDepth, setPlanDepth] = useState<ExecutionPlanAiPlanDepthId>('brief');
  const [title, setTitle] = useState('');
  const [constraints, setConstraints] = useState('');
  const [milestones, setMilestones] = useState<MilestoneRow[]>([]);
  const [usePreviousSummary, setUsePreviousSummary] = useState(false);

  const depthOptions = cfg.planDepthOptions ?? [
    { id: 'detailed', label: '세부', hint: '' },
    { id: 'brief', label: '간략', hint: '' },
    { id: 'simple', label: '간단', hint: '' },
  ];

  const historyEntries = useMemo(() => readHistory(), [isOpen]);

  const applicableMonthsText = useMemo(
    () => formatApplicableMonthsKorean(selectedMonths),
    [selectedMonths],
  );

  useEffect(() => {
    if (!isOpen) return;
    setTitle(defaultPlanTitle.trim());
  }, [isOpen, defaultPlanTitle]);

  const handleGenerate = useCallback(async () => {
    const entries = readHistory();
    const previousSummary = usePreviousSummary && entries[0]?.summary ? entries[0].summary : '';
    const monthsSorted = [...selectedMonths].sort((a, b) => a - b);
    const resolvedTitle = title.trim() || defaultPlanTitle.trim() || '나의 실행계획';
    const tpl =
      cfg.autoFinalGoalTemplate?.trim() ??
      '적용 월 {months} 동안 「{title}」 활동 목표를 달성한다.';
    const finalGoal = buildAutoFinalGoalForApi(tpl, resolvedTitle, monthsSorted);

    const body = {
      title: resolvedTitle,
      plan_depth: planDepth,
      category_id: '',
      student_level: '',
      level_label: '',
      difficulty: 3,
      final_goal: finalGoal,
      selected_months: monthsSorted,
      milestones: milestones
        .map(milestone => {
          const titleTrim = milestone.title.trim();
          const dateTrim = milestone.date_iso.trim();
          if (!titleTrim && !dateTrim) {
            return { title: '', date_iso: '' };
          }
          return { title: titleTrim || '일정', date_iso: dateTrim };
        })
        .filter(milestone => milestone.title.length > 0),
      constraints: constraints.trim(),
      previous_summary: previousSummary,
    };

    try {
      const result = await mutation.mutateAsync(body);
      pushHistory(result.summary);
    } catch {
      /* mutation 에러 상태로 표시 */
    }
  }, [
    constraints,
    defaultPlanTitle,
    cfg.autoFinalGoalTemplate,
    milestones,
    mutation,
    planDepth,
    selectedMonths,
    title,
    usePreviousSummary,
  ]);

  const handleApply = useCallback(() => {
    const data = mutation.data;
    if (!data?.weeks?.length) return;
    const subItems = mapExecutionPlanAiWeeksToRoadmapTodoItems(data.weeks, selectedMonths);
    onApplySubItems(subItems);
    onClose();
  }, [mutation.data, onApplySubItems, onClose, selectedMonths]);

  if (!isOpen) return null;

  const effectiveActivityTitle = title.trim() || defaultPlanTitle.trim();
  const canGenerate = effectiveActivityTitle.length > 0 && selectedMonths.length > 0;
  const canApply = Boolean(mutation.data?.weeks?.length);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start sm:items-center justify-center overflow-y-auto p-3 sm:p-6"
      style={{ backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)' }}
      role="dialog"
      aria-modal
      aria-labelledby="execution-plan-ai-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label={cfg.closeButton}
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-[580px] my-auto rounded-2xl flex flex-col shadow-2xl max-h-[min(94vh,920px)] min-h-0 border-2 border-violet-500/35"
        style={{
          background: 'linear-gradient(180deg, #101528 0%, #0a0e1a 45%, #080c14 100%)',
          boxShadow: '0 0 0 1px rgba(167,139,250,0.12), 0 24px 80px rgba(0,0,0,0.55), 0 0 48px rgba(124,58,237,0.12)',
        }}
        onClick={event => event.stopPropagation()}
      >
        <div className="pointer-events-none absolute left-3 top-3 h-2 w-2 rounded-sm bg-fuchsia-400/80 shadow-[0_0_10px_rgba(232,121,249,0.6)]" aria-hidden />
        <div className="pointer-events-none absolute right-10 top-3 h-2 w-2 rounded-sm bg-cyan-400/70 shadow-[0_0_10px_rgba(34,211,238,0.45)]" aria-hidden />
        <div className="flex items-start justify-between gap-3 p-4 sm:p-5 border-b border-violet-500/15 flex-shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border border-violet-400/25"
              style={{ background: 'linear-gradient(145deg, rgba(124,58,237,0.5), rgba(59,130,246,0.2))' }}
            >
              <Sparkles className="w-6 h-6 text-violet-100" />
            </div>
            <div className="min-w-0 pt-0.5">
              {cfg.gameHeaderBadge ? (
                <p className="text-[10px] font-black tracking-[0.25em] text-fuchsia-300/90 mb-1">
                  {cfg.gameHeaderBadge}
                </p>
              ) : null}
              <h2 id="execution-plan-ai-title" className="text-lg font-black text-white tracking-tight">
                {cfg.dialogTitle}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5 leading-tight line-clamp-2">{cfg.dialogSubtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
          >
            <X className="w-5 h-5 text-gray-300" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 px-4 sm:px-6 py-4 space-y-5">
          <ExecutionPlanAiDepthPicker
            options={depthOptions}
            value={planDepth}
            onChange={setPlanDepth}
            label={cfg.planDepthLabel}
            hint={cfg.planDepthHint}
          />

          <section className="space-y-2">
            <label className="block space-y-1">
              <div className="flex flex-row flex-wrap items-baseline gap-x-2 gap-y-0 min-w-0">
                <span className="text-xs font-semibold text-gray-300 shrink-0">{cfg.titleLabel}</span>
                {cfg.titleFieldHint ? (
                  <span className="text-[11px] text-gray-500 leading-tight min-w-0">{cfg.titleFieldHint}</span>
                ) : null}
              </div>
              {selectedMonths.length > 0 ? (
                <p
                  className="text-[11px] font-semibold text-cyan-200/90 mt-0.5"
                  aria-label={`${cfg.applicableMonthsLabel ?? '적용 월'}: ${applicableMonthsText}`}
                >
                  <span className="text-cyan-300/80">{cfg.applicableMonthsLabel ?? '적용 월'}</span>
                  <span className="text-gray-400 font-normal mx-1.5">·</span>
                  <span>{applicableMonthsText}</span>
                </p>
              ) : cfg.applicableMonthsEmptyHint ? (
                <p className="text-[11px] text-amber-200/85 mt-0.5">{cfg.applicableMonthsEmptyHint}</p>
              ) : null}
              <input
                value={title}
                onChange={event => setTitle(event.target.value)}
                placeholder={cfg.titlePlaceholder}
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-500 outline-none border border-white/10 bg-white/[0.05]"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs text-gray-500">{cfg.constraintsLabel}</span>
              <textarea
                value={constraints}
                onChange={event => setConstraints(event.target.value)}
                placeholder={cfg.constraintsPlaceholder}
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl text-sm text-white placeholder-gray-500 outline-none resize-y border border-white/10 bg-white/[0.05]"
              />
            </label>
            <div
              className="space-y-2 rounded-2xl border border-cyan-500/15 p-3 [color-scheme:dark]"
              style={{ background: 'linear-gradient(165deg, rgba(14,116,144,0.08) 0%, rgba(15,23,42,0.35) 100%)' }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <CalendarDays className="w-4 h-4 text-cyan-300/90 flex-shrink-0" aria-hidden />
                  <span className="text-xs font-bold text-cyan-100/90 truncate">{cfg.milestonesLabel}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMilestones(previous => [...previous, { title: '', date_iso: '' }])}
                  className="text-xs font-black text-cyan-300 hover:text-cyan-200 tracking-wide"
                >
                  + {cfg.milestoneAdd}
                </button>
              </div>
              {milestones.map((row, index) => (
                <div key={`milestone-${index}`} className="flex flex-col sm:flex-row gap-2">
                  <input
                    value={row.title}
                    onChange={event => {
                      const next = [...milestones];
                      next[index] = { ...next[index], title: event.target.value };
                      setMilestones(next);
                    }}
                    placeholder={cfg.milestoneTitlePlaceholder}
                    className="flex-1 min-w-0 px-3 py-2 rounded-xl text-sm text-white placeholder-gray-500 outline-none border border-white/10 bg-white/[0.05]"
                  />
                  <input
                    type="date"
                    value={row.date_iso}
                    onChange={event => {
                      const next = [...milestones];
                      next[index] = { ...next[index], date_iso: event.target.value };
                      setMilestones(next);
                    }}
                    aria-label={cfg.milestoneDateAriaLabel ?? '날짜 선택'}
                    className="w-full sm:w-[148px] flex-shrink-0 px-2 py-2 rounded-xl text-sm text-white outline-none border border-cyan-500/25 bg-slate-950/80 min-h-[42px]"
                  />
                </div>
              ))}
            </div>
            {historyEntries.length > 0 && (
              <label className="flex items-center gap-2 text-xs text-gray-400">
                <input
                  type="checkbox"
                  checked={usePreviousSummary}
                  onChange={event => setUsePreviousSummary(event.target.checked)}
                />
                {cfg.previousRunHint}
              </label>
            )}
          </section>

          {mutation.data && (
            <div className={`${roadmapEditorSoftInsetPanelClassName} rounded-xl p-4 space-y-2 border border-emerald-500/25`}>
              <p className="text-xs font-bold text-emerald-300">{cfg.aiDraftBadge}</p>
              <p className="text-sm text-gray-200 leading-relaxed">{mutation.data.summary}</p>
              <p className="text-xs text-gray-500">
                {cfg.quotaHint}: {mutation.data.quota_remaining_after ?? '—'}
              </p>
            </div>
          )}

          {mutation.isError && (
            <p className="text-sm text-red-300">
              {mutation.error instanceof Error ? mutation.error.message : '오류가 났어요.'}
            </p>
          )}

          <p className="text-xs text-amber-200/75 leading-relaxed">{cfg.disclaimer}</p>
        </div>

        <div
          className="p-4 sm:p-5 border-t border-white/10 space-y-2 flex-shrink-0 flex flex-col sm:flex-row sm:gap-3"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          <button
            type="button"
            disabled={!canGenerate || mutation.isPending}
            onClick={() => void handleGenerate()}
            className="w-full sm:flex-1 h-12 rounded-2xl font-bold text-white text-sm disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            {mutation.isPending ? '생성 중…' : cfg.generateButton}
          </button>
          <button
            type="button"
            disabled={!canApply}
            onClick={handleApply}
            className="w-full sm:flex-1 h-12 rounded-2xl font-bold text-white text-sm disabled:opacity-40 border border-violet-500/30"
            style={{ background: 'linear-gradient(135deg, rgba(108,92,231,0.5), rgba(168,85,247,0.35))' }}
          >
            {cfg.applyButton}
          </button>
        </div>
      </div>
    </div>
  );
}
