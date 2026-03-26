'use client';

import { Bot, Sparkles } from 'lucide-react';
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
    low: { label: '낮음 (상대적 안전)' },
    medium: { label: '중간 (역할 재설계)' },
    high: { label: '높음 (루틴 압력)' },
  };

  const riskBadgeLabel = riskColors[ai.replacementRisk].label;

  return (
    <div className="space-y-6 p-5 pb-10">
      <div className="flex items-center gap-2 border-b border-white/10 pb-3">
        <Sparkles className="h-5 w-5" style={{ color: star.color }} />
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
            {AI_ERA_GAME_UI_LABELS.jobModalGameSubtitle}
          </p>
          <p className="text-sm font-black text-white">{job.name}</p>
        </div>
      </div>

      <AiGameTransformationDungeonRiskSection
        replacementRisk={ai.replacementRisk}
        starColor={star.color}
        title={AI_ERA_GAME_UI_LABELS.jobModalRiskDungeonTitle}
        hint={AI_ERA_GAME_UI_LABELS.jobModalRiskDungeonHint}
        riskBadgeLabel={riskBadgeLabel}
        riskBodyLow="반복 산출물보다 관계·윤리·현장 맥락·책임이 중심이라, AI는 보조에 가깝습니다."
        riskBodyMedium="초안·검색·모니터링은 AI가 빠르게 가져가고, 검증·설명·예외·협업이 사람에게 남습니다."
        riskBodyHigh="형식적·패턴화된 산출은 자동화되기 쉬워, '무엇을 만들지'보다 '무엇을 검증·브랜딩·책임질지'가 경쟁력이 됩니다."
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

      <AiGameTransformationEvolutionCards
        starColor={star.color}
        beforeAI={ai.beforeAI}
        afterAI={ai.afterAI}
        sectionTitle={AI_ERA_GAME_UI_LABELS.jobModalEvolutionTitle}
      />

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
  );
}
