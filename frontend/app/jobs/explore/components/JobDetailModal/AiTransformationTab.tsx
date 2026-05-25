'use client';

import { Bot, Lightbulb, Sparkles, Target } from 'lucide-react';
import { AI_ERA_SECTION_LABELS } from '../../config/aiEraTransformationLabels';
import { AI_ERA_GAME_UI_LABELS } from '../../config/aiEraGameUiLabels';
import { resolveAiTransformationDetail } from '@/lib/jobs/resolveAiTransformationDetail';
import type { Job, StarData } from '../../types';
import { AiGameTransformationDungeonRiskSection } from './aiTransformationGame/AiGameTransformationDungeonRiskSection';
import { AiGameTransformationXpBarsSection } from './aiTransformationGame/AiGameTransformationXpBarsSection';
import { AiGameTransformationEvolutionCards } from './aiTransformationGame/AiGameTransformationEvolutionCards';
import { AiGameTransformationPlaybookQuestLoop } from './aiTransformationGame/AiGameTransformationPlaybookQuestLoop';
import { AiGameTransformationToolsAndSurvival } from './aiTransformationGame/AiGameTransformationToolsAndSurvival';

interface AiTransformationTabProps {
  job: Job;
  star: StarData;
}

const RISK_SUMMARY: Record<
  'low' | 'medium' | 'high',
  { headline: string; tldr: string; action: string }
> = {
  low: {
    headline: 'AI가 와도 사람이 중심에 남는 직업',
    tldr: '판단·관계·현장 감각이 핵심이라, AI는 잡일을 덜어주는 보조에 가깝습니다.',
    action: 'AI는 보조 도구로 익혀두고, 사람만 할 수 있는 \'전문성·신뢰·책임\'을 더 깊게 쌓는 것이 핵심입니다.',
  },
  medium: {
    headline: '일부는 AI가, 핵심은 사람이 맡는 직업',
    tldr: '초안·검색·모니터링은 AI가 빨리 가져가고, 검증·설명·예외 처리·협업이 사람의 몫으로 남습니다.',
    action: 'AI에게 \'무엇을 맡길지\'와 \'무엇은 끝까지 사람이 책임질지\'를 나누고, 그 경계를 설계하는 능력이 경쟁력입니다.',
  },
  high: {
    headline: 'AI가 빠르게 들어와 일하는 방식을 바꾸는 직업',
    tldr: '형식적·반복적 산출은 자동화되기 쉬워, \'무엇을 만들지\'보다 \'무엇을 검증·브랜딩·책임질지\'가 더 중요해집니다.',
    action: 'AI를 도구가 아닌 \'동료·시스템\'으로 다루는 법을 배우고, 사람만의 시각·판단·관계로 차별화해야 합니다.',
  },
};

function StepHeader({
  step,
  title,
  subtitle,
  starColor,
}: {
  step: number;
  title: string;
  subtitle: string;
  starColor: string;
}) {
  return (
    <div className="mb-3 flex items-start gap-3">
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-black"
        style={{
          background: `linear-gradient(135deg, ${starColor}, ${starColor}88)`,
          color: '#0a0a0a',
          boxShadow: `0 4px 18px ${starColor}55`,
        }}
      >
        {step}
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500">
          STEP {step}
        </p>
        <h2 className="text-base font-black leading-tight text-white">{title}</h2>
        <p className="mt-1 text-[11px] leading-relaxed text-gray-400">{subtitle}</p>
      </div>
    </div>
  );
}

