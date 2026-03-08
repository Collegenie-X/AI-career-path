'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Calendar, Target, Pencil, Plus, Trash2, Check,
  CheckCircle2, Circle, ChevronDown, X, MoreHorizontal,
  Share2, Globe, Eye, EyeOff, Shield,
} from 'lucide-react';
import { ITEM_TYPES, GRADE_YEARS } from '../config';
import type { CareerPlan, PlanItem, YearPlan, PlanGroup } from './CareerPathBuilder';
import { ItemDetailDialog } from './ItemDetailDialog';
import { ShareSettingsDialog } from './community/ShareSettingsDialog';
import type { ShareType } from './community/types';

/* ─── Types ─── */
type PlanItemWithCheck = PlanItem & { checked?: boolean };

type Props = {
  allPlans: CareerPlan[];
  onEdit: (plan: CareerPlan) => void;
  onUpdatePlan: (plan: CareerPlan) => void;
  onDeletePlan: (planId: string) => void;
  onNewPlan: () => void;
  onSharePlan?: (plan: CareerPlan, isPublic: boolean, shareType?: string) => void;
};

/* ─── Inline editable title ─── */
function InlineTitle({ value, color, onSave }: { value: string; color: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const commit = () => {
    const t = draft.trim();
    if (t) onSave(t); else setDraft(value);
    setEditing(false);
  };

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') { setDraft(value); setEditing(false); }
        }}
        className="flex-1 bg-transparent text-sm font-semibold text-white outline-none border-b pb-0.5"
        style={{ borderColor: color }}
      />
    );
  }
  return (
    <span
      className="flex-1 text-sm font-semibold text-white leading-snug cursor-text"
      onClick={() => { setDraft(value); setEditing(true); }}
    >
      {value}
    </span>
  );
}

/* ─── Goal row ─── */
function GoalRow({ goal, color, isEditMode, onSave, onDelete }: {
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
        <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 transition-opacity active:scale-90">
          <X style={{ width: 13, height: 13, color: '#ef4444' }} />
        </button>
      )}
    </div>
  );
}

