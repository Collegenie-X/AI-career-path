'use client';

import { Target, Sparkles, Calendar } from 'lucide-react';
import { ITEM_TYPES, GRADE_YEARS } from '../config';
import type { YearPlan, PlanItem } from './CareerPathBuilder';

function getMonthLabel(item: PlanItem & { month?: number }): string {
  const months = item.months;
  const singleMonth = 'month' in item ? (item as { month?: number }).month : undefined;
  if (months && months.length > 0) {
    if (months.length === 1) return `${months[0]}월`;
    return `${months[0]}~${months[months.length - 1]}월`;
  }
  if (typeof singleMonth === 'number') return `${singleMonth}월`;
  return '월 미정';
}

function getAllItems(year: YearPlan): PlanItem[] {
  const fromGroups = (year.groups ?? []).flatMap(g => g.items);
  return [...year.items, ...fromGroups];
}

type Props = {
  years: YearPlan[];
  color: string;
};

/** 커리어 패스 상세 타임라인 미리보기 (CareerPathDetailDialog와 동일 구조) */
export function CareerPathTimelinePreview({ years, color }: Props) {
  const gradeOrder = GRADE_YEARS.reduce(
    (acc, g, i) => { acc[g.id] = i; return acc; },
    {} as Record<string, number>
  );
  const sortedYears = [...years].sort(
    (a, b) => (gradeOrder[a.gradeId] ?? 0) - (gradeOrder[b.gradeId] ?? 0)
  );

  return (
    <div className="relative">
      <div
        className="absolute top-0 bottom-0 w-0.5"
        style={{ left: 19, backgroundColor: `${color}25` }}
      />
      <div className="space-y-0">
        {sortedYears.map((year) => {
          const grade = GRADE_YEARS.find(g => g.id === year.gradeId);
          const allItems = getAllItems(year);
          return (
            <div key={year.gradeId} className="relative pl-12 pb-6">
              {/* Grade circle */}
              <div
                className="absolute top-0 flex items-center justify-center rounded-full text-xs font-black z-10"
                style={{
                  left: 0, width: 38, height: 38,
                  backgroundColor: color,
                  color: '#fff',
                  boxShadow: `0 0 0 3px #08081a, 0 0 10px ${color}55`,
                  fontSize: 11,
                }}
              >
                {year.gradeLabel}
              </div>

              <div className="space-y-2.5 pt-1">
                <div>
                  <div className="text-sm font-bold text-white">{grade?.fullLabel ?? year.gradeLabel}</div>
                  <div className="text-[11px] text-gray-500">{allItems.length}개 항목</div>
                </div>

                {/* Goals */}
                {year.goals.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <Target style={{ width: 11, height: 11 }} />
                      목표
                    </div>
                    {year.goals.map((goal, gi) => (
                      <div
                        key={gi}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
                        style={{
                          backgroundColor: `${color}12`,
                          border: `1px solid ${color}1e`,
                        }}
                      >
                        <div
                          className="w-1 h-1 rounded-full flex-shrink-0"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-gray-200">{goal}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Items */}
                {allItems.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <Sparkles style={{ width: 11, height: 11 }} />
                      활동·수상·자격증
                    </div>
                    {allItems.map((item, idx) => {
                      const typeConf = ITEM_TYPES.find(t => t.value === item.type);
                      const monthLabel = getMonthLabel(item);
                      return (
                        <div
                          key={item.id ?? `${year.gradeId}-${idx}`}
                          className="flex items-start gap-2.5 p-2.5 rounded-xl"
                          style={{
                            backgroundColor: `${typeConf?.color ?? color}0d`,
                            border: `1px solid ${typeConf?.color ?? color}25`,
                          }}
                        >
                          <div
                            className="rounded-xl flex items-center justify-center text-base flex-shrink-0"
                            style={{
                              width: 34, height: 34,
                              backgroundColor: `${typeConf?.color ?? color}18`,
                              border: `1px solid ${typeConf?.color ?? color}28`,
                            }}
                          >
                            {typeConf?.emoji ?? '📌'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-white leading-snug">{item.title}</div>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <span
                                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: `${typeConf?.color ?? color}22`,
                                  color: typeConf?.color ?? color,
                                }}
                              >
                                {typeConf?.label}
                              </span>
                              <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                                <Calendar style={{ width: 9, height: 9 }} />
                                {monthLabel}
                              </span>
                              {item.cost && (
                                <span className="text-[10px] text-gray-600">{item.cost}</span>
                              )}
                              {item.difficulty > 0 && (
                                <span className="text-[10px] text-gray-600">
                                  {'★'.repeat(item.difficulty)}{'☆'.repeat(5 - item.difficulty)}
                                </span>
                              )}
                            </div>
                            {item.organizer && (
                              <div className="text-[10px] text-gray-600 mt-0.5">{item.organizer}</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
