'use client';

import { Rocket, Wrench, CheckCircle2, Package, Clock, Wallet, BookmarkCheck } from 'lucide-react';
import { LABELS } from '../../config';
import type { Job, JobProject, StarData } from '../../types';
import { GlossaryText, GlossaryChip } from '@/components/shared/GlossaryText';

interface ProjectTabProps {
  job: Job;
  star: StarData;
}

function TrackHeaderCard({
  title,
  why,
  stack,
  count,
  starColor,
}: {
  title: string;
  why: string;
  stack: string[];
  count: number;
  starColor: string;
}) {
  return (
    <div
      className="rounded-2xl p-4 mb-5 border"
      style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: `${starColor}30` }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${starColor}20` }}
        >
          <Rocket className="w-5 h-5" style={{ color: starColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-extrabold text-white text-base leading-snug">{title}</h3>
          <span
            className="inline-block mt-1 px-2 py-0.5 rounded-full text-[11px] font-bold"
            style={{ backgroundColor: `${starColor}18`, color: starColor }}
          >
            {count}
            {LABELS.project_track_count_suffix}
          </span>
        </div>
      </div>

      <div className="mb-3">
        <div className="text-[11px] font-extrabold mb-1" style={{ color: starColor }}>
          {LABELS.project_track_why_label}
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">
          <GlossaryText>{why}</GlossaryText>
        </p>
      </div>

      {stack.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <Wrench className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs font-bold text-gray-400">{LABELS.project_track_stack_label}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {stack.map((tool, i) => (
              <span
                key={`${tool}-${i}`}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.8)',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <GlossaryChip token={tool} />
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-xs font-bold text-gray-400">{label}</span>
      </div>
      <p className="text-sm leading-relaxed" style={{ color }}>
        <GlossaryText>{value}</GlossaryText>
      </p>
    </div>
  );
}

function ProjectNode({
  project,
  index,
  starColor,
  isLast,
}: {
  project: JobProject;
  index: number;
  starColor: string;
  isLast: boolean;
}) {
  return (
    <div className="relative flex gap-4">
      {/* 왼쪽: 타임라인 아이콘 */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center border-2 z-10"
          style={{
            background: `${starColor}20`,
            borderColor: starColor,
            boxShadow: `0 0 12px ${starColor}50`,
          }}
        >
          <span className="text-xl">{project.icon}</span>
        </div>
        {!isLast && (
          <div className="flex-1 w-0.5 min-h-8 mt-1" style={{ backgroundColor: starColor, opacity: 0.4 }} />
        )}
      </div>

      {/* 오른쪽: 내용 */}
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
            PROJECT {index + 1} · {project.level}
          </span>
          <span className="text-xs font-semibold" style={{ color: starColor }}>
            {project.stage}
          </span>
        </div>

        <h4 className="font-extrabold text-white text-base mb-2 leading-snug">{project.title}</h4>

        <div
          className="p-3 rounded-xl mb-3"
          style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: `1px solid ${starColor}30` }}
        >
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-base">🎯</span>
            <span className="text-xs font-extrabold" style={{ color: starColor }}>
              {LABELS.project_track_mission_label}
            </span>
          </div>
          <p className="text-sm text-gray-200 leading-relaxed">
            <GlossaryText>{project.mission}</GlossaryText>
          </p>
        </div>

        {/* 실행 단계 */}
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" style={{ color: starColor }} />
            <span className="text-xs font-bold text-gray-400">{LABELS.project_track_steps_label}</span>
          </div>
          <ol className="space-y-1.5">
            {project.steps.map((step, i) => (
              <li key={`${step}-${i}`} className="flex gap-2">
                <span
                  className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-extrabold mt-0.5"
                  style={{ backgroundColor: `${starColor}20`, color: starColor }}
                >
                  {i + 1}
                </span>
                <span className="text-sm text-gray-300 leading-relaxed">
                  <GlossaryText>{step}</GlossaryText>
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* 도구 */}
        {project.aiStack.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Wrench className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs font-bold text-gray-400">
                {LABELS.project_track_stack_item_label}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {project.aiStack.map((tool, i) => (
                <span
                  key={`${tool}-${i}`}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    color: 'rgba(255,255,255,0.8)',
                    border: '1px solid rgba(255,255,255,0.12)',
                  }}
                >
                  <GlossaryChip token={tool} />
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2.5">
          <InfoRow
            icon={<Package className="w-3.5 h-3.5 text-gray-400" />}
            label={LABELS.project_track_deliverable_label}
            value={project.deliverable}
            color="rgba(255,255,255,0.85)"
          />
          <InfoRow
            icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            label={LABELS.project_track_proof_label}
            value={project.proof}
            color="#6ee7b7"
          />
          <InfoRow
            icon={<BookmarkCheck className="w-3.5 h-3.5 text-amber-400" />}
            label={LABELS.project_track_record_label}
            value={project.record}
            color="#fbbf24"
          />
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.75)' }}
          >
            <Clock className="w-3 h-3" />
            {LABELS.project_track_duration_label} {project.duration}
          </span>
          <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold"
            style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.75)' }}
          >
            <Wallet className="w-3 h-3" />
            {LABELS.project_track_cost_label} {project.cost}
          </span>
        </div>
      </div>
    </div>
  );
}

export function ProjectTab({ job, star }: ProjectTabProps) {
  const track = job.projectTrack;

  if (!track?.projects?.length) {
    return (
      <div className="px-4 py-12 text-center text-gray-500 text-sm">
        프로젝트 트랙이 준비 중입니다
      </div>
    );
  }

  return (
    <div className="pt-3 pb-6">
      <div className="px-4">
        <TrackHeaderCard
          title={track.title}
          why={track.why}
          stack={track.stack ?? []}
          count={track.projects.length}
          starColor={star.color}
        />

        <div className="relative pl-0.5">
          <div
            className="absolute left-[24px] top-6 bottom-0 w-0.5 -translate-x-1/2"
            style={{ backgroundColor: star.color, opacity: 0.5, boxShadow: `0 0 8px ${star.color}50` }}
            aria-hidden
          />
          <div className="relative space-y-0">
            {track.projects.map((project, index) => (
              <ProjectNode
                key={`${project.level}-${index}`}
                project={project}
                index={index}
                starColor={star.color}
                isLast={index === track.projects.length - 1}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
