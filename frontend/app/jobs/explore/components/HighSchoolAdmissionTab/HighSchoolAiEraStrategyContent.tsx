'use client';

import type { HighSchoolAiEraStrategy } from '../../types';
import { HIGH_SCHOOL_LABELS } from '../../config';

export type HighSchoolAiEraStrategyContentProps = {
  aiStrategy: HighSchoolAiEraStrategy | undefined;
  categoryColor: string;
  categoryBgColor: string;
  /** 예: 패널 `px-5 py-4`, 다이얼로그 `px-4 py-4` */
  contentPaddingClassName?: string;
};

/**
 * 학교 유형(JSON `category.aiEraStrategy`) 공통 — 고입 상세 다이얼로그 등에서 재사용
 */
export function HighSchoolAiEraStrategyContent({
  aiStrategy,
  categoryColor,
  categoryBgColor,
  contentPaddingClassName = 'px-5 py-4',
}: HighSchoolAiEraStrategyContentProps) {
  if (!aiStrategy) {
    return (
      <div className={`${contentPaddingClassName} space-y-3`}>
        <div
          className="p-4 rounded-2xl text-center"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="text-3xl mb-2">🤖</div>
          <p className="text-sm font-bold text-white mb-1">{HIGH_SCHOOL_LABELS.category_ai_era_empty_title}</p>
          <p className="text-[12px] text-gray-400">{HIGH_SCHOOL_LABELS.category_ai_era_empty_sub}</p>
        </div>
      </div>
    );
  }

  const roadmap = aiStrategy.keyInsights?.[1]?.roadmap;
  const strategiesBlock = aiStrategy.keyInsights?.[2]?.strategies;

  return (
    <div className={`${contentPaddingClassName} space-y-4`}>
      <div
        className="p-4 rounded-2xl"
        style={{
          background: `linear-gradient(135deg, ${categoryColor}20, ${categoryColor}05)`,
          border: `1px solid ${categoryColor}40`,
        }}
      >
        <p className="mb-2 text-[13px] font-bold text-white">{aiStrategy.title}</p>
        <p className="text-[12px] text-gray-300 leading-relaxed">{aiStrategy.summary}</p>
      </div>

      {aiStrategy.keyInsights?.[0] && (
        <div className="space-y-3">
          <p className="text-[12px] font-bold text-white flex items-center gap-2">
            <span className="text-lg">⚡</span>
            {aiStrategy.keyInsights[0].title}
          </p>

          <div
            className="rounded-xl p-3"
            style={{
              background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(185,28,28,0.08))',
              border: '1px solid rgba(239,68,68,0.3)',
            }}
          >
            <p className="text-[11px] font-bold text-red-400 mb-2">❌ AI가 대체하는 것</p>
            <ul className="space-y-1">
              {aiStrategy.keyInsights[0].aiReplaces?.map((item, i) => (
                <li key={i} className="text-[11px] text-gray-300 flex items-start gap-2">
                  <span className="text-red-400 flex-shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className="rounded-xl p-3"
            style={{
              background: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(22,163,74,0.08))',
              border: '1px solid rgba(34,197,94,0.3)',
            }}
          >
            <p className="text-[11px] font-bold text-green-400 mb-2">✅ 인간이 해야 할 것</p>
            <ul className="space-y-1">
              {aiStrategy.keyInsights[0].humanMustDo?.map((item, i) => (
                <li key={i} className="text-[11px] text-gray-300 flex items-start gap-2">
                  <span className="text-green-400 flex-shrink-0">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {roadmap && roadmap.length > 0 && aiStrategy.keyInsights?.[1] && (
        <div className="space-y-3">
          <p className="text-[12px] font-bold text-white flex items-center gap-2">
            <span className="text-lg">🗺️</span>
            {aiStrategy.keyInsights[1].title}
          </p>

          <div className="relative pl-0.5">
            <div
              className="absolute left-[22px] top-5 bottom-0 w-0.5 -translate-x-1/2"
              style={{
                backgroundColor: categoryColor,
                opacity: 0.5,
                boxShadow: `0 0 8px ${categoryColor}50`,
              }}
            />
            <div className="relative space-y-0">
              {roadmap.map((step, i) => (
                <div key={`${step.stage}-${i}`} className="relative flex gap-4">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-xl border-2 z-10"
                      style={{
                        background: `${categoryColor}20`,
                        borderColor: categoryColor,
                        boxShadow: `0 0 12px ${categoryColor}50`,
                      }}
                    >
                      🤖
                    </div>
                    {i < roadmap.length - 1 && (
                      <div
                        className="flex-1 w-0.5 min-h-8 mt-1"
                        style={{ backgroundColor: categoryColor, opacity: 0.4 }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pb-6">
                    <span
                      className="inline-block px-3 py-1.5 rounded-full text-xs font-extrabold mb-2"
                      style={{
                        backgroundColor: `${categoryColor}15`,
                        color: categoryColor,
                        border: `1px solid ${categoryColor}40`,
                      }}
                    >
                      {step.stage}
                    </span>
                    <p className="text-[11px] font-bold text-white mb-2">{step.focus}</p>

                    {step.tools && step.tools.length > 0 && (
                      <div className="mb-2">
                        <p className="text-[10px] font-bold text-gray-400 mb-1">🛠️ 추천 도구</p>
                        <div className="flex flex-wrap gap-1">
                          {step.tools.map((tool, j) => (
                            <span
                              key={j}
                              className="text-[10px] px-2 py-0.5 rounded-full"
                              style={{ background: `${categoryColor}20`, color: categoryColor }}
                            >
                              {tool}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {step.projects && step.projects.length > 0 && (
                      <div className="mb-2">
                        <p className="text-[10px] font-bold text-gray-400 mb-1">💡 프로젝트</p>
                        <ul className="space-y-0.5">
                          {step.projects.map((project, j) => (
                            <li key={j} className="text-[11px] text-gray-300 flex items-start gap-1.5">
                              <span className="text-gray-500 flex-shrink-0">•</span>
                              <span>{project}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {step.keyPoint && (
                      <div
                        className="p-2 rounded-lg mt-2"
                        style={{
                          background: 'rgba(251,191,36,0.1)',
                          border: '1px solid rgba(251,191,36,0.3)',
                        }}
                      >
                        <p className="text-[10px] text-yellow-400 leading-relaxed">{step.keyPoint}</p>
                      </div>
                    )}

                    {step.warning && (
                      <div
                        className="p-2 rounded-lg mt-2"
                        style={{
                          background: 'rgba(239,68,68,0.1)',
                          border: '1px solid rgba(239,68,68,0.3)',
                        }}
                      >
                        <p className="text-[10px] text-red-400 leading-relaxed">{step.warning}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {strategiesBlock && strategiesBlock.length > 0 && aiStrategy.keyInsights?.[2] && (
        <div className="space-y-3">
          <p className="text-[12px] font-bold text-white flex items-center gap-2">
            <span className="text-lg">🎯</span>
            {aiStrategy.keyInsights[2].title}
          </p>

          {strategiesBlock.map((strat, i) => (
            <div
              key={i}
              className="rounded-xl p-3"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${categoryColor}30`,
              }}
            >
              <p className="text-[11px] font-bold text-white mb-1.5">{strat.strategy}</p>
              <p className="text-[10px] text-gray-400 mb-2 italic">{strat.why}</p>

              {strat.how && strat.how.length > 0 && (
                <div className="mb-2">
                  <p className="text-[10px] font-bold text-gray-400 mb-1">방법</p>
                  <ul className="space-y-0.5">
                    {strat.how.map((method, j) => (
                      <li key={j} className="text-[10px] text-gray-300 flex items-start gap-1.5">
                        <span className="flex-shrink-0" style={{ color: categoryColor }}>
                          →
                        </span>
                        <span>{method}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {strat.example && (
                <div className="p-2 rounded-lg mt-2" style={{ background: `${categoryColor}10` }}>
                  <p className="text-[10px] text-gray-300">{strat.example}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {aiStrategy.practicalTips && aiStrategy.practicalTips.length > 0 && (
        <div className="space-y-3">
          <p className="text-[12px] font-bold text-white flex items-center gap-2">
            <span className="text-lg">💡</span>
            실전 팁
          </p>

          <div className="space-y-2">
            {aiStrategy.practicalTips.map((tip, i) => (
              <div
                key={i}
                className="rounded-xl p-3"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
                    style={{ background: `${categoryColor}15` }}
                  >
                    {tip.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-white mb-0.5">{tip.category}</p>
                    <p className="text-[11px] font-semibold" style={{ color: categoryColor }}>
                      {tip.tip}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">{tip.detail}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {aiStrategy.commonMistakes && aiStrategy.commonMistakes.length > 0 && (
        <div className="space-y-3">
          <p className="text-[12px] font-bold text-white flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            흔한 실수
          </p>

          <div className="space-y-2">
            {aiStrategy.commonMistakes.map((mistake, i) => (
              <div
                key={i}
                className="rounded-xl p-3"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <p className="text-[11px] text-red-400 mb-1.5">{mistake.mistake}</p>
                <p className="text-[11px] text-green-400">{mistake.correct}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {aiStrategy.futureCareerInsight && (
        <div
          className="rounded-xl p-4"
          style={{
            background: `linear-gradient(135deg, ${categoryColor}15, ${categoryColor}05)`,
            border: `1px solid ${categoryColor}40`,
          }}
        >
          <p className="text-[12px] font-bold text-white mb-2 flex items-center gap-2">
            <span className="text-lg">🔮</span>
            {aiStrategy.futureCareerInsight.title}
          </p>
          <p className="text-[11px] text-gray-300 mb-3 leading-relaxed">{aiStrategy.futureCareerInsight.reality}</p>

          {aiStrategy.futureCareerInsight.newCareers && aiStrategy.futureCareerInsight.newCareers.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] font-bold text-gray-400 mb-1.5">새로운 직업</p>
              <div className="space-y-1">
                {aiStrategy.futureCareerInsight.newCareers.map((career, i) => (
                  <div
                    key={i}
                    className="text-[10px] text-gray-300 px-2 py-1 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    • {career}
                  </div>
                ))}
              </div>
            </div>
          )}

          {aiStrategy.futureCareerInsight.preparation && aiStrategy.futureCareerInsight.preparation.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 mb-1.5">준비 방법</p>
              <div className="space-y-1">
                {aiStrategy.futureCareerInsight.preparation.map((prep, i) => (
                  <div
                    key={i}
                    className="text-[10px] px-2 py-1 rounded-lg"
                    style={{ background: `${categoryColor}15`, color: categoryColor }}
                  >
                    → {prep}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
