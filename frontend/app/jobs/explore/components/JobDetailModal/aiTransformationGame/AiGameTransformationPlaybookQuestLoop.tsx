'use client';

import {
  BookOpen,
  Compass,
  Cpu,
  PenLine,
  RefreshCw,
  ShieldCheck,
  Users,
  Wrench,
} from 'lucide-react';
import type { AiCollaborationPlaybookStepResolved } from '@/lib/jobs/resolveAiTransformationDetail';
import { AI_ERA_SECTION_LABELS } from '../../../config/aiEraTransformationLabels';

type AiEraSectionLabels = typeof AI_ERA_SECTION_LABELS;

const STEP_ICONS: Record<string, React.ElementType> = {
  frame: Compass,
  draft: PenLine,
  verify: ShieldCheck,
  learn: RefreshCw,
};

function resolvePlaybookIcon(stepKey: string): React.ElementType {
  return STEP_ICONS[stepKey] ?? BookOpen;
}

interface AiGameTransformationPlaybookQuestLoopProps {
  starColor: string;
  playbook: AiCollaborationPlaybookStepResolved[];
  labels: AiEraSectionLabels;
  title: string;
  intro: string;
}

export function AiGameTransformationPlaybookQuestLoop({
  starColor,
  playbook,
  labels,
  title,
  intro,
}: AiGameTransformationPlaybookQuestLoopProps) {
  return (
    <section>
      <div className="mb-3 flex items-start gap-2">
        <div
          className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
          style={{
            background: `${starColor}20`,
            border: `1px solid ${starColor}38`,
          }}
        >
          <BookOpen className="h-4 w-4" style={{ color: starColor }} />
        </div>
        <div>
          <h3 className="text-sm font-black text-white">{title}</h3>
          <p className="mt-1 text-[11px] leading-relaxed text-gray-500">{intro}</p>
        </div>
      </div>
      <div className="space-y-3">
        {playbook.map((step, idx) => {
          const StepIcon = resolvePlaybookIcon(step.stepKey);
          return (
            <div
              key={step.stepKey + String(idx)}
              className="overflow-hidden rounded-2xl"
              style={{
                border: `1px solid ${starColor}30`,
                background: 'linear-gradient(165deg, rgba(255,255,255,0.04), rgba(0,0,0,0.35))',
                boxShadow: `0 8px 28px ${starColor}12`,
              }}
            >
              <div
                className="flex items-center gap-2 px-3 py-2.5"
                style={{
                  background: `linear-gradient(90deg, ${starColor}40, transparent)`,
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{
                    background: 'rgba(0,0,0,0.35)',
                    border: `1px solid ${starColor}45`,
                  }}
                >
                  <StepIcon className="h-4 w-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    Chapter {idx + 1}
                  </div>
                  <div className="truncate text-xs font-bold text-white">{step.stepTitle}</div>
                </div>
              </div>
              <div className="space-y-3 p-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div
                    className="rounded-xl p-2.5"
                    style={{
                      background: 'rgba(56, 189, 248, 0.06)',
                      border: '1px solid rgba(56, 189, 248, 0.18)',
                    }}
                  >
                    <div className="mb-1.5 flex items-center gap-1.5">
                      <Cpu className="h-3.5 w-3.5 text-sky-400" />
                      <span className="text-[11px] font-bold text-sky-300">{labels.aiColumn}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-gray-300">{step.aiRole}</p>
                  </div>
                  <div
                    className="rounded-xl p-2.5"
                    style={{
                      background: 'rgba(251, 191, 36, 0.06)',
                      border: '1px solid rgba(251, 191, 36, 0.16)',
                    }}
                  >
                    <div className="mb-1.5 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-amber-200" />
                      <span className="text-[11px] font-bold text-amber-100">{labels.humanColumn}</span>
                    </div>
                    <p className="text-xs leading-relaxed text-gray-300">{step.humanRole}</p>
                  </div>
                </div>
                <div
                  className="rounded-xl p-3 text-xs leading-relaxed text-gray-200"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <span className="font-bold text-white">{labels.exampleColumn}: </span>
                  {step.scenarioExample}
                </div>
                <div>
                  <div className="mb-2 flex items-center gap-1.5">
                    <Wrench className="h-3.5 w-3.5" style={{ color: starColor }} />
                    <span className="text-[11px] font-bold text-gray-300">{labels.toolsColumn}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {step.recommendedTools.map((tool, tidx) => (
                      <span
                        key={`${tool}-${tidx}`}
                        className="rounded-lg px-2.5 py-1 text-[11px] font-semibold"
                        style={{
                          background: `${starColor}18`,
                          border: `1px solid ${starColor}35`,
                          color: '#e5e7eb',
                        }}
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
