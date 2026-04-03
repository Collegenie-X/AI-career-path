'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Calendar, Trash2,
  CheckCircle2, Circle, MoreHorizontal,
  ChevronDown, ChevronUp, ExternalLink,
  X,
} from 'lucide-react';
import { ITEM_TYPES } from '../config';
import { InlineTitle } from './TimelineInlineTitle';
import type { PlanItemWithCheck } from '../types/timelinePlanItemTypes';
import { CareerPathTimelineMyPathItemCard } from './CareerPathTimelineMyPathItemCard';
import {
  buildTimelineMonthLabelFromMonths,
  deriveMyPathTimelineExpandableState,
} from '../utils/careerPathTimelineItemDerivations';

export type { PlanItemWithCheck };

/* ─── Goal row ─── */
export function GoalRow({ goal, color, isEditMode, onSave, onDelete }: {
  goal: string; color: string; isEditMode: boolean;
  onSave: (v: string) => void; onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(goal);
  const inputRef = useRef<HTMLInputElement>(null);

  const commit = () => {
    const t = draft.trim();
    if (t) onSave(t); else onDelete();
    setEditing(false);
  };

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const handleClick = () => {
    if (!isEditMode) return;
    setDraft(goal);
    setEditing(true);
  };

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-xl group"
      style={{ backgroundColor: `${color}10`, border: `1px solid ${color}1e` }}
    >
      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') { setDraft(goal); setEditing(false); }
          }}
          className="flex-1 bg-transparent text-sm text-white outline-none"
        />
      ) : (
        <span
          className={`flex-1 text-sm text-white ${isEditMode ? 'cursor-text' : ''}`}
          onClick={handleClick}
        >
          {goal}
        </span>
      )}
      {isEditMode && (
        <button type="button" onClick={onDelete} className="opacity-0 group-hover:opacity-100 transition-opacity active:scale-90">
          <X style={{ width: 13, height: 13, color: '#ef4444' }} />
        </button>
      )}
    </div>
  );
}

