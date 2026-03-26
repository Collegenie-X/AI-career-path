import {
  DEFAULT_AI_COLLABORATION_PLAYBOOK_TEMPLATES,
  REPLACEMENT_PRESSURE_SCALE_ANCHORS,
  COLLABORATION_DESIGN_SCALE_ANCHORS,
} from '@/app/jobs/explore/config/aiEraTransformationLabels';
import type { AiTransformation, Job } from '@/app/jobs/explore/types';

export type AiCollaborationPlaybookStepResolved = {
  stepKey: string;
  stepTitle: string;
  humanRole: string;
  aiRole: string;
  scenarioExample: string;
  recommendedTools: string[];
};

export type ResolvedAiTransformationDetail = {
  replacementPressure5: 1 | 2 | 3 | 4 | 5;
  collaborationDesign5: 1 | 2 | 3 | 4 | 5;
  pressureAnchorText: string;
  collaborationAnchorText: string;
  playbook: AiCollaborationPlaybookStepResolved[];
  base: AiTransformation;
};

function clamp5(n: number): 1 | 2 | 3 | 4 | 5 {
  const x = Math.min(5, Math.max(1, Math.round(n)));
  return x as 1 | 2 | 3 | 4 | 5;
}

/** replacementRisk → 기본 대체 압력 (1~5) */
export function defaultReplacementPressure5(
  risk: AiTransformation['replacementRisk']
): 1 | 2 | 3 | 4 | 5 {
  if (risk === 'low') return 2;
  if (risk === 'high') return 5;
  return 3;
}

/** replacementRisk → 기본 협업 설계 역량 요구 (1~5) */
export function defaultCollaborationDesign5(
  risk: AiTransformation['replacementRisk']
): 1 | 2 | 3 | 4 | 5 {
  if (risk === 'low') return 4;
  if (risk === 'high') return 5;
  return 4;
}

function uniqueTools(list: string[], max = 12): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of list) {
    const s = t.trim();
    if (!s || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
    if (out.length >= max) break;
  }
  return out;
}

function fillTemplate(tpl: string, jobName: string): string {
  return tpl.replace(/\{jobName\}/g, jobName);
}

function buildPlaybookFromTemplates(
  job: Job,
  ai: AiTransformation
): AiCollaborationPlaybookStepResolved[] {
  const jobName = job.name;
  const fromData = ai.aiTools ?? [];

  return DEFAULT_AI_COLLABORATION_PLAYBOOK_TEMPLATES.map((step, idx) => {
    const mergedTools = uniqueTools([
      ...fromData.slice(idx * 2, idx * 2 + 3),
      ...step.defaultTools,
    ]);

    return {
      stepKey: step.stepKey,
      stepTitle: step.stepTitle,
      humanRole: fillTemplate(step.humanRoleTemplate, jobName),
      aiRole: fillTemplate(step.aiRoleTemplate, jobName),
      scenarioExample: fillTemplate(step.exampleTemplate, jobName),
      recommendedTools: mergedTools.length > 0 ? mergedTools : [...step.defaultTools],
    };
  });
}

/**
 * 직업 JSON의 aiTransformation 과 기본 템플릿을 합쳐 탭에 넣을 상세 객체를 만듭니다.
 * JSON에 replacementPressure5 / collaborationPlaybook 등이 있으면 우선합니다.
 */
export function resolveAiTransformationDetail(job: Job): ResolvedAiTransformationDetail | null {
  const ai = job.aiTransformation;
  if (!ai) return null;

  const replacementPressure5 =
    ai.replacementPressure5 ??
    defaultReplacementPressure5(ai.replacementRisk);

  const collaborationDesign5 =
    ai.aiCollaborationRequired5 ?? defaultCollaborationDesign5(ai.replacementRisk);

  const playbook =
    ai.collaborationPlaybook && ai.collaborationPlaybook.length > 0
      ? ai.collaborationPlaybook.map((row, i) => ({
          stepKey: `custom-${i}`,
          stepTitle: row.stepTitle,
          humanRole: row.humanRole,
          aiRole: row.aiRole,
          scenarioExample: row.scenarioExample,
          recommendedTools: uniqueTools([...row.recommendedTools, ...(ai.aiTools ?? [])]),
        }))
      : buildPlaybookFromTemplates(job, ai);

  return {
    replacementPressure5: clamp5(replacementPressure5),
    collaborationDesign5: clamp5(collaborationDesign5),
    pressureAnchorText: REPLACEMENT_PRESSURE_SCALE_ANCHORS[replacementPressure5],
    collaborationAnchorText: COLLABORATION_DESIGN_SCALE_ANCHORS[collaborationDesign5],
    playbook,
    base: ai,
  };
}
