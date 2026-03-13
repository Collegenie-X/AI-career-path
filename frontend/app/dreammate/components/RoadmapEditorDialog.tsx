'use client';

import { useMemo, useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Plus, Trash2, X } from 'lucide-react';
import {
  DREAM_ITEM_TYPES,
  LABELS,
  PERIOD_FILTERS,
  ROADMAP_DESCRIPTION_AUTOCOMPLETE_TEMPLATES,
  ROADMAP_ITEM_TITLE_AUTOCOMPLETE_BY_ITEM_TYPE,
  ROADMAP_TITLE_AUTOCOMPLETE_TEMPLATES,
  WEEKLY_TODO_AUTOCOMPLETE_BY_ITEM_TYPE,
} from '../config';
import type { DreamItemType, PeriodType, RoadmapItem, RoadmapTodoItem } from '../types';

interface RoadmapEditorPayload {
  title: string;
  description: string;
  period: PeriodType;
  starColor: string;
  focusItemTypes: DreamItemType[];
  groupIds: string[];
  items: RoadmapItem[];
}

interface RoadmapEditorDialogProps {
  title: string;
  submitLabel: string;
  initialValues: RoadmapEditorPayload;
  onClose: () => void;
  onSubmit: (payload: RoadmapEditorPayload) => void;
}

const COLOR_OPTIONS = ['#6C5CE7', '#3B82F6', '#EC4899', '#22C55E', '#F97316', '#EAB308'];
const MONTH_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const WEEK_OPTIONS = [1, 2, 3, 4, 5];

function createDefaultWeeklySubItems(months: number[]): RoadmapTodoItem[] {
  const firstMonth = months[0] ?? 3;
  return [1, 2, 3, 4].map(weekNumber => ({
    id: `draft-sub-item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${weekNumber}`,
    weekNumber,
    weekLabel: buildMonthWeekLabel(firstMonth, weekNumber),
    entryType: 'task',
    title: `${firstMonth}월 ${weekNumber}주차 활동`,
    isDone: false,
  }));
}

function createEmptyItem(selectedMonths: number[]): RoadmapItem {
  const months = selectedMonths.length > 0 ? [...selectedMonths].sort((a, b) => a - b) : [3];
  return {
    id: `draft-item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: 'activity',
    title: '',
    months,
    difficulty: 3,
    subItems: createDefaultWeeklySubItems(months),
  };
}

function createEmptySubItem(): RoadmapTodoItem {
  return {
    id: `draft-sub-item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    weekNumber: 1,
    entryType: 'task',
    title: '',
    isDone: false,
  };
}

function buildMonthWeekLabel(month: number, week: number): string {
  return `${month}월 ${week}주차`;
}

function extractWeekNumber(todoItem: RoadmapTodoItem): number {
  if (typeof todoItem.weekNumber === 'number' && todoItem.weekNumber > 0) {
    return todoItem.weekNumber;
  }
  const matchedMonthWeek = (todoItem.weekLabel ?? '').match(/(\d+)\s*월\s*(\d+)\s*주차/);
  if (matchedMonthWeek) {
    const weekFromMonthWeek = Number(matchedMonthWeek[2]);
    if (Number.isFinite(weekFromMonthWeek) && weekFromMonthWeek > 0) return weekFromMonthWeek;
  }
  const numberMatches = (todoItem.weekLabel ?? '').match(/\d+/g);
  const lastNumber = numberMatches ? Number(numberMatches[numberMatches.length - 1]) : NaN;
  return Number.isFinite(lastNumber) && lastNumber > 0 ? lastNumber : 1;
}

function extractMonthWeek(todoItem: RoadmapTodoItem, fallbackMonth: number): { month: number; week: number } {
  const matched = (todoItem.weekLabel ?? '').match(/(\d+)\s*월\s*(\d+)\s*주차/);
  if (matched) {
    const month = Number(matched[1]);
    const week = Number(matched[2]);
    if (month >= 1 && month <= 12 && week >= 1 && week <= 5) {
      return { month, week };
    }
  }

  return {
    month: fallbackMonth,
    week: Math.min(Math.max(extractWeekNumber(todoItem), 1), 5),
  };
}