/* ─── Item row (todo-style) ─── */
function ItemRow({
  item, color, isEditMode, onToggleCheck, onDelete, onTitleSave, onInfoClick,
}: {
  item: PlanItemWithCheck; color: string; isEditMode: boolean;
  onToggleCheck: () => void; onDelete: () => void;
  onTitleSave: (t: string) => void; onInfoClick: () => void;
}) {
  const typeConf = ITEM_TYPES.find((t) => t.value === item.type);
  const checked = !!item.checked;
  const monthLabel =
    item.months.length === 1 ? `${item.months[0]}월`
    : item.months.length <= 3 ? item.months.map((m) => `${m}월`).join('·')
    : `${item.months[0]}~${item.months[item.months.length - 1]}월`;

  return (
    <div
      className="relative flex items-start gap-2.5 p-3 rounded-xl transition-all"
      style={{
        backgroundColor: checked ? 'rgba(255,255,255,0.02)' : `${typeConf?.color ?? color}0e`,
        border: `1px solid ${checked ? 'rgba(255,255,255,0.06)' : (typeConf?.color ?? color) + '28'}`,
        opacity: checked ? 0.5 : 1,
      }}
    >
      {/* Branch connector */}
      <div className="absolute -left-[42px] top-5 w-[42px] h-0.5" style={{ backgroundColor: `${color}28` }} />

      {/* Checkbox (항상 표시 — todo 체크) */}
      <button onClick={onToggleCheck} className="flex-shrink-0 mt-0.5 transition-all active:scale-90"
        style={{ color: checked ? typeConf?.color ?? color : 'rgba(255,255,255,0.2)' }}>
        {checked ? <CheckCircle2 style={{ width: 18, height: 18 }} /> : <Circle style={{ width: 18, height: 18 }} />}
      </button>

      {/* Type icon */}
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ backgroundColor: `${typeConf?.color ?? color}1a`, border: `1px solid ${typeConf?.color ?? color}30` }}>
        {typeConf?.emoji ?? '📌'}
      </div>

      {/* Content */}
      <div
        className="flex-1 min-w-0"
        onClick={!isEditMode ? onInfoClick : undefined}
        role={!isEditMode ? 'button' : undefined}
        tabIndex={!isEditMode ? 0 : undefined}
        onKeyDown={!isEditMode ? (e) => { if (e.key === 'Enter' || e.key === ' ') onInfoClick(); } : undefined}
      >
        {isEditMode ? (
          <InlineTitle value={item.title} color={typeConf?.color ?? color} onSave={onTitleSave} />
        ) : (
          <span className="text-sm font-semibold text-white leading-snug cursor-pointer hover:underline decoration-dotted" title="탭하여 상세 보기">{item.title}</span>
        )}
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ backgroundColor: `${typeConf?.color ?? color}22`, color: typeConf?.color ?? color }}>
            {typeConf?.label}
          </span>
          <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
            <Calendar style={{ width: 10, height: 10 }} />{monthLabel}
          </span>
          {item.cost && item.cost !== '무료' && item.cost !== '자체 제작' && (
            <span className="text-[10px] text-gray-600">{item.cost}</span>
          )}
        </div>
      </div>

      {/* Actions — 수정 모드에서만 삭제/상세 버튼 표시 */}
      {isEditMode && (
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={onInfoClick} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
            <MoreHorizontal style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.35)' }} />
          </button>
          <button onClick={onDelete} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90"
            style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
            <Trash2 style={{ width: 13, height: 13, color: '#ef4444' }} />
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Quick add item ─── */
function QuickAddItem({ color, onAdd }: { color: string; onAdd: (title: string, type: PlanItem['type']) => void }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<PlanItem['type']>('activity');
  const inputRef = useRef<HTMLInputElement>(null);

  const commit = () => {
    if (title.trim()) { onAdd(title.trim(), type); setTitle(''); setOpen(false); }
  };

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all active:scale-[0.99]"
        style={{ border: `1px dashed ${color}35`, color: `${color}99`, backgroundColor: `${color}06` }}>
        <Plus style={{ width: 14, height: 14 }} />항목 추가
      </button>
    );
  }

  return (
    <div className="rounded-xl p-3 space-y-2.5" style={{ border: `1.5px solid ${color}44`, backgroundColor: `${color}0a` }}>
      <div className="flex gap-1.5">
        {ITEM_TYPES.map((t) => (
          <button key={t.value} onClick={() => setType(t.value)}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold transition-all"
            style={type === t.value ? { backgroundColor: t.color, color: '#fff' } : { backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input ref={inputRef} value={title} onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setOpen(false); setTitle(''); } }}
          placeholder="항목 이름 입력..."
          className="flex-1 h-9 px-3 rounded-xl text-sm text-white placeholder-gray-600 outline-none"
          style={{ backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }} />
        <button onClick={commit} disabled={!title.trim()}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30"
          style={{ backgroundColor: color }}>
          <Check style={{ width: 16, height: 16, color: '#fff' }} />
        </button>
        <button onClick={() => { setOpen(false); setTitle(''); }}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
          <X style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.4)' }} />
        </button>
      </div>
    </div>
  );
}

