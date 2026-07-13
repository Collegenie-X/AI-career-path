'use client';

import { useState } from 'react';
import { Check, Copy, Sparkles } from 'lucide-react';
import type { PhaseMeta } from '../tracks';

/** CSRT 4요소를 한 덩어리 프롬프트로 합치기 */
function buildPrompt(meta: PhaseMeta): string {
  const { context, specific, role, task } = meta.guide.csrt;
  return [
    `[맥락] ${context}`,
    `[역할] ${role}`,
    `[요청] ${specific}`,
    `[결과] ${task}`,
  ].join('\n');
}

const CSRT_LABELS: { key: keyof PhaseMeta['guide']['csrt']; tag: string; ko: string }[] = [
  { key: 'context',  tag: 'C', ko: '맥락' },
  { key: 'specific', tag: 'S', ko: '구체' },
  { key: 'role',     tag: 'R', ko: '역할' },
  { key: 'task',     tag: 'T', ko: '과제' },
];

export function PhaseGuidePanel({ meta }: { meta: PhaseMeta }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(buildPrompt(meta)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }).catch(() => {});
  };

  return (
    <div className="space-y-3 px-1 pb-1">
      {/* 이렇게 해보세요 */}
      <div>
        <div className="text-[11px] font-bold mb-1.5" style={{ color: meta.color }}>💡 이렇게 해보세요</div>
        <ul className="space-y-1">
          {meta.guide.examples.map((ex, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[12px] text-gray-300 leading-snug">
              <Check className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: meta.color }} />
              <span>{ex}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* AI 활용 (CSRT) */}
      <div className="rounded-xl p-3" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-200">
            <Sparkles className="w-3.5 h-3.5" /> AI 활용 — {meta.guide.aiUse}
          </div>
          <button onClick={copy} className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg text-purple-200"
            style={{ background: 'rgba(139,92,246,0.2)' }}>
            {copied ? <><Check className="w-3 h-3" /> 복사됨</> : <><Copy className="w-3 h-3" /> 프롬프트 복사</>}
          </button>
        </div>
        <div className="space-y-1.5">
          {CSRT_LABELS.map(({ key, tag, ko }) => (
            <div key={key} className="flex items-start gap-2 text-[12px] leading-snug">
              <span className="flex-shrink-0 w-[42px] flex items-center gap-1">
                <span className="w-4 h-4 rounded flex items-center justify-center text-[9px] font-black text-white" style={{ background: meta.color }}>{tag}</span>
                <span className="text-[10px] text-gray-400">{ko}</span>
              </span>
              <span className="text-gray-200 flex-1">{meta.guide.csrt[key]}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-500 mt-2">CSRT = 맥락·구체·역할·과제. AI 답은 꼭 직접 확인하고 내 말로 바꿔 쓰세요.</p>
      </div>
    </div>
  );
}