/* ─── Item row (todo-style) — 커리어 타임라인: 설명·하위 트리 단일 아코디언 ─── */
export function ItemRow({
  item, color, isEditMode, showCheckbox = true, useLightBorder = false, onToggleCheck, onDelete, onTitleSave, onInfoClick, onToggleSubItemDone,
}: {
  item: PlanItemWithCheck; color: string; isEditMode: boolean; showCheckbox?: boolean;
  /** true: 내 패스 타임라인 — 테두리 아주 연하게 */
  useLightBorder?: boolean;
  onToggleCheck: () => void; onDelete: () => void;
  onTitleSave: (t: string) => void; onInfoClick: () => void;
  onToggleSubItemDone?: (itemId: string, subItemId: string) => void;
}) {
  const typeConf = ITEM_TYPES.find((t) => t.value === item.type);
  const checked = !!item.checked;
  const subItems = item.subItems ?? [];
  const [detailExpanded, setDetailExpanded] = useState(false);
  const [subExpanded, setSubExpanded] = useState(false);
  const doneCount = subItems.filter((s) => s.done).length;
  const monthLabel = buildTimelineMonthLabelFromMonths(item.months);

  const borderColor = useLightBorder ? '12' : '28';
  const isCareerPathFlat = useLightBorder;
  const typeAccent = typeConf?.color ?? color;
  const derived = deriveMyPathTimelineExpandableState(item, subItems.length);
  const { descTrim, organizerTrim, linkHref, linkLabel, hasExpandableDetails } = derived;

  const handleTitleActivate = () => {
    if (isEditMode) return;
    if (hasExpandableDetails) setDetailExpanded((v) => !v);
    else onInfoClick();
  };

  if (isCareerPathFlat) {
    return (
      <CareerPathTimelineMyPathItemCard
        item={item}
        color={color}
        checked={checked}
        showCheckbox={showCheckbox}
        isEditMode={isEditMode}
        detailExpanded={detailExpanded}
        setDetailExpanded={setDetailExpanded}
        monthLabel={monthLabel}
        descTrim={descTrim}
        organizerTrim={organizerTrim}
        linkHref={linkHref}
        linkLabel={linkLabel}
        hasExpandableDetails={hasExpandableDetails}
        subItems={subItems}
        doneCount={doneCount}
        onToggleCheck={onToggleCheck}
        onDelete={onDelete}
        onTitleSave={onTitleSave}
        onInfoClick={onInfoClick}
        onToggleSubItemDone={onToggleSubItemDone}
        handleTitleActivate={handleTitleActivate}
      />
    );
  }

  return (
    <div
      className="relative transition-all overflow-hidden rounded-xl"
      style={{
        backgroundColor: checked ? 'rgba(255,255,255,0.02)' : `${typeAccent}0e`,
        border: `1px solid ${checked ? 'rgba(255,255,255,0.04)' : typeAccent + borderColor}`,
        opacity: checked ? 0.5 : 1,
      }}
    >
      <div className="flex items-start gap-2.5 p-3">
        <div className="absolute -left-[42px] top-5 w-[42px] h-0.5" style={{ backgroundColor: `${color}28` }} />

        {showCheckbox && (
          <button type="button" onClick={onToggleCheck} className="flex-shrink-0 mt-0.5 transition-all active:scale-90"
            style={{ color: checked ? typeConf?.color ?? color : 'rgba(255,255,255,0.2)' }}>
            {checked ? <CheckCircle2 style={{ width: 18, height: 18 }} /> : <Circle style={{ width: 18, height: 18 }} />}
          </button>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {isEditMode ? (
                <InlineTitle value={item.title} color={typeConf?.color ?? color} onSave={onTitleSave} />
              ) : (
                <span
                  className="text-sm font-semibold text-white leading-snug cursor-pointer hover:underline decoration-dotted"
                  onClick={onInfoClick}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onInfoClick(); }}
                >
                  {item.title}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <span className="text-[12px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: `${typeConf?.color ?? color}22`, color: typeConf?.color ?? color }}>
              {typeConf?.label}
            </span>
            <span className="text-[12px] text-gray-500 flex items-center gap-0.5">
              <Calendar style={{ width: 10, height: 10 }} />{monthLabel}
            </span>
            {item.cost && item.cost !== '무료' && item.cost !== '자체 제작' && (
              <span className="text-[12px] text-gray-600">{item.cost}</span>
            )}
            {subItems.length > 0 && showCheckbox && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setSubExpanded((prev) => !prev); }}
                className="flex items-center gap-1.5 text-[12px] font-semibold transition-all rounded-lg px-2 py-1 -mx-1 hover:bg-white/5"
                style={{ color: subExpanded ? (typeConf?.color ?? color) : 'rgba(255,255,255,0.5)' }}
                title={subExpanded ? '하위 상세 접기' : '하위 상세 보기'}
              >
                {subExpanded ? <ChevronUp style={{ width: 12, height: 12 }} /> : <ChevronDown style={{ width: 12, height: 12 }} />}
                하위 {doneCount}/{subItems.length}
              </button>
            )}
          </div>
        </div>

        {isEditMode && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <button type="button" onClick={onInfoClick} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
              <MoreHorizontal style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.35)' }} />
            </button>
            <button type="button" onClick={onDelete} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90"
              style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
              <Trash2 style={{ width: 13, height: 13, color: '#ef4444' }} />
            </button>
          </div>
        )}
      </div>

      {showCheckbox && !isCareerPathFlat && subExpanded && subItems.length > 0 && (
        <div
          className="px-3 pb-3 pt-1 space-y-1.5"
          style={{ borderTop: `1px solid ${(typeConf?.color ?? color)}18` }}
        >
          {subItems.map((sub) => (
            <div
              key={sub.id}
              className="flex items-start gap-2 px-2.5 py-1.5 rounded-lg"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
            >
              {onToggleSubItemDone ? (
                <button
                  type="button"
                  onClick={() => onToggleSubItemDone(item.id, sub.id)}
                  className="flex-shrink-0 transition-all active:scale-90 mt-0.5"
                  style={{ color: sub.done ? typeConf?.color ?? color : 'rgba(255,255,255,0.2)' }}
                >
                  {sub.done ? <CheckCircle2 style={{ width: 14, height: 14 }} /> : <Circle style={{ width: 14, height: 14 }} />}
                </button>
              ) : (
                <div className="flex-shrink-0 mt-0.5">
                  {sub.done ? <CheckCircle2 style={{ width: 14, height: 14, color: typeConf?.color ?? color }} />
                    : <Circle style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.2)' }} />}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span
                  className="text-xs leading-snug"
                  style={{
                    color: sub.done ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.8)',
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
                    <ExternalLink style={{ width: 9, height: 9 }} />
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

export { QuickAddItem } from './TimelineQuickAddItem';
