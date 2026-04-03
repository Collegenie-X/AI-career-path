'use client';

import { useState, useRef, useEffect } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { ITEM_TYPES } from '../config';
import type { PlanItem } from './CareerPathBuilder';

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
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-[12px] font-bold transition-all"
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
