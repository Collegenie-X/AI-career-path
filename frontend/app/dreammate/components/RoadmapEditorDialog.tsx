'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExecutionPlanAiGenerateDialog } from './execution-plan-ai/ExecutionPlanAiGenerateDialog';
import { Sparkles, ChevronDown, ChevronUp, ChevronRight, ArrowLeft, Plus, Trash2, X, SlidersHorizontal, CalendarDays, Package } from 'lucide-react';
import { RoadmapEditorColorSwatchRow } from './roadmap-editor-ui/RoadmapEditorColorSwatchRow';
import { RoadmapEditorDreamItemTypeToggleGrid } from './roadmap-editor-ui/RoadmapEditorDreamItemTypeToggleGrid';
import { RoadmapEditorLabeledFieldRow } from './roadmap-editor-ui/RoadmapEditorLabeledFieldRow';
import { RoadmapEditorPeriodPillGroup } from './roadmap-editor-ui/RoadmapEditorPeriodPillGroup';
import { RoadmapEditorSparkleIconButton } from './roadmap-editor-ui/RoadmapEditorSparkleIconButton';
import {
  RoadmapEditorSoftTextFieldMultiline,
  RoadmapEditorSoftTextFieldSingleLine,
} from './roadmap-editor-ui/RoadmapEditorSoftTextField';
import {
  roadmapEditorDialogFooterClassName,
  roadmapEditorDialogShellClassName,
  roadmapEditorSoftInsetPanelClassName,
  roadmapEditorSectionLabelClassName,
} from './roadmap-editor-ui/roadmapEditorUiTokens';
import type { WeekGroupViewModel } from './roadmap-editor-ui/roadmapEditorWbsTypes';
import { RoadmapEditorWbsWeeklyChecklistTree } from './roadmap-editor-ui/RoadmapEditorWbsWeeklyChecklistTree';
import {
  DREAM_ITEM_TYPES,
  LABELS,
  PERIOD_FILTERS,
  ROADMAP_DESCRIPTION_AUTOCOMPLETE_TEMPLATES,
  ROADMAP_ITEM_TITLE_AUTOCOMPLETE_BY_ITEM_TYPE,
  ROADMAP_TITLE_AUTOCOMPLETE_TEMPLATES,
  WEEKLY_TODO_AUTOCOMPLETE_BY_ITEM_TYPE,
} from '../config';
import type { DreamItemType, PeriodType, RoadmapItem, RoadmapMilestoneResult, RoadmapTodoItem } from '../types';
import {
  buildMonthWeekLabel,
  createWeeklyGoalSubItem,
  createWeeklyTaskSubItem,
  extractMonthWeek,
  extractWeekNumber,
  isGoalTodoEntry,
  normalizeSubItemsToAvailableMonths,
} from '../utils/roadmapWeeklySubItemBuilders';

