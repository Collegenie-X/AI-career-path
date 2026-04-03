'use client';

import { useState, useRef, useEffect } from 'react';

/** 타임라인 항목 제목 인라인 편집 (ItemRow 편집 모드) */
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
