'use client';

import { Target, Gauge, Bot } from 'lucide-react';
import type { CareerPathTemplate } from '@/data/path-templates';

/** 2032 창직·AI 시대 확장 필드 (템플릿 JSON) */
type AiEraFields = {
  readonly northStar?: {
    readonly goal: string;
    readonly proof: string;
    readonly byWhen?: string;
    readonly ventureNote?: string;
  };
  readonly competencyGrowth?: {
    readonly note?: string;
    readonly axes: ReadonlyArray<{
      readonly key: string;
      readonly icon?: string;
      readonly name: string;
      readonly levels: ReadonlyArray<{
        readonly stage: string;
        readonly score: number;
        readonly evidence: string;
      }>;
    }>;
  };
  readonly aiOrchestra?: {
    readonly note?: string;
    readonly agents: ReadonlyArray<{
      readonly stage: string;
      readonly tools: readonly string[];
      readonly use: string;
    }>;
  };
};

type Props = { readonly template: CareerPathTemplate };

function ScoreBar({ score, color }: { readonly score: number; readonly color: string }) {
  const clamped = Math.max(0, Math.min(100, score));
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
      <div
        className="h-full rounded-full"
        style={{ width: `${clamped}%`, background: `linear-gradient(90deg, ${color}66, ${color})` }}
      />
    </div>
  );
}

/**
 * 목표(북극성) · 역량 성장 수치 · AI 오케스트라 스택을 한 블록으로 표시.
 * 세 필드 중 하나라도 있으면 렌더한다.
 */
export function CareerPathAiEraSection({ template }: Props) {
  const t = template as unknown as AiEraFields;
  const northStar = t.northStar;
  const growth = t.competencyGrowth;
  const orchestra = t.aiOrchestra;
  if (!northStar && !growth && !orchestra) return null;

  const accent = template.starColor;

  return (
    <div className="space-y-3">
      {northStar && (
        <div
          className="rounded-2xl p-4 border"
          style={{ borderColor: `${accent}40`, backgroundColor: `${accent}0d` }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Target style={{ width: 15, height: 15, color: accent }} />
            <span className="text-[13px] font-bold text-white">이 패스의 목표</span>
            {northStar.byWhen && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold"
                style={{ backgroundColor: `${accent}22`, color: accent }}
              >
                {northStar.byWhen}
              </span>
            )}
          </div>
          <p className="text-[13px] text-gray-200 leading-relaxed font-semibold">{northStar.goal}</p>
          <div
            className="mt-2 text-[12px] flex items-start gap-1.5 px-2 py-1.5 rounded-lg"
            style={{ backgroundColor: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', color: '#fde68a' }}
          >
            <span>📏</span>
            <span><span className="font-bold">달성 판정:</span> {northStar.proof}</span>
          </div>
          {northStar.ventureNote && (
            <p className="mt-2 text-[12px] text-gray-400 leading-relaxed">🚀 {northStar.ventureNote}</p>
          )}
        </div>
      )}

      {growth && growth.axes.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden border"
          style={{ borderColor: `${accent}35`, backgroundColor: 'rgba(255,255,255,0.02)' }}
        >
          <div className="px-4 py-2.5 flex items-center gap-2" style={{ backgroundColor: `${accent}1a` }}>
            <Gauge style={{ width: 14, height: 14, color: accent }} />
            <div className="min-w-0">
              <div className="text-sm font-bold text-white">역량 성장 수치</div>
              <div className="text-[11px] text-gray-400">
                {growth.note ?? '단계별로 무엇이 몇 개 쌓였는지로 역량을 숫자로 확인해요.'}
              </div>
            </div>
          </div>
          <div className="px-4 py-3 space-y-3">
            {growth.axes.map((axis) => (
              <div key={axis.key}>
                <div className="text-[12px] font-bold text-white mb-1.5">
                  {axis.icon ?? '📈'} {axis.name}
                </div>
                <div className="space-y-1.5">
                  {axis.levels.map((lv) => (
                    <div key={`${axis.key}-${lv.stage}`} className="flex items-center gap-2">
                      <span className="text-[11px] text-gray-400 w-14 flex-shrink-0">{lv.stage}</span>
                      <div className="flex-1 min-w-0">
                        <ScoreBar score={lv.score} color={accent} />
                        <div className="text-[11px] text-gray-400 mt-0.5 leading-snug">{lv.evidence}</div>
                      </div>
                      <span className="text-[11px] font-bold w-8 text-right flex-shrink-0" style={{ color: accent }}>
                        {lv.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {orchestra && orchestra.agents.length > 0 && (
        <div
          className="rounded-2xl overflow-hidden border"
          style={{ borderColor: 'rgba(96,165,250,0.3)', backgroundColor: 'rgba(96,165,250,0.06)' }}
        >
          <div className="px-4 py-2.5 flex items-center gap-2" style={{ backgroundColor: 'rgba(96,165,250,0.14)' }}>
            <Bot style={{ width: 14, height: 14, color: '#93c5fd' }} />
            <div className="min-w-0">
              <div className="text-sm font-bold text-white">AI 오케스트라 (도구 사용법)</div>
              <div className="text-[11px] text-gray-400">
                {orchestra.note ?? '단계마다 어떤 AI 에이전트를 어디에 썼는지 한 줄로 정리했어요.'}
              </div>
            </div>
          </div>
          <div className="px-4 py-3 space-y-2.5">
            {orchestra.agents.map((a) => (
              <div key={a.stage}>
                <div className="text-[12px] font-bold text-white mb-1">{a.stage}</div>
                <div className="flex flex-wrap gap-1 mb-1">
                  {a.tools.map((tool) => (
                    <span
                      key={`${a.stage}-${tool}`}
                      className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
                      style={{
                        backgroundColor: 'rgba(96,165,250,0.14)',
                        border: '1px solid rgba(96,165,250,0.35)',
                        color: '#bfdbfe',
                      }}
                    >
                      {tool}
                    </span>
                  ))}
                </div>
                <div className="text-[11px] text-gray-400 leading-snug">{a.use}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
