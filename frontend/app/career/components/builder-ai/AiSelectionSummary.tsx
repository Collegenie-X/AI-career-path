'use client';

import { ClipboardList } from 'lucide-react';
import { GRADE_YEARS } from '../../config';
import {
  AI_PATH_CONFIG,
  getIntensity,
  getOperationCost,
  getStyleOption,
  resolveGradeRange,
  type AiPathSelection,
} from '../../utils/aiPathGenerator';
import { AI_ACCENT, AI_ACCENT_SOFT } from './AiDraftContext';

type Props = {
  selection: AiPathSelection;
  jobLabel: string;
  credits: number;
  /** 다음 생성에 쓸 크레딧 — 첫 생성인지 재생성인지에 따라 달라진다 */
  nextCost?: number;
  compact?: boolean;
};

const gradeLabel = (id: string) => GRADE_YEARS.find((g) => g.id === id)?.label ?? '';

/** 사용자가 고른 값을 한눈에 보여 주는 선택 현황 표 */
export function AiSelectionSummary({ selection, jobLabel, credits, nextCost, compact }: Props) {
  const { labels, title, empty } = AI_PATH_CONFIG.selectionSummary;
  const horizon = AI_PATH_CONFIG.questions.horizon.options.find((o) => o.id === selection.horizonId);
  const range = selection.currentGradeId && selection.horizonId
    ? resolveGradeRange(selection.currentGradeId, selection.horizonId)
    : [];
  const intensity = getIntensity(selection.intensityId);
  const cost = nextCost ?? getOperationCost('generate');

  const rows: { key: string; value: string; filled: boolean }[] = [
    { key: 'job', value: jobLabel, filled: !!jobLabel },
    { key: 'grade', value: gradeLabel(selection.currentGradeId), filled: !!selection.currentGradeId },
    { key: 'range', value: horizon ? `${horizon.emoji} ${horizon.label}` : '', filled: !!horizon },
    {
      key: 'styles',
      value: selection.styleIds.map((id) => getStyleOption(id)?.label ?? id).join(', '),
      filled: selection.styleIds.length > 0,
    },
    { key: 'intensity', value: `${intensity.emoji} ${intensity.label}`, filled: true },
    ...(compact ? [] : [{ key: 'freeText', value: selection.freeText.trim(), filled: !!selection.freeText.trim() }]),
    {
      key: 'years',
      value: range.length > 0 ? `${range.map(gradeLabel).join(' → ')} (${range.length}개 학년)` : '',
      filled: range.length > 0,
    },
    { key: 'cost', value: `${cost}개`, filled: true },
    { key: 'credits', value: `${credits}개`, filled: true },
  ];

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: `1px solid ${AI_ACCENT}40`, backgroundColor: `${AI_ACCENT}0d` }}
      data-testid="ai-selection-summary"
    >
      <div className="flex items-center gap-1.5 px-3.5 py-2.5" style={{ borderBottom: `1px solid ${AI_ACCENT}2a` }}>
        <ClipboardList className="w-3.5 h-3.5" style={{ color: AI_ACCENT_SOFT }} />
        <span className="text-xs font-bold" style={{ color: AI_ACCENT_SOFT }}>{title}</span>
      </div>
      <dl className="px-3.5 py-2">
        {rows.map((row) => (
          <div key={row.key} className="flex items-start gap-3 py-1">
            <dt className="w-[76px] flex-shrink-0 text-[12px] text-gray-500">{labels[row.key]}</dt>
            <dd className={`flex-1 min-w-0 text-[12.5px] leading-snug break-words ${row.filled ? 'text-white font-semibold' : 'text-gray-600'}`}>
              {row.filled ? row.value : empty}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
