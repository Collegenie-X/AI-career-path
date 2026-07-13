'use client';

import { Check } from 'lucide-react';
import { BuilderSheet } from './BuilderSheet';
import { STAR_COLORS, PERIOD_OPTIONS } from '../config';
import type { BuilderState } from '../types';

interface Props {
  state: BuilderState;
  onChange: (patch: Partial<BuilderState>) => void;
  onClose: () => void;
}

/** 프로젝트 기본 정보 편집 — 정보 영역 클릭 시 열리는 바텀시트 */
export function ProjectInfoDialog({ state, onChange, onClose }: Props) {
  return (
    <BuilderSheet
      title="프로젝트 정보"
      emoji="📝"
      onClose={onClose}
      footer={
        <button onClick={onClose} className="w-full py-3 rounded-2xl text-sm font-black text-white" style={{ background: 'linear-gradient(135deg,#6C5CE7,#8b5cf6)' }}>완료</button>
      }
    >
      <Field label="프로젝트 제목">
        <input value={state.title} onChange={(e) => onChange({ title: e.target.value })} placeholder="예: 우리 반 영단어 게임 카드" className={inputCls} />
      </Field>
      <Field label="한 줄 소개">
        <textarea value={state.description} onChange={(e) => onChange({ description: e.target.value })} rows={3} placeholder="무엇을, 왜 만들었는지" className={`${inputCls} resize-none`} />
      </Field>
      <Field label="기간">
        <div className="flex gap-1.5">
          {PERIOD_OPTIONS.map((p) => (
            <button key={p.id} onClick={() => onChange({ period: p.id })} className="flex-1 py-2 rounded-xl text-xs font-semibold"
              style={{ background: state.period === p.id ? 'rgba(108,92,231,0.25)' : 'rgba(255,255,255,0.05)', color: state.period === p.id ? '#fff' : '#9ca3af', border: `1px solid ${state.period === p.id ? 'rgba(108,92,231,0.6)' : 'transparent'}` }}>
              {p.label}
            </button>
          ))}
        </div>
      </Field>
      <Field label="색상">
        <div className="flex gap-2">
          {STAR_COLORS.map((c) => (
            <button key={c} onClick={() => onChange({ starColor: c })} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: c, transform: state.starColor === c ? 'scale(1.18)' : undefined }}>
              {state.starColor === c && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
            </button>
          ))}
        </div>
      </Field>
    </BuilderSheet>
  );
}

const inputCls = 'w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] placeholder:text-gray-500';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><label className="text-[12px] font-bold text-gray-400">{label}</label>{children}</div>;
}
