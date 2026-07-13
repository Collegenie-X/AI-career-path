'use client';

import { useState } from 'react';
import { Plus, ChevronRight, Lightbulb, ChevronDown } from 'lucide-react';
import type { PhaseMeta } from '../tracks';
import type { PhaseBlock } from '../types';
import { PhaseGuidePanel } from './PhaseGuidePanel';

interface Props {
  meta: PhaseMeta;
  index: number;
  blocks: PhaseBlock[];
  onOpenBlock: (id: string) => void;
  onAddBlock: () => void;
}

/** 한 단계(역할) 섹션 — 헤더에 역할 설명, 가이드(예시·AI), 주차 블록 행. 행 클릭 시 편집 다이얼로그 */
export function PhaseSection({ meta, index, blocks, onOpenBlock, onAddBlock }: Props) {
  const [showGuide, setShowGuide] = useState(false);
  return (
    <section className="rounded-2xl overflow-hidden" style={{ background: `linear-gradient(135deg, ${meta.color}12, transparent)`, border: `1px solid ${meta.color}26` }}>
      {/* 역할 헤더 */}
      <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg" style={{ background: `${meta.color}22` }}>{meta.emoji}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${meta.color}22`, color: meta.color }}>{index + 1}단계</span>
            <span className="text-sm font-black text-white">{meta.label}</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">{meta.hint}</p>
        </div>
        <button onClick={() => setShowGuide((v) => !v)}
          className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg flex-shrink-0"
          style={{ background: showGuide ? `${meta.color}26` : 'rgba(255,255,255,0.05)', color: showGuide ? meta.color : '#9ca3af' }}>
          <Lightbulb className="w-3 h-3" /> 예시·AI
          <ChevronDown className={`w-3 h-3 transition-transform ${showGuide ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* 가이드 (예시 + CSRT AI 활용) */}
      {showGuide && (
        <div className="px-3 pt-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 12 }}>
          <PhaseGuidePanel meta={meta} />
        </div>
      )}

      {/* 주차 블록 행 */}
      <div className="p-2.5 space-y-1.5">
        <div className="flex justify-end -mt-0.5 mb-0.5"><span className="text-[10px] text-gray-500">{blocks.length}주</span></div>
        {blocks.map((block) => {
          const empty = !block.goalTitle.trim();
          return (
            <button key={block.id} onClick={() => onOpenBlock(block.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors hover:bg-white/[0.04]"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex-1 min-w-0">
                <div className={`text-[13px] leading-snug font-semibold ${empty ? 'text-gray-500 italic' : 'text-white'}`}>
                  {block.goalTitle.trim() || '목표를 입력하세요'}
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400">
                  {block.tasks.length > 0 && <span>할 일 {block.tasks.length}</span>}
                  {block.plannedOutput?.trim() && <span className="truncate">📸 {block.plannedOutput}</span>}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
            </button>
          );
        })}

        <button onClick={onAddBlock}
          className="w-full py-2 rounded-xl flex items-center justify-center gap-1 text-[12px] font-semibold text-gray-400 hover:text-white transition-colors"
          style={{ border: '1.5px dashed rgba(255,255,255,0.12)' }}>
          <Plus className="w-3.5 h-3.5" /> 주차 추가
        </button>
      </div>
    </section>
  );
}
