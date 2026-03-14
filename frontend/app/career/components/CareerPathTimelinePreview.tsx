'use client';

import { useState } from 'react';
import { Target, Calendar, ChevronDown, ChevronUp, CheckCircle2, Circle, ExternalLink } from 'lucide-react';
import { ITEM_TYPES, GRADE_YEARS, SEMESTER_OPTIONS } from '../config';
import type { YearPlan, PlanItem, GoalActivityGroup } from './CareerPathBuilder';

function getMonthLabel(item: PlanItem): string {
  const { months } = item;
  if (months && months.length > 0) {
    if (months.length === 1) return `${months[0]}월`;
    return `${months[0]}~${months[months.length - 1]}월`;
  }
  return '월 미정';
}

/** 세부활동 하나 + 하위활동 아코디언 (읽기 전용) */
function ActivityItemReadOnly({ item, color }: { item: PlanItem; color: string }) {
  const tc = ITEM_TYPES.find(t => t.value === item.type);
  const subItems = item.subItems ?? [];
  const [subExpanded, setSubExpanded] = useState(subItems.length > 0);
  const doneCount = subItems.filter(s => s.done).length;

  return (
    <div
      className="rounded-lg overflow-hidden my-1.5"
      style={{
        backgroundColor: `${tc?.color ?? color}0d`,
        border: `1px solid ${tc?.color ?? color}22`,
      }}
    >
      {/* 활동 헤더 */}
      <div className="flex items-center gap-2 px-2.5 py-2.5">
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-white line-clamp-1">{item.title}</div>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className="text-[12px] font-bold" style={{ color: tc?.color ?? color }}>
              {tc?.label}
            </span>
            <span className="text-[12px] text-gray-500 flex items-center gap-0.5">
              <Calendar style={{ width: 9, height: 9 }} />
              {getMonthLabel(item)}
            </span>
            {subItems.length > 0 && (
              <span className="text-[12px] text-gray-500">{doneCount}/{subItems.length} 완료</span>
            )}
          </div>
        </div>
        {subItems.length > 0 && (
          <button
            onClick={() => setSubExpanded(e => !e)}
            className="flex-shrink-0"
          >
            {subExpanded
              ? <ChevronUp style={{ width: 11, height: 11, color: 'rgba(255,255,255,0.3)' }} />
              : <ChevronDown style={{ width: 11, height: 11, color: 'rgba(255,255,255,0.3)' }} />}
          </button>
        )}
      </div>

      {/* 하위활동 목록 */}
      {subExpanded && subItems.length > 0 && (
        <div
          className="px-2.5 py-2.5 pb-3 space-y-1.5"
          style={{ borderTop: `1px solid ${tc?.color ?? color}18` }}
        >
          {subItems.map(sub => (
            <div
              key={sub.id}
              className="flex items-start gap-1.5 px-2 py-1 rounded"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
            >
              {sub.done
                ? <CheckCircle2 style={{ width: 11, height: 11, color: tc?.color ?? color, flexShrink: 0, marginTop: 2 }} />
                : <Circle style={{ width: 11, height: 11, color: 'rgba(255,255,255,0.2)', flexShrink: 0, marginTop: 2 }} />}
              <div className="flex-1 min-w-0">
                <span
                  className="text-[12px] leading-snug"
                  style={{
                    color: sub.done ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.7)',
                    textDecoration: sub.done ? 'line-through' : 'none',
                  }}
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
                    <ExternalLink style={{ width: 8, height: 8 }} />
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

/** 목표 + 연결된 세부활동 아코디언 (읽기 전용) */
function GoalActivityGroupReadOnly({
  group, color,
}: {
  group: GoalActivityGroup;
  color: string;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${color}30`, background: `${color}08` }}
    >
      {/* Goal row */}
      <button
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left"
        onClick={() => setIsExpanded(e => !e)}
      >
        <div
          className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}25` }}
        >
          <Target style={{ width: 11, height: 11, color }} />
        </div>
        <span className="flex-1 text-xs font-bold text-white leading-snug">{group.goal}</span>
        {isExpanded
          ? <ChevronUp style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
          : <ChevronDown style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />}
      </button>

      {/* 세부활동 목록 — ActivityItemReadOnly로 렌더링 */}
      {isExpanded && (group.items ?? []).length > 0 && (
        <div className="px-3 py-2.5 pb-4 space-y-2" style={{ borderTop: `1px solid ${color}18` }}>
          {(group.items ?? []).map((item, idx) => (
            <ActivityItemReadOnly key={item.id ?? idx} item={item} color={color} />
          ))}
        </div>
      )}
    </div>
  );
}

/** 학기 섹션 (읽기 전용) */
function SemesterSectionReadOnly({
  semesterLabel, semesterEmoji, goalGroups, color,
}: {
  semesterLabel: string;
  semesterEmoji: string;
  goalGroups: GoalActivityGroup[];
  color: string;
}) {
  if (goalGroups.length === 0) return null;
  return (
    <div className="space-y-2">
      {semesterLabel && (
        <div className="flex items-center gap-1.5">
          <span className="text-xs">{semesterEmoji}</span>
          <span className="text-[12px] font-bold text-gray-400">{semesterLabel}</span>
          <div className="flex-1 h-px" style={{ backgroundColor: `${color}20` }} />
        </div>
      )}
      {goalGroups.map(group => (
        <GoalActivityGroupReadOnly key={group.id} group={group} color={color} />
      ))}
    </div>
  );
}

type Props = {
  years: YearPlan[];
  color: string;
};

/** 커리어 패스 상세 타임라인 미리보기 */
export function CareerPathTimelinePreview({ years, color }: Props) {
  const gradeOrder = GRADE_YEARS.reduce(
    (acc, g, i) => { acc[g.id] = i; return acc; },
    {} as Record<string, number>
  );
  const sortedYears = [...years].sort(
    (a, b) => (gradeOrder[a.gradeId] ?? 0) - (gradeOrder[b.gradeId] ?? 0)
  );

  return (
    <div className="relative py-4">
      <div
        className="absolute top-0 bottom-0 w-0.5"
        style={{ left: 19, backgroundColor: `${color}25` }}
      />
      <div className="space-y-0">
        {sortedYears.map((year) => {
          const grade = GRADE_YEARS.find(g => g.id === year.gradeId);
          const semesterConf = SEMESTER_OPTIONS.find(s => s.id === year.semester);

          const totalGoals = year.semester === 'split'
            ? (year.semesterPlans ?? []).reduce((s, sp) => s + (sp.goalGroups ?? []).length, 0)
            : (year.goalGroups ?? []).length;

          const totalItems = year.semester === 'split'
            ? (year.semesterPlans ?? []).reduce((s, sp) => s + (sp.goalGroups ?? []).reduce((gs, g) => gs + (g.items ?? []).length, 0), 0)
            : (year.goalGroups ?? []).reduce((s, g) => s + (g.items ?? []).length, 0);

          return (
            <div key={year.gradeId} className="relative pl-12 pb-8">
              {/* Grade circle */}
              <div
                className="absolute top-0 flex items-center justify-center rounded-full text-xs font-black z-10"
                style={{
                  left: 0, width: 38, height: 38,
                  backgroundColor: color, color: '#fff',
                  boxShadow: `0 0 0 3px #08081a, 0 0 10px ${color}55`,
                  fontSize: 12,
                }}
              >
                {year.gradeLabel}
              </div>

              <div className="space-y-2.5 pt-1">
                <div>
                  <div className="text-sm font-bold text-white">{grade?.fullLabel ?? year.gradeLabel}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {semesterConf && (
                      <span className="text-[12px]" style={{ color: `${color}99` }}>
                        {semesterConf.emoji} {semesterConf.label}
                      </span>
                    )}
                    <span className="text-[12px] text-gray-500">
                      {totalGoals}개 목표 · {totalItems}개 활동
                    </span>
                  </div>
                </div>

                {/* 목표-활동 그룹 (학기 분리) */}
                {year.semester === 'split' && (year.semesterPlans ?? []).map(sp => (
                  <SemesterSectionReadOnly
                    key={sp.semesterId}
                    semesterLabel={sp.semesterLabel}
                    semesterEmoji={sp.semesterId === 'first' ? '🌸' : '🍂'}
                    goalGroups={sp.goalGroups ?? []}
                    color={color}
                  />
                ))}

                {/* 목표-활동 그룹 (통합/단일 학기) */}
                {year.semester !== 'split' && (year.goalGroups ?? []).length > 0 && (
                  <div className="space-y-2">
                    {(year.goalGroups ?? []).map(group => (
                      <GoalActivityGroupReadOnly key={group.id} group={group} color={color} />
                    ))}
                  </div>
                )}

                {/* 레거시 데이터 폴백 (goals + items) */}
                {(!year.goalGroups || year.goalGroups.length === 0) &&
                  year.semester !== 'split' &&
                  (year.goals ?? []).length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                      <Target style={{ width: 11, height: 11 }} />
                      목표
                    </div>
                    {(year.goals ?? []).map((goal, gi) => (
                      <div
                        key={gi}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
                        style={{ backgroundColor: `${color}12`, border: `1px solid ${color}1e` }}
                      >
                        <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                        <span className="text-gray-200">{goal}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
