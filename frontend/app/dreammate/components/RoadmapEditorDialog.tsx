'use client';

import { useMemo, useState, type ChangeEvent } from 'react';
import { ExecutionPlanAiGenerateDialog } from './execution-plan-ai/ExecutionPlanAiGenerateDialog';
import { Sparkles, ChevronDown, ChevronUp, Plus, Trash2, X } from 'lucide-react';
import { RoadmapEditorAccordionHeaderButton } from './roadmap-editor-ui/RoadmapEditorAccordionHeaderButton';
import { RoadmapEditorGradientAccordionShell } from './roadmap-editor-ui/RoadmapEditorGradientAccordionShell';
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
import { compressImageFile } from '../utils/compressImageFile';
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
const WEEK_OPTIONS = [1, 2, 3, 4, 5];
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

function createEmptyMilestoneResult(): RoadmapMilestoneResult {
  return {
    id: `milestone-result-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: '',
    description: '',
    monthWeekLabel: '',
    resultUrl: '',
    imageUrl: '',
  };
}

function parseMonthWeekLabel(monthWeekLabel?: string): { month?: number; week?: number } {
  const matchedMonthWeek = (monthWeekLabel ?? '').match(/(\d+)\s*월\s*(\d+)\s*주차/);
  if (!matchedMonthWeek) return {};
  const month = Number(matchedMonthWeek[1]);
  const week = Number(matchedMonthWeek[2]);
  if (!Number.isInteger(month) || !Number.isInteger(week)) return {};
  return { month, week };
}

function buildMilestoneMonthWeekLabel(month: number, week: number): string {
  return `${month}월 ${week}주차`;
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
  // 결과물(중간·최종)·사진 첨부 — 생성/수정에서 직접 편집한다.
  const [milestoneResults, setMilestoneResults] = useState<RoadmapMilestoneResult[]>(
    (initialValues.milestoneResults ?? []).map(result => ({
      ...result,
      description: result.description ?? '',
      monthWeekLabel: result.monthWeekLabel ?? '',
      resultUrl: result.resultUrl ?? '',
      imageUrl: result.imageUrl ?? '',
    })),
  );
  const [finalResultTitle, setFinalResultTitle] = useState(initialValues.finalResultTitle ?? '');
  const [finalResultDescription, setFinalResultDescription] = useState(initialValues.finalResultDescription ?? '');
  const [finalResultUrl, setFinalResultUrl] = useState(initialValues.finalResultUrl ?? '');
  const [finalResultImageUrl, setFinalResultImageUrl] = useState(initialValues.finalResultImageUrl ?? '');
  const [milestoneAccordionOpenMap, setMilestoneAccordionOpenMap] = useState<Record<string, boolean>>(() => {
    const firstResult = (initialValues.milestoneResults ?? [])[0];
    return firstResult ? { [firstResult.id]: true } : {};
  });
  const [isMilestoneSectionOpen, setIsMilestoneSectionOpen] = useState(
    (initialValues.milestoneResults ?? []).length > 0,
  );
  const [isFinalResultSectionOpen, setIsFinalResultSectionOpen] = useState(
    Boolean(
      initialValues.finalResultTitle?.trim()
      || initialValues.finalResultDescription?.trim()
      || initialValues.finalResultUrl?.trim()
      || initialValues.finalResultImageUrl?.trim(),
    ),
  );
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

  const addMilestoneResult = () => {
    const newResult = createEmptyMilestoneResult();
    setMilestoneResults(previous => [...previous, newResult]);
    setMilestoneAccordionOpenMap(previous => ({ ...previous, [newResult.id]: true }));
    setIsMilestoneSectionOpen(true);
  };

  const toggleMilestoneAccordion = (resultId: string) => {
    setMilestoneAccordionOpenMap(previous => ({ ...previous, [resultId]: !previous[resultId] }));
  };

  const updateMilestoneResult = (resultId: string, patch: Partial<RoadmapMilestoneResult>) => {
    setMilestoneResults(previous => previous.map(result => (
      result.id === resultId ? { ...result, ...patch } : result
    )));
  };

  const removeMilestoneResult = (resultId: string) => {
    setMilestoneResults(previous => previous.filter(result => result.id !== resultId));
  };

  const updateMilestoneResultMonthWeek = (
    resultId: string,
    patch: { month?: number; week?: number },
  ) => {
    setMilestoneResults(previous => previous.map(result => {
      if (result.id !== resultId) return result;
      const parsed = parseMonthWeekLabel(result.monthWeekLabel);
      const nextMonth = patch.month ?? parsed.month ?? startMonth ?? MONTH_OPTIONS[0];
      const nextWeek = patch.week ?? parsed.week ?? WEEK_OPTIONS[0];
      return { ...result, monthWeekLabel: buildMilestoneMonthWeekLabel(nextMonth, nextWeek) };
    }));
  };

  const handleFinalResultImageFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const imageFile = event.target.files?.[0];
    if (!imageFile || !imageFile.type.startsWith('image/')) return;
    try {
      const imageDataUrl = await compressImageFile(imageFile);
      setFinalResultImageUrl(imageDataUrl);
    } finally {
      event.target.value = '';
    }
  };

  const handleMilestoneResultImageFileUpload = async (
    resultId: string,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const imageFile = event.target.files?.[0];
    if (!imageFile || !imageFile.type.startsWith('image/')) return;
    try {
      const imageDataUrl = await compressImageFile(imageFile);
      updateMilestoneResult(resultId, { imageUrl: imageDataUrl });
    } finally {
      event.target.value = '';
    }
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

                      <div className="space-y-2 rounded-xl bg-white/[0.03] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="text-[13px] font-bold px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: 'rgba(6,182,212,0.15)', color: '#67e8f9' }}
                            >
                              산출
                            </span>
                            <span className="text-xs text-gray-500">이 항목으로 만들어 낼 최종 산출물</span>
                          </div>
                          <input
                            value={item.targetOutput ?? ''}
                            onChange={event => updateItem(item.id, { targetOutput: event.target.value })}
                            placeholder="예: 탐구 계획서 A4 1장"
                            className="w-full h-10 px-3 rounded-lg text-sm text-white placeholder-gray-500 outline-none border-0 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="text-[13px] font-bold px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#6ee7b7' }}
                            >
                              기준
                            </span>
                            <span className="text-xs text-gray-500">완료를 판단하는 기준</span>
                          </div>
                          <input
                            value={item.successCriteria ?? ''}
                            onChange={event => updateItem(item.id, { successCriteria: event.target.value })}
                            placeholder="예: 탐구 질문 2개 이상, 가설 명시"
                            className="w-full h-10 px-3 rounded-lg text-sm text-white placeholder-gray-500 outline-none border-0 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                          />
                        </div>
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

          {/* 결과물 그룹 — 중간 결과 / 최종 결과 / 사진 첨부 */}
          <section className="space-y-2">
            <span className={roadmapEditorSectionLabelClassName}>📦 결과물 <span className="font-normal text-gray-600">(선택)</span></span>

            {/* 중간 결과물 섹션 - 아코디언 */}
            <RoadmapEditorGradientAccordionShell
              tone="sky"
              header={(
                <RoadmapEditorAccordionHeaderButton
                  isOpen={isMilestoneSectionOpen}
                  onToggle={() => setIsMilestoneSectionOpen(prev => !prev)}
                  icon="🏁"
                  title={LABELS.roadmapMilestoneResultSectionLabel ?? '중간 결과물'}
                  subtitle={milestoneResults.length > 0
                    ? `${milestoneResults.length}개 기록됨`
                    : '진행 중 만든 결과물을 기록해보세요'}
                  titleClassName="text-sky-200"
                  subtitleClassName="text-sky-400/75"
                  chevronClassName="text-sky-400"
                  trailing={milestoneResults.length > 0 ? (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-200">
                      {milestoneResults.length}
                    </span>
                  ) : undefined}
                />
              )}
              body={isMilestoneSectionOpen ? (
                <div className="px-3 pb-3 space-y-2">
                  {milestoneResults.length === 0 ? (
                    <div className={`${roadmapEditorSoftInsetPanelClassName} rounded-xl p-4 text-center space-y-2`}>
                      <p className="text-2xl">📸</p>
                      <p className="text-sm font-semibold text-sky-300/80">아직 기록된 중간 결과물이 없어요</p>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        데모, 발표자료, 프로토타입 등<br />작은 성과도 기록해두면 동기부여가 됩니다
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {milestoneResults.map((result, resultIndex) => {
                        const isOpen = milestoneAccordionOpenMap[result.id] ?? false;
                        const hasContent = result.title.trim().length > 0;
                        return (
                          <div key={result.id} className={`${roadmapEditorSoftInsetPanelClassName} rounded-xl overflow-hidden`}>
                            <div className="flex items-center">
                              <div
                                role="button"
                                tabIndex={0}
                                onClick={() => toggleMilestoneAccordion(result.id)}
                                onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') toggleMilestoneAccordion(result.id); }}
                                className="flex-1 flex items-center justify-between px-2.5 py-2 cursor-pointer min-w-0"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span
                                    className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: 'rgba(56,189,248,0.2)', color: '#7dd3fc', fontSize: 10 }}
                                  >
                                    {resultIndex + 1}
                                  </span>
                                  <span className="text-white truncate" style={{ fontSize: 11 }}>
                                    {hasContent ? result.title : `${LABELS.roadmapMilestoneResultItemLabel ?? '중간 결과물'} ${resultIndex + 1}`}
                                  </span>
                                  {result.monthWeekLabel && (
                                    <span className="text-sky-400/70 whitespace-nowrap flex-shrink-0" style={{ fontSize: 10 }}>
                                      {result.monthWeekLabel}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                                  {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" /> : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeMilestoneResult(result.id)}
                                className="w-8 h-8 mr-2 rounded-md flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>

                            {isOpen && (
                              <div className="px-2.5 pb-2 space-y-1.5 pt-1 border-t border-white/[0.06]">
                                <div className="pt-1.5">
                                  <input
                                    value={result.title}
                                    onChange={event => updateMilestoneResult(result.id, { title: event.target.value })}
                                    placeholder={LABELS.roadmapMilestoneResultTitlePlaceholder ?? '예: 1차 시제품 데모'}
                                    className="w-full px-2.5 py-1.5 rounded-lg text-[11px] text-white placeholder-gray-500 outline-none border-0 bg-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] min-h-[32px]"
                                  />
                                </div>
                                <textarea
                                  value={result.description ?? ''}
                                  onChange={event => updateMilestoneResult(result.id, { description: event.target.value })}
                                  placeholder={LABELS.roadmapMilestoneResultDescriptionPlaceholder ?? '어떤 결과물인지 간단히 적어주세요'}
                                  rows={2}
                                  className="w-full px-2.5 py-1.5 rounded-lg text-[11px] text-white placeholder-gray-500 outline-none resize-none border-0 bg-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                                />
                                <div className="grid grid-cols-2 gap-1.5">
                                  <label className="flex items-center gap-1.5 px-2 h-8 rounded-lg cursor-pointer bg-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                                    <span className="text-sky-400/70 whitespace-nowrap" style={{ fontSize: 10 }}>{LABELS.roadmapMilestoneResultMonthLabel ?? '월'}</span>
                                    <select
                                      value={parseMonthWeekLabel(result.monthWeekLabel).month ?? startMonth}
                                      onChange={event => updateMilestoneResultMonthWeek(result.id, { month: Number(event.target.value) })}
                                      className="w-full bg-transparent text-white outline-none"
                                      style={{ fontSize: 11 }}
                                    >
                                      {MONTH_OPTIONS.map(month => (
                                        <option key={`${result.id}-month-${month}`} value={month} className="bg-[#111827]">{month}월</option>
                                      ))}
                                    </select>
                                  </label>
                                  <label className="flex items-center gap-1.5 px-2 h-8 rounded-lg cursor-pointer bg-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                                    <span className="text-sky-400/70 whitespace-nowrap" style={{ fontSize: 10 }}>{LABELS.roadmapMilestoneResultWeekLabel ?? '주차'}</span>
                                    <select
                                      value={parseMonthWeekLabel(result.monthWeekLabel).week ?? WEEK_OPTIONS[0]}
                                      onChange={event => updateMilestoneResultMonthWeek(result.id, { week: Number(event.target.value) })}
                                      className="w-full bg-transparent text-white outline-none"
                                      style={{ fontSize: 11 }}
                                    >
                                      {WEEK_OPTIONS.map(week => (
                                        <option key={`${result.id}-week-${week}`} value={week} className="bg-[#111827]">{week}주차</option>
                                      ))}
                                    </select>
                                  </label>
                                </div>
                                <input
                                  value={result.resultUrl ?? ''}
                                  onChange={event => updateMilestoneResult(result.id, { resultUrl: event.target.value })}
                                  placeholder={LABELS.roadmapMilestoneResultUrlPlaceholder ?? '결과물 URL (예: https://...)'}
                                  className="w-full px-2.5 py-1.5 rounded-lg text-[11px] text-white placeholder-gray-500 outline-none border-0 bg-white/[0.05] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] min-h-[30px]"
                                />
                                <div className="rounded-lg p-2 space-y-1.5 bg-sky-500/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                                  <p className="text-sky-400/80 font-semibold" style={{ fontSize: 10 }}>📷 결과물 사진 첨부</p>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={event => { void handleMilestoneResultImageFileUpload(result.id, event); }}
                                    className="w-full text-sm text-gray-300 file:mr-2 file:px-2 file:py-1 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-sky-500/20 file:text-sky-200"
                                  />
                                  {result.imageUrl && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={result.imageUrl}
                                      alt={result.title || `${LABELS.roadmapMilestoneResultItemLabel ?? '중간 결과물'} ${resultIndex + 1}`}
                                      className="w-full max-h-32 object-cover rounded-lg ring-1 ring-white/10"
                                    />
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={addMilestoneResult}
                    className="w-full flex items-center justify-center gap-1.5 h-9 rounded-xl font-bold text-[11px] text-sky-200 bg-sky-500/15 hover:bg-sky-500/25 transition-colors shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  >
                    <Plus className="w-4 h-4" />
                    {LABELS.roadmapMilestoneResultAddButtonLabel ?? '중간 결과물 추가'}
                  </button>
                </div>
              ) : undefined}
            />

            {/* 최종 결과물 섹션 - 아코디언 */}
            <RoadmapEditorGradientAccordionShell
              tone="emerald"
              header={(
                <RoadmapEditorAccordionHeaderButton
                  isOpen={isFinalResultSectionOpen}
                  onToggle={() => setIsFinalResultSectionOpen(prev => !prev)}
                  icon="🏆"
                  title={LABELS.roadmapFinalResultSectionLabel ?? '최종 결과물'}
                  subtitle={finalResultTitle.trim().length > 0 ? finalResultTitle : '완성된 결과물을 자랑해보세요'}
                  titleClassName="text-emerald-200"
                  subtitleClassName="text-emerald-400/75"
                  chevronClassName="text-emerald-400"
                  trailing={(finalResultUrl.trim() || finalResultImageUrl.trim()) ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.55)]" />
                  ) : undefined}
                />
              )}
              body={isFinalResultSectionOpen ? (
                <div className="px-3 pb-3 space-y-2 border-t border-white/[0.06] pt-2">
                  <input
                    value={finalResultTitle}
                    onChange={event => setFinalResultTitle(event.target.value)}
                    placeholder={LABELS.roadmapFinalResultTitlePlaceholder ?? '예: SW 공모전 최종 제출작'}
                    className="w-full px-3 py-2 rounded-xl text-[11px] text-white placeholder-gray-500 outline-none border-0 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] min-h-[32px]"
                  />
                  <textarea
                    value={finalResultDescription}
                    onChange={event => setFinalResultDescription(event.target.value)}
                    placeholder={LABELS.roadmapFinalResultDescriptionPlaceholder ?? '무엇을 만들었고, 어떤 점이 핵심 결과인지 적어주세요'}
                    rows={3}
                    className="w-full px-3 py-2 rounded-xl text-[11px] text-white placeholder-gray-500 outline-none resize-none border-0 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                  />
                  <input
                    value={finalResultUrl}
                    onChange={event => setFinalResultUrl(event.target.value)}
                    placeholder={LABELS.roadmapFinalResultUrlPlaceholder ?? '결과물 URL (예: https://github.com/...)'}
                    className="w-full px-3 py-2 rounded-xl text-[11px] text-white placeholder-gray-500 outline-none border-0 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] min-h-[32px]"
                  />
                  <div className="rounded-xl p-2 space-y-1.5 bg-emerald-500/[0.07] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                    <p className="text-emerald-300/90 font-semibold text-[10px]">🖼️ 결과물 대표 이미지 첨부</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={event => { void handleFinalResultImageFileUpload(event); }}
                      className="w-full text-sm text-gray-300 file:mr-2 file:px-2 file:py-1 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-500/25 file:text-emerald-100"
                    />
                    {finalResultImageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={finalResultImageUrl}
                        alt={finalResultTitle || LABELS.roadmapFinalResultSectionLabel || '최종 결과물'}
                        className="w-full max-h-40 object-cover rounded-lg ring-1 ring-white/10"
                      />
                    )}
                  </div>
                  <p className="text-emerald-500/75 leading-relaxed text-[10px]">
                    {LABELS.roadmapFinalResultHint ?? '전체 공유는 결과물 URL 또는 이미지가 있을 때 가능해요.'}
                  </p>
                </div>
              ) : undefined}
            />
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