function normalizeSubItemsToAvailableMonths(
  subItems: RoadmapTodoItem[],
  availableMonths: number[],
): RoadmapTodoItem[] {
  const normalizedMonths = availableMonths.length > 0 ? availableMonths : [3];
  const fallbackMonth = normalizedMonths[0];
  return subItems.map(subItem => {
    const parsed = extractMonthWeek(subItem, fallbackMonth);
    const targetMonth = normalizedMonths.includes(parsed.month) ? parsed.month : fallbackMonth;
    return {
      ...subItem,
      weekNumber: parsed.week,
      weekLabel: buildMonthWeekLabel(targetMonth, parsed.week),
      entryType: subItem.entryType ?? 'task',
      title: subItem.title?.trim().length ? subItem.title : `${targetMonth}월 ${parsed.week}주차 활동`,
    };
  });
}

function isGoalTodoEntry(todoItem: RoadmapTodoItem): boolean {
  return todoItem.entryType === 'goal';
}

function getWeekGroupKey(month: number, week: number): string {
  return `${month}-${week}`;
}

function parseWeekGroupKey(groupKey: string): { month: number; week: number } | null {
  const matched = groupKey.match(/^(\d+)-(\d+)$/);
  if (!matched) return null;
  const month = Number(matched[1]);
  const week = Number(matched[2]);
  if (!Number.isInteger(month) || !Number.isInteger(week)) return null;
  return { month, week };
}

function getWeekGroupKeyFromTodo(todoItem: RoadmapTodoItem, fallbackMonth: number): string {
  const monthWeek = extractMonthWeek(todoItem, fallbackMonth);
  return getWeekGroupKey(monthWeek.month, monthWeek.week);
}

