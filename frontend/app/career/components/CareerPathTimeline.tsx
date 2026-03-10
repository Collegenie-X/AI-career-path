'use client';

import { useState } from 'react';
import {
  Map, Pencil, Trash2, Share2, Calendar,
  Target, ChevronDown, ChevronUp, Plus,
  Sparkles, CheckCircle2, Circle
} from 'lucide-react';
import { LABELS, ITEM_TYPES, GRADE_YEARS, SEMESTER_OPTIONS } from '../config';
import type { CareerPlan, YearPlan, PlanItem, GoalActivityGroup } from './CareerPathBuilder';

type Props = {
  plan: CareerPlan | null;
  onEdit: () => void;
  onNewPlan: () => void;
};

function ItemTypeBadge({ type }: { type: string }) {
  const conf = ITEM_TYPES.find(t => t.value === type);
  if (!conf) return null;
  return (
    <span
      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
      style={{ backgroundColor: `${conf.color}22`, color: conf.color }}
    >
      {conf.emoji} {conf.label}
    </span>
  );
}

function DifficultyStars({ difficulty }: { difficulty: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className="text-[10px]" style={{ opacity: i < difficulty ? 1 : 0.2 }}>★</span>
      ))}
    </div>
  );
}

function ItemCard({
  item, color, onRemove,
}: {
  item: PlanItem;
  color: string;
  onRemove: () => void;
}) {
  const [checked, setChecked] = useState(false);
  const typeConf = ITEM_TYPES.find(t => t.value === item.type)!;

  return (
    <div
      className="flex items-start gap-3 p-3 rounded-xl transition-all"
      style={{
        backgroundColor: checked ? `${typeConf.color}12` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${checked ? typeConf.color + '33' : 'rgba(255,255,255,0.06)'}`,
        opacity: checked ? 0.7 : 1,
      }}
    >
      <button
        onClick={() => setChecked(c => !c)}
        className="mt-0.5 flex-shrink-0"
        style={{ color: checked ? typeConf.color : 'rgba(255,255,255,0.2)' }}
      >
        {checked
          ? <CheckCircle2 className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
          : <Circle className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />}
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2 flex-wrap">
          <span
            className={`text-sm font-semibold leading-snug ${checked ? 'line-through text-gray-500' : 'text-white'}`}
          >
            {item.title}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <ItemTypeBadge type={item.type} />
          <span className="text-[10px] text-gray-500 flex items-center gap-1">
            <Calendar className="w-2.5 h-2.5" />
            {Array.isArray(item.months) && item.months.length > 0
              ? item.months.length === 1
                ? `${item.months[0]}월`
                : item.months.length <= 3
                ? item.months.map(m => `${m}월`).join('·')
                : `${item.months[0]}~${item.months[item.months.length - 1]}월`
              : '월 미정'}
          </span>
          <span className="text-[10px] text-gray-500">{item.cost}</span>
          {item.difficulty > 0 && <DifficultyStars difficulty={item.difficulty} />}
          {item.custom && (
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/8 text-gray-500">직접입력</span>
          )}
        </div>
        {item.organizer && (
          <div className="text-[10px] text-gray-600 mt-0.5">{item.organizer}</div>
        )}
      </div>
      <button
        onClick={onRemove}
        className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
      >
        <Trash2 className="w-3 h-3 text-gray-600" />
      </button>
    </div>
  );
}

/** 세부활동 하나 + 하위활동 표시 (타임라인용) */
function ActivityItemTimelineCard({
  item, planColor, onRemove,
}: {
  item: PlanItem;
  planColor: string;
  onRemove: () => void;
}) {
  const tc = ITEM_TYPES.find(t => t.value === item.type);
  const subItems = item.subItems ?? [];
  const [subExpanded, setSubExpanded] = useState(false);
  const doneCount = subItems.filter(s => s.done).length;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        backgroundColor: `${tc?.color ?? planColor}0e`,
        border: `1px solid ${tc?.color ?? planColor}25`,
      }}
    >
      {/* 활동 헤더 */}
      <div className="flex items-start gap-3 p-3">
        <button
          className="mt-0.5 flex-shrink-0"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          <Circle className="w-4.5 h-4.5" style={{ width: 16, height: 16 }} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <span className="text-sm font-semibold text-white leading-snug">{item.title}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <ItemTypeBadge type={item.type} />
            <span className="text-[10px] text-gray-500 flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5" />
              {Array.isArray(item.months) && item.months.length > 0
                ? item.months.length === 1
                  ? `${item.months[0]}월`
                  : item.months.length <= 3
                  ? item.months.map(m => `${m}월`).join('·')
                  : `${item.months[0]}~${item.months[item.months.length - 1]}월`
                : '월 미정'}
            </span>
            {item.cost && item.cost !== '무료' && item.cost !== '자체 제작' && (
              <span className="text-[10px] text-gray-500">{item.cost}</span>
            )}
            {subItems.length > 0 && (
              <button
                onClick={() => setSubExpanded(e => !e)}
                className="flex items-center gap-0.5 text-[10px] transition-all"
                style={{ color: subExpanded ? (tc?.color ?? planColor) : 'rgba(255,255,255,0.35)' }}
              >
                {subExpanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                하위 {doneCount}/{subItems.length}
              </button>
            )}
          </div>
        </div>
        <button
          onClick={onRemove}
          className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
        >
          <Trash2 className="w-3 h-3 text-gray-600" />
        </button>
      </div>

      {/* 하위활동 목록 */}
      {subExpanded && subItems.length > 0 && (
        <div
          className="px-3 pb-2.5 space-y-1"
          style={{ borderTop: `1px solid ${tc?.color ?? planColor}18` }}
        >
          {subItems.map(sub => (
            <div
              key={sub.id}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
            >
              {sub.done
                ? <CheckCircle2 style={{ width: 12, height: 12, color: tc?.color ?? planColor, flexShrink: 0 }} />
                : <Circle style={{ width: 12, height: 12, color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />}
              <span
                className="text-[10px] leading-snug"
                style={{
                  color: sub.done ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.7)',
                  textDecoration: sub.done ? 'line-through' : 'none',
                }}
              >
                {sub.title}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** 목표-활동 그룹 아코디언 (타임라인 읽기 전용) */
function GoalActivityGroupTimelineCard({
  group, planColor, onRemoveItem,
}: {
  group: GoalActivityGroup;
  planColor: string;
  onRemoveItem: (itemId: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${planColor}30`, background: `${planColor}08` }}
    >
      {/* Goal row — 항상 표시 */}
      <button
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left"
        onClick={() => setIsExpanded(e => !e)}
      >
        <div
          className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${planColor}25` }}
        >
          <Target style={{ width: 11, height: 11, color: planColor }} />
        </div>
        <span className="flex-1 text-xs font-bold text-white leading-snug">{group.goal}</span>
        <span className="text-[10px] text-gray-500 flex-shrink-0">{group.items.length}개 활동</span>
        {isExpanded
          ? <ChevronUp className="w-3 h-3 text-gray-500 flex-shrink-0" />
          : <ChevronDown className="w-3 h-3 text-gray-500 flex-shrink-0" />}
      </button>

      {/* 세부활동 목록 — ActivityItemTimelineCard로 렌더링 */}
      {isExpanded && group.items.length > 0 && (
        <div className="px-3 pb-2.5 space-y-1.5" style={{ borderTop: `1px solid ${planColor}18` }}>
          {group.items.map(item => (
            <ActivityItemTimelineCard
              key={item.id}
              item={item}
              planColor={planColor}
              onRemove={() => onRemoveItem(item.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function YearCard({
  yearPlan, color, planColor, onRemoveItem, onRemoveYear,
}: {
  yearPlan: YearPlan;
  color: string;
  planColor: string;
  onRemoveItem: (gradeId: string, itemId: string) => void;
  onRemoveYear: (gradeId: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const grade = GRADE_YEARS.find(g => g.id === yearPlan.gradeId);
  const semesterConf = SEMESTER_OPTIONS.find(s => s.id === yearPlan.semester);

  const goalGroups = yearPlan.goalGroups ?? [];
  const semesterPlans = yearPlan.semesterPlans ?? [];

  const totalGoals = yearPlan.semester === 'split'
    ? semesterPlans.reduce((s, sp) => s + sp.goalGroups.length, 0)
    : goalGroups.length;

  const totalItems = yearPlan.semester === 'split'
    ? semesterPlans.reduce((s, sp) => s + sp.goalGroups.reduce((gs, g) => gs + g.items.length, 0), 0)
    : goalGroups.reduce((s, g) => s + g.items.length, 0);

  const handleRemoveGoalGroupItem = (groupId: string, itemId: string) => {
    onRemoveItem(yearPlan.gradeId, itemId);
  };

  return (
    <div className="relative">
      <div
        className="absolute left-5 top-14 bottom-0 w-0.5 -z-0"
        style={{ backgroundColor: `${planColor}20` }}
      />

      <div
        className="relative rounded-2xl overflow-hidden"
        style={{ border: `1px solid ${planColor}22` }}
      >
        {/* Year header */}
        <button
          className="w-full flex items-center gap-3 p-4 text-left"
          style={{ background: `linear-gradient(135deg, ${planColor}20, ${planColor}08)` }}
          onClick={() => setExpanded(e => !e)}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm"
            style={{ backgroundColor: planColor, color: '#fff', boxShadow: `0 0 12px ${planColor}44` }}
          >
            {yearPlan.gradeLabel}
          </div>

          <div className="flex-1 min-w-0">
            <div className="font-bold text-white text-sm">{grade?.fullLabel ?? yearPlan.gradeLabel}</div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {semesterConf && (
                <span className="text-[10px]" style={{ color: `${planColor}99` }}>
                  {semesterConf.emoji} {semesterConf.label}
                </span>
              )}
              {totalGoals > 0 && <span className="text-[10px] text-gray-400">🎯 {totalGoals}개 목표</span>}
              {totalItems > 0 && <span className="text-[10px] text-gray-400">📌 {totalItems}개 활동</span>}
              {totalGoals === 0 && totalItems === 0 && (
                <span className="text-[10px] text-gray-500">계획 없음</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {expanded
              ? <ChevronUp className="w-4 h-4 text-gray-400" />
              : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </div>
        </button>

        {/* Year body */}
        {expanded && (
          <div className="px-4 pb-4 space-y-3 pt-2">
            {/* 학기 분리 모드 */}
            {yearPlan.semester === 'split' && semesterPlans.map(sp => (
              <div key={sp.semesterId} className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">{sp.semesterId === 'first' ? '🌸' : '🍂'}</span>
                  <span className="text-[11px] font-bold text-gray-400">{sp.semesterLabel}</span>
                  <div className="flex-1 h-px" style={{ backgroundColor: `${planColor}20` }} />
                </div>
                {sp.goalGroups.map(group => (
                  <GoalActivityGroupTimelineCard
                    key={group.id}
                    group={group}
                    planColor={planColor}
                    onRemoveItem={(itemId) => handleRemoveGoalGroupItem(group.id, itemId)}
                  />
                ))}
                {sp.goalGroups.length === 0 && (
                  <p className="text-xs text-gray-600 pl-2">이 학기에 계획이 없어요</p>
                )}
              </div>
            ))}

            {/* 통합/단일 학기 모드 */}
            {yearPlan.semester !== 'split' && goalGroups.length > 0 && (
              <div className="space-y-2">
                {goalGroups.map(group => (
                  <GoalActivityGroupTimelineCard
                    key={group.id}
                    group={group}
                    planColor={planColor}
                    onRemoveItem={(itemId) => handleRemoveGoalGroupItem(group.id, itemId)}
                  />
                ))}
              </div>
            )}

            {/* 레거시 데이터 폴백 */}
            {(!goalGroups || goalGroups.length === 0) &&
              yearPlan.semester !== 'split' &&
              yearPlan.goals.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold flex items-center gap-1">
                  <Target className="w-3 h-3" />
                  목표
                </div>
                {yearPlan.goals.map((goal, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                    style={{ backgroundColor: `${planColor}12`, border: `1px solid ${planColor}20` }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: planColor }} />
                    <span className="text-white">{goal}</span>
                  </div>
                ))}
              </div>
            )}

            {/* 완전 빈 상태 */}
            {totalGoals === 0 && totalItems === 0 && yearPlan.goals.length === 0 && (
              <div className="text-center py-4">
                <p className="text-xs text-gray-500">이 학년에 계획이 없어요</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── WBS Gantt Mini Chart ─── */
function WBSChart({ plan }: { plan: CareerPlan }) {
  const allItems = plan.years.flatMap(y => {
    const items = y.semester === 'split'
      ? (y.semesterPlans ?? []).flatMap(sp => sp.goalGroups.flatMap(g => g.items))
      : (y.goalGroups ?? []).flatMap(g => g.items);
    return items.map(item => ({ ...item, gradeLabel: y.gradeLabel, gradeId: y.gradeId }));
  });

  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const gradeOrder = GRADE_YEARS.reduce((acc, g, i) => { acc[g.id] = i; return acc; }, {} as Record<string, number>);
  const sortedYears = [...plan.years].sort((a, b) => (gradeOrder[a.gradeId] ?? 0) - (gradeOrder[b.gradeId] ?? 0));

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="p-3 border-b border-white/8">
        <div className="text-xs font-bold text-white flex items-center gap-2">
          <Map className="w-3.5 h-3.5" style={{ color: plan.starColor }} />
          WBS 타임라인
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[500px] p-3">
          {/* Month header */}
          <div className="flex mb-2">
            <div className="w-10 flex-shrink-0" />
            {months.map(m => (
              <div key={m} className="flex-1 text-center text-[9px] text-gray-600 font-semibold">
                {m}
              </div>
            ))}
          </div>
          {/* Grade rows */}
          {sortedYears.map(year => {
            // Each item can span multiple months — register it in each month
            const itemsByMonth = year.items.reduce((acc, item) => {
              const mths = Array.isArray(item.months) && item.months.length > 0 ? item.months : [];
              mths.forEach(m => {
                acc[m] = acc[m] ?? [];
                acc[m].push(item);
              });
              return acc;
            }, {} as Record<number, PlanItem[]>);

            return (
              <div key={year.gradeId} className="flex items-center mb-1.5">
                <div
                  className="w-10 flex-shrink-0 text-[10px] font-bold text-right pr-1.5"
                  style={{ color: plan.starColor }}
                >
                  {year.gradeLabel}
                </div>
                {months.map(m => {
                  const mItems = itemsByMonth[m] ?? [];
                  // Show up to 3 type-colored dots
                  const uniqueTypes = [...new Set(mItems.map(it => it.type))];
                  return (
                    <div key={m} className="flex-1 h-6 flex items-center justify-center gap-0.5">
                      {uniqueTypes.slice(0, 2).map(type => {
                        const tc = ITEM_TYPES.find(t => t.value === type);
                        const cnt = mItems.filter(it => it.type === type).length;
                        return (
                          <div key={type}
                            className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-black cursor-default"
                            style={{ backgroundColor: tc?.color ?? plan.starColor, boxShadow: `0 0 5px ${tc?.color ?? plan.starColor}55` }}
                            title={mItems.filter(it => it.type === type).map(i => i.title).join(', ')}>
                            {cnt > 1 ? cnt : ''}
                          </div>
                        );
                      })}
                      {uniqueTypes.length > 2 && (
                        <div className="w-3 h-3 rounded-full flex items-center justify-center text-[6px] font-black"
                          style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}>+</div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
          {/* Legend */}
          <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/6">
            {ITEM_TYPES.map(t => (
              <div key={t.value} className="flex items-center gap-1">
                <span className="text-[10px]">{t.emoji}</span>
                <span className="text-[9px] text-gray-500">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Stats ─── */
function PlanStats({ plan }: { plan: CareerPlan }) {
  const allItems = plan.years.flatMap(y => {
    if (y.semester === 'split') {
      return (y.semesterPlans ?? []).flatMap(sp => sp.goalGroups.flatMap(g => g.items));
    }
    return (y.goalGroups ?? []).flatMap(g => g.items);
  });

  const typeCounts = allItems.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1; return acc;
  }, {} as Record<string, number>);

  const totalGoals = plan.years.reduce((sum, y) => {
    if (y.semester === 'split') {
      return sum + (y.semesterPlans ?? []).reduce((s, sp) => s + sp.goalGroups.length, 0);
    }
    return sum + (y.goalGroups ?? []).length;
  }, 0);

  return (
    <div className="grid grid-cols-2 gap-2">
      <div
        className="rounded-xl p-3"
        style={{ background: `linear-gradient(135deg, ${plan.starColor}20, ${plan.starColor}08)`, border: `1px solid ${plan.starColor}22` }}
      >
        <div className="text-2xl font-bold" style={{ color: plan.starColor }}>{allItems.length}</div>
        <div className="text-xs text-gray-400 mt-0.5">총 계획 항목</div>
      </div>
      <div
        className="rounded-xl p-3"
        style={{ background: 'linear-gradient(135deg, #A78BFA20, #A78BFA08)', border: '1px solid #A78BFA22' }}
      >
        <div className="text-2xl font-bold text-purple-400">{plan.years.length}</div>
        <div className="text-xs text-gray-400 mt-0.5">학년 수</div>
      </div>
      {Object.entries(typeCounts).map(([type, count]) => {
        const conf = ITEM_TYPES.find(t => t.value === type)!;
        return (
          <div
            key={type}
            className="rounded-xl p-3"
            style={{ background: `linear-gradient(135deg, ${conf.color}20, ${conf.color}08)`, border: `1px solid ${conf.color}22` }}
          >
            <div className="text-2xl font-bold" style={{ color: conf.color }}>{count}</div>
            <div className="text-xs text-gray-400 mt-0.5">{conf.emoji} {conf.label}</div>
          </div>
        );
      })}
      <div
        className="rounded-xl p-3"
        style={{ background: 'linear-gradient(135deg, #22C55E20, #22C55E08)', border: '1px solid #22C55E22' }}
      >
        <div className="text-2xl font-bold text-green-400">{totalGoals}</div>
        <div className="text-xs text-gray-400 mt-0.5">🎯 목표</div>
      </div>
    </div>
  );
}

/* ─── Main Timeline ─── */
export function CareerPathTimeline({ plan, onEdit, onNewPlan }: Props) {
  const [localPlan, setLocalPlan] = useState<CareerPlan | null>(plan);

  const handleRemoveItem = (gradeId: string, itemId: string) => {
    if (!localPlan) return;
    setLocalPlan({
      ...localPlan,
      years: localPlan.years.map(y => {
        if (y.gradeId !== gradeId) return y;
        if (y.semester === 'split') {
          return {
            ...y,
            semesterPlans: (y.semesterPlans ?? []).map(sp => ({
              ...sp,
              goalGroups: sp.goalGroups.map(g => ({
                ...g,
                items: g.items.filter(it => it.id !== itemId),
              })),
            })),
          };
        }
        return {
          ...y,
          goalGroups: (y.goalGroups ?? []).map(g => ({
            ...g,
            items: g.items.filter(it => it.id !== itemId),
          })),
          items: y.items.filter(it => it.id !== itemId),
        };
      }),
    });
  };

  const handleRemoveYear = (gradeId: string) => {
    if (!localPlan) return;
    setLocalPlan({
      ...localPlan,
      years: localPlan.years.filter(y => y.gradeId !== gradeId),
    });
  };

  if (!localPlan || localPlan.years.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #6C5CE722, #6C5CE708)', border: '1px solid #6C5CE733' }}
        >
          <Map className="w-10 h-10" style={{ color: '#6C5CE7' }} />
        </div>
        <div>
          <div className="text-base font-bold text-white">아직 커리어 패스가 없어요</div>
          <div className="text-sm text-gray-400 mt-1">빌더에서 나만의 로드맵을 만들어보세요</div>
        </div>
        <button
          onClick={onNewPlan}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #6C5CE7, #a855f7)', boxShadow: '0 4px 20px rgba(108,92,231,0.4)' }}
        >
          <Plus className="w-4 h-4" />
          커리어 패스 만들기
        </button>
      </div>
    );
  }

  const gradeOrder = GRADE_YEARS.reduce((acc, g, i) => { acc[g.id] = i; return acc; }, {} as Record<string, number>);
  const sortedYears = [...localPlan.years].sort(
    (a, b) => (gradeOrder[a.gradeId] ?? 0) - (gradeOrder[b.gradeId] ?? 0)
  );

  return (
    <div className="space-y-4">
      {/* Plan header */}
      <div
        className="rounded-2xl p-4"
        style={{ background: `linear-gradient(135deg, ${localPlan.starColor}22, ${localPlan.starColor}08)`, border: `1px solid ${localPlan.starColor}33` }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="text-3xl">{localPlan.jobEmoji}</div>
          <div className="flex-1">
            <div className="font-bold text-white">{localPlan.title}</div>
            <div className="text-xs mt-0.5" style={{ color: `${localPlan.starColor}cc` }}>
              {localPlan.starEmoji} {localPlan.starName} · {localPlan.jobName}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-semibold transition-all"
            style={{
              backgroundColor: `${localPlan.starColor}22`,
              color: localPlan.starColor,
              border: `1px solid ${localPlan.starColor}44`,
            }}
          >
            <Pencil className="w-3.5 h-3.5" />
            수정
          </button>
          <button
            className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: localPlan.title, text: `${localPlan.jobName} 커리어 패스를 확인해보세요!` });
              }
            }}
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <PlanStats plan={localPlan} />

      {/* WBS Gantt */}
      <WBSChart plan={localPlan} />

      {/* Timeline */}
      <div>
        <div className="text-xs text-gray-400 uppercase tracking-wider mb-3 font-semibold flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5" />
          학년별 상세 계획
        </div>
        <div className="space-y-3">
          {sortedYears.map((year, idx) => (
            <YearCard
              key={year.gradeId}
              yearPlan={year}
              color={localPlan.starColor}
              planColor={localPlan.starColor}
              onRemoveItem={handleRemoveItem}
              onRemoveYear={handleRemoveYear}
            />
          ))}
        </div>
      </div>

      {/* Add year button */}
      <button
        onClick={onEdit}
        className="w-full h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold transition-all"
        style={{
          border: `1px dashed ${localPlan.starColor}44`,
          color: localPlan.starColor,
          backgroundColor: `${localPlan.starColor}08`,
        }}
      >
        <Plus className="w-4 h-4" />
        학년 · 항목 추가
      </button>
    </div>
  );
}
