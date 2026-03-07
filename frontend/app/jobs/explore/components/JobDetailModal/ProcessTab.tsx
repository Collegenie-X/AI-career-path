'use client';

import { useState, useCallback } from 'react';
import { Clock, Briefcase, Zap } from 'lucide-react';
import { LABELS } from '../../config';
import type { Job, StarData, WorkPhase } from '../../types';

interface ProcessTabProps {
  job: Job;
  star: StarData;
}

function ProcessHeader({
  title,
  description,
  phaseCount,
  starColor,
}: {
  title: string;
  description: string;
  phaseCount: number;
  starColor: string;
}) {
  return (
    <div
      className="rounded-2xl p-4 mb-5 border"
      style={{
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderColor: `${starColor}25`,
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${starColor}20` }}
        >
          <span className="text-xl">🏛️</span>
        </div>
        <div className="flex-1">
          <h3 className="font-extrabold text-white text-base">{title}</h3>
          <span
            className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ backgroundColor: `${starColor}18`, color: starColor }}
          >
            {phaseCount}
            {LABELS.process_phase_badge}
          </span>
        </div>
      </div>
      {description && (
        <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
      )}
    </div>
  );
}

function PhaseStepItem({
  phase,
  index,
  starColor,
  isLast,
  isExpanded,
  onToggle,
}: {
  phase: WorkPhase;
  index: number;
  starColor: string;
  isLast: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="mb-3">
      <div className="flex gap-2">
        <div className="w-9 flex flex-col items-center">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 z-10"
            style={{
              backgroundColor: isExpanded ? `${starColor}30` : `${starColor}15`,
              borderColor: isExpanded ? starColor : `${starColor}40`,
            }}
          >
            <span
              className="text-[11px] font-extrabold"
              style={{ color: isExpanded ? starColor : `${starColor}90` }}
            >
              {index + 1}
            </span>
          </div>
          {!isLast && (
            <div
              className="flex-1 w-0.5 min-h-4 mt-0.5"
              style={{
                backgroundColor: isExpanded ? `${starColor}25` : 'rgba(255,255,255,0.08)',
              }}
            />
          )}
        </div>

        <div
          className="flex-1 rounded-xl border overflow-hidden"
          style={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            borderColor: 'rgba(255,255,255,0.07)',
          }}
        >
          <button
            type="button"
            onClick={onToggle}
            className="w-full flex items-center gap-2 p-3 text-left transition-colors"
            style={{
              backgroundColor: isExpanded ? 'rgba(255,255,255,0.05)' : 'transparent',
            }}
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{
                backgroundColor: isExpanded ? `${starColor}20` : 'rgba(255,255,255,0.06)',
              }}
            >
              <span className="text-lg">{phase.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-gray-500">
                {LABELS.process_step_prefix} {index + 1} · {phase.phase}
              </div>
              <div
                className={`text-sm font-extrabold ${isExpanded ? 'text-white' : 'text-gray-400'}`}
              >
                {phase.title}
              </div>
            </div>
            <div
              className="px-2 py-0.5 rounded-full text-[10px] font-bold flex-shrink-0"
              style={{ backgroundColor: `${starColor}18`, color: starColor }}
            >
              {phase.duration}
            </div>
          </button>

          {isExpanded && (
            <PhaseExpandedContent phase={phase} starColor={starColor} />
          )}
        </div>
      </div>
    </div>
  );
}

function PhaseExpandedContent({ phase, starColor }: { phase: WorkPhase; starColor: string }) {
  const tools = phase.tools ?? [];
  const skills = phase.skills ?? [];

  return (
    <div
      className="p-3 border-t space-y-3"
      style={{ borderColor: 'rgba(255,255,255,0.06)' }}
    >
      <p className="text-sm text-gray-400 leading-relaxed">{phase.description}</p>

      {phase.example && (
        <div
          className="rounded-xl p-3 border-l-4"
          style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderLeftColor: starColor,
          }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-base">💡</span>
            <span className="text-xs font-extrabold" style={{ color: starColor }}>
              {LABELS.modal_example}
            </span>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed">{phase.example}</p>
        </div>
      )}

      <div className="space-y-2">
        {tools.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Briefcase className="w-3 h-3 text-gray-500" />
              <span className="text-xs font-bold text-gray-500">{LABELS.modal_tools}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tools.map((tool) => (
                <span
                  key={tool}
                  className="px-2 py-1 rounded-lg text-xs font-semibold"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.8)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}

        {skills.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Zap className="w-3 h-3 text-gray-500" />
              <span className="text-xs font-bold text-gray-500">{LABELS.modal_skills}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-1 rounded-lg text-xs font-bold"
                  style={{
                    backgroundColor: 'rgba(108,92,231,0.12)',
                    color: '#A29BFE',
                  }}
                >
                  ⚡ {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ProcessTab({ job, star }: ProcessTabProps) {
  const workProcess = job.workProcess;
  const [expandedIndex, setExpandedIndex] = useState<number>(0);

  const handleToggle = useCallback((index: number) => {
    setExpandedIndex((prev) => (prev === index ? -1 : index));
  }, []);

  if (!workProcess?.phases?.length) {
    return (
      <div className="px-4 py-12 text-center text-gray-500 text-sm">
        직무 프로세스 정보가 준비 중입니다
      </div>
    );
  }

  const phases = workProcess.phases;
  const title = workProcess.title ?? `${job.name} 직무 프로세스`;
  const description = workProcess.description ?? '';

  return (
    <div className="px-4 pt-3 pb-6">
      <ProcessHeader
        title={title}
        description={description}
        phaseCount={phases.length}
        starColor={star.color}
      />
      {phases.map((phase, index) => (
        <PhaseStepItem
          key={phase.id}
          phase={phase}
          index={index}
          starColor={star.color}
          isLast={index === phases.length - 1}
          isExpanded={expandedIndex === index}
          onToggle={() => handleToggle(index)}
        />
      ))}
    </div>
  );
}
