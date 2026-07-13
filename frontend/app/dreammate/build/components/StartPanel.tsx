'use client';

import { useState } from 'react';
import { Pencil, Search } from 'lucide-react';
import type { GalleryField } from '../tracks';
import type { TemplateLike } from '../utils/templateToBlocks';

interface Props {
  fields: GalleryField[];
  onPickTemplate: (tpl: TemplateLike) => void;
  onBlank: () => void;
}

export function StartPanel({ fields, onPickTemplate, onBlank }: Props) {
  const [fieldId, setFieldId] = useState<string>(fields[0]?.id ?? '');
  const field = fields.find((f) => f.id === fieldId) ?? fields[0];

  return (
    <div className="space-y-3">
      <button
        onClick={onBlank}
        className="w-full flex items-center gap-2.5 p-3 rounded-xl text-left"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1.5px dashed rgba(255,255,255,0.18)' }}
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <Pencil className="w-4 h-4 text-gray-300" />
        </div>
        <div>
          <div className="text-sm font-bold text-white">빈 캔버스로 시작</div>
          <div className="text-[11px] text-gray-400">4단계 빈 블록부터 직접 채우기</div>
        </div>
      </button>

      <div className="flex items-center gap-1.5 text-[11px] text-gray-400 px-0.5">
        <Search className="w-3 h-3" /> 템플릿으로 시작 — 분야 선택
      </div>

      {/* 분야 필터 */}
      <div className="flex flex-wrap gap-1.5">
        {fields.map((f) => {
          const on = f.id === fieldId;
          return (
            <button key={f.id} onClick={() => setFieldId(f.id)}
              className="px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all"
              style={{ background: on ? 'rgba(108,92,231,0.25)' : 'rgba(255,255,255,0.05)', color: on ? '#fff' : '#9ca3af', border: `1px solid ${on ? 'rgba(108,92,231,0.6)' : 'transparent'}` }}>
              {f.emoji} {f.label}
            </button>
          );
        })}
      </div>

      {/* 템플릿 카드 */}
      <div className="grid grid-cols-1 gap-2 max-h-[52vh] overflow-y-auto pr-1">
        {field?.templates.map((tpl) => (
          <button key={tpl.id} onClick={() => onPickTemplate(tpl)}
            className="flex items-start gap-2.5 p-3 rounded-xl text-left transition-all hover:bg-white/5"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-xl flex-shrink-0">{tpl.emoji ?? '🧩'}</span>
            <div className="min-w-0">
              <div className="text-[13px] font-bold text-white leading-snug">{tpl.title}</div>
              <div className="text-[11px] text-gray-400 mt-0.5 leading-snug line-clamp-2">{tpl.description}</div>
              <div className="text-[10px] text-gray-500 mt-1">{tpl.weeklyGoals.length}주 · 클릭하면 트랙으로 불러옵니다</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