export function RoadmapEditorDialog({
  title,
  submitLabel,
  initialValues,
  onClose,
  onSubmit,
}: RoadmapEditorDialogProps) {
  const [roadmapTitle, setRoadmapTitle] = useState(initialValues.title);
  const [description, setDescription] = useState(initialValues.description);
  const [period, setPeriod] = useState<PeriodType>(initialValues.period);
  const [starColor, setStarColor] = useState(initialValues.starColor);
  const [focusItemTypes, setFocusItemTypes] = useState<DreamItemType[]>(
    initialValues.focusItemTypes.length > 0
      ? initialValues.focusItemTypes
      : DREAM_ITEM_TYPES.map(itemType => itemType.value),
  );
  const [items, setItems] = useState<RoadmapItem[]>(
    initialValues.items.length > 0 ? initialValues.items : [],
  );
  const [selectedMonths, setSelectedMonths] = useState<number[]>(() => {
    const monthsFromItems = [...new Set(initialValues.items.flatMap(item => item.months ?? []))]
      .filter(month => month >= 1 && month <= 12)
      .sort((a, b) => a - b);
    return monthsFromItems.length > 0 ? monthsFromItems : [3];
  });
  const [itemAccordionOpenMap, setItemAccordionOpenMap] = useState<Record<string, boolean>>({});
  const [monthAccordionOpenMap, setMonthAccordionOpenMap] = useState<Record<string, boolean>>({});
  const [weekAccordionOpenMap, setWeekAccordionOpenMap] = useState<Record<string, boolean>>({});

  const periodOptions = useMemo(
    () => PERIOD_FILTERS.filter(option => option.id !== 'all') as { id: PeriodType; label: string; emoji: string }[],
    [],
  );

  const isSubmitEnabled = roadmapTitle.trim().length > 1 && items.some(item => item.title.trim().length > 1);

  const toggleFocusItemType = (itemType: DreamItemType) => {
    setFocusItemTypes(previous => {
      const hasType = previous.includes(itemType);
      if (hasType) {
        const nextTypes = previous.filter(type => type !== itemType);
        return nextTypes.length === 0 ? previous : nextTypes;
      }
      return [...previous, itemType];
    });
  };

  const toggleSelectedMonth = (month: number) => {
    setSelectedMonths(previous => {
      const exists = previous.includes(month);
      if (exists) {
        const next = previous.filter(value => value !== month);
        return next.length > 0 ? next : previous;
      }
      return [...previous, month].sort((a, b) => a - b);
    });
  };

  const addRoadmapItem = () => {
    setItems(previous => [...previous, createEmptyItem(selectedMonths)]);
  };

  const updateItem = (itemId: string, patch: Partial<RoadmapItem>) => {
    setItems(prev => prev.map(item => item.id === itemId ? { ...item, ...patch } : item));
  };

  const toggleItemMonth = (itemId: string, month: number) => {
    setItems(previousItems => previousItems.map(item => {
      if (item.id !== itemId) return item;

      const hasMonth = item.months.includes(month);
      const nextMonths = hasMonth
        ? item.months.filter(value => value !== month)
        : [...item.months, month].sort((a, b) => a - b);

      if (nextMonths.length === 0) return item;

      return {
        ...item,
        months: nextMonths,
        subItems: normalizeSubItemsToAvailableMonths(item.subItems ?? [], nextMonths),
      };
    }));
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateSubItem = (itemId: string, subItemId: string, patch: Partial<RoadmapTodoItem>) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      return {
        ...item,
        subItems: (item.subItems ?? []).map(subItem => (
          subItem.id === subItemId ? { ...subItem, ...patch } : subItem
        )),
      };
    }));
  };

  const removeSubItem = (itemId: string, subItemId: string) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      return {
        ...item,
        subItems: (item.subItems ?? []).filter(subItem => subItem.id !== subItemId),
      };
    }));
  };

  const addWeekGroup = (itemId: string) => {
    setItems(previousItems => previousItems.map(item => {
      if (item.id !== itemId) return item;

      const availableMonths = item.months.length > 0 ? item.months : selectedMonths;
      const firstMonth = availableMonths[0] ?? 3;
      const currentSubItems = item.subItems ?? [];

      const usedGroupKeys = new Set(
        currentSubItems.map(subItem => getWeekGroupKeyFromTodo(subItem, firstMonth)),
      );

      let nextMonth = firstMonth;
      let nextWeek = 1;
      let hasEmptyGroupSlot = false;
      for (const month of availableMonths) {
        for (const week of WEEK_OPTIONS) {
          const groupKey = getWeekGroupKey(month, week);
          if (!usedGroupKeys.has(groupKey)) {
            nextMonth = month;
            nextWeek = week;
            hasEmptyGroupSlot = true;
            break;
          }
        }
        if (hasEmptyGroupSlot) break;
      }

      const fallbackWeek = WEEK_OPTIONS[Math.max(WEEK_OPTIONS.length - 1, 0)] ?? 1;
      const targetWeek = hasEmptyGroupSlot ? nextWeek : fallbackWeek;
      const nextSubItems: RoadmapTodoItem[] = [
        ...currentSubItems,
        {
          ...createEmptySubItem(),
          weekNumber: targetWeek,
          weekLabel: buildMonthWeekLabel(nextMonth, targetWeek),
          entryType: 'task',
          title: `${nextMonth}월 ${targetWeek}주차 활동`,
        },
      ];

      return {
        ...item,
        subItems: normalizeSubItemsToAvailableMonths(nextSubItems, availableMonths),
      };
    }));
  };

  const addWeekTask = (itemId: string, groupKey: string) => {
    const parsedGroup = parseWeekGroupKey(groupKey);
    if (!parsedGroup) return;
    setItems(previousItems => previousItems.map(item => {
      if (item.id !== itemId) return item;
      const availableMonths = item.months.length > 0 ? item.months : selectedMonths;
      const nextSubItems: RoadmapTodoItem[] = [
        ...(item.subItems ?? []),
        {
          ...createEmptySubItem(),
          weekNumber: parsedGroup.week,
          weekLabel: buildMonthWeekLabel(parsedGroup.month, parsedGroup.week),
          entryType: 'task',
          title: `${parsedGroup.month}월 ${parsedGroup.week}주차 활동`,
        },
      ];
      return {
        ...item,
        subItems: normalizeSubItemsToAvailableMonths(nextSubItems, availableMonths),
      };
    }));
  };

  const upsertWeekGoal = (itemId: string, groupKey: string, goalTitle: string) => {
    const parsedGroup = parseWeekGroupKey(groupKey);
    if (!parsedGroup) return;
    setItems(previousItems => previousItems.map(item => {
      if (item.id !== itemId) return item;
      const currentSubItems = item.subItems ?? [];
      const availableMonths = item.months.length > 0 ? item.months : selectedMonths;
      const rawGoalTitle = goalTitle;
      const targetWeekLabel = buildMonthWeekLabel(parsedGroup.month, parsedGroup.week);
      const existingGoal = currentSubItems.find(subItem => (
        isGoalTodoEntry(subItem)
        && getWeekGroupKeyFromTodo(subItem, parsedGroup.month) === groupKey
      ));

      const nextSubItems = rawGoalTitle.trim().length === 0
        ? currentSubItems.filter(subItem => subItem.id !== existingGoal?.id)
        : existingGoal
          ? currentSubItems.map(subItem => (
            subItem.id === existingGoal.id ? { ...subItem, title: rawGoalTitle } : subItem
          ))
          : [
            {
              id: `draft-sub-item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              weekNumber: parsedGroup.week,
              weekLabel: targetWeekLabel,
              entryType: 'goal' as const,
              title: rawGoalTitle,
              isDone: false,
            },
            ...currentSubItems,
          ];

      return {
        ...item,
        subItems: normalizeSubItemsToAvailableMonths(nextSubItems, availableMonths),
      };
    }));
  };

  const removeWeekGroup = (itemId: string, groupKey: string) => {
    const parsedGroup = parseWeekGroupKey(groupKey);
    if (!parsedGroup) return;
    setItems(previousItems => previousItems.map(item => {
      if (item.id !== itemId) return item;
      return {
        ...item,
        subItems: (item.subItems ?? []).filter(subItem => {
          const monthWeek = extractMonthWeek(subItem, parsedGroup.month);
          return getWeekGroupKey(monthWeek.month, monthWeek.week) !== groupKey;
        }),
      };
    }));
  };

  const handleSubmit = () => {
    const validItems = items
      .filter(item => item.title.trim().length > 0)
      .map(item => ({
        ...item,
        months: [...item.months].sort((a, b) => a - b),
        subItems: (item.subItems ?? [])
          .map(subItem => ({
            ...subItem,
            weekNumber: typeof subItem.weekNumber === 'number'
              ? subItem.weekNumber
              : extractWeekNumber(subItem),
            weekLabel: subItem.weekLabel?.trim() || undefined,
            entryType: subItem.entryType ?? 'task',
            title: subItem.title.trim(),
          }))
          .filter(subItem => subItem.title.length > 0),
      }));

    onSubmit({
      title: roadmapTitle.trim(),
      description: description.trim(),
      period,
      starColor,
      focusItemTypes,
      groupIds: [],
      items: validItems,
    });
  };

  const createRoadmapTitleAutoComplete = () => {
    const template = ROADMAP_TITLE_AUTOCOMPLETE_TEMPLATES[
      Math.floor(Math.random() * Math.max(ROADMAP_TITLE_AUTOCOMPLETE_TEMPLATES.length, 1))
    ] ?? '나만의 로드맵';
    setRoadmapTitle(template);
  };

  const createRoadmapDescriptionAutoComplete = () => {
    const categoryLabels = DREAM_ITEM_TYPES
      .filter(itemType => focusItemTypes.includes(itemType.value))
      .map(itemType => itemType.label);
    const categoryText = categoryLabels.join('/');
    const periodText = periodOptions.find(option => option.id === period)?.label ?? period;
    const template = ROADMAP_DESCRIPTION_AUTOCOMPLETE_TEMPLATES[
      Math.floor(Math.random() * Math.max(ROADMAP_DESCRIPTION_AUTOCOMPLETE_TEMPLATES.length, 1))
    ] ?? '{period} 동안 {category} 중심으로 운영하는 실행형 계획입니다.';
    setDescription(template.replaceAll('{period}', periodText).replaceAll('{category}', categoryText));
  };

  const createRoadmapItemTitleAutoComplete = (itemId: string, itemType: DreamItemType) => {
    const suggestions = ROADMAP_ITEM_TITLE_AUTOCOMPLETE_BY_ITEM_TYPE.find(template => template.itemType === itemType)?.suggestions ?? [];
    if (suggestions.length === 0) return;
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    updateItem(itemId, { title: randomSuggestion });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-[430px] rounded-t-3xl overflow-y-auto"
        style={{ backgroundColor: '#12122a', border: '1px solid rgba(255,255,255,0.08)', maxHeight: 'calc(100vh - 72px)', marginBottom: 72 }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 className="text-lg font-black text-white">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="px-5 pb-10 space-y-5">
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-400">{LABELS.roadmapEditorTitleLabel ?? '로드맵 제목'}</label>
              <button
                onClick={createRoadmapTitleAutoComplete}
                title={LABELS.autoCompleteButton}
                aria-label={LABELS.autoCompleteButton}
                className="w-7 h-7 rounded-md flex items-center justify-center"
                style={{ backgroundColor: 'rgba(59,130,246,0.2)', color: '#93c5fd' }}
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>
            <input
              value={roadmapTitle}
              onChange={event => setRoadmapTitle(event.target.value)}
              placeholder="예: 고입 준비 6개월 로드맵"
              className="w-full h-11 px-4 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-500">로드맵 설명</span>
              <button
                onClick={createRoadmapDescriptionAutoComplete}
                title={LABELS.autoCompleteButton}
                aria-label={LABELS.autoCompleteButton}
                className="w-7 h-7 rounded-md flex items-center justify-center"
                style={{ backgroundColor: 'rgba(59,130,246,0.2)', color: '#93c5fd' }}
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
            </div>
            <textarea
              value={description}
              onChange={event => setDescription(event.target.value)}
              placeholder="로드맵 설명을 입력해 주세요"
              rows={3}
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none resize-none"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          </section>

          <section className="space-y-2">
            <label className="text-xs font-bold text-gray-400">활동 시기</label>
            <div className="grid grid-cols-3 gap-2">
              {periodOptions.map(option => {
                const selected = period === option.id;
                return (
                  <button
                    key={option.id}
                    onClick={() => setPeriod(option.id)}
                    className="h-10 rounded-xl text-xs font-bold transition-all"
                    style={selected
                      ? { background: 'linear-gradient(135deg, #6C5CE7, #a855f7)', color: '#fff' }
                      : { backgroundColor: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    {option.emoji} {option.label}
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-2">
            <label className="text-xs font-bold text-gray-400">대표 색상</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map(color => (
                <button
                  key={color}
                  onClick={() => setStarColor(color)}
                  className="w-9 h-9 rounded-full border-2"
                  style={{
                    backgroundColor: color,
                    borderColor: starColor === color ? '#ffffff' : 'rgba(255,255,255,0.15)',
                  }}
                />
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <label className="text-xs font-bold text-gray-400">{LABELS.roadmapCategoryLabel}</label>
            <div className="grid grid-cols-2 gap-2">
              {DREAM_ITEM_TYPES.map(itemType => {
                const isSelected = focusItemTypes.includes(itemType.value);
                return (
                  <button
                    key={itemType.value}
                    onClick={() => toggleFocusItemType(itemType.value)}
                    className="h-10 px-3 rounded-xl text-xs font-semibold text-left transition-all"
                    style={isSelected
                      ? { backgroundColor: `${itemType.color}22`, color: itemType.color, border: `1px solid ${itemType.color}66` }
                      : { backgroundColor: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    {itemType.emoji} {itemType.label}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-gray-500">{LABELS.roadmapCategoryHint}</p>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-400">{LABELS.roadmapEditorMonthSectionLabel ?? '월 선택 (멀티)'}</label>
              <button
                onClick={addRoadmapItem}
                className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg"
                style={{ backgroundColor: 'rgba(108,92,231,0.2)', color: '#c4b5fd' }}
              >
                <Plus className="w-3.5 h-3.5" />
                {LABELS.roadmapEditorAddItemButtonLabel ?? '항목 추가'}
              </button>
            </div>

            <div className="flex flex-wrap gap-1">
              {MONTH_OPTIONS.map(month => {
                const selected = selectedMonths.includes(month);
                return (
                  <button
                    key={month}
                    onClick={() => toggleSelectedMonth(month)}
                    className="px-2 py-1 rounded-md text-[10px] font-bold"
                    style={selected
                      ? { backgroundColor: 'rgba(59,130,246,0.25)', color: '#93c5fd' }
                      : { backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)' }}
                  >
                    {month}월
                  </button>
                );
              })}
            </div>

            <p className="text-[10px] text-gray-500">
              선택 월: {selectedMonths.map(month => `${month}월`).join(', ')}
            </p>

            {items.map(item => {
              const isItemOpen = itemAccordionOpenMap[item.id] ?? true;
              const itemMonths = item.months.length > 0 ? item.months : selectedMonths;
              return (
                <div
                  key={item.id}
                  className="rounded-xl p-3 space-y-2"
                  style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                >
                  <div className="flex items-center gap-2">
                    <input
                      value={item.title}
                      onChange={event => updateItem(item.id, { title: event.target.value })}
                      placeholder={LABELS.roadmapEditorItemTitlePlaceholder ?? '항목명 입력'}
                      className="flex-1 h-9 px-3 rounded-lg text-xs text-white placeholder-gray-600 outline-none"
                      style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                    />
                    <button
                      onClick={() => createRoadmapItemTitleAutoComplete(item.id, item.type)}
                      title={LABELS.autoCompleteButton}
                      aria-label={LABELS.autoCompleteButton}
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(59,130,246,0.2)', color: '#93c5fd' }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setItemAccordionOpenMap(previous => ({ ...previous, [item.id]: !(previous[item.id] ?? true) }))}
                      className="w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)' }}
                    >
                      {isItemOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {isItemOpen && (
                    <div className="space-y-2">
                      <div className="text-[10px] text-gray-500">카테고리 · 적용 월</div>
                      <div className="flex flex-wrap gap-1.5">
                        {DREAM_ITEM_TYPES.map(type => {
                          const isActiveType = item.type === type.value;
                          return (
                            <button
                              key={`${item.id}-type-${type.value}`}
                              onClick={() => updateItem(item.id, { type: type.value })}
                              className="px-2 py-1 rounded-md text-[10px] font-bold"
                              style={isActiveType
                                ? { backgroundColor: `${type.color}26`, color: type.color }
                                : { backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.55)' }}
                            >
                              {type.emoji} {type.label}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {(selectedMonths.length > 0 ? selectedMonths : MONTH_OPTIONS).map(month => {
                          const isActive = item.months.includes(month);
                          return (
                            <button
                              key={`${item.id}-month-${month}`}
                              onClick={() => toggleItemMonth(item.id, month)}
                              className="px-2 py-1 rounded-md text-[10px] font-bold"
                              style={isActive
                                ? { backgroundColor: 'rgba(59,130,246,0.25)', color: '#93c5fd' }
                                : { backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)' }}
                            >
                              {month}월
                            </button>
                          );
                        })}
                      </div>

                      <p className="text-[10px] text-gray-500">
                        적용 월: {itemMonths.map(month => `${month}월`).join(', ')}
                      </p>

                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-gray-400">{LABELS.todoSectionLabel} · {LABELS.weeklyChecklistLabel}</span>
                          <button
                            onClick={() => addWeekGroup(item.id)}
                            className="text-[10px] font-bold px-2 py-1 rounded-md"
                            style={{ backgroundColor: 'rgba(59,130,246,0.2)', color: '#93c5fd' }}
                          >
                            + {LABELS.roadmapEditorAddWeekGroupButtonLabel ?? '주차 그룹 추가'}
                          </button>
                        </div>
                        {(item.subItems ?? []).length === 0 ? (
                          <p className="text-[10px] text-gray-600">{LABELS.roadmapEditorNoWeekGroupHint ?? '주차 그룹을 추가하면 목표/항목을 자유롭게 관리할 수 있어요.'}</p>
                        ) : (
                          <div className="space-y-2">
                            {(() => {
                              const availableMonths = item.months.length > 0 ? item.months : selectedMonths;
                              const fallbackMonth = availableMonths[0] ?? 3;
                              const weekGroups = new Map<string, { month: number; week: number; goal?: RoadmapTodoItem; tasks: RoadmapTodoItem[] }>();

                              (item.subItems ?? []).forEach(subItem => {
                                const monthWeek = extractMonthWeek(subItem, fallbackMonth);
                                const groupKey = getWeekGroupKey(monthWeek.month, monthWeek.week);
                                const currentGroup = weekGroups.get(groupKey) ?? {
                                  month: monthWeek.month,
                                  week: monthWeek.week,
                                  goal: undefined,
                                  tasks: [],
                                };
                                if (isGoalTodoEntry(subItem)) {
                                  currentGroup.goal = subItem;
                                } else {
                                  currentGroup.tasks.push(subItem);
                                }
                                weekGroups.set(groupKey, currentGroup);
                              });

                              const sortedWeekGroups = [...weekGroups.entries()]
                                .sort((leftEntry, rightEntry) => {
                                  const left = leftEntry[1];
                                  const right = rightEntry[1];
                                  if (left.month !== right.month) return left.month - right.month;
                                  return left.week - right.week;
                                });

                              const monthGroups = new Map<number, Array<{ groupKey: string; group: { month: number; week: number; goal?: RoadmapTodoItem; tasks: RoadmapTodoItem[] } }>>();
                              sortedWeekGroups.forEach(([groupKey, group]) => {
                                const monthGroupItems = monthGroups.get(group.month) ?? [];
                                monthGroupItems.push({ groupKey, group });
                                monthGroups.set(group.month, monthGroupItems);
                              });

                              return [...monthGroups.entries()]
                                .sort(([leftMonth], [rightMonth]) => leftMonth - rightMonth)
                                .map(([month, monthGroupItems]) => {
                                  const monthAccordionKey = `${item.id}-month-${month}`;
                                  const isMonthOpen = monthAccordionOpenMap[monthAccordionKey] ?? true;
                                  return (
                                    <div key={monthAccordionKey} className="rounded-lg p-2" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                      <button
                                        onClick={() => setMonthAccordionOpenMap(previous => ({
                                          ...previous,
                                          [monthAccordionKey]: !(previous[monthAccordionKey] ?? true),
                                        }))}
                                        className="w-full flex items-center justify-between text-left"
                                      >
                                        <span className="text-[11px] font-bold text-sky-300">{month}월</span>
                                        <span className="text-gray-500">
                                          {isMonthOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                        </span>
                                      </button>

                                      {isMonthOpen && (
                                        <div className="mt-1.5 space-y-1.5">
                                          {monthGroupItems.map(({ groupKey, group }) => {
                                            const weekAccordionKey = `${item.id}-${groupKey}`;
                                            const isWeekOpen = weekAccordionOpenMap[weekAccordionKey] ?? true;
                                            return (
                                              <div key={weekAccordionKey} className="rounded-md p-2" style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                                <div className="flex items-center justify-between gap-2">
                                                  <button
                                                    onClick={() => setWeekAccordionOpenMap(previous => ({
                                                      ...previous,
                                                      [weekAccordionKey]: !(previous[weekAccordionKey] ?? true),
                                                    }))}
                                                    className="flex items-center gap-1 text-[11px] font-bold text-sky-300"
                                                  >
                                                    {group.month}월 {group.week}주차
                                                    {isWeekOpen ? <ChevronUp className="w-3.5 h-3.5 text-gray-500" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-500" />}
                                                  </button>
                                                  <div className="flex items-center gap-1">
                                                    <button
                                                      onClick={() => addWeekTask(item.id, groupKey)}
                                                      className="text-[10px] font-bold px-2 py-1 rounded-md"
                                                      style={{ backgroundColor: 'rgba(59,130,246,0.2)', color: '#93c5fd' }}
                                                    >
                                                      + {LABELS.roadmapEditorAddWeekTaskButtonLabel ?? '항목 추가'}
                                                    </button>
                                                    <button
                                                      onClick={() => removeWeekGroup(item.id, groupKey)}
                                                      className="text-[10px] font-bold px-2 py-1 rounded-md"
                                                      style={{ backgroundColor: 'rgba(239,68,68,0.18)', color: '#fca5a5' }}
                                                    >
                                                      {LABELS.roadmapEditorDeleteWeekGroupButtonLabel ?? '주차 삭제'}
                                                    </button>
                                                  </div>
                                                </div>

                                                {isWeekOpen && (
                                                  <div className="mt-1.5 space-y-1.5">
                                                    <input
                                                      value={group.goal?.title ?? ''}
                                                      onChange={event => upsertWeekGoal(item.id, groupKey, event.target.value)}
                                                      placeholder={(LABELS.roadmapEditorWeekGoalPlaceholder ?? '{month}월 {week}주차 목표 (선택)')
                                                        .replaceAll('{month}', String(group.month))
                                                        .replaceAll('{week}', String(group.week))}
                                                      className="w-full h-7 px-2 rounded-md text-[11px] text-white placeholder-gray-600 outline-none"
                                                      style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}
                                                    />

                                                    {group.tasks.map(subItem => (
                                                      <div
                                                        key={subItem.id}
                                                        className="flex items-center gap-1.5 rounded-md px-1.5 py-1"
                                                        style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
                                                      >
                                                        <input
                                                          value={subItem.title}
                                                          onChange={event => updateSubItem(item.id, subItem.id, { title: event.target.value })}
                                                          placeholder={(LABELS.roadmapEditorWeekTaskPlaceholder ?? '{month}월 {week}주차 항목')
                                                            .replaceAll('{month}', String(group.month))
                                                            .replaceAll('{week}', String(group.week))}
                                                          list={`todo-autocomplete-${item.id}`}
                                                          className="flex-1 h-7 px-2 rounded-md text-[11px] text-white placeholder-gray-600 outline-none"
                                                          style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}
                                                        />
                                                        <button
                                                          onClick={() => removeSubItem(item.id, subItem.id)}
                                                          className="w-7 h-7 rounded-md flex items-center justify-center"
                                                          style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
                                                        >
                                                          <Trash2 className="w-3 h-3" />
                                                        </button>
                                                      </div>
                                                    ))}
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  );
                                });
                            })()}
                          </div>
                        )}
                        <datalist id={`todo-autocomplete-${item.id}`}>
                          {(WEEKLY_TODO_AUTOCOMPLETE_BY_ITEM_TYPE.find(template => template.itemType === item.type)?.suggestions ?? [])
                            .map(suggestion => (
                              <option key={suggestion} value={suggestion} />
                            ))}
                        </datalist>
                        <div className="text-[10px] text-gray-600">
                          {LABELS.todoAutoCompleteHint}: {(WEEKLY_TODO_AUTOCOMPLETE_BY_ITEM_TYPE.find(template => template.itemType === item.type)?.suggestions ?? []).join(' · ')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </section>

          <button
            onClick={handleSubmit}
            disabled={!isSubmitEnabled}
            className="w-full h-12 rounded-2xl font-bold text-white text-sm transition-all active:scale-[0.98] disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #6C5CE7, #a855f7)' }}
          >
            {submitLabel || LABELS.createRoadmapButton}
          </button>
        </div>
      </div>
    </div>
  );
}

export type { RoadmapEditorPayload };
