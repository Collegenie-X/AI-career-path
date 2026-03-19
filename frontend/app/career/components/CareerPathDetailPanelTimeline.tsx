'use client';

import { Calendar, Target, Sparkles, Link as LinkIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { ITEM_TYPES, GRADE_YEARS } from '../config';
import type { CareerPathTemplate } from '@/data/career-path-templates-index';

type CareerPathDetailPanelTimelineProps = {
  readonly template: CareerPathTemplate;
  readonly collapsedGoalKeys: Set<string>;
  readonly onToggleGoalExpand: (key: string) => void;
};

export function CareerPathDetailPanelTimeline({
  template,
  collapsedGoalKeys,
  onToggleGoalExpand,
}: CareerPathDetailPanelTimelineProps) {
  const gradeOrder = GRADE_YEARS.reduce(
    (acc, g, i) => { acc[g.id] = i; return acc; },
    {} as Record<string, number>
  );
  const sortedYears = [...template.years].sort(
    (a, b) => (gradeOrder[a.gradeId] ?? 0) - (gradeOrder[b.gradeId] ?? 0)
  );

  return (
    <div className="relative">
      <div
        className="absolute top-0 bottom-0 w-0.5"
        style={{ left: 19, backgroundColor: `${template.starColor}25` }}
      />
      <div className="space-y-0">
        {sortedYears.map((year) => {
          const grade = GRADE_YEARS.find(g => g.id === year.gradeId);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const yearAny = year as any;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const allGroups: { goal: string; items: any[] }[] = [];
          if (Array.isArray(yearAny.goalGroups) && yearAny.goalGroups.length > 0) {
            allGroups.push(...yearAny.goalGroups);
          }
          if (Array.isArray(yearAny.semesterPlans)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            yearAny.semesterPlans.forEach((sp: any) => {
              if (Array.isArray(sp.goalGroups)) allGroups.push(...sp.goalGroups);
            });
          }
          if (allGroups.length === 0) {
            const goals = Array.isArray(yearAny.goals) && yearAny.goals.length > 0
              ? yearAny.goals
              : ['활동 목록'];
            const items = Array.isArray(yearAny.items) ? yearAny.items : [];
            goals.forEach((goal: string, idx: number) => {
              allGroups.push({ goal, items: idx === 0 ? items : [] });
            });
          }

          return (
            <div key={year.gradeId} className="relative pl-12 pb-6">
              <div
                className="absolute top-0 flex items-center justify-center rounded-full text-xs font-black z-10"
                style={{
                  left: 0, width: 38, height: 38,
                  backgroundColor: template.starColor,
                  color: '#fff',
                  boxShadow: `0 0 0 3px #0d0d24, 0 0 10px ${template.starColor}55`,
                  fontSize: 12,
                }}
              >
                {year.gradeLabel}
              </div>

              <div className="space-y-3 pt-1">
                <div className="text-[14px] font-bold text-white">{grade?.fullLabel ?? year.gradeLabel}</div>

                {allGroups
                  .filter((group) => (group.items ?? []).length > 0)
                  .map((group, gi) => {
                    const goalKey = `${year.gradeId}-${gi}`;
                    const isExpanded = !collapsedGoalKeys.has(goalKey);
                    return (
                      <div key={gi} className="rounded-xl overflow-hidden"
                        style={{ border: `1px solid ${template.starColor}20` }}>
                        <button
                          type="button"
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-left"
                          style={{ backgroundColor: `${template.starColor}18` }}
                          onClick={() => onToggleGoalExpand(goalKey)}
                        >
                          <div
                            className="flex items-center justify-center rounded-md flex-shrink-0"
                            style={{ width: 22, height: 22, backgroundColor: `${template.starColor}30` }}
                          >
                            <Target style={{ width: 12, height: 12, color: template.starColor }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-bold uppercase tracking-wider mb-0.5"
                              style={{ color: template.starColor }}>
                              목표
                            </div>
                            <div className="text-[13px] font-semibold text-white leading-snug">{group.goal}</div>
                          </div>
                          {isExpanded
                            ? <ChevronUp style={{ width: 15, height: 15, color: '#6B7280' }} />
                            : <ChevronDown style={{ width: 15, height: 15, color: '#6B7280' }} />}
                        </button>

                        {isExpanded && (group.items ?? []).length > 0 && (
                          <div className="px-2 py-2 space-y-2"
                            style={{ backgroundColor: `${template.starColor}06` }}>
                            <div className="flex items-center gap-1 px-1 mb-1">
                              <Sparkles style={{ width: 11, height: 11, color: '#6b7280' }} />
                              <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">
                                활동 · 수상 · 자격증
                              </span>
                            </div>
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {(group.items ?? []).map((item: any, itemIndex: number) => {
                              const typeConf = ITEM_TYPES.find(t => t.value === item.type);
                              const months: number[] = Array.isArray(item.months)
                                ? item.months
                                : typeof item.month === 'number' ? [item.month] : [];
                              const monthLabel = months.length === 0
                                ? '월 미정'
                                : months.length === 1
                                  ? `${months[0]}월`
                                  : `${months[0]}~${months[months.length - 1]}월`;

                              return (
                                <div
                                  key={item.id ?? `${goalKey}-${itemIndex}`}
                                  className="flex items-start gap-2.5 p-3 rounded-lg"
                                  style={{
                                    backgroundColor: `${typeConf?.color ?? template.starColor}0d`,
                                    border: `1px solid ${typeConf?.color ?? template.starColor}22`,
                                  }}
                                >
                                  <div
                                    className="rounded-lg flex items-center justify-center text-base flex-shrink-0"
                                    style={{
                                      width: 34, height: 34,
                                      backgroundColor: `${typeConf?.color ?? template.starColor}18`,
                                      border: `1px solid ${typeConf?.color ?? template.starColor}28`,
                                    }}
                                  >
                                    {typeConf?.emoji ?? '📌'}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-[13px] font-semibold text-white leading-snug">{item.title}</div>
                                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                      <span
                                        className="text-[12px] font-bold px-1.5 py-0.5 rounded-full"
                                        style={{
                                          backgroundColor: `${typeConf?.color ?? template.starColor}22`,
                                          color: typeConf?.color ?? template.starColor,
                                        }}
                                      >
                                        {typeConf?.label}
                                      </span>
                                      <span className="text-[12px] text-gray-500 flex items-center gap-0.5">
                                        <Calendar style={{ width: 10, height: 10 }} />
                                        {monthLabel}
                                      </span>
                                      {item.cost && (
                                        <span className="text-[12px] text-gray-600">{item.cost}</span>
                                      )}
                                      {item.difficulty > 0 && (
                                        <span className="text-[12px] text-gray-600">
                                          {'★'.repeat(item.difficulty)}{'☆'.repeat(5 - item.difficulty)}
                                        </span>
                                      )}
                                    </div>
                                    {item.organizer && (
                                      <div className="text-[13px] text-gray-500 mt-1">🏢 {item.organizer}</div>
                                    )}
                                    {(item.url || item.links?.[0]?.url) && (
                                      <a
                                        href={item.url ?? item.links?.[0]?.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 mt-1 text-[13px] text-blue-400 hover:underline"
                                      >
                                        <LinkIcon style={{ width: 10, height: 10 }} />
                                        {item.links?.[0]?.title ?? item.url ?? item.links?.[0]?.url}
                                      </a>
                                    )}
                                    {item.description && (
                                      <div className="text-[13px] text-gray-500 mt-1 leading-relaxed">{item.description}</div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