/* ─── Year node (timeline branch) ─── */
function YearTimelineNode({
  year, color, isLast, isEditMode, onUpdateYear, onItemInfoClick,
}: {
  year: YearPlan & { items: PlanItemWithCheck[] };
  color: string; isLast: boolean; isEditMode: boolean;
  onUpdateYear: (y: YearPlan) => void;
  onItemInfoClick: (item: PlanItem, gradeLabel: string) => void;
}) {
  const grade = GRADE_YEARS.find((g) => g.id === year.gradeId);
  const groupItems = (year.groups ?? []).flatMap(g => g.items) as PlanItemWithCheck[];
  const checkedCount = [
    ...year.items.filter((it) => (it as PlanItemWithCheck).checked),
    ...groupItems.filter(it => it.checked),
  ].length;
  const totalCount = year.items.length + groupItems.length;

  const toggleCheck = (itemId: string) =>
    onUpdateYear({ ...year, items: year.items.map((it) => it.id === itemId ? { ...it, checked: !(it as PlanItemWithCheck).checked } : it) });

  const toggleCheckInGroup = (groupId: string, itemId: string) => {
    const groups = (year.groups ?? []).map(g =>
      g.id === groupId
        ? { ...g, items: g.items.map(it => it.id === itemId ? { ...it, checked: !(it as PlanItemWithCheck).checked } : it) }
        : g
    );
    onUpdateYear({ ...year, groups });
  };

  const deleteItem = (itemId: string) =>
    onUpdateYear({ ...year, items: year.items.filter((it) => it.id !== itemId) });

  const deleteItemFromGroup = (groupId: string, itemId: string) => {
    const groups = (year.groups ?? []).map(g =>
      g.id === groupId ? { ...g, items: g.items.filter(it => it.id !== itemId) } : g
    );
    onUpdateYear({ ...year, groups });
  };

  const saveItemTitle = (itemId: string, title: string) =>
    onUpdateYear({ ...year, items: year.items.map((it) => it.id === itemId ? { ...it, title } : it) });

  const saveItemTitleInGroup = (groupId: string, itemId: string, title: string) => {
    const groups = (year.groups ?? []).map(g =>
      g.id === groupId ? { ...g, items: g.items.map(it => it.id === itemId ? { ...it, title } : it) } : g
    );
    onUpdateYear({ ...year, groups });
  };

  const addItem = (title: string, type: PlanItem['type']) => {
    const newItem: PlanItemWithCheck = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      type, title, months: [3], difficulty: 2, cost: '무료', organizer: '',
    };
    onUpdateYear({ ...year, items: [...year.items, newItem] });
  };

  const saveGoal = (idx: number, value: string) => {
    const goals = [...year.goals]; goals[idx] = value;
    onUpdateYear({ ...year, goals });
  };

  const deleteGoal = (idx: number) =>
    onUpdateYear({ ...year, goals: year.goals.filter((_, i) => i !== idx) });

  return (
    <div className="relative pl-14 pb-6">
      {/* Grade circle */}
      <div className="absolute left-0 top-0 w-11 h-11 rounded-full flex items-center justify-center text-sm font-black z-10 select-none"
        style={{ backgroundColor: color, color: '#fff', boxShadow: `0 0 0 4px rgba(10,10,30,1), 0 0 14px ${color}55` }}>
        {year.gradeLabel}
      </div>

      <div className="space-y-3">
        {/* Header */}
        <div className="pt-1.5 flex items-start justify-between gap-2">
          <div>
            <div className="text-base font-bold text-white">{grade?.fullLabel ?? year.gradeLabel}</div>
            <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
              {totalCount > 0 && <span>{checkedCount}/{totalCount} 완료</span>}
              {year.goals.length > 0 && <span>{year.goals.length}개 목표</span>}
            </div>
          </div>
          {totalCount > 0 && (
            <div className="flex-shrink-0 mt-2">
              <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(checkedCount / totalCount) * 100}%`, backgroundColor: color }} />
              </div>
            </div>
          )}
        </div>

        {/* Goals */}
        {year.goals.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                <Target style={{ width: 12, height: 12 }} />목표
              </div>
              {isEditMode && (
                <button onClick={() => onUpdateYear({ ...year, goals: [...year.goals, '새 목표'] })}
                  className="text-[10px] font-bold" style={{ color: `${color}99` }}>+ 추가</button>
              )}
            </div>
            {year.goals.map((goal, idx) => (
              <GoalRow key={idx} goal={goal} color={color} isEditMode={isEditMode}
                onSave={(v) => saveGoal(idx, v)} onDelete={() => deleteGoal(idx)} />
            ))}
          </div>
        )}

        {/* Groups */}
        {(year.groups ?? []).length > 0 && (
          <div className="space-y-2">
            {(year.groups ?? []).map((group) => (
              <div key={group.id} className="rounded-2xl overflow-hidden"
                style={{ border: `1px solid ${color}28`, backgroundColor: `${color}06` }}>
                <div className="flex items-center gap-2 px-3 py-2"
                  style={{ borderBottom: group.items.length > 0 ? `1px solid ${color}18` : 'none' }}>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="flex-1 text-xs font-bold" style={{ color }}>{group.label}</span>
                  <span className="text-[10px] text-gray-600">{group.items.length}개</span>
                </div>
                {group.items.length > 0 && (
                  <div className="px-3 py-2 space-y-1.5">
                    {(group.items as PlanItemWithCheck[]).map((item) => (
                      <ItemRow
                        key={item.id}
                        item={item}
                        color={color}
                        isEditMode={isEditMode}
                        onToggleCheck={() => toggleCheckInGroup(group.id, item.id)}
                        onDelete={() => deleteItemFromGroup(group.id, item.id)}
                        onTitleSave={(title) => saveItemTitleInGroup(group.id, item.id, title)}
                        onInfoClick={() => onItemInfoClick(item, year.gradeLabel)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Ungrouped items */}
        <div className="space-y-2">
          {year.items.map((item) => (
            <ItemRow key={item.id} item={item} color={color} isEditMode={isEditMode}
              onToggleCheck={() => toggleCheck(item.id)}
              onDelete={() => deleteItem(item.id)}
              onTitleSave={(title) => saveItemTitle(item.id, title)}
              onInfoClick={() => onItemInfoClick(item, year.gradeLabel)} />
          ))}
          {isEditMode && <QuickAddItem color={color} onAdd={addItem} />}
        </div>

        {year.items.length === 0 && year.goals.length === 0 && (year.groups ?? []).length === 0 && isEditMode && (
          <div className="text-center py-3 rounded-xl"
            style={{ border: `1px dashed ${color}28`, backgroundColor: `${color}05` }}>
            <p className="text-xs text-gray-500">항목을 추가해 보세요</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Single plan accordion card ─── */
function PlanAccordionCard({
  plan, isOpen, onToggle, onEdit, onDelete, onUpdatePlan, onItemInfoClick, onShare,
}: {
  plan: CareerPlan; isOpen: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onUpdatePlan: (p: CareerPlan) => void;
  onItemInfoClick: (item: PlanItem, gradeLabel: string) => void;
  onShare: (isPublic: boolean, shareType?: ShareType) => void;
}) {
  const gradeOrder = GRADE_YEARS.reduce((acc, g, i) => { acc[g.id] = i; return acc; }, {} as Record<string, number>);
  const sortedYears = [...plan.years].sort((a, b) => (gradeOrder[a.gradeId] ?? 0) - (gradeOrder[b.gradeId] ?? 0));

  const totalItems = plan.years.reduce((s, y) => s + y.items.length, 0);
  const checkedItems = plan.years.reduce((s, y) => s + y.items.filter((it) => (it as PlanItemWithCheck).checked).length, 0);

  const updateYear = (updatedYear: YearPlan) =>
    onUpdatePlan({ ...plan, years: plan.years.map((y) => y.gradeId === updatedYear.gradeId ? updatedYear : y) });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showShareSettings, setShowShareSettings] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(plan.title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const commitTitle = () => {
    const t = titleDraft.trim();
    if (t && t !== plan.title) onUpdatePlan({ ...plan, title: t });
    else setTitleDraft(plan.title);
    setEditingTitle(false);
  };

  useEffect(() => { if (editingTitle) titleInputRef.current?.focus(); }, [editingTitle]);
  useEffect(() => { if (!editingTitle) setTitleDraft(plan.title); }, [plan.title, editingTitle]);

  const handleOpenShareSettings = () => {
    setShowShareSettings(true);
  };

  const handleShareConfirm = (selectedShareType: ShareType) => {
    onShare(true, selectedShareType);
    setShowShareSettings(false);
  };

  const handleMakePrivate = () => {
    onShare(false, undefined);
    setShowShareSettings(false);
  };

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        border: `1.5px solid ${isOpen ? plan.starColor + '55' : 'rgba(255,255,255,0.08)'}`,
        background: isOpen
          ? `linear-gradient(180deg, ${plan.starColor}14 0%, ${plan.starColor}06 100%)`
          : 'rgba(255,255,255,0.03)',
      }}
    >
      {/* ── Header row (always visible) ── */}
      <div
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all cursor-pointer"
        onClick={(e) => {
          if ((e.target as HTMLElement).closest('input')) return;
          onToggle();
        }}
      >
        {/* Job emoji */}
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{
            background: isOpen
              ? `linear-gradient(135deg, ${plan.starColor}33, ${plan.starColor}18)`
              : 'rgba(255,255,255,0.06)',
            border: isOpen ? `1.5px solid ${plan.starColor}55` : '1.5px solid rgba(255,255,255,0.1)',
          }}
        >
          {plan.jobEmoji}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* 제목: 뷰 모드에서는 읽기 전용, 수정 모드에서만 인라인 편집 */}
          {editingTitle ? (
            <input
              ref={titleInputRef}
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitTitle();
                if (e.key === 'Escape') { setTitleDraft(plan.title); setEditingTitle(false); }
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-transparent text-sm font-bold text-white outline-none border-b pb-0.5"
              style={{ borderColor: plan.starColor }}
              autoFocus
            />
          ) : (
            <div
              className={`font-bold text-white text-sm leading-snug truncate ${isEditMode ? 'cursor-text' : ''}`}
              onClick={isEditMode ? (e) => { e.stopPropagation(); setTitleDraft(plan.title); setEditingTitle(true); } : undefined}
              title={isEditMode ? '클릭하여 제목 수정' : undefined}
            >
              {plan.title}
            </div>
          )}
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[10px] font-semibold" style={{ color: `${plan.starColor}cc` }}>
              {plan.starEmoji} {plan.starName}
            </span>
            <span className="text-[10px] text-gray-600">·</span>
            <span className="text-[10px] text-gray-500">{plan.years.length}개 학년</span>
            {totalItems > 0 && (
              <>
                <span className="text-[10px] text-gray-600">·</span>
                <span className="text-[10px] text-gray-500">{checkedItems}/{totalItems} 완료</span>
              </>
            )}
          </div>
          {/* Mini progress bar */}
          {totalItems > 0 && (
            <div className="mt-1.5 w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(checkedItems / totalItems) * 100}%`, backgroundColor: plan.starColor }} />
            </div>
          )}
        </div>

        {/* Chevron */}
        <ChevronDown
          className="flex-shrink-0 transition-transform duration-200"
          style={{
            width: 18, height: 18,
            color: isOpen ? plan.starColor : 'rgba(255,255,255,0.3)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </div>

      {/* ── Expanded body ── */}
      {isOpen && (
        <div style={{ borderTop: `1px solid ${plan.starColor}22` }}>
          {/* Action bar */}
          <div className="px-4 py-3 space-y-2">
            <div className="flex gap-2">
              {isEditMode ? (
                <>
                  <button onClick={() => setIsEditMode(false)}
                    className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-bold transition-all active:scale-95"
                    style={{ backgroundColor: `${plan.starColor}25`, color: plan.starColor, border: `1px solid ${plan.starColor}44` }}>
                    <Check style={{ width: 13, height: 13 }} />수정 완료
                  </button>
                  <button onClick={onEdit}
                    className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl text-xs font-bold transition-all active:scale-95"
                    style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.12)' }}>
                    <Pencil style={{ width: 13, height: 13 }} />전체 수정
                  </button>
                </>
              ) : (
                <button onClick={() => setIsEditMode(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-bold transition-all active:scale-95"
                  style={{ backgroundColor: `${plan.starColor}22`, color: plan.starColor, border: `1px solid ${plan.starColor}44` }}>
                  <Pencil style={{ width: 13, height: 13 }} />수정하기
                </button>
              )}

              {/* 공유 설정 버튼 */}
              <button
                onClick={handleOpenShareSettings}
                className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl text-xs font-bold transition-all active:scale-95"
                style={plan.isPublic
                  ? plan.shareType === 'operator'
                    ? { backgroundColor: 'rgba(108,92,231,0.18)', color: '#a78bfa', border: '1px solid rgba(108,92,231,0.4)' }
                    : { backgroundColor: 'rgba(34,197,94,0.18)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.4)' }
                  : { backgroundColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.12)' }
                }
              >
                {plan.isPublic
                  ? plan.shareType === 'operator'
                    ? <><Shield style={{ width: 13, height: 13 }} />운영자 공유</>
                    : <><Globe style={{ width: 13, height: 13 }} />전체 공유</>
                  : <><Share2 style={{ width: 13, height: 13 }} />공유</>
                }
              </button>

              {!showDeleteConfirm ? (
                <button onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl text-xs font-bold transition-all active:scale-95"
                  style={{ backgroundColor: 'rgba(239,68,68,0.12)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.28)' }}>
                  <Trash2 style={{ width: 13, height: 13 }} />삭제
                </button>
              ) : (
                <div className="flex gap-1.5">
                  <button onClick={() => setShowDeleteConfirm(false)}
                    className="h-9 px-3 rounded-xl text-xs font-semibold"
                    style={{ backgroundColor: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}>
                    취소
                  </button>
                  <button onClick={onDelete}
                    className="h-9 px-3 rounded-xl text-xs font-bold"
                    style={{ backgroundColor: '#ef4444', color: '#fff' }}>
                    삭제 확인
                  </button>
                </div>
              )}
            </div>

            {/* 공개 상태 표시 배너 */}
            {plan.isPublic && (
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                style={{
                  backgroundColor: plan.shareType === 'operator' ? 'rgba(108,92,231,0.08)' : 'rgba(34,197,94,0.08)',
                  border: `1px solid ${plan.shareType === 'operator' ? 'rgba(108,92,231,0.2)' : 'rgba(34,197,94,0.2)'}`,
                }}>
                {plan.shareType === 'operator'
                  ? <Shield style={{ width: 14, height: 14, color: '#a78bfa', flexShrink: 0 }} />
                  : <Globe style={{ width: 14, height: 14, color: '#22C55E', flexShrink: 0 }} />
                }
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-white">
                    {plan.shareType === 'operator' ? '운영자에게 공유됨' : '커뮤니티에 공개됨'}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {plan.shareType === 'operator'
                      ? '진로 선생님이 확인하고 코멘트를 남길 수 있어요'
                      : '같은 학교 친구들이 보고 코멘트를 남길 수 있어요'
                    }
                  </div>
                </div>
                <button
                  onClick={handleMakePrivate}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold flex-shrink-0 transition-all active:scale-95"
                  style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>
                  <EyeOff style={{ width: 11, height: 11 }} />비공개
                </button>
              </div>
            )}

            {/* 공유 설정 다이얼로그 */}
            {showShareSettings && (
              <ShareSettingsDialog
                planTitle={plan.title}
                currentShareType={plan.isPublic ? (plan.shareType as ShareType ?? 'public') : null}
                onConfirm={handleShareConfirm}
                onMakePrivate={handleMakePrivate}
                onClose={() => setShowShareSettings(false)}
              />
            )}
          </div>

          {/* Vertical timeline */}
          <div className="relative px-4 pb-4">
            {/* Vertical line */}
            <div className="absolute left-[38px] top-0 bottom-4 w-0.5"
              style={{ backgroundColor: `${plan.starColor}28` }} />
            {isEditMode && (
              <div className="mb-3 px-3 py-2 rounded-xl text-xs font-semibold"
                style={{ border: `1px solid ${plan.starColor}30`, backgroundColor: `${plan.starColor}0a`, color: `${plan.starColor}cc` }}>
                ✏️ 부분 수정 — 제목·목표·항목 탭하여 수정, 전체 수정은 빌더에서
              </div>
            )}

            <div className="space-y-0">
              {sortedYears.map((year, idx) => (
                <YearTimelineNode
                  key={year.gradeId}
                  year={year as YearPlan & { items: PlanItemWithCheck[] }}
                  color={plan.starColor}
                  isLast={idx === sortedYears.length - 1}
                  isEditMode={isEditMode}
                  onUpdateYear={updateYear}
                  onItemInfoClick={onItemInfoClick}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main export ─── */
export function VerticalTimelineList({ allPlans, onEdit, onUpdatePlan, onDeletePlan, onNewPlan, onSharePlan }: Props) {
  const [openPlanId, setOpenPlanId] = useState<string | null>(allPlans[0]?.id ?? null);
  const [detailItem, setDetailItem] = useState<{ item: PlanItem; gradeLabel: string } | null>(null);

  const toggle = (planId: string) =>
    setOpenPlanId((prev) => (prev === planId ? null : planId));

  if (allPlans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
        <div className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #6C5CE722, #6C5CE708)', border: '1px solid #6C5CE733' }}>
          <span className="text-4xl">🗺️</span>
        </div>
        <div>
          <div className="text-base font-bold text-white">아직 커리어 패스가 없어요</div>
          <div className="text-sm text-gray-400 mt-1">빌더에서 나만의 로드맵을 만들어보세요</div>
        </div>
        <button onClick={onNewPlan}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #6C5CE7, #a855f7)', boxShadow: '0 4px 20px rgba(108,92,231,0.4)' }}>
          <Plus style={{ width: 16, height: 16 }} />커리어 패스 만들기
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          내 커리어 패스 ({allPlans.length})
        </div>
        <button onClick={onNewPlan}
          className="flex items-center gap-1.5 px-1.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #6C5CE7, #a855f7)', color: '#fff' }}>
          <Plus style={{ width: 18, height: 18 }} />
        </button>
      </div>

      {/* Accordion list */}
      {allPlans.map((plan) => (
        <PlanAccordionCard
          key={plan.id}
          plan={plan}
          isOpen={openPlanId === plan.id}
          onToggle={() => toggle(plan.id)}
          onEdit={() => onEdit(plan)}
          onDelete={() => { onDeletePlan(plan.id); if (openPlanId === plan.id) setOpenPlanId(null); }}
          onUpdatePlan={onUpdatePlan}
          onItemInfoClick={(item, gradeLabel) => setDetailItem({ item, gradeLabel })}
          onShare={(isPublic, shareType) => {
            const updated = {
              ...plan,
              isPublic,
              shareType: isPublic ? shareType : undefined,
              sharedAt: isPublic ? new Date().toISOString() : undefined,
            };
            onUpdatePlan(updated);
            onSharePlan?.(updated, isPublic, shareType);
          }}
        />
      ))}

      {/* Detail dialog */}
      {detailItem && (
        <ItemDetailDialog
          item={detailItem.item}
          gradeLabel={detailItem.gradeLabel}
          color={allPlans.find((p) => p.years.some((y) => y.items.some((it) => it.id === detailItem.item.id)))?.starColor ?? '#6C5CE7'}
          onClose={() => setDetailItem(null)}
        />
      )}
    </div>
  );
}
