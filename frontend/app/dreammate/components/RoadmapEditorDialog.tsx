'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, X } from 'lucide-react';
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

function createEmptyItem(): RoadmapItem {
  return {
    id: `draft-item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: 'activity',
    title: '',
    months: [3],
    difficulty: 3,
    subItems: [],
  };
}

function createEmptySubItem(): RoadmapTodoItem {
  return {
    id: `draft-sub-item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    weekNumber: 1,
    title: '',
    isDone: false,
  };
}

function extractWeekNumber(todoItem: RoadmapTodoItem): number {
  if (typeof todoItem.weekNumber === 'number' && todoItem.weekNumber > 0) {
    return todoItem.weekNumber;
  }
  const parsed = Number((todoItem.weekLabel ?? '').replace(/[^0-9]/g, ''));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
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
  const [groupIds, setGroupIds] = useState<string[]>(initialValues.groupIds);
  const [items, setItems] = useState<RoadmapItem[]>(
    initialValues.items.length > 0 ? initialValues.items : [createEmptyItem()],
  );

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

  const updateItem = (itemId: string, patch: Partial<RoadmapItem>) => {
    setItems(prev => prev.map(item => item.id === itemId ? { ...item, ...patch } : item));
  };

  const toggleMonth = (itemId: string, month: number) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const exists = item.months.includes(month);
      const updatedMonths = exists ? item.months.filter(value => value !== month) : [...item.months, month];
      return { ...item, months: updatedMonths.sort((a, b) => a - b) };
    }));
  };

  const removeItem = (itemId: string) => {
    setItems(prev => prev.length === 1 ? prev : prev.filter(item => item.id !== itemId));
  };

  const addSubItem = (itemId: string) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const currentSubItems = item.subItems ?? [];
      const highestWeekNumber = currentSubItems.reduce((highest, subItem) => (
        Math.max(highest, extractWeekNumber(subItem))
      ), 0);
      return {
        ...item,
        subItems: [...currentSubItems, { ...createEmptySubItem(), weekNumber: highestWeekNumber + 1 }],
      };
    }));
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

  const handleSubmit = () => {
    const normalizedItems = items
      .map(item => ({
        ...item,
        title: item.title.trim(),
        months: item.months.length > 0 ? item.months : [3],
        subItems: (item.subItems ?? [])
          .map(subItem => ({
            ...subItem,
            weekNumber: extractWeekNumber(subItem),
            weekLabel: undefined,
            title: subItem.title.trim(),
          }))
          .filter(subItem => subItem.title.length > 0),
      }))
      .filter(item => item.title.length > 1);

    if (roadmapTitle.trim().length <= 1 || normalizedItems.length === 0) {
      return;
    }

    onSubmit({
      title: roadmapTitle.trim(),
      description: description.trim(),
      period,
      starColor,
      focusItemTypes,
      groupIds,
      items: normalizedItems,
    });
  };

  const createRoadmapTitleAutoComplete = () => {
    const categoryLabels = DREAM_ITEM_TYPES
      .filter(itemType => focusItemTypes.includes(itemType.value))
      .map(itemType => itemType.label);
    const categoryText = categoryLabels.join('/');
    const periodText = periodOptions.find(option => option.id === period)?.label ?? period;
    const template = ROADMAP_TITLE_AUTOCOMPLETE_TEMPLATES[
      Math.floor(Math.random() * Math.max(ROADMAP_TITLE_AUTOCOMPLETE_TEMPLATES.length, 1))
    ] ?? '{period} {category} WBS 로드맵';
    setRoadmapTitle(template.replaceAll('{period}', periodText).replaceAll('{category}', categoryText));
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
              <label className="text-xs font-bold text-gray-400">로드맵 제목</label>
              <button
                onClick={createRoadmapTitleAutoComplete}
                className="text-[10px] font-bold px-2 py-1 rounded-md"
                style={{ backgroundColor: 'rgba(59,130,246,0.2)', color: '#93c5fd' }}
              >
                {LABELS.autoCompleteButton}
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
                className="text-[10px] font-bold px-2 py-1 rounded-md"
                style={{ backgroundColor: 'rgba(59,130,246,0.2)', color: '#93c5fd' }}
              >
                {LABELS.autoCompleteButton}
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
              <label className="text-xs font-bold text-gray-400">로드맵 항목</label>
              <button
                onClick={() => setItems(prev => [...prev, createEmptyItem()])}
                className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg"
                style={{ backgroundColor: 'rgba(108,92,231,0.2)', color: '#c4b5fd' }}
              >
                <Plus className="w-3.5 h-3.5" />
                항목 추가
              </button>
            </div>

            {items.map(item => (
              <div
                key={item.id}
                className="rounded-xl p-3 space-y-2"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-center gap-2">
                  <input
                    value={item.title}
                    onChange={event => updateItem(item.id, { title: event.target.value })}
                    placeholder="항목명 입력"
                    className="flex-1 h-9 px-3 rounded-lg text-xs text-white placeholder-gray-600 outline-none"
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                  <button
                    onClick={() => createRoadmapItemTitleAutoComplete(item.id, item.type)}
                    className="h-9 px-2 rounded-lg text-[10px] font-bold"
                    style={{ backgroundColor: 'rgba(59,130,246,0.2)', color: '#93c5fd' }}
                  >
                    {LABELS.autoCompleteButton}
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={item.type}
                    onChange={event => updateItem(item.id, { type: event.target.value as DreamItemType })}
                    className="h-9 px-2 rounded-lg text-xs text-white outline-none"
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    {DREAM_ITEM_TYPES.map(type => (
                      <option key={type.value} value={type.value} className="bg-slate-800">
                        {type.emoji} {type.label}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={item.difficulty}
                    onChange={event => updateItem(item.id, { difficulty: Number(event.target.value) || 1 })}
                    className="h-9 px-3 rounded-lg text-xs text-white outline-none"
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                    placeholder="난이도(1~5)"
                  />
                </div>

                <div className="flex flex-wrap gap-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => {
                    const selected = item.months.includes(month);
                    return (
                      <button
                        key={month}
                        onClick={() => toggleMonth(item.id, month)}
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

                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400">{LABELS.todoSectionLabel} · {LABELS.weeklyChecklistLabel}</span>
                    <button
                      onClick={() => addSubItem(item.id)}
                      className="text-[10px] font-bold px-2 py-1 rounded-md"
                      style={{ backgroundColor: 'rgba(59,130,246,0.2)', color: '#93c5fd' }}
                    >
                      + 주차 추가
                    </button>
                  </div>
                  {(item.subItems ?? []).length === 0 ? (
                    <p className="text-[10px] text-gray-600">세부 Todo를 추가하면 목표-그룹-하위 구조로 보여요.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {(item.subItems ?? []).map(subItem => (
                        <div
                          key={subItem.id}
                          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5"
                          style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                        >
                          <button
                            onClick={() => updateSubItem(item.id, subItem.id, { isDone: !subItem.isDone })}
                            className="flex-shrink-0"
                          >
                            {subItem.isDone
                              ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              : <Circle className="w-3.5 h-3.5 text-gray-500" />}
                          </button>
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min={1}
                              value={extractWeekNumber(subItem)}
                              onChange={event => updateSubItem(item.id, subItem.id, {
                                weekNumber: Math.max(1, Number(event.target.value) || 1),
                              })}
                              className="w-12 h-7 px-1.5 rounded-md text-[10px] text-white outline-none"
                              style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                            />
                            <span className="text-[10px] text-gray-500">{LABELS.weeklyNumberLabel}</span>
                          </div>
                          <input
                            value={subItem.title}
                            onChange={event => updateSubItem(item.id, subItem.id, { title: event.target.value })}
                            placeholder="예: 탐구 보고서 초안 작성"
                            list={`todo-autocomplete-${item.id}`}
                            className="flex-1 h-7 px-2 rounded-md text-[11px] text-white placeholder-gray-600 outline-none"
                            style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
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
            ))}
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

