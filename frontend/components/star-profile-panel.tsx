'use client';

import { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, Star, Users, BookOpen, Zap, CheckCircle, XCircle, Info } from 'lucide-react';

type CoreTrait = {
  icon: string;
  label: string;
  desc: string;
};

type StarProfile = {
  tagline: string;
  coreTraits: CoreTrait[];
  fitPersonality: {
    title: string;
    traits: string[];
    notFit: string[];
  };
  whyThisGroup: {
    title: string;
    reason: string;
    commonDNA: string[];
  };
  hollandCode: string;
  keySubjects: string[];
  careerKeyword: string;
  difficultyLevel: number;
  avgPreparationYears: number;
};

type StarData = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
  starProfile?: StarProfile;
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

/* ─── Star Profile Panel (Bottom Sheet style) ─── */
export function StarProfilePanel({
  star,
  onClose,
}: {
  star: StarData;
  onClose: () => void;
}) {
  const profile = star.starProfile;
  if (!profile) return null;

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-[430px] flex flex-col overflow-hidden"
        style={{
          height: '100dvh',
          background: 'linear-gradient(180deg, #12122a 0%, #0d0d1a 100%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Safe-area top spacer */}
        <div style={{ height: 'env(safe-area-inset-top, 0px)' }} className="flex-shrink-0" />

        {/* Header */}
        <div
          className="flex-shrink-0 px-5 pt-2 pb-4 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${star.bgColor}ff, ${star.bgColor}88)` }}
        >
          <div className="absolute -right-4 -top-4 text-8xl opacity-10 select-none pointer-events-none">{star.emoji}</div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                style={{ background: `${star.color}33`, border: `2px solid ${star.color}66` }}
              >
                {star.emoji}
              </div>
              <div>
                <div className="font-bold text-white text-lg leading-tight">{star.name}</div>
                <div className="text-xs mt-0.5" style={{ color: `${star.color}cc` }}>
                  {profile.hollandCode}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="relative z-10 w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-colors hover:bg-white/20 active:bg-white/30"
              style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.15)' }}
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Tagline */}
          <div
            className="mt-3 px-3 py-2 rounded-xl text-xs font-semibold text-white/90 italic"
            style={{ background: `${star.color}22`, border: `1px solid ${star.color}33` }}
          >
            &ldquo;{profile.tagline}&rdquo;
          </div>

          {/* Quick stats */}
          <div
            className="flex flex-row items-center mt-3 rounded-xl overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex-1 flex flex-col items-center justify-center py-2.5 px-2">
              <div className="text-[10px] text-gray-500 mb-1.5 whitespace-nowrap">준비 난이도</div>
              <DifficultyDots level={profile.difficultyLevel} color={star.color} />
            </div>
            <div className="w-px self-stretch bg-white/10" />
            <div className="flex-1 flex flex-col items-center justify-center py-2.5 px-2">
              <div className="text-[10px] text-gray-500 mb-1 whitespace-nowrap">준비 기간</div>
              <div className="text-sm font-bold" style={{ color: star.color }}>
                약 {profile.avgPreparationYears}년
              </div>
            </div>
            <div className="w-px self-stretch bg-white/10" />
            <div className="flex-1 flex flex-col items-center justify-center py-2.5 px-2">
              <div className="text-[10px] text-gray-500 mb-1 whitespace-nowrap">핵심 과목</div>
              <div className="text-[10px] text-gray-300 leading-snug text-center">
                {profile.keySubjects.slice(0, 2).join(' · ')}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ WebkitOverflowScrolling: 'touch' }}>

          {/* Core Traits */}
          <SectionBlock title="이 별의 핵심 특징" icon={Star} color={star.color} defaultOpen>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {profile.coreTraits.map((trait, i) => (
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

          {/* Fit Personality */}
          <SectionBlock title={profile.fitPersonality.title} icon={Users} color={star.color} defaultOpen>
            <div className="mt-2 space-y-1.5">
              {profile.fitPersonality.traits.map((t, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: star.color }} />
                  <span className="text-xs text-gray-300 leading-snug">{t}</span>
                </div>
              ))}
            </div>
            {profile.fitPersonality.notFit.length > 0 && (
              <div className="mt-3 pt-3 border-t border-white/8">
                <div className="text-[10px] font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
                  이런 분께는 다른 별을 추천해요
                </div>
                {profile.fitPersonality.notFit.map((t, i) => (
                  <div key={i} className="flex items-start gap-2 mt-1">
                    <XCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-gray-600" />
                    <span className="text-xs text-gray-500 leading-snug">{t}</span>
                  </div>
                ))}
              </div>
            )}
          </SectionBlock>

          {/* Why This Group */}
          <SectionBlock title={profile.whyThisGroup.title} icon={Info} color={star.color}>
            <p className="text-xs text-gray-300 leading-relaxed mt-2">
              {profile.whyThisGroup.reason}
            </p>
            <div className="mt-3">
              <div className="text-[10px] font-bold text-gray-500 mb-2 uppercase tracking-wider">공통 DNA</div>
              <div className="flex flex-wrap gap-1.5">
                {profile.whyThisGroup.commonDNA.map((dna, i) => (
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

          {/* Key Subjects */}
          <SectionBlock title="관련 핵심 과목" icon={BookOpen} color={star.color}>
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.keySubjects.map((subj, i) => (
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
          <div
            className="rounded-2xl px-4 py-3 flex items-center gap-3"
            style={{ background: `${star.color}12`, border: `1px solid ${star.color}22` }}
          >
            <span className="text-lg">{star.emoji}</span>
            <div>
              <div className="text-[10px] text-gray-500 mb-0.5">커리어 키워드</div>
              <div className="text-xs font-bold" style={{ color: star.color }}>
                {profile.careerKeyword}
              </div>
            </div>
          </div>

          {/* Bottom padding for safe area */}
          <div style={{ height: 'max(env(safe-area-inset-bottom, 0px), 24px)' }} />
        </div>
      </div>
    </div>
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
  const profile = star.starProfile;
  if (!profile) return null;

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

      {/* Tagline */}
      <div className="text-xs font-semibold italic mb-3" style={{ color: `${star.color}cc` }}>
        &ldquo;{profile.tagline}&rdquo;
      </div>

      {/* Trait pills */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {profile.coreTraits.map((t, i) => (
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
          <span className="text-[10px] text-gray-500">난이도</span>
          <DifficultyDots level={profile.difficultyLevel} color={star.color} />
        </div>
        <div className="w-px h-3 bg-white/15" />
        <div className="text-[10px] text-gray-400">
          준비 <span className="font-bold text-white">{profile.avgPreparationYears}년</span>
        </div>
        <div className="ml-auto flex items-center gap-1 text-[10px] font-bold" style={{ color: star.color }}>
          상세 보기
          <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
        </div>
      </div>
    </button>
  );
}
