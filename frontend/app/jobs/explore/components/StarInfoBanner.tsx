'use client';

import { useState } from 'react';
import type { StarData } from '../types';
import { LABELS } from '../config';

interface StarInfoBannerProps {
  star: StarData;
}

function DifficultyDots({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5 justify-center">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: i < level ? '#FBBF24' : 'rgba(255,255,255,0.1)' }}
        />
      ))}
    </div>
  );
}

function AccordionSection({
  isExpanded,
  onToggle,
  backgroundColor,
  icon,
  title,
  previewContent,
  children,
}: {
  isExpanded: boolean;
  onToggle: () => void;
  backgroundColor: string;
  icon: string;
  title: string;
  previewContent?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl p-3" style={{ backgroundColor }}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-2 text-left"
      >
        <span className="text-base">{icon}</span>
        <span className="font-bold text-white text-sm flex-1">{title}</span>
        <span className="text-xs text-gray-500 font-bold">{isExpanded ? '▼' : '▶'}</span>
      </button>
      {!isExpanded && previewContent}
      {isExpanded && (
        <div className="pt-3 mt-2 border-t border-white/6">
          {children}
        </div>
      )}
    </div>
  );
}

export function StarInfoBanner({ star }: StarInfoBannerProps) {
  const profile = star.starProfile;
  const [isTraitsExpanded, setIsTraitsExpanded] = useState(false);
  const [isFitExpanded, setIsFitExpanded] = useState(false);
  const [isNotFitExpanded, setIsNotFitExpanded] = useState(false);
  const [isWhyExpanded, setIsWhyExpanded] = useState(false);

  if (!profile) {
    return (
      <div
        className="rounded-2xl p-3 flex items-center gap-3 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${star.bgColor}ee, ${star.bgColor}88)`,
          border: `2px solid ${star.color}55`,
        }}
      >
        <div className="absolute -right-3 -top-3 text-6xl opacity-10">{star.emoji}</div>
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: `${star.color}33`, border: `2px solid ${star.color}66` }}
        >
          {star.emoji}
        </div>
        <div className="flex-1">
          <div className="font-bold text-white text-base">{star.name}</div>
          <div className="text-xs leading-relaxed mt-0.5" style={{ color: `${star.color}cc` }}>
            {star.description}
          </div>
        </div>
      </div>
    );
  }

  const difficultyText =
    profile.difficultyLevel != null
      ? LABELS.star_difficulty_levels[String(profile.difficultyLevel)] ?? ''
      : '';

  return (
    <div className="mb-4">
      <div
        className="rounded-2xl p-4 gap-3 flex flex-col"
        style={{
          backgroundColor: `${star.color}08`,
          border: `1.5px solid ${star.color}25`,
        }}
      >
        {/* 태그라인 & 해시태그 */}
        <div className="pb-3 border-b border-white/8 space-y-1">
          {profile.tagline && (
            <p className="text-sm font-extrabold text-white text-center leading-relaxed">
              &quot;{profile.tagline}&quot;
            </p>
          )}
          {profile.careerKeyword && (
            <div className="flex flex-wrap justify-center gap-1.5 mt-2">
              {profile.careerKeyword
                .split(/\s+/)
                .filter((tag) => tag.startsWith('#'))
                .map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 rounded-full text-xs font-bold"
                    style={{ backgroundColor: `${star.color}15`, color: star.color }}
                  >
                    {tag}
                  </span>
                ))}
            </div>
          )}
        </div>

        {/* 핵심 특성 아코디언 */}
        {profile.coreTraits && profile.coreTraits.length > 0 && (
          <AccordionSection
            isExpanded={isTraitsExpanded}
            onToggle={() => setIsTraitsExpanded(!isTraitsExpanded)}
            backgroundColor="rgba(255,255,255,0.04)"
            icon="🎯"
            title={LABELS.star_core_traits_title}
            previewContent={
              <div className="flex flex-wrap gap-2 mt-3">
                {profile.coreTraits.map((trait) => (
                  <div
                    key={trait.label}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/6"
                  >
                    <span className="text-sm">{trait.icon}</span>
                    <span className="text-sm font-bold text-white">{trait.label}</span>
                  </div>
                ))}
              </div>
            }
          >
            <div className="flex flex-wrap gap-2">
              {profile.coreTraits.map((trait) => (
                <div
                  key={trait.label}
                  className="w-[48%] rounded-xl p-3 bg-white/4 border border-white/10 text-center"
                >
                  <span className="text-lg block mb-0.5">{trait.icon}</span>
                  <div className="text-sm font-extrabold text-white">{trait.label}</div>
                  <div className="text-xs text-gray-400 leading-relaxed mt-0.5">{trait.desc}</div>
                </div>
              ))}
            </div>
          </AccordionSection>
        )}

        {/* 잘 맞는 사람 아코디언 */}
        {profile.fitPersonality && (
          <AccordionSection
            isExpanded={isFitExpanded}
            onToggle={() => setIsFitExpanded(!isFitExpanded)}
            backgroundColor="rgba(34,197,94,0.08)"
            icon="✨"
            title={profile.fitPersonality.title}
            previewContent={
              <p className="text-sm text-gray-500 mt-2">
                {profile.fitPersonality.traits.length}
                {LABELS.star_view_more_traits}
              </p>
            }
          >
            <div className="space-y-2">
              {profile.fitPersonality.traits.map((trait, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span className="text-sm text-gray-300 leading-relaxed flex-1">{trait}</span>
                </div>
              ))}
            </div>
          </AccordionSection>
        )}

        {/* 맞지 않는 사람 아코디언 */}
        {profile.fitPersonality?.notFit && profile.fitPersonality.notFit.length > 0 && (
          <AccordionSection
            isExpanded={isNotFitExpanded}
            onToggle={() => setIsNotFitExpanded(!isNotFitExpanded)}
            backgroundColor="rgba(239,68,68,0.06)"
            icon="⚠️"
            title={LABELS.star_not_fit_title}
            previewContent={
              <p className="text-sm text-gray-500 mt-2">
                {profile.fitPersonality.notFit.length}가지 주의 사항
              </p>
            }
          >
            <div className="space-y-2">
              {profile.fitPersonality.notFit.map((trait, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">✗</span>
                  <span className="text-sm text-gray-300 leading-relaxed flex-1">{trait}</span>
                </div>
              ))}
            </div>
          </AccordionSection>
        )}

        {/* 왜 이 직업들을 묶었나 아코디언 */}
        {profile.whyThisGroup && (
          <AccordionSection
            isExpanded={isWhyExpanded}
            onToggle={() => setIsWhyExpanded(!isWhyExpanded)}
            backgroundColor="rgba(168,85,247,0.08)"
            icon="💡"
            title={profile.whyThisGroup.title}
            previewContent={
              <div className="flex flex-wrap gap-1 mt-2 items-center">
                {profile.whyThisGroup.commonDNA.slice(0, 3).map((dna) => (
                  <span
                    key={dna}
                    className="px-2 py-0.5 rounded-full text-xs font-bold"
                    style={{ backgroundColor: `${star.color}15`, color: star.color }}
                  >
                    {dna}
                  </span>
                ))}
                {profile.whyThisGroup.commonDNA.length > 3 && (
                  <span className="text-xs text-gray-500 font-bold">
                    +{profile.whyThisGroup.commonDNA.length - 3}
                  </span>
                )}
              </div>
            }
          >
            <div className="space-y-3">
              <p className="text-sm text-gray-300 leading-relaxed">{profile.whyThisGroup.reason}</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.whyThisGroup.commonDNA.map((dna) => (
                  <span
                    key={dna}
                    className="px-3 py-1 rounded-full text-xs font-extrabold"
                    style={{ backgroundColor: `${star.color}15`, color: star.color }}
                  >
                    {dna}
                  </span>
                ))}
              </div>
            </div>
          </AccordionSection>
        )}

        {/* 메타 정보 카드 */}
        <div className="flex gap-2">
          {profile.difficultyLevel != null && (
            <div className="flex-1 rounded-xl p-3 bg-white/4 text-center">
              <span className="text-lg block">📊</span>
              <div className="text-xs text-gray-500">{LABELS.star_difficulty_label}</div>
              <DifficultyDots level={profile.difficultyLevel} />
              <div className="text-[10px] font-bold mt-0.5" style={{ color: star.color }}>
                {difficultyText}
              </div>
            </div>
          )}
          {profile.avgPreparationYears != null && (
            <div className="flex-1 rounded-xl p-3 bg-white/4 text-center">
              <span className="text-lg block">⏱️</span>
              <div className="text-xs text-gray-500">{LABELS.star_preparation_label}</div>
              <div className="text-lg font-extrabold" style={{ color: star.color }}>
                {profile.avgPreparationYears}
                {LABELS.star_preparation_unit}
              </div>
              <div className="text-[10px] text-gray-500 text-center">
                {LABELS.star_preparation_sub_label}
              </div>
            </div>
          )}
        </div>

        {/* Holland 코드 + 핵심 과목 */}
        {(profile.hollandCode || (profile.keySubjects && profile.keySubjects.length > 0)) && (
          <div className="rounded-xl p-3 bg-white/4 space-y-2">
            {profile.hollandCode && (
              <div className="flex items-center gap-2">
                <span className="text-sm">🔖</span>
                <span className="text-sm font-bold text-white">{LABELS.star_holland_code_label}</span>
                <span
                  className="ml-auto px-3 py-0.5 rounded-full text-sm font-extrabold"
                  style={{ backgroundColor: `${star.color}25`, color: star.color }}
                >
                  {profile.hollandCode}
                </span>
              </div>
            )}
            {profile.keySubjects && profile.keySubjects.length > 0 && (
              <div>
                <div className="text-xs text-gray-500 mb-1">{LABELS.star_key_subjects_label}</div>
                <div className="flex flex-wrap gap-1">
                  {profile.keySubjects.map((subject) => (
                    <span
                      key={subject}
                      className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ backgroundColor: `${star.color}15`, color: star.color }}
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