export function AiTransformationTab({ job, star }: AiTransformationTabProps) {
  const resolved = resolveAiTransformationDetail(job);

  if (!resolved) {
    return (
      <div className="p-6 text-center text-gray-400">
        <Bot className="mx-auto mb-3 h-12 w-12 opacity-30" />
        <p className="text-sm">AI 변화 정보가 아직 준비되지 않았습니다.</p>
      </div>
    );
  }

  const {
    base: ai,
    replacementPressure5,
    collaborationDesign5,
    pressureAnchorText,
    collaborationAnchorText,
    playbook,
  } = resolved;

  const riskColors = {
    low: { label: '낮음 · 사람이 중심' },
    medium: { label: '중간 · 역할 재설계' },
    high: { label: '높음 · 자동화 압력 큼' },
  } as const;

  const riskBadgeLabel = riskColors[ai.replacementRisk].label;
  const summary = RISK_SUMMARY[ai.replacementRisk];

  return (
    <div className="space-y-8 p-5 pb-10">
      {/* 헤더: 이 탭이 무엇을 말하는지 한 줄로 */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: `linear-gradient(140deg, ${star.color}22, rgba(0,0,0,0.45))`,
          border: `1px solid ${star.color}40`,
          boxShadow: `0 10px 32px ${star.color}1a`,
        }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" style={{ color: star.color }} />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">
            {AI_ERA_GAME_UI_LABELS.jobModalGameSubtitle}
          </p>
        </div>
        <h1 className="mt-2 text-lg font-black leading-tight text-white">{job.name}</h1>
        <p className="mt-2 text-[12px] leading-relaxed text-gray-300">
          <span className="font-bold text-white">{summary.headline}.</span>{' '}
          {summary.tldr}
        </p>
        <div
          className="mt-3 flex items-start gap-2 rounded-xl p-2.5"
          style={{
            background: 'rgba(0,0,0,0.35)',
            border: `1px solid ${star.color}30`,
          }}
        >
          <Lightbulb className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" style={{ color: star.color }} />
          <p className="text-[11px] leading-relaxed text-gray-200">
            <span className="font-bold" style={{ color: star.color }}>한 줄 대응법 · </span>
            {summary.action}
          </p>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5 text-[10px]">
          <span className="rounded-full bg-white/10 px-2 py-1 font-bold text-gray-200">
            STEP 1 · AI 영향 진단
          </span>
          <span className="rounded-full bg-white/10 px-2 py-1 font-bold text-gray-200">
            STEP 2 · 일이 어떻게 달라지나
          </span>
          <span className="rounded-full bg-white/10 px-2 py-1 font-bold text-gray-200">
            STEP 3 · 그래서 무엇을 해야 하나
          </span>
        </div>
      </div>

      {/* STEP 1 — 영향 진단 */}
      <section>
        <StepHeader
          step={1}
          title="AI가 이 직업을 얼마나 흔드나요?"
          subtitle="자동화 압력의 강도를 한눈에 보고, 두 가지 축(대체 압력 · 협업 설계 역량)으로 더 자세히 살펴봅니다."
          starColor={star.color}
        />
        <div className="space-y-4">
          <AiGameTransformationDungeonRiskSection
            replacementRisk={ai.replacementRisk}
            starColor={star.color}
            title={AI_ERA_GAME_UI_LABELS.jobModalRiskDungeonTitle}
            hint={AI_ERA_GAME_UI_LABELS.jobModalRiskDungeonHint}
            riskBadgeLabel={riskBadgeLabel}
            riskBodyLow="판단·관계·윤리·현장 감각·책임이 일의 중심이라, AI는 시간을 줄여주는 보조 도구에 가깝습니다."
            riskBodyMedium="초안·검색·모니터링은 AI가 빠르게 가져가고, 검증·설명·예외 처리·협업이 사람에게 남습니다."
            riskBodyHigh="형식적·반복적 산출은 자동화되기 쉬워, '무엇을 만들지'보다 '무엇을 검증·브랜딩·책임질지'가 경쟁력이 됩니다."
          />

          <AiGameTransformationXpBarsSection
            starColor={star.color}
            sectionTitle={AI_ERA_GAME_UI_LABELS.jobModalXpSectionTitle}
            replacementPressureTitle={AI_ERA_SECTION_LABELS.replacementPressureTitle}
            replacementPressureHint={AI_ERA_SECTION_LABELS.replacementPressureHint}
            replacementPressure5={replacementPressure5}
            pressureAnchorText={pressureAnchorText}
            collaborationDesignTitle={AI_ERA_SECTION_LABELS.collaborationDesignTitle}
            collaborationDesignHint={AI_ERA_SECTION_LABELS.collaborationDesignHint}
            collaborationDesign5={collaborationDesign5}
            collaborationAnchorText={collaborationAnchorText}
            scaleAxisLow={AI_ERA_SECTION_LABELS.scaleAxisLow}
            scaleAxisHigh={AI_ERA_SECTION_LABELS.scaleAxisHigh}
          />
        </div>
      </section>

      {/* STEP 2 — 변화의 모습 */}
      <section>
        <StepHeader
          step={2}
          title="일하는 모습이 어떻게 달라지나요?"
          subtitle="AI 도입 전과 후를 나란히 두고, 같은 일을 어떻게 다르게 처리하게 되는지 비교해봅니다."
          starColor={star.color}
        />
        <AiGameTransformationEvolutionCards
          starColor={star.color}
          beforeAI={ai.beforeAI}
          afterAI={ai.afterAI}
          sectionTitle={AI_ERA_GAME_UI_LABELS.jobModalEvolutionTitle}
        />
      </section>

      {/* STEP 3 — 대응 방법 */}
      <section>
        <StepHeader
          step={3}
          title="그래서 무엇을 해야 하나요?"
          subtitle="현장에서 바로 쓸 수 있는 4단계 행동 가이드와, 함께 익혀두면 좋은 도구·전략을 모았습니다."
          starColor={star.color}
        />
        <div className="space-y-5">
          <AiGameTransformationPlaybookQuestLoop
            starColor={star.color}
            playbook={playbook}
            labels={AI_ERA_SECTION_LABELS}
            title={AI_ERA_GAME_UI_LABELS.jobModalCoopQuestTitle}
            intro={AI_ERA_SECTION_LABELS.collaborationHowToIntro}
          />

          <AiGameTransformationToolsAndSurvival
            starColor={star.color}
            mainToolsTitle={AI_ERA_SECTION_LABELS.mainToolsTitle}
            survivalTitle={AI_ERA_SECTION_LABELS.survivalTitle}
            aiTools={ai.aiTools ?? []}
            survivalStrategy={ai.survivalStrategy ?? []}
          />
        </div>

        {/* 마무리: 핵심 메시지 한 번 더 강조 */}
        <div
          className="mt-5 flex items-start gap-2.5 rounded-2xl p-4"
          style={{
            background: `linear-gradient(140deg, ${star.color}18, rgba(0,0,0,0.4))`,
            border: `1px solid ${star.color}38`,
          }}
        >
          <Target className="mt-0.5 h-4 w-4 flex-shrink-0" style={{ color: star.color }} />
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">
              핵심 메시지
            </p>
            <p className="mt-1 text-sm font-bold leading-relaxed text-white">
              {summary.action}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
