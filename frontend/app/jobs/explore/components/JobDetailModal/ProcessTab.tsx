'use client';

import { useState, useCallback } from 'react';
import { Clock, Briefcase, Zap, Brain, Gamepad2, List } from 'lucide-react';
import { LABELS, HOLLAND_CODE_LABELS } from '../../config';
import { ProcessQuizGame } from './ProcessQuizGame';
import type { Job, StarData, WorkPhase } from '../../types';

type ProcessViewMode = 'quiz' | 'full';

function parseHolland(code: string): string {
  return code
    .split(/\+/)
    .map((c) => HOLLAND_CODE_LABELS[c.trim()] ?? c.trim())
    .filter(Boolean)
    .join(' + ');
}

interface ProcessTabProps {
  job: Job;
  star: StarData;
}

function ProcessHeaderCard({
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
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderColor: `${starColor}30`,
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
            className="inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-bold"
            style={{ backgroundColor: `${starColor}18`, color: starColor }}
          >
            {phaseCount}
            {LABELS.process_phase_badge}
          </span>
        </div>
      </div>
      {description && (
        <p className="text-sm text-gray-300 leading-relaxed">{description}</p>
      )}
    </div>
  );
}

function ProcessTreeNode({
  phase,
  index,
  starColor,
  isLast,
}: {
  phase: WorkPhase;
  index: number;
  starColor: string;
  isLast: boolean;
}) {
  const tools = Array.isArray(phase.tools) ? phase.tools : [];
  const skills = Array.isArray(phase.skills) ? phase.skills : [];

  return (
    <div className="relative flex gap-4">
      {/* Left: icon on timeline */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center border-2 z-10"
          style={{
            background: `${starColor}20`,
            borderColor: starColor,
            boxShadow: `0 0 12px ${starColor}50`,
          }}
        >
          <span className="text-xl">{phase.icon}</span>
        </div>
        {!isLast && (
          <div
            className="flex-1 w-0.5 min-h-8 mt-1"
            style={{ backgroundColor: starColor, opacity: 0.4 }}
          />
        )}
      </div>

      {/* Right: content */}
      <div className="flex-1 min-w-0 pb-8">
        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
          <span
            className="px-3 py-1.5 rounded-full text-xs font-extrabold"
            style={{
              backgroundColor: `${starColor}15`,
              color: starColor,
              border: `1px solid ${starColor}40`,
            }}
          >
            STEP {index + 1} · {phase.phase}
          </span>
          <span className="text-xs font-semibold" style={{ color: starColor }}>
            {phase.duration}
          </span>
        </div>

        <h4 className="font-extrabold text-white text-base mb-2 leading-snug">{phase.title}</h4>

        <p className="text-sm text-gray-300 leading-relaxed mb-3">{phase.description}</p>

        {phase.example && (
          <div
            className="p-3 rounded-xl mb-3"
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: `1px solid ${starColor}30`,
            }}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-base">💡</span>
              <span className="text-xs font-extrabold" style={{ color: starColor }}>
                실제 예시
              </span>
            </div>
            <p className="text-sm text-gray-200 leading-relaxed">{phase.example}</p>
          </div>
        )}

        <div className="space-y-2.5">
          {tools.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs font-bold text-gray-400">사용 도구</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {tools.map((tool, i) => (
                  <span
                    key={`${tool}-${i}`}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold"
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
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-xs font-bold text-gray-400">필요 스킬</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill, i) => (
                  <span
                    key={`${skill}-${i}`}
                    className="px-2.5 py-1 rounded-lg text-xs font-bold"
                    style={{
                      backgroundColor: 'rgba(251,191,36,0.12)',
                      color: '#fbbf24',
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
    </div>
  );
}

function ProcessTree({ phases, starColor }: { phases: WorkPhase[]; starColor: string }) {
  if (phases.length === 0) return null;

  return (
    <div className="relative pl-0.5">
      {/* Glowing vertical line */}
      <div
        className="absolute left-[24px] top-6 bottom-0 w-0.5 -translate-x-1/2"
        style={{
          backgroundColor: starColor,
          opacity: 0.5,
          boxShadow: `0 0 8px ${starColor}50`,
        }}
        aria-hidden
      />
      <div className="relative space-y-0">
        {phases.map((phase, index) => (
          <ProcessTreeNode
            key={phase.id}
            phase={phase}
            index={index}
            starColor={starColor}
            isLast={index === phases.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

export function ProcessTab({ job, star }: ProcessTabProps) {
  const workProcess = job.workProcess;
  const [viewMode, setViewMode] = useState<ProcessViewMode>('full');

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

  const hollandLabel = parseHolland(job.holland);

  return (
    <div className="pt-3 pb-6">
      <div className="px-4">
        <ProcessHeaderCard
          title={title}
          description={description}
          phaseCount={phases.length}
          starColor={star.color}
        />

        {/* 직무 성향 */}
        <div
          className="rounded-2xl px-3 py-2.5 mb-4 flex items-center gap-2.5"
          style={{ background: `${star.color}12`, border: `1px solid ${star.color}30` }}
        >
          <Brain className="w-4 h-4 flex-shrink-0" style={{ color: star.color }} />
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: star.color }}>
              {LABELS.process_job_tendency}
            </span>
            <p className="text-sm font-bold text-white mt-0.5">{hollandLabel}</p>
          </div>
        </div>

        {/* 퀴즈 / 전체 보기 모드 전환 */}
        <div
          className="flex rounded-xl overflow-hidden border mb-4"
          style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderColor: 'rgba(255,255,255,0.1)',
          }}
        >
          <button
            type="button"
            onClick={() => setViewMode('quiz')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold transition-colors ${
              viewMode === 'quiz' ? 'text-white' : 'text-gray-500'
            }`}
            style={
              viewMode === 'quiz'
                ? {
                    backgroundColor: `${star.color}25`,
                    color: star.color,
                  }
                : {}
            }
          >
            <Gamepad2 className="w-4 h-4" />
            {LABELS.process_quiz_mode}
          </button>
          <button
            type="button"
            onClick={() => setViewMode('full')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold transition-colors ${
              viewMode === 'full' ? 'text-white' : 'text-gray-500'
            }`}
            style={
              viewMode === 'full'
                ? {
                    backgroundColor: `${star.color}25`,
                    color: star.color,
                  }
                : {}
            }
          >
            <List className="w-4 h-4" />
            {LABELS.process_full_mode}
          </button>
        </div>
      </div>

      {viewMode === 'quiz' ? (
        <ProcessQuizGame
          phases={phases}
          starColor={star.color}
          jobName={job.name}
          onViewFull={() => setViewMode('full')}
        />
      ) : (
        <div className="px-4">
          <ProcessTree phases={phases} starColor={star.color} />
        </div>
      )}
    </div>
  );
}
