'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Calendar, Plus, Trash2, Check,
  CheckCircle2, Circle, X, MoreHorizontal,
} from 'lucide-react';
import { ITEM_TYPES } from '../config';
import type { PlanItem } from './CareerPathBuilder';

export type PlanItemWithCheck = PlanItem & { checked?: boolean };

/* ─── Inline editable title ─── */
export function InlineTitle({ value, color, onSave }: {
  value: string; color: string; onSave: (v: string) => void;
}) {
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
        <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 transition-opacity active:scale-90">
          <X style={{ width: 13, height: 13, color: '#ef4444' }} />
        </button>
      )}
    </div>
  );
}

/* ─── Item row (todo-style) ─── */
export function ItemRow({
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

      <button onClick={onToggleCheck} className="flex-shrink-0 mt-0.5 transition-all active:scale-90"
        style={{ color: checked ? typeConf?.color ?? color : 'rgba(255,255,255,0.2)' }}>
        {checked ? <CheckCircle2 style={{ width: 18, height: 18 }} /> : <Circle style={{ width: 18, height: 18 }} />}
      </button>

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
          <span className="text-sm font-semibold text-white leading-snug cursor-pointer hover:underline decoration-dotted" title="탭하여 상세 보기">
            {item.title}
          </span>
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
export function QuickAddItem({ color, onAdd }: {
  color: string; onAdd: (title: string, type: PlanItem['type']) => void;
}) {
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