interface RoadmapEditorPayload {
  title: string;
  description: string;
  period: PeriodType;
  starColor: string;
  focusItemTypes: DreamItemType[];
  milestoneResults?: RoadmapMilestoneResult[];
  finalResultTitle?: string;
  finalResultDescription?: string;
  finalResultUrl?: string;
  finalResultImageUrl?: string;
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

function createEmptyItem(selectedMonths: number[]): RoadmapItem {
  const months = selectedMonths.length > 0 ? [...selectedMonths].sort((a, b) => a - b) : [3];
  return {
    id: `draft-item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: 'activity',
    title: '',
    months,
    difficulty: 3,
    subItems: [],
  };
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

function buildSortedWeekGroups(subItems: RoadmapTodoItem[], fallbackMonth: number): WeekGroupViewModel[] {
  const weekGroups = new Map<string, WeekGroupViewModel>();

  subItems.forEach(subItem => {
    const monthWeek = extractMonthWeek(subItem, fallbackMonth);
    const groupKey = getWeekGroupKey(monthWeek.month, monthWeek.week);
    const currentGroup = weekGroups.get(groupKey) ?? {
      groupKey,
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

  return [...weekGroups.values()].sort((left, right) => {
    if (left.month !== right.month) return left.month - right.month;
    return left.week - right.week;
  });
}

export function RoadmapEditorDialog({
  title,
  submitLabel,
  initialValues,
  onClose,
  onSubmit,
}: RoadmapEditorDialogProps) {
  const [view, setView] = useState<'hub' | 'basics' | 'items'>('hub');
  const [roadmapTitle, setRoadmapTitle] = useState(initialValues.title);
  const [description, setDescription] = useState(initialValues.description);
  const [period, setPeriod] = useState<PeriodType>(initialValues.period);
  const [starColor, setStarColor] = useState(initialValues.starColor);
  // 결과물·사진 편집은 포트폴리오 결과 리포트로 이전됨 — 기존 값은 읽기 전용으로 보존해 payload로 그대로 전달
  const [milestoneResults] = useState<RoadmapMilestoneResult[]>(initialValues.milestoneResults ?? []);
  const [finalResultTitle] = useState(initialValues.finalResultTitle ?? '');
  const [finalResultDescription] = useState(initialValues.finalResultDescription ?? '');
  const [finalResultUrl] = useState(initialValues.finalResultUrl ?? '');
  const [finalResultImageUrl] = useState(initialValues.finalResultImageUrl ?? '');
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

  const hasMissingRequiredWeekGoal = useMemo(() => {
    return items
      .filter(item => item.title.trim().length > 0)
      .some(item => {
        const availableMonths = item.months.length > 0 ? item.months : selectedMonths;
        const fallbackMonth = availableMonths[0] ?? 3;
        return buildSortedWeekGroups(item.subItems ?? [], fallbackMonth)
          .some(group => (group.goal?.title.trim().length ?? 0) === 0);
      });
  }, [items, selectedMonths]);

  const isSubmitEnabled = roadmapTitle.trim().length > 1
    && items.some(item => item.title.trim().length > 1)
    && !hasMissingRequiredWeekGoal;

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
        createWeeklyGoalSubItem(nextMonth, targetWeek),
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
        createWeeklyTaskSubItem(parsedGroup.month, parsedGroup.week),
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

      const nextSubItems = existingGoal
        ? currentSubItems.map(subItem => (
          subItem.id === existingGoal.id ? { ...subItem, title: rawGoalTitle } : subItem
        ))
        : [
          {
            ...createWeeklyGoalSubItem(parsedGroup.month, parsedGroup.week, rawGoalTitle),
            weekLabel: targetWeekLabel,
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
      milestoneResults: milestoneResults
        .map(result => ({
          ...result,
          title: result.title.trim(),
          description: result.description?.trim() || undefined,
          monthWeekLabel: result.monthWeekLabel?.trim() || undefined,
          resultUrl: result.resultUrl?.trim() || undefined,
          imageUrl: result.imageUrl?.trim() || undefined,
          recordedAt: result.recordedAt ?? new Date().toISOString(),
        }))
        .filter(result => result.title.length > 0),
      finalResultTitle: finalResultTitle.trim() || undefined,
      finalResultDescription: finalResultDescription.trim() || undefined,
      finalResultUrl: finalResultUrl.trim() || undefined,
      finalResultImageUrl: finalResultImageUrl.trim() || undefined,
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

  const [executionPlanAiItemId, setExecutionPlanAiItemId] = useState<string | null>(null);

  const executionPlanAiTargetItem = useMemo(
    () => (executionPlanAiItemId ? items.find(i => i.id === executionPlanAiItemId) : undefined),
    [executionPlanAiItemId, items],
  );

  /** AI 실행계획은 해당 활동 행의 적용 월 기준(비어 있으면 에디터 상단 월 선택과 동일 로직). */
  const executionPlanAiSelectedMonths = useMemo(() => {
    if (!executionPlanAiTargetItem) return [...selectedMonths].sort((a, b) => a - b);
    const fromItem = executionPlanAiTargetItem.months;
    const raw = fromItem.length > 0 ? fromItem : selectedMonths;
    return [...raw].sort((a, b) => a - b);
  }, [executionPlanAiTargetItem, selectedMonths]);

  /** 프롬프트용 제목: 로드맵 전체 제목이 아니라 활동 항목(목표) 한 줄. */
  const executionPlanAiDefaultTitle = useMemo(() => {
    const activityGoal = executionPlanAiTargetItem?.title?.trim();
    return activityGoal && activityGoal.length > 0 ? activityGoal : '나의 활동';
  }, [executionPlanAiTargetItem]);

  const applyExecutionPlanAiSubItems = (subItems: RoadmapTodoItem[]) => {
    if (!executionPlanAiItemId) return;
    setItems(previousItems => previousItems.map(item => {
      if (item.id !== executionPlanAiItemId) return item;
      const months = item.months.length > 0 ? item.months : selectedMonths;
      return {
        ...item,
        months,
        subItems,
      };
    }));
    setExecutionPlanAiItemId(null);
  };

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={roadmapEditorDialogShellClassName}
        style={{ backgroundColor: '#12122a', maxHeight: 'calc(100vh - 72px)', marginBottom: 72 }}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {view !== 'hub' && (
              <button
                onClick={() => setView('hub')}
                aria-label="뒤로"
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
              >
                <ArrowLeft className="w-4 h-4 text-gray-300" />
              </button>
            )}
            <h3 className="text-lg font-black text-white truncate">
              {view === 'hub' ? title : view === 'basics' ? '기본 설정' : '주차 항목 편집'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-4">
          <AnimatePresence mode="wait" initial={false}>
          {view === 'hub' && (
          <motion.div
            key="hub"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="space-y-4"
          >
          <section className="space-y-4">
            <RoadmapEditorLabeledFieldRow
              label={LABELS.roadmapEditorTitleLabel ?? '로드맵 제목'}
              trailing={(
                <RoadmapEditorSparkleIconButton
                  title={LABELS.autoCompleteButton}
                  ariaLabel={LABELS.autoCompleteButton}
                  onClick={createRoadmapTitleAutoComplete}
                />
              )}
            >
              <RoadmapEditorSoftTextFieldSingleLine
                value={roadmapTitle}
                onChange={event => setRoadmapTitle(event.target.value)}
                placeholder={LABELS.roadmapEditorTitlePlaceholder ?? '예: 고입 준비 6개월 로드맵'}
                minHeightPx={48}
              />
            </RoadmapEditorLabeledFieldRow>
            <RoadmapEditorLabeledFieldRow
              label={LABELS.roadmapEditorDescriptionLabel ?? '로드맵 설명'}
              trailing={(
                <RoadmapEditorSparkleIconButton
                  title={LABELS.autoCompleteButton}
                  ariaLabel={LABELS.autoCompleteButton}
                  onClick={createRoadmapDescriptionAutoComplete}
                />
              )}
            >
              <RoadmapEditorSoftTextFieldMultiline
                value={description}
                onChange={event => setDescription(event.target.value)}
                placeholder={LABELS.roadmapEditorDescriptionPlaceholder ?? '로드맵 설명을 입력해 주세요'}
                rows={3}
              />
            </RoadmapEditorLabeledFieldRow>
          </section>

          {/* 허브 네비게이션 카드 — 세부 편집은 팝업(서브뷰)으로 */}
          <div className="space-y-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => setView('basics')}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-left transition-colors"
              style={{ background: `linear-gradient(135deg, ${starColor}1f, ${starColor}0a)`, border: `1px solid ${starColor}33` }}
            >
              <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${starColor}26` }}>
                <SlidersHorizontal className="w-5 h-5" style={{ color: starColor }} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white">기본 설정</div>
                <div className="text-[11px] text-gray-400 truncate">
                  {periodOptions.find(o => o.id === period)?.label ?? period}
                  {' · '}
                  {focusItemTypes.map(t => DREAM_ITEM_TYPES.find(d => d.value === t)?.emoji).filter(Boolean).join(' ') || '카테고리 미선택'}
                </div>
              </div>
              <span className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: starColor, boxShadow: `0 0 8px ${starColor}` }} />
              <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => setView('items')}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-left transition-colors"
              style={{ background: 'linear-gradient(135deg, rgba(108,92,231,0.14), rgba(108,92,231,0.05))', border: '1px solid rgba(108,92,231,0.3)' }}
            >
              <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(108,92,231,0.22)' }}>
                <CalendarDays className="w-5 h-5" style={{ color: '#c4b5fd' }} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white">주차 항목</div>
                <div className="text-[11px] text-gray-400 truncate">
                  {items.length}개 항목 · 주차 목표 {items.reduce((n, it) => n + (it.subItems ?? []).filter(isGoalTodoEntry).length, 0)}개
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
            </motion.button>

            {/* 결과물·사진은 포트폴리오 결과 리포트로 일원화 */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.12)' }}>
              <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(236,72,153,0.18)' }}>
                <Package className="w-5 h-5" style={{ color: '#f9a8d4' }} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-white">결과물 · 사진</div>
                <div className="text-[11px] text-gray-400 leading-snug">포트폴리오 탭의 결과 리포트에서 주차별로 기록해요</div>
              </div>
            </div>
          </div>
          </motion.div>
          )}


          {view === 'basics' && (
          <motion.div
            key="basics"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
          {/* 기본 설정 그룹 — 활동시기·색상 한 줄, 카테고리 그 아래 */}
          <section className="space-y-3">
            <span className={roadmapEditorSectionLabelClassName}>⚙ 기본 설정</span>

            {/* 활동 시기 — 라벨 + 컨트롤 인라인 */}
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-[11px] font-semibold text-gray-400 w-14 flex-shrink-0">
                {LABELS.roadmapEditorActivityPeriodLabel ?? '활동 시기'}
              </span>
              <div className="flex-1 min-w-0">
                <RoadmapEditorPeriodPillGroup
                  options={periodOptions}
                  value={period}
                  onChange={setPeriod}
                />
              </div>
            </div>

            {/* 대표 색상 — 라벨 + 스와치 인라인 */}
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-[11px] font-semibold text-gray-400 w-14 flex-shrink-0">
                {LABELS.roadmapEditorAccentColorLabel ?? '대표 색상'}
              </span>
              <div className="flex-1 min-w-0">
                <RoadmapEditorColorSwatchRow
                  colors={COLOR_OPTIONS}
                  value={starColor}
                  onChange={setStarColor}
                />
              </div>
            </div>

            {/* 실행 카테고리 */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-gray-400">{LABELS.roadmapCategoryLabel}</span>
              <RoadmapEditorDreamItemTypeToggleGrid
                options={DREAM_ITEM_TYPES}
                selectedValues={focusItemTypes}
                onToggle={toggleFocusItemType}
              />
              <p className="text-xs text-gray-500">{LABELS.roadmapCategoryHint}</p>
            </div>
          </section>
          </motion.div>
          )}

          {view === 'items' && (
          <motion.div
            key="items"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-gray-400">{LABELS.roadmapEditorMonthSectionLabel ?? '월 선택 (멀티)'}</label>
              <button
                onClick={addRoadmapItem}
                className="flex items-center gap-1 text-sm font-bold px-3 py-2 rounded-lg"
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
                    className="px-2.5 py-1.5 rounded-md text-sm font-bold"
                    style={selected
                      ? { backgroundColor: 'rgba(59,130,246,0.25)', color: '#93c5fd' }
                      : { backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)' }}
                  >
                    {month}월
                  </button>
                );
              })}
            </div>

            <p className="text-sm text-gray-500">
              선택 월: {selectedMonths.map(month => `${month}월`).join(', ')}
            </p>

            {items.map(item => {
              const isItemOpen = itemAccordionOpenMap[item.id] ?? true;
              const itemMonths = item.months.length > 0 ? item.months : selectedMonths;
              const fallbackMonth = itemMonths[0] ?? 3;
              const sortedWeekGroups = buildSortedWeekGroups(item.subItems ?? [], fallbackMonth);
              const hasMissingGoalInItem = sortedWeekGroups.some(group => (group.goal?.title.trim().length ?? 0) === 0);
              return (
                <div
                  key={item.id}
                  className={`${roadmapEditorSoftInsetPanelClassName} rounded-2xl p-3 space-y-2`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      value={item.title}
                      onChange={event => updateItem(item.id, { title: event.target.value })}
                      placeholder={LABELS.roadmapEditorItemTitlePlaceholder ?? '항목명 입력'}
                      className="flex-1 h-11 px-3 rounded-xl text-sm text-white placeholder-gray-500 outline-none border-0 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
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
                      <div className="text-sm text-gray-500">카테고리 · 적용 월</div>
                      <div className="flex flex-wrap gap-1.5">
                        {DREAM_ITEM_TYPES.map(type => {
                          const isActiveType = item.type === type.value;
                          return (
                            <button
                              key={`${item.id}-type-${type.value}`}
                              onClick={() => updateItem(item.id, { type: type.value })}
                              className="px-2.5 py-1.5 rounded-md text-sm font-bold"
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
                              className="px-2.5 py-1.5 rounded-md text-sm font-bold"
                              style={isActive
                                ? { backgroundColor: 'rgba(59,130,246,0.25)', color: '#93c5fd' }
                                : { backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)' }}
                            >
                              {month}월
                            </button>
                          );
                        })}
                      </div>

                      <p className="text-sm text-gray-500">
                        적용 월: {itemMonths.map(month => `${month}월`).join(', ')}
                      </p>

                      <button
                        type="button"
                        onClick={() => setExecutionPlanAiItemId(item.id)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-colors active:scale-[0.99]"
                        style={{ backgroundColor: 'rgba(139,92,246,0.22)', color: '#e9d5ff' }}
                      >
                        <Sparkles className="w-4 h-4" />
                        AI로 주간 계획 만들기
                      </button>

                      <RoadmapEditorWbsWeeklyChecklistTree
                        item={item}
                        sortedWeekGroups={sortedWeekGroups}
                        labels={{
                          sectionTitle: `${LABELS.todoSectionLabel} · ${LABELS.weeklyChecklistLabel}`,
                          addWeekGroupButton: LABELS.roadmapEditorAddWeekGroupButtonLabel ?? '주 추가',
                          noWeekGroupHint: LABELS.roadmapEditorNoWeekGroupHint ?? '주차 그룹을 추가하면 목표/항목을 자유롭게 관리할 수 있어요.',
                          deleteWeekGroupButton: LABELS.roadmapEditorDeleteWeekGroupButtonLabel ?? '삭제',
                          weekGoalLabel: LABELS.roadmapEditorWeekGoalTreeFieldLabel ?? '목표',
                          weekGoalEditHelpHint: LABELS.roadmapEditorWeekGoalEditHelpHint,
                          weekGoalRequiredHint: LABELS.roadmapEditorWeekGoalRequiredHint ?? '주차 목표는 필수입니다.',
                          weekGoalValidationHint: LABELS.roadmapEditorWeekGoalValidationHint ?? '저장하려면 모든 주차 그룹에 목표를 입력해 주세요. 항목은 선택입니다.',
                          goalOutputLabel: LABELS.roadmapEditorWeekGoalOutputFieldLabel ?? '산출물 (URL 또는 파일명) — 주당 1개',
                          subItemSectionLabel: LABELS.roadmapEditorSubItemSectionLabel ?? '하위 항목',
                          addSubItemButton: LABELS.roadmapEditorAddSubItemButtonLabel ?? '하위 항목 추가',
                          todoAutoCompleteHint: LABELS.todoAutoCompleteHint,
                        }}
                        weekGoalPlaceholderTemplate={LABELS.roadmapEditorWeekGoalPlaceholder ?? '{month}월 {week}주차 목표 (필수)'}
                        weekTaskPlaceholderTemplate={LABELS.roadmapEditorWeekTaskPlaceholder ?? '{month}월 {week}주차 항목'}
                        monthAccordionOpenMap={monthAccordionOpenMap}
                        weekAccordionOpenMap={weekAccordionOpenMap}
                        onToggleMonthAccordion={monthAccordionKey => {
                          setMonthAccordionOpenMap(previous => ({
                            ...previous,
                            [monthAccordionKey]: !(previous[monthAccordionKey] ?? true),
                          }));
                        }}
                        onToggleWeekAccordion={weekAccordionKey => {
                          setWeekAccordionOpenMap(previous => ({
                            ...previous,
                            [weekAccordionKey]: !(previous[weekAccordionKey] ?? true),
                          }));
                        }}
                        onAddWeekGroup={() => addWeekGroup(item.id)}
                        onRemoveWeekGroup={groupKey => removeWeekGroup(item.id, groupKey)}
                        onUpsertWeekGoal={(groupKey, title) => upsertWeekGoal(item.id, groupKey, title)}
                        onUpdateSubItem={(subItemId, patch) => updateSubItem(item.id, subItemId, patch)}
                        onRemoveSubItem={subItemId => removeSubItem(item.id, subItemId)}
                        onAddWeekTask={groupKey => addWeekTask(item.id, groupKey)}
                        autocompleteListId={`todo-autocomplete-${item.id}`}
                        autocompleteSuggestions={
                          WEEKLY_TODO_AUTOCOMPLETE_BY_ITEM_TYPE.find(template => template.itemType === item.type)?.suggestions ?? []
                        }
                        hasMissingGoalInItem={hasMissingGoalInItem}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </section>
          </motion.div>
          )}
          </AnimatePresence>

        </div>

        <div
          className={`${roadmapEditorDialogFooterClassName} shadow-[0_-12px_32px_rgba(0,0,0,0.45)]`}
          style={{
            paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
          }}
        >
          {view === 'hub' ? (
            <button
              onClick={handleSubmit}
              disabled={!isSubmitEnabled}
              className="w-full h-12 rounded-2xl font-bold text-white text-sm transition-all active:scale-[0.98] disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #6C5CE7, #a855f7)' }}
            >
              {submitLabel || LABELS.createRoadmapButton}
            </button>
          ) : (
            <button
              onClick={() => setView('hub')}
              className="w-full h-12 rounded-2xl font-bold text-white text-sm transition-all active:scale-[0.98]"
              style={{ background: `linear-gradient(135deg, ${starColor}, ${starColor}cc)` }}
            >
              완료
            </button>
          )}
        </div>
      </div>
    </div>
    <ExecutionPlanAiGenerateDialog
      isOpen={executionPlanAiItemId !== null}
      onClose={() => setExecutionPlanAiItemId(null)}
      selectedMonths={executionPlanAiSelectedMonths}
      defaultPlanTitle={executionPlanAiDefaultTitle}
      onApplySubItems={applyExecutionPlanAiSubItems}
    />
    </>
  );
}

export type { RoadmapEditorPayload };
