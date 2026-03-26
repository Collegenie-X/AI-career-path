'use client';

import { TrendingUp, Clock, Award, Briefcase } from 'lucide-react';
import { ORGANIZATION_STRUCTURE_LABELS } from '../../config/organizationStructureLabels';
import type { Job, OrganizationLevel, StarData } from '../../types';

interface OrganizationStructureTabProps {
  job: Job;
  star: StarData;
}

/** 상·하 직급 카드 사이: 세로선 + 중앙 노드로 트리 연결 */
function OrganizationLevelNarrativeBlocks({
  level,
  accentColor,
}: {
  level: OrganizationLevel;
  accentColor: string;
}) {
  const hasNarrative = Boolean(level.roleNarrative?.trim() || level.competencyNarrative?.trim());
  const cardClass =
    'rounded-lg border border-white/[0.08] bg-white/[0.03] p-3 text-xs text-gray-300 leading-relaxed';

  if (hasNarrative) {
    return (
      <div className="space-y-2.5">
        {level.roleNarrative?.trim() ? (
          <div className={cardClass}>
            <div className="mb-1.5 text-[11px] font-bold text-gray-400">
              {ORGANIZATION_STRUCTURE_LABELS.level_role_heading}
            </div>
            <p>{level.roleNarrative.trim()}</p>
          </div>
        ) : null}
        {level.competencyNarrative?.trim() ? (
          <div className={cardClass} style={{ borderColor: `${accentColor}33` }}>
            <div className="mb-1.5 text-[11px] font-bold" style={{ color: accentColor }}>
              {ORGANIZATION_STRUCTURE_LABELS.level_competency_heading}
            </div>
            <p className="text-gray-300">{level.competencyNarrative.trim()}</p>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {level.roles && level.roles.length > 0 ? (
        <div>
          <div className="text-[11px] font-bold text-gray-400 uppercase mb-1">
            {ORGANIZATION_STRUCTURE_LABELS.level_role_heading}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {level.roles.map((role, ridx) => (
              <span
                key={ridx}
                className="px-2.5 py-1 rounded-md text-xs font-medium"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: '#e5e7eb',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      ) : null}
      {level.requiredSkills && level.requiredSkills.length > 0 ? (
        <div>
          <div className="text-[11px] font-bold text-gray-400 uppercase mb-1">
            {ORGANIZATION_STRUCTURE_LABELS.level_competency_heading}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {level.requiredSkills.map((skill, sidx) => (
              <span
                key={sidx}
                className="px-2.5 py-1 rounded-md text-xs font-semibold"
                style={{
                  background: `${accentColor}20`,
                  color: accentColor,
                  border: `1px solid ${accentColor}40`,
                }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function OrganizationTreeLevelConnector({ accentColor }: { accentColor: string }) {
  return (
    <div className="flex flex-col items-center py-0.5" aria-hidden>
      <div
        className="w-[2px] h-3.5 rounded-full shrink-0"
        style={{
          background: `linear-gradient(to bottom, ${accentColor}35, ${accentColor})`,
        }}
      />
      <div
        className="my-0.5 h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-white/15"
        style={{
          backgroundColor: accentColor,
          boxShadow: `0 0 0 3px ${accentColor}28, 0 0 14px ${accentColor}44`,
        }}
      />
      <div
        className="w-[2px] h-3.5 rounded-full shrink-0"
        style={{
          background: `linear-gradient(to bottom, ${accentColor}, ${accentColor}35)`,
        }}
      />
    </div>
  );
}

export function OrganizationStructureTab({ job, star }: OrganizationStructureTabProps) {
  const org = job.organizationStructure;

  if (!org || !org.levels || org.levels.length === 0) {
    return (
      <div className="p-6 text-center text-gray-400">
        <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">조직 구조 정보가 준비 중입니다.</p>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-5">
      {/* 헤더 */}
      <section>
        <h3 className="text-base font-bold text-white mb-1">{org.title}</h3>
        <p className="text-xs text-gray-400 leading-relaxed">{org.description}</p>
      </section>

      {/* 상하 트리: 상단(고직급) → 하단(신입), 카드 사이 세로선·노드로 연결 */}
      <section aria-label="직급 계층 트리">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="mx-auto flex w-full max-w-lg flex-col items-center">
            {org.levels
              .slice()
              .sort((a, b) => b.level - a.level)
              .map((lvl, idx) => {
                const isTop = idx === 0;
                const isBottom = idx === org.levels.length - 1;

                return (
                  <div key={lvl.level} className="flex w-full flex-col items-center">
                    <div
                      className="w-full rounded-xl p-4 relative overflow-hidden transition-all hover:scale-[1.01]"
                      style={{
                        background: `linear-gradient(135deg, ${star.color}${isTop ? '22' : isBottom ? '08' : '14'}, rgba(255,255,255,0.03))`,
                        border: `1.5px solid ${star.color}${isTop ? '50' : '28'}`,
                        boxShadow: isTop ? `0 4px 20px ${star.color}30` : 'none',
                      }}
                    >
                    <div className="absolute -right-4 -top-4 text-6xl opacity-10">{lvl.icon}</div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{lvl.icon}</span>
                          <h4 className="text-base font-bold text-white">{lvl.title}</h4>
                        </div>
                        <div
                          className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                          style={{
                            background: `${star.color}30`,
                            color: star.color,
                          }}
                        >
                          Lv.{lvl.level}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-3 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-xs text-gray-300 font-medium">{lvl.yearsRange}</span>
                        </div>
                        {lvl.avgSalary && lvl.avgSalary !== '—' && (
                          <div className="flex items-center gap-1.5">
                            <Award className="w-3.5 h-3.5 text-yellow-400" />
                            <span className="text-xs text-gray-300 font-medium">{lvl.avgSalary}</span>
                          </div>
                        )}
                      </div>

                      <OrganizationLevelNarrativeBlocks level={lvl} accentColor={star.color} />
                    </div>
                  </div>

                    {!isBottom && (
                      <OrganizationTreeLevelConnector accentColor={star.color} />
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      {/* 승진 기준 */}
      {org.promotionCriteria && org.promotionCriteria.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4" style={{ color: star.color }} />
            <h3 className="text-sm font-bold text-white">
              {ORGANIZATION_STRUCTURE_LABELS.promotion_section_title}
            </h3>
          </div>
          <div className="space-y-2">
            {org.promotionCriteria.map((criteria, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <p className="text-xs text-gray-300 leading-relaxed">{criteria}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 커리어 경로 */}
      {org.careerPaths && org.careerPaths.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="w-4 h-4" style={{ color: star.color }} />
            <h3 className="text-sm font-bold text-white">
              {ORGANIZATION_STRUCTURE_LABELS.career_paths_section_title}
            </h3>
          </div>
          <div className="space-y-2">
            {org.careerPaths.map((path, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div className="text-sm font-bold text-white mb-1">{path.path}</div>
                <p className="text-xs text-gray-300 leading-relaxed">{path.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
