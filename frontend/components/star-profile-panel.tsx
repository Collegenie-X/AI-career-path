'use client';

import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronDown, ChevronUp, Star, Users, BookOpen, Zap, Info, Workflow, Rocket } from 'lucide-react';
import { normalizeStarProfile } from '@/data/stars/normalizeProfile';
import { LABELS } from '@/app/jobs/explore/config';

type StarData = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
  starProfile?: unknown;
};

/* ─── Difficulty Dots ─── */
function DifficultyDots({ level, color }: { level: number; color: string }) {
  return (
    <div className="flex flex-row gap-1 justify-center items-center">
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className="w-2.5 h-2.5 rounded-full transition-all flex-shrink-0"
          style={{ backgroundColor: i < level ? color : 'rgba(255,255,255,0.12)' }}
        />
      ))}
    </div>
  );
}

/* ─── Section Toggle ─── */
function SectionBlock({
  title,
  icon: Icon,
  color,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ElementType;
  color: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: `1px solid ${color}22`, background: 'rgba(255,255,255,0.03)' }}
    >
      <button
        className="w-full flex items-center gap-2.5 px-4 py-3.5"
        onClick={() => setOpen(o => !o)}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}22` }}
        >
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
        <span className="flex-1 text-left text-sm font-bold text-white">{title}</span>
        {open
          ? <ChevronUp className="w-4 h-4 text-gray-500" />
          : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1 border-t border-white/5">
          {children}
        </div>
      )}
    </div>
  );
}

/* ─── Star Profile Panel (Bottom Sheet style — 커리어 패스 다이얼로그와 동일) ─── */
export function StarProfilePanel({
  star,
  onClose,
}: {
  star: StarData;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const rawProfile = star.starProfile;
  const profile = useMemo(
    () => (rawProfile ? normalizeStarProfile(rawProfile as Parameters<typeof normalizeStarProfile>[0]) : null),
    [rawProfile]
  );

  useEffect(() => {
    setMounted(true);
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!profile || !mounted) return null;

  const coreTraitsSection = profile.sections.find((s) => s.id === 'coreTraits');
  const fitSection = profile.sections.find((s) => s.id === 'fitPersonality');
  const whySection = profile.sections.find((s) => s.id === 'whyThisGroup');
  const orchestraSection = profile.sections.find((s) => s.id === 'aiOrchestra');
  const ventureSection = profile.sections.find((s) => s.id === 'venture2032');
  const coreTraits = coreTraitsSection?.type === 'traitGrid' ? coreTraitsSection.items : [];
  const fitItems = fitSection?.type === 'fitList' ? fitSection.fitItems : [];
  const notFitItems = fitSection?.type === 'fitList' ? fitSection.notFitItems : [];

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex flex-col justify-end"
      style={{ backgroundColor: 'rgba(0,0,0,0.82)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] mx-auto rounded-t-3xl overflow-hidden flex flex-col"
        style={{
          backgroundColor: 'rgb(var(--background))',
          border: '1px solid rgba(255,255,255,0.08)',
          borderBottom: 'none',
          maxHeight: 'calc(100vh - 56px)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div
          className="flex-shrink-0 px-5 py-4 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${star.color}28, ${star.color}0a)`,
            borderBottom: `1px solid ${star.color}30`,
          }}
        >
          <div className="absolute -right-4 -top-4 text-8xl opacity-10 select-none pointer-events-none">
            {star.emoji}
          </div>
          <div className="flex items-start gap-3">
            <div
              className="rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{
                width: 52,
                height: 52,
                background: `linear-gradient(135deg, ${star.color}40, ${star.color}18)`,
                border: `1.5px solid ${star.color}44`,
              }}
            >
              {star.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold text-white leading-snug">{star.name}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-xs text-gray-400">{star.description}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Quick stats */}
          <div
            className="flex flex-row items-center mt-3 rounded-xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex-1 flex flex-col items-center justify-center py-2.5 px-2">
              <div className="text-[10px] text-gray-500 mb-1.5 whitespace-nowrap">
                {LABELS.star_preparation_difficulty_label}
              </div>
              <DifficultyDots level={profile.meta.difficultyLevel} color={star.color} />
            </div>
            <div className="w-px self-stretch bg-white/10" />
            <div className="flex-1 flex flex-col items-center justify-center py-2.5 px-2">
              <div className="text-[10px] text-gray-500 mb-1 whitespace-nowrap">
                {LABELS.star_preparation_period_label}
              </div>
              <div className="text-sm font-bold" style={{ color: star.color }}>
                {LABELS.star_preparation_years_prefix} {profile.meta.avgPreparationYears}
                {LABELS.star_preparation_years_suffix}
              </div>
            </div>
            <div className="w-px self-stretch bg-white/10" />
            <div className="flex-1 flex flex-col items-center justify-center py-2.5 px-2">
              <div className="text-[10px] text-gray-500 mb-1 whitespace-nowrap">
                {LABELS.star_key_subjects_label}
              </div>
              <div className="text-[10px] text-gray-300 leading-snug text-center">
                {profile.meta.keySubjects.slice(0, 2).join(' · ')}
              </div>
            </div>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div
          className="flex-1 overflow-y-auto px-5 py-4 space-y-3"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {/* Core Traits */}
          <SectionBlock title={LABELS.star_core_features_title} icon={Star} color={star.color} defaultOpen>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {coreTraits.map((trait, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl"
                  style={{ background: `${star.color}10`, border: `1px solid ${star.color}22` }}
                >
                  <div className="text-xl mb-1">{trait.icon}</div>
                  <div className="text-xs font-bold text-white mb-0.5">{trait.label}</div>
                  <div className="text-[10px] text-gray-400 leading-snug">{trait.desc}</div>
                </div>
              ))}
            </div>
          </SectionBlock>

          {/* AI Orchestra — 지금 바뀌는 역할 */}
          {orchestraSection && orchestraSection.type === 'orchestra' && (
            <SectionBlock
              title={(LABELS as unknown as Record<string, string>)[orchestraSection.titleKey] ?? LABELS.star_ai_orchestra_title}
              icon={Workflow}
              color={star.color}
              defaultOpen
            >
              {/* 역할 이동 */}
              <div className="mt-2 rounded-xl p-3" style={{ background: `${star.color}10`, border: `1px solid ${star.color}22` }}>
                <div className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">
                  {LABELS.star_orchestra_role_shift_label}
                </div>
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <div className="text-[10px] text-gray-500 mb-0.5">{LABELS.star_orchestra_from_label}</div>
                    <div className="text-[11px] text-gray-400 leading-snug line-through decoration-white/20">
                      {orchestraSection.roleShift.from}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 pt-3">→</div>
                  <div className="flex-1">
                    <div className="text-[10px] mb-0.5" style={{ color: star.color }}>
                      {LABELS.star_orchestra_to_label}
                    </div>
                    <div className="text-[11px] text-white font-semibold leading-snug">
                      {orchestraSection.roleShift.to}
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 leading-snug mt-2 pt-2 border-t border-white/8">
                  {orchestraSection.roleShift.note}
                </p>
              </div>

              {/* AI 스택 */}
              <div className="mt-3">
                <div className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">
                  {LABELS.star_orchestra_tool_label}
                </div>
                <div className="space-y-1.5">
                  {orchestraSection.toolStack.map((tool, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 px-3 py-2 rounded-xl bg-white/4 border border-white/8"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold text-white">{tool.name}</div>
                        <div className="text-[10px] text-gray-400 leading-snug">{tool.role}</div>
                      </div>
                      <span
                        className="px-2 py-0.5 rounded-full text-[9px] font-bold flex-shrink-0"
                        style={{ background: `${star.color}20`, color: star.color }}
                      >
                        {tool.level}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 루틴 */}
              <div className="mt-3">
                <div className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">
                  {LABELS.star_orchestra_routine_label}
                </div>
                <div className="space-y-1">
                  {orchestraSection.routine.map((r, i) => (
                    <div key={i} className="text-[11px] text-gray-300 leading-snug">{r}</div>
                  ))}
                </div>
              </div>

              {/* 주목할 변화 */}
              <div className="mt-3 pt-3 border-t border-white/8">
                <div className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">
                  {LABELS.star_orchestra_watch_label}
                </div>
                <div className="space-y-1.5">
                  {orchestraSection.watchNext.map((w, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[10px] flex-shrink-0" style={{ color: star.color }}>●</span>
                      <span className="text-[11px] text-gray-300 leading-snug">{w}</span>
                    </div>
                  ))}
                </div>
              </div>
            </SectionBlock>
          )}

          {/* Fit Personality */}
          {fitSection && (
            <SectionBlock
              title={(LABELS as unknown as Record<string, string>)[fitSection.titleKey] ?? LABELS.star_fit_title}
              icon={Users}
              color={star.color}
              defaultOpen
            >
              <p className="text-xs text-gray-400 leading-relaxed mb-3">
                {LABELS.star_fit_simple_description}
              </p>
              <div className="space-y-2">
                {fitItems.map((t, i) => {
                  const icons = LABELS.star_fit_item_icons as readonly string[];
                  const icon = icons[i % icons.length] ?? '✓';
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 px-3 py-2 rounded-xl"
                      style={{ background: `${star.color}10`, border: `1px solid ${star.color}22` }}
                    >
                      <span className="text-base flex-shrink-0">{icon}</span>
                      <span className="text-xs text-gray-300 leading-snug flex-1">{t}</span>
                    </div>
                  );
                })}
              </div>
              {notFitItems.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/8">
                  <div className="text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                    {LABELS.star_fit_not_recommend_title}
                  </div>
                  <div className="space-y-2 mt-2">
                    {notFitItems.map((t, i) => {
                      const icons = LABELS.star_not_fit_item_icons as readonly string[];
                      const icon = icons[i % icons.length] ?? '✗';
                      return (
                        <div
                          key={i}
                          className="flex items-start gap-2.5 px-3 py-2 rounded-xl bg-white/4 border border-white/8"
                        >
                          <span className="text-base flex-shrink-0">{icon}</span>
                          <span className="text-xs text-gray-500 leading-snug flex-1">{t}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </SectionBlock>
          )}

          {/* Why This Group */}
          {whySection && whySection.type === 'reasonWithTags' && (
            <SectionBlock
              title={(LABELS as unknown as Record<string, string>)[whySection.titleKey] ?? LABELS.star_why_grouped_title}
              icon={Info}
              color={star.color}
            >
              <p className="text-xs text-gray-300 leading-relaxed mt-2">{whySection.reason}</p>
              <div className="mt-3">
                <div className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">
                  {LABELS.star_common_dna_label}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {whySection.commonDNA.map((dna, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                      style={{ background: `${star.color}20`, color: star.color, border: `1px solid ${star.color}33` }}
                    >
                      {dna}
                    </span>
                  ))}
                </div>
              </div>
            </SectionBlock>
          )}

          {/* 2032 창직 프로젝트 */}
          {ventureSection && ventureSection.type === 'ventureProjects' && (
            <SectionBlock
              title={(LABELS as unknown as Record<string, string>)[ventureSection.titleKey] ?? LABELS.star_venture2032_title}
              icon={Rocket}
              color={star.color}
              defaultOpen
            >
              <div className="mt-2">
                <div className="text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                  {LABELS.star_venture_thesis_label}
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">{ventureSection.thesis}</p>
              </div>

              {/* AI 시대 필수 역량 */}
              <div className="mt-3">
                <div className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">
                  {LABELS.star_venture_skills_label}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {ventureSection.aiEraSkills.map((sk, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl"
                      style={{ background: `${star.color}10`, border: `1px solid ${star.color}22` }}
                    >
                      <div className="text-lg mb-0.5">{sk.icon}</div>
                      <div className="text-[11px] font-bold text-white mb-0.5">{sk.label}</div>
                      <div className="text-[10px] text-gray-400 leading-snug">{sk.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 시간 배분 안내 */}
              <div
                className="mt-3 rounded-xl p-3"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className="text-[10px] font-bold text-gray-500 mb-1 uppercase tracking-wider">
                  {LABELS.star_venture_time_note_label}
                </div>
                <p className="text-[11px] text-gray-300 leading-relaxed">{ventureSection.timeNote}</p>
              </div>

              {/* 학교 유형별 트랙 */}
              <div className="mt-3">
                <div className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">
                  {LABELS.star_venture_tracks_label}
                </div>
                <div className="space-y-2">
                  {ventureSection.tracks.map((tr, i) => (
                    <div
                      key={i}
                      className="rounded-xl p-3"
                      style={{ background: `${star.color}0f`, border: `1px solid ${star.color}20` }}
                    >
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span
                          className="px-2 py-0.5 rounded-full text-[9px] font-bold"
                          style={{ background: `${star.color}22`, color: star.color }}
                        >
                          {tr.name}
                        </span>
                        <span className="text-[9px] text-gray-500">
                          {LABELS.star_venture_track_load_label} {tr.load}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-300 leading-snug mb-1">
                        <span className="text-gray-500">{LABELS.star_venture_track_when_label} · </span>
                        {tr.when}
                      </div>
                      <p className="text-[10px] text-gray-400 leading-snug">{tr.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 단계별 프로젝트 */}
              <div className="mt-3">
                <div className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">
                  {LABELS.star_venture_projects_label}
                </div>
                <div className="space-y-2.5">
                  {ventureSection.projects.map((pj, i) => (
                    <div
                      key={i}
                      className="rounded-xl p-3"
                      style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${star.color}22` }}
                    >
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span
                          className="px-2 py-0.5 rounded-full text-[9px] font-bold"
                          style={{ background: `${star.color}22`, color: star.color }}
                        >
                          {pj.stage}
                        </span>
                        <span className="text-[9px] text-gray-500">
                          {LABELS.star_venture_duration_label} {pj.duration} · {LABELS.star_venture_cost_label} {pj.cost}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-white leading-snug mb-1">{pj.title}</div>
                      <div className="space-y-0.5 mb-1.5">
                        <div className="flex gap-2">
                          <span className="text-[9px] text-gray-500 w-6 flex-shrink-0">
                            {LABELS.star_venture_timing_label}
                          </span>
                          <span className="text-[10px] text-gray-300 leading-snug flex-1">{pj.timing}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-[9px] text-gray-500 w-6 flex-shrink-0">
                            {LABELS.star_venture_load_label}
                          </span>
                          <span className="text-[10px] text-gray-300 leading-snug flex-1">{pj.load}</span>
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-snug mb-2">{pj.problem}</p>

                      <div className="text-[9px] font-bold text-gray-500 mb-1">
                        {LABELS.star_venture_steps_label}
                      </div>
                      <div className="space-y-1 mb-2">
                        {pj.steps.map((st, j) => (
                          <div key={j} className="flex items-start gap-1.5">
                            <span className="text-[9px] flex-shrink-0 mt-0.5" style={{ color: star.color }}>
                              {j + 1}
                            </span>
                            <span className="text-[10px] text-gray-300 leading-snug">{st}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-1 mb-2">
                        {pj.aiStack.map((t, j) => (
                          <span
                            key={j}
                            className="px-2 py-0.5 rounded-md text-[9px] text-gray-300 bg-white/6 border border-white/8"
                          >
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="space-y-1 pt-2 border-t border-white/8">
                        <div className="flex gap-2">
                          <span className="text-[9px] text-gray-500 w-12 flex-shrink-0">
                            {LABELS.star_venture_deliverable_label}
                          </span>
                          <span className="text-[10px] text-gray-300 leading-snug flex-1">{pj.deliverable}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-[9px] text-gray-500 w-12 flex-shrink-0">
                            {LABELS.star_venture_proof_label}
                          </span>
                          <span className="text-[10px] leading-snug flex-1" style={{ color: star.color }}>
                            {pj.proof}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-[9px] text-gray-500 w-12 flex-shrink-0">
                            {LABELS.star_venture_revenue_label}
                          </span>
                          <span className="text-[10px] text-gray-300 leading-snug flex-1">{pj.revenue}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 1인 기업 로드맵 */}
              <div className="mt-3 pt-3 border-t border-white/8">
                <div className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">
                  {LABELS.star_venture_solo_path_label}
                </div>
                <div className="space-y-1.5">
                  {ventureSection.soloPath.map((sp, i) => (
                    <div
                      key={i}
                      className="px-3 py-2 rounded-xl text-[11px] text-gray-300 leading-snug"
                      style={{ background: `${star.color}0f`, border: `1px solid ${star.color}1f` }}
                    >
                      {sp}
                    </div>
                  ))}
                </div>
              </div>
            </SectionBlock>
          )}

          {/* Key Subjects */}
          <SectionBlock title={LABELS.star_key_subjects_section_title} icon={BookOpen} color={star.color}>
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.meta.keySubjects.map((subj, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <Zap className="w-3 h-3" style={{ color: star.color }} />
                  <span className="text-xs text-white font-semibold">{subj}</span>
                </div>
              ))}
            </div>
          </SectionBlock>

          {/* Career Keywords */}
          {profile.careerKeywords.length > 0 && (
            <div
              className="rounded-2xl px-4 py-3 flex items-center gap-3"
              style={{ background: `${star.color}12`, border: `1px solid ${star.color}22` }}
            >
              <span className="text-lg">{star.emoji}</span>
              <div>
                <div className="text-[10px] text-gray-500 mb-0.5">{LABELS.star_career_keywords_label}</div>
                <div className="text-xs font-bold" style={{ color: star.color }}>
                  {profile.careerKeywords.map((k) => `#${k}`).join(' ')}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

/* ─── Inline Star Profile Summary (for star detail page) ─── */
export function StarProfileSummary({
  star,
  onOpenDetail,
}: {
  star: StarData;
  onOpenDetail: () => void;
}) {
  const rawProfile = star.starProfile;
  const profile = useMemo(
    () => (rawProfile ? normalizeStarProfile(rawProfile as Parameters<typeof normalizeStarProfile>[0]) : null),
    [rawProfile]
  );
  if (!profile) return null;

  const coreTraitsSection = profile.sections.find((s) => s.id === 'coreTraits');
  const coreTraits = coreTraitsSection?.type === 'traitGrid' ? coreTraitsSection.items : [];

  return (
    <button
      className="w-full text-left rounded-2xl p-4 relative overflow-hidden transition-all active:scale-[0.98]"
      style={{
        background: `linear-gradient(135deg, ${star.bgColor}ee, ${star.bgColor}88)`,
        border: `1.5px solid ${star.color}44`,
      }}
      onClick={onOpenDetail}
    >
      <div className="absolute -right-3 -top-3 text-6xl opacity-10 select-none">{star.emoji}</div>

      {/* 간단 설명 */}
      <p className="text-xs text-gray-400 leading-relaxed mb-3">{star.description}</p>

      {/* Trait pills */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {coreTraits.map((t, i) => (
          <span
            key={i}
            className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold"
            style={{ background: `${star.color}20`, color: star.color }}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </span>
        ))}
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-3">
        <div className="flex flex-row items-center gap-1.5">
          <span className="text-[10px] text-gray-500">{LABELS.star_difficulty_label}</span>
          <DifficultyDots level={profile.meta.difficultyLevel} color={star.color} />
        </div>
        <div className="w-px h-3 bg-white/15" />
        <div className="text-[10px] text-gray-400">
          {LABELS.star_preparation_summary_prefix}{' '}
          <span className="font-bold text-white">
            {profile.meta.avgPreparationYears}
            {LABELS.star_preparation_unit}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-1 text-[10px] font-bold" style={{ color: star.color }}>
          {LABELS.star_view_detail}
          <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
        </div>
      </div>
    </button>
  );
}
