'use client';

import { useMemo, useState } from 'react';
import { ExecutionPlanAiGenerateDialog } from './execution-plan-ai/ExecutionPlanAiGenerateDialog';
import { Sparkles, ChevronDown, ChevronUp, Plus, Trash2, X } from 'lucide-react';
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
import { RoadmapEditorWeekEditPopup } from './roadmap-editor-ui/RoadmapEditorWeekEditPopup';
import { buildStatusChangeComment } from '../utils/roadmapGoalStatus';
import {
  DREAM_ITEM_TYPES,
  LABELS,
  PERIOD_FILTERS,
  ROADMAP_DESCRIPTION_AUTOCOMPLETE_TEMPLATES,
  ROADMAP_ITEM_TITLE_AUTOCOMPLETE_BY_ITEM_TYPE,
  ROADMAP_TITLE_AUTOCOMPLETE_TEMPLATES,
  WEEKLY_TODO_AUTOCOMPLETE_BY_ITEM_TYPE,
} from '../config';
import type { DreamItemType, PeriodType, RoadmapGoalStatus, RoadmapItem, RoadmapMilestoneResult, RoadmapTodoItem } from '../types';
import {
  buildMonthWeekLabel,
  createWeeklyGoalSubItem,
  createWeeklyTaskSubItem,
  extractMonthWeek,
  extractWeekNumber,
  isGoalTodoEntry,
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
/** 한 달을 4주로 보고 순차 주차(1주차~N주차)를 월·주차로 매핑한다. */
const WEEKS_PER_MONTH = 4;
/** 항목마다 최소로 깔아 두는 순차 주차 수 (빈칸으로 채워나가는 방식). */
const DEFAULT_PLAN_WEEKS = 4;

/** 순차 주차(seq) → 시작 월 기준 월·주차 */
function sequentialToMonthWeek(startMonth: number, seq: number): { month: number; week: number } {
  const normalizedSeq = Math.max(seq, 1);
  const offset = Math.floor((normalizedSeq - 1) / WEEKS_PER_MONTH);
  const month = Math.min(startMonth + offset, 12);
  const week = ((normalizedSeq - 1) % WEEKS_PER_MONTH) + 1;
  return { month, week };
}

/** 월·주차 → 시작 월 기준 순차 주차(seq, 1 이상) */
function monthWeekToSequential(startMonth: number, month: number, week: number): number {
  const seq = (month - startMonth) * WEEKS_PER_MONTH + week;
  return seq >= 1 ? seq : 1;
}

function getSequentialKey(seq: number): string {
  return `seq-${seq}`;
}

function parseSequentialKey(groupKey: string): number | null {
  const matched = groupKey.match(/^seq-(\d+)$/);
  if (!matched) return null;
  const seq = Number(matched[1]);
  return Number.isInteger(seq) && seq >= 1 ? seq : null;
}

/** 항목 subItems가 실제로 걸친 월 목록 (item.months 호환용) */
function deriveItemMonths(subItems: RoadmapTodoItem[], startMonth: number): number[] {
  const months = new Set<number>();
  subItems.forEach(subItem => {
    const { month } = extractMonthWeek(subItem, startMonth);
    months.add(month);
  });
  const sorted = [...months].sort((a, b) => a - b);
  return sorted.length > 0 ? sorted : [startMonth];
}

function createEmptyItem(startMonth: number): RoadmapItem {
  return {
    id: `draft-item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: 'activity',
    title: '',
    months: [startMonth],
    difficulty: 3,
    subItems: [],
  };
}

/**
 * 항목의 주차를 1주차~N주차 순차로 만든 그리드. 기존 데이터는 (월·주차)에서 순차 위치를 역산해 배치하고,
 * 최소 DEFAULT_PLAN_WEEKS 주차까지 빈 슬롯을 깔아 채워나가게 한다.
 * weekLabel은 'N월 M주차'를 유지해 피드·상세·타임라인과 호환된다.
 */
function buildSequentialWeekGrid(subItems: RoadmapTodoItem[], startMonth: number): WeekGroupViewModel[] {
  const groupBySeq = new Map<string, WeekGroupViewModel>();
  let maxSeq = 0;

  subItems.forEach(subItem => {
    const { month, week } = extractMonthWeek(subItem, startMonth);
    const seq = monthWeekToSequential(startMonth, month, week);
    maxSeq = Math.max(maxSeq, seq);
    const groupKey = getSequentialKey(seq);
    const mapped = sequentialToMonthWeek(startMonth, seq);
    const current = groupBySeq.get(groupKey) ?? {
      groupKey,
      sequentialWeek: seq,
      month: mapped.month,
      week: mapped.week,
      goal: undefined,
      tasks: [],
    };
    if (isGoalTodoEntry(subItem)) current.goal = subItem;
    else current.tasks.push(subItem);
    groupBySeq.set(groupKey, current);
  });

  const shownWeeks = Math.max(maxSeq, DEFAULT_PLAN_WEEKS);
  for (let seq = 1; seq <= shownWeeks; seq += 1) {
    const groupKey = getSequentialKey(seq);
    if (!groupBySeq.has(groupKey)) {
      const mapped = sequentialToMonthWeek(startMonth, seq);
      groupBySeq.set(groupKey, {
        groupKey,
        sequentialWeek: seq,
        month: mapped.month,
        week: mapped.week,
        goal: undefined,
        tasks: [],
      });
    }
  }

  return [...groupBySeq.values()].sort((left, right) => left.sequentialWeek - right.sequentialWeek);
}

/** 내용 있는 하위 항목이 있는데 주차 목표가 비어 있으면 저장을 막는다. 완전히 빈 주차는 통과. */
function isWeekGroupMissingGoal(group: WeekGroupViewModel): boolean {
  const hasGoalText = (group.goal?.title.trim().length ?? 0) > 0;
  const hasTaskText = group.tasks.some(task => task.title.trim().length > 0);
  return hasTaskText && !hasGoalText;
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
  const [startMonth, setStartMonth] = useState<number>(() => {
    const monthsFromItems = initialValues.items
      .flatMap(item => item.months ?? [])
      .filter(month => month >= 1 && month <= 12);
    return monthsFromItems.length > 0 ? Math.min(...monthsFromItems) : 3;
  });
  const [itemAccordionOpenMap, setItemAccordionOpenMap] = useState<Record<string, boolean>>({});
  /** 클릭해서 편집 팝업을 연 주차 (전체펼침 개요 → 주차 클릭) */
  const [selectedWeek, setSelectedWeek] = useState<{ itemId: string; groupKey: string } | null>(null);
  const periodOptions = useMemo(
    () => PERIOD_FILTERS.filter(option => option.id !== 'all') as { id: PeriodType; label: string; emoji: string }[],
    [],
  );

  const hasMissingRequiredWeekGoal = useMemo(() => {
    return items
      .filter(item => item.title.trim().length > 0)
      .some(item => buildSequentialWeekGrid(item.subItems ?? [], startMonth).some(isWeekGroupMissingGoal));
  }, [items, startMonth]);

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

  const addRoadmapItem = () => {
    setItems(previous => [...previous, createEmptyItem(startMonth)]);
  };

  const updateItem = (itemId: string, patch: Partial<RoadmapItem>) => {
    setItems(prev => prev.map(item => item.id === itemId ? { ...item, ...patch } : item));
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

  /** 항목 subItem이 시작 월 기준 몇 번째 순차 주차인지 */
  const subItemSequential = (subItem: RoadmapTodoItem): number => {
    const { month, week } = extractMonthWeek(subItem, startMonth);
    return monthWeekToSequential(startMonth, month, week);
  };

  const addWeekGroup = (itemId: string) => {
    setItems(previousItems => previousItems.map(item => {
      if (item.id !== itemId) return item;
      const currentSubItems = item.subItems ?? [];
      // 1주차~N주차 중 다음 순차 주차에 빈 목표를 추가 (최소 DEFAULT_PLAN_WEEKS 다음 칸)
      const maxSeq = currentSubItems.reduce((max, subItem) => Math.max(max, subItemSequential(subItem)), 0);
      const nextSeq = Math.max(maxSeq, DEFAULT_PLAN_WEEKS) + 1;
      const { month, week } = sequentialToMonthWeek(startMonth, nextSeq);
      const nextSubItems: RoadmapTodoItem[] = [...currentSubItems, createWeeklyGoalSubItem(month, week)];
      return { ...item, months: deriveItemMonths(nextSubItems, startMonth), subItems: nextSubItems };
    }));
  };

  const addWeekTask = (itemId: string, groupKey: string) => {
    const seq = parseSequentialKey(groupKey);
    if (!seq) return;
    const { month, week } = sequentialToMonthWeek(startMonth, seq);
    setItems(previousItems => previousItems.map(item => {
      if (item.id !== itemId) return item;
      const nextSubItems: RoadmapTodoItem[] = [...(item.subItems ?? []), createWeeklyTaskSubItem(month, week)];
      return { ...item, months: deriveItemMonths(nextSubItems, startMonth), subItems: nextSubItems };
    }));
  };

  const upsertWeekGoal = (itemId: string, groupKey: string, goalTitle: string) => {
    const seq = parseSequentialKey(groupKey);
    if (!seq) return;
    const { month, week } = sequentialToMonthWeek(startMonth, seq);
    setItems(previousItems => previousItems.map(item => {
      if (item.id !== itemId) return item;
      const currentSubItems = item.subItems ?? [];
      const existingGoal = currentSubItems.find(subItem => (
        isGoalTodoEntry(subItem) && subItemSequential(subItem) === seq
      ));

      const nextSubItems = existingGoal
        ? currentSubItems.map(subItem => (
          subItem.id === existingGoal.id ? { ...subItem, title: goalTitle } : subItem
        ))
        : [
          {
            ...createWeeklyGoalSubItem(month, week, goalTitle),
            weekLabel: buildMonthWeekLabel(month, week),
          },
          ...currentSubItems,
        ];

      return { ...item, months: deriveItemMonths(nextSubItems, startMonth), subItems: nextSubItems };
    }));
  };

  const removeWeekGroup = (itemId: string, groupKey: string) => {
    const seq = parseSequentialKey(groupKey);
    if (!seq) return;
    setItems(previousItems => previousItems.map(item => {
      if (item.id !== itemId) return item;
      const nextSubItems = (item.subItems ?? []).filter(subItem => subItemSequential(subItem) !== seq);
      return { ...item, months: deriveItemMonths(nextSubItems, startMonth), subItems: nextSubItems };
    }));
  };

  /** 목표 상태(Jira)를 바꾸고, 상태 전이를 코멘트 스레드 맨 앞에 자동 기록한다. */
  const setGoalStatus = (itemId: string, groupKey: string, nextStatus: RoadmapGoalStatus) => {
    const seq = parseSequentialKey(groupKey);
    if (!seq) return;
    const nowIso = new Date().toISOString();
    setItems(previousItems => previousItems.map(item => {
      if (item.id !== itemId) return item;
      const currentSubItems = item.subItems ?? [];
      const existingGoal = currentSubItems.find(subItem => (
        isGoalTodoEntry(subItem) && subItemSequential(subItem) === seq
      ));
      if (!existingGoal) return item; // 목표가 있어야 상태를 둘 수 있음
      const fromStatus = existingGoal.goalStatus ?? 'todo';
      if (fromStatus === nextStatus) return item;
      const statusComment = buildStatusChangeComment(fromStatus, nextStatus, nowIso);
      const nextComments = statusComment
        ? [statusComment, ...(existingGoal.comments ?? [])]
        : (existingGoal.comments ?? []);
      return {
        ...item,
        subItems: currentSubItems.map(subItem => (
          subItem.id === existingGoal.id
            ? { ...subItem, goalStatus: nextStatus, isDone: nextStatus === 'done', comments: nextComments }
            : subItem
        )),
      };
    }));
  };

  const weekGoalPlaceholderTemplate = LABELS.roadmapEditorWeekGoalPlaceholder ?? '{month}월 {week}주차 목표 (선택)';
  const weekTaskPlaceholderTemplate = LABELS.roadmapEditorWeekTaskPlaceholder ?? '{month}월 {week}주차 항목';

  /** 클릭한 주차의 활동/그룹 컨텍스트 (편집 팝업용) */
  const selectedWeekContext = useMemo(() => {
    if (!selectedWeek) return null;
    const item = items.find(currentItem => currentItem.id === selectedWeek.itemId);
    if (!item) return null;
    const group = buildSequentialWeekGrid(item.subItems ?? [], startMonth).find(
      candidate => candidate.groupKey === selectedWeek.groupKey,
    );
    if (!group) return null;
    return { item, group };
  }, [selectedWeek, items, startMonth]);

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

  /** AI 실행계획은 해당 활동이 걸친 월 기준(비어 있으면 시작 월부터 기본 주 수만큼). */
  const executionPlanAiSelectedMonths = useMemo(() => {
    const fromItem = executionPlanAiTargetItem?.months ?? [];
    if (fromItem.length > 0) return [...fromItem].sort((a, b) => a - b);
    const lastMonth = sequentialToMonthWeek(startMonth, DEFAULT_PLAN_WEEKS).month;
    const months: number[] = [];
    for (let month = startMonth; month <= lastMonth; month += 1) months.push(month);
    return months;
  }, [executionPlanAiTargetItem, startMonth]);

  /** 프롬프트용 제목: 로드맵 전체 제목이 아니라 활동 항목(목표) 한 줄. */
  const executionPlanAiDefaultTitle = useMemo(() => {
    const activityGoal = executionPlanAiTargetItem?.title?.trim();
    return activityGoal && activityGoal.length > 0 ? activityGoal : '나의 활동';
  }, [executionPlanAiTargetItem]);

  const applyExecutionPlanAiSubItems = (subItems: RoadmapTodoItem[]) => {
    if (!executionPlanAiItemId) return;
    setItems(previousItems => previousItems.map(item => {
      if (item.id !== executionPlanAiItemId) return item;
      return {
        ...item,
        months: deriveItemMonths(subItems, startMonth),
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
            <h3 className="text-lg font-black text-white truncate">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-4 space-y-5">
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

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-gray-400">{LABELS.roadmapEditorStartMonthSectionLabel ?? '시작 월'}</label>
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
                const selected = startMonth === month;
                return (
                  <button
                    key={month}
                    onClick={() => setStartMonth(month)}
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
              {startMonth}월부터 시작 · 주차는 1주차→N주차 순서로 추가/편집해요.
            </p>

            {items.map(item => {
              const isItemOpen = itemAccordionOpenMap[item.id] ?? true;
              const sortedWeekGroups = buildSequentialWeekGrid(item.subItems ?? [], startMonth);
              const hasMissingGoalInItem = sortedWeekGroups.some(isWeekGroupMissingGoal);
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
                      <div className="text-sm text-gray-500">카테고리</div>
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
                          weekGoalEditHelpHint: LABELS.roadmapEditorWeekGoalEditHelpHint,
                          weekGoalValidationHint: LABELS.roadmapEditorWeekGoalValidationHint ?? '하위 항목을 추가한 주차에는 목표를 입력해 주세요. 빈 주차는 비워 두어도 저장됩니다.',
                          emptyGoalRowLabel: LABELS.roadmapEditorWeekGoalEmptyRowLabel ?? '탭하여 목표·상태·산출물을 입력하세요',
                        }}
                        onAddWeekGroup={() => addWeekGroup(item.id)}
                        onSelectWeek={groupKey => setSelectedWeek({ itemId: item.id, groupKey })}
                        hasMissingGoalInItem={hasMissingGoalInItem}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </section>

        </div>

        <div
          className={`${roadmapEditorDialogFooterClassName} shadow-[0_-12px_32px_rgba(0,0,0,0.45)]`}
          style={{
            paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 0px))',
          }}
        >
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
    <ExecutionPlanAiGenerateDialog
      isOpen={executionPlanAiItemId !== null}
      onClose={() => setExecutionPlanAiItemId(null)}
      selectedMonths={executionPlanAiSelectedMonths}
      defaultPlanTitle={executionPlanAiDefaultTitle}
      onApplySubItems={applyExecutionPlanAiSubItems}
    />
    {selectedWeekContext && (
      <RoadmapEditorWeekEditPopup
        group={selectedWeekContext.group}
        deleteWeekGroupButton={LABELS.roadmapEditorDeleteWeekGroupButtonLabel ?? '삭제'}
        labels={{
          weekGoalLabel: LABELS.roadmapEditorWeekGoalTreeFieldLabel ?? '목표',
          weekGoalEditHelpHint: LABELS.roadmapEditorWeekGoalEditHelpHint,
          weekGoalRequiredHint: LABELS.roadmapEditorWeekGoalRequiredHint ?? '하위 항목이 있는 주차는 목표가 필요해요.',
          goalOutputLabel: LABELS.roadmapEditorWeekGoalOutputFieldLabel ?? '산출물 (이미지 · 내용) — 주당 1개',
          subItemSectionLabel: LABELS.roadmapEditorSubItemSectionLabel ?? '하위 항목',
          addSubItemButton: LABELS.roadmapEditorAddSubItemButtonLabel ?? '하위 항목 추가',
          statusSectionLabel: LABELS.roadmapEditorWeekGoalStatusLabel ?? '상태 (Jira)',
        }}
        weekGoalPlaceholderTemplate={weekGoalPlaceholderTemplate}
        weekTaskPlaceholderTemplate={weekTaskPlaceholderTemplate}
        onClose={() => setSelectedWeek(null)}
        onUpsertWeekGoal={(groupKey, goalTitle) => upsertWeekGoal(selectedWeekContext.item.id, groupKey, goalTitle)}
        onSetGoalStatus={(groupKey, nextStatus) => setGoalStatus(selectedWeekContext.item.id, groupKey, nextStatus)}
        onUpdateSubItem={(subItemId, patch) => updateSubItem(selectedWeekContext.item.id, subItemId, patch)}
        onRemoveSubItem={subItemId => removeSubItem(selectedWeekContext.item.id, subItemId)}
        onAddWeekTask={groupKey => addWeekTask(selectedWeekContext.item.id, groupKey)}
        onRemoveWeekGroup={groupKey => removeWeekGroup(selectedWeekContext.item.id, groupKey)}
        autocompleteListId={`todo-autocomplete-${selectedWeekContext.item.id}`}
        autocompleteSuggestions={
          WEEKLY_TODO_AUTOCOMPLETE_BY_ITEM_TYPE.find(template => template.itemType === selectedWeekContext.item.type)?.suggestions ?? []
        }
      />
    )}
    </>
  );
}

export type { RoadmapEditorPayload };
