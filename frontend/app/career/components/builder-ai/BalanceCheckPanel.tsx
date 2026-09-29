'use client';

import { useMemo, useState } from 'react';
import { Scale, Plus, CheckCircle2 } from 'lucide-react';
import { GRADE_YEARS } from '../../config';
import type { YearPlan } from '../CareerPathBuilder';
import { computeBalance, type AiStyleId } from '../../utils/aiPathGenerator';

type Props = {
  yearPlans: YearPlan[];
  color: string;
  /** 추가에 성공하면 목표가 들어간 gradeId를 돌려준다 */
  onAddGoal: (styleId: AiStyleId) => string | null;
};

/** 활동 유형이 한쪽으로 치우쳤는지 알려 주는 균형 점검 */
export function BalanceCheckPanel({ yearPlans, color, onAddGoal }: Props) {
  const report = useMemo(() => computeBalance(yearPlans), [yearPlans]);
  const [feedback, setFeedback] = useState('');
  if (yearPlans.length === 0) return null;
  const max = Math.max(1, ...report.counts.map((c) => c.count));
  const needsAction = report.status === 'dominant' || report.status === 'missing';

  const handleAdd = () => {
    if (!report.suggestion) return;
    const gradeId = onAddGoal(report.suggestion.styleId);
    const label = GRADE_YEARS.find((g) => g.id === gradeId)?.label;
    setFeedback(gradeId ? `${label} 정거장에 ${report.suggestion.label} 목표를 추가했어요` : '추가할 수 있는 학년이 없어요. 직접 목표를 넣어 보세요');
  };

  return (
    <div className="px-4 py-3 rounded-xl space-y-2.5" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div className="flex items-center gap-1.5">
        <Scale className="w-3.5 h-3.5" style={{ color }} />
        <span className="text-xs font-bold text-white">활동 균형 점검</span>
        <span className="text-[11.5px] text-gray-500 ml-auto">활동 {report.total}개</span>
      </div>
      <div className="grid grid-cols-3 gap-x-3 gap-y-2">
        {report.counts.map((c) => (
          <div key={c.key} className="min-w-0">
            <div className="flex items-center justify-between text-[11.5px]">
              <span className="text-gray-300 truncate">{c.emoji} {c.label}</span>
              <span className={c.count === 0 ? 'text-gray-600' : 'text-white font-bold'}>{c.count}</span>
            </div>
            <div className="h-1.5 rounded-full mt-1 overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${(c.count / max) * 100}%`, backgroundColor: color }} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-start gap-1.5">
        {report.status === 'good' && <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-green-400" />}
        <p className="text-[12px] leading-snug" style={{ color: needsAction ? '#fcd34d' : '#9ca3af' }}>{report.message}</p>
      </div>
      {needsAction && report.suggestion && (
        <button
          type="button"
          onClick={handleAdd}
          className="w-full h-9 rounded-xl text-[12px] font-bold text-white flex items-center justify-center gap-1"
          style={{ backgroundColor: `${color}30`, border: `1px solid ${color}66` }}
        >
          <Plus className="w-3.5 h-3.5" />{report.suggestion.label} 목표 추가 (무료)
        </button>
      )}
      {feedback && <p className="text-[12px] text-gray-400" role="status">{feedback}</p>}
    </div>
  );
}
