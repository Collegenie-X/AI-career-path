'use client';

import { Plus, Trash2 } from 'lucide-react';
import { BuilderSheet } from './BuilderSheet';
import type { PhaseMeta } from '../tracks';
import { makeBuilderId, type PhaseBlock } from '../types';

interface Props {
  block: PhaseBlock;
  phases: PhaseMeta[];
  onChange: (next: PhaseBlock) => void;
  onDelete: () => void;
  onClose: () => void;
}

/** 블록(주차) 한 개 집중 편집 — 영역 클릭 시 열리는 바텀시트 */
export function BlockEditDialog({ block, phases, onChange, onDelete, onClose }: Props) {
  const meta = phases.find((p) => p.key === block.phase) ?? phases[0];
  const update = (patch: Partial<PhaseBlock>) => onChange({ ...block, ...patch });
  const setTask = (id: string, title: string) => update({ tasks: block.tasks.map((t) => (t.id === id ? { ...t, title } : t)) });
  const addTask = () => update({ tasks: [...block.tasks, { id: makeBuilderId('task'), title: '' }] });
  const removeTask = (id: string) => update({ tasks: block.tasks.filter((t) => t.id !== id) });

  return (
    <BuilderSheet
      title="주차 편집"
      emoji={meta.emoji}
      accent={meta.color}
      onClose={onClose}
      footer={
        <button onClick={onClose} className="w-full py-3 rounded-2xl text-sm font-black text-white" style={{ background: `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)` }}>
          완료
        </button>
      }
    >
      {/* 단계 (역할 명시) */}
      <Field label="이 주차의 단계 (역할)">
        <div className="grid grid-cols-4 gap-1.5">
          {phases.map((pm) => {
            const on = pm.key === block.phase;
            return (
              <button key={pm.key} onClick={() => update({ phase: pm.key })}
                className="flex flex-col items-center gap-0.5 py-2 rounded-xl transition-all"
                style={{ background: on ? `${pm.color}22` : 'rgba(255,255,255,0.05)', border: `1.5px solid ${on ? pm.color : 'transparent'}` }}>
                <span className="text-base">{pm.emoji}</span>
                <span className="text-[10px] font-bold" style={{ color: on ? pm.color : '#9ca3af' }}>{pm.label}</span>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-gray-500 mt-1">{meta.emoji} {meta.label} — {meta.hint}</p>
      </Field>

      <Field label="이번 주차 목표">
        <input value={block.goalTitle} onChange={(e) => update({ goalTitle: e.target.value })}
          placeholder="예: V0 프로토타입 프론트 구현" className={inputCls} />
      </Field>

      <Field label={`할 일 (${block.tasks.length})`}>
        <div className="space-y-1.5">
          {block.tasks.map((t) => (
            <div key={t.id} className="flex items-center gap-1.5">
              <input value={t.title} onChange={(e) => setTask(t.id, e.target.value)} placeholder="할 일을 입력" className={inputCls} />
              <button onClick={() => removeTask(t.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 flex-shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button onClick={addTask} className="text-[12px] font-semibold flex items-center gap-1" style={{ color: meta.color }}>
            <Plus className="w-3.5 h-3.5" /> 할 일 추가
          </button>
        </div>
      </Field>

      <Field label="이번 주차 산출물 (포트폴리오 근거)">
        <input value={block.plannedOutput ?? ''} onChange={(e) => update({ plannedOutput: e.target.value })}
          placeholder="예: 데모 영상 · 배포 링크" className={inputCls} />
      </Field>

      <button onClick={onDelete} className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-red-400">
        <Trash2 className="w-3.5 h-3.5" /> 이 주차 삭제
      </button>
    </BuilderSheet>
  );
}

const inputCls = 'flex-1 w-full px-3 py-2.5 rounded-xl text-sm text-white outline-none bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] placeholder:text-gray-500';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><label className="text-[12px] font-bold text-gray-400">{label}</label>{children}</div>;
}
