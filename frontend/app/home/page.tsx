'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import { TabBar } from '@/components/tab-bar';
import { BadgeToastManager } from '@/components/badge-toast';
import { useBadgeChecker } from '@/hooks/use-badge-checker';
import { getLevelForXP, getXPProgress } from '@/lib/xp';
import exploreStar from '@/data/stars/explore-star.json';
import createStar from '@/data/stars/create-star.json';
import techStar from '@/data/stars/tech-star.json';
import connectStar from '@/data/stars/connect-star.json';
import {
  Sparkles, Zap, ChevronRight, Map,
  Activity, Trophy, Award,
  Moon, Star, Brain, ClipboardList,
  Briefcase,
} from 'lucide-react';
import type { UserProfile, RIASECResult } from '@/lib/types';

type SavedPlan = {
  id: string;
  title: string;
  type: 'activity' | 'award' | 'certification';
  grade: string;
  targetMonth: number;
  kingdomId: string;
  kingdomName: string;
  color: string;
};

type StarJob = {
  id: string;
  name: string;
  icon: string;
  shortDesc: string;
  holland: string;
  salaryRange: string;
  futureGrowth: number;
  aiRisk: string;
};

type StarData = {
  id: string;
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  description: string;
  jobs: StarJob[];
};

const RIASEC_META: Record<string, { label: string; color: string; emoji: string }> = {
  R: { label: '현실형', color: '#EF4444', emoji: '🔧' },
  I: { label: '탐구형', color: '#3B82F6', emoji: '🔬' },
  A: { label: '예술형', color: '#A855F7', emoji: '🎨' },
  S: { label: '사회형', color: '#22C55E', emoji: '🤝' },
  E: { label: '기업형', color: '#FBBF24', emoji: '🚀' },
  C: { label: '관습형', color: '#6B7280', emoji: '📋' },
};

const RIASEC_DESC: Record<string, string> = {
  R: '도구로 만들고 고치는 걸 좋아하는 타입',
  I: '분석하며 문제 해결을 즐기는 타입',
  A: '상상력으로 창의적 표현을 하는 타입',
  S: '사람들을 돕고 협력하는 타입',
  E: '목표를 세우고 실행하는 타입',
  C: '체계적으로 정리하고 관리하는 타입',
};

const TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  activity:      { label: '활동',    icon: Activity, color: '#3B82F6' },
  award:         { label: '수상',    icon: Trophy,   color: '#FBBF24' },
  certification: { label: '자격증', icon: Award,    color: '#22C55E' },
};

const ALL_STARS: StarData[] = [exploreStar, createStar, techStar, connectStar] as StarData[];

/* ─── Deterministic star field ─── */
function StarField({ count = 40 }: { count?: number }) {
  const stars = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x:  ((i * 137.5) % 100),
      y:  ((i * 97.3)  % 100),
      size: (i % 3) + 1,
      delay: (i * 0.4) % 4,
      dur: 2 + (i % 3),
      opacity: 0.15 + (i % 5) * 0.07,
    })), [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {stars.map(s => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`, top: `${s.y}%`,
            width: s.size, height: s.size, opacity: s.opacity,
            animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── XP Bar ─── */
function XPCard({ level, progress }: {
  xp: number;
  level: { level: number; name: string };
  progress: { current: number; max: number; percentage: number };
}) {
  return (
    <div className="glass-card p-4 relative overflow-hidden">
      <div className="absolute -top-2 -right-2 opacity-20 animate-sparkle-spin">
        <Star className="w-8 h-8 text-yellow-400" />
      </div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="font-bold text-sm text-white">Lv.{level.level} {level.name}</span>
        </div>
        <span className="text-xs text-gray-400 font-mono">{progress.current} / {progress.max} XP</span>
      </div>
      <div className="h-3 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full relative"
          style={{
            width: `${progress.percentage}%`,
            background: 'linear-gradient(90deg, #6C5CE7, #a78bfa, #6C5CE7)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 2s ease-in-out infinite',
            transition: 'width 0.6s ease-out',
          }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]" />
        </div>
      </div>
    </div>
  );
}

/* ─── Aptitude Summary Card ─── */
function AptitudeSummaryCard({ riasec, onDetailTest }: {
  riasec: RIASECResult | null;
  onDetailTest: () => void;
}) {
  if (!riasec) {
    return (
      <div
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(168,85,247,0.18) 0%, rgba(59,130,246,0.12) 100%)',
          border: '1px solid rgba(168,85,247,0.3)',
        }}
      >
        <div className="absolute top-3 right-4 text-5xl opacity-10">🧠</div>
        <div className="flex items-center gap-2 mb-2">
          <Brain className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">적성 검사</span>
        </div>
        <p className="text-white font-bold text-base mb-1">아직 적성 검사를 하지 않았어요!</p>
        <p className="text-sm text-gray-400 mb-4">나에게 맞는 직업을 찾으려면 먼저 적성 검사를 해보세요</p>
        <button
          className="h-11 px-5 rounded-xl font-semibold text-white text-sm flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg, #A855F7, #6C5CE7)' }}
          onClick={onDetailTest}
        >
          <ClipboardList className="w-4 h-4" />
          적성 검사 시작하기
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const topType = riasec.topTypes[0];
  const secondType = riasec.topTypes[1];
  const topMeta = RIASEC_META[topType];
  const secondMeta = RIASEC_META[secondType];

  const sortedScores = Object.entries(riasec.scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);
  const maxScore = Math.max(...Object.values(riasec.scores));

  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(168,85,247,0.18) 0%, rgba(59,130,246,0.12) 100%)',
        border: '1px solid rgba(168,85,247,0.3)',
      }}
    >
      <div className="absolute top-3 right-4 text-5xl opacity-10">🧠</div>

      <div className="flex items-center gap-2 mb-3">
        <Brain className="w-4 h-4 text-purple-400" />
        <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">내 적성 유형</span>
      </div>

      {/* Top types */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1.5"
          style={{ backgroundColor: `${topMeta.color}22`, color: topMeta.color, border: `1px solid ${topMeta.color}44` }}
        >
          <span>{topMeta.emoji}</span>
          <span>{topMeta.label}</span>
        </div>
        <span className="text-gray-600 text-sm">+</span>
        <div
          className="px-3 py-1.5 rounded-xl text-sm font-bold flex items-center gap-1.5"
          style={{ backgroundColor: `${secondMeta.color}22`, color: secondMeta.color, border: `1px solid ${secondMeta.color}44` }}
        >
          <span>{secondMeta.emoji}</span>
          <span>{secondMeta.label}</span>
        </div>
      </div>

      <p className="text-sm text-gray-300 mb-4 leading-relaxed">
        {RIASEC_DESC[topType]}
      </p>

      {/* Mini score bars */}
      <div className="space-y-2 mb-4">
        {sortedScores.map(([key, score]) => {
          const meta = RIASEC_META[key];
          return (
            <div key={key} className="flex items-center gap-2">
              <span className="text-xs w-14 text-gray-400 flex-shrink-0">{meta.emoji} {meta.label}</span>
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${maxScore > 0 ? (score / maxScore) * 100 : 0}%`,
                    backgroundColor: meta.color,
                  }}
                />
              </div>
              <span className="text-xs text-gray-500 w-5 text-right flex-shrink-0">{score}</span>
            </div>
          );
        })}
      </div>

      <button
        className="w-full h-10 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2"
        style={{ background: 'linear-gradient(135deg, #A855F7, #6C5CE7)' }}
        onClick={onDetailTest}
      >
        <ClipboardList className="w-4 h-4" />
        상세 검사 다시 하기
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

/* ─── Recommended Job Card ─── */
function RecommendedJobCard({
  job, star, onClick,
}: {
  job: StarJob;
  star: StarData;
  onClick: () => void;
}) {
  return (
    <button
      className="glass-card p-3.5 text-left w-full transition-all active:scale-95 relative overflow-hidden group"
      onClick={onClick}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(135deg, ${star.color}11, transparent)` }}
      />
      <div className="flex items-center gap-3 relative">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: `linear-gradient(135deg, ${star.color}44, ${star.color}22)`, border: `1px solid ${star.color}55` }}
        >
          {job.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-white text-sm truncate">{job.name}</div>
          <div className="text-xs text-gray-400 truncate">{job.shortDesc}</div>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
              style={{ backgroundColor: `${star.color}22`, color: star.color }}
            >
              {star.emoji} {star.name}
            </span>
            <span className="text-[10px] text-gray-500">{job.holland}</span>
          </div>
        </div>
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: `${star.color}33` }}
        >
          <ChevronRight className="w-3.5 h-3.5" style={{ color: star.color }} />
        </div>
      </div>
    </button>
  );
}

/* ─── Career Path Status ─── */
function CareerPathCard({ savedPlans, onNavigate }: {
  savedPlans: SavedPlan[];
  onNavigate: () => void;
}) {
  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(108,92,231,0.22) 0%, rgba(59,130,246,0.14) 100%)',
        border: '1px solid rgba(108,92,231,0.3)',
      }}
    >
      <div className="absolute top-3 right-4 text-5xl opacity-10">🚀</div>
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">커리어 패스 현황</span>
      </div>

      {savedPlans.length === 0 ? (
        <div>
          <p className="text-white font-bold text-base mb-1">아직 계획이 없어요!</p>
          <p className="text-sm text-gray-400 mb-4">Job 체험 후 나만의 커리어 패스를 만들어보세요</p>
          <button
            className="h-11 px-5 rounded-xl font-semibold text-white text-sm flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #6C5CE7, #5B4ED4)' }}
            onClick={onNavigate}
          >
            <Map className="w-4 h-4" />
            커리어 패스 시작하기
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div>
          <div className="flex items-end gap-2 mb-3">
            <span className="text-3xl font-black text-white">{savedPlans.length}</span>
            <span className="text-gray-400 text-sm pb-1">개 계획 수립 완료</span>
          </div>
          <div className="flex gap-3 mb-3">
            {(['activity', 'award', 'certification'] as const).map(type => {
              const cfg = TYPE_CONFIG[type];
              const count = savedPlans.filter(p => p.type === type).length;
              const Icon = cfg.icon;
              return (
                <div key={type} className="flex items-center gap-1.5 text-xs">
                  <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                  <span style={{ color: cfg.color }}>{count}</span>
                  <span className="text-gray-500">{cfg.label}</span>
                </div>
              );
            })}
          </div>
          <button
            className="h-10 px-4 rounded-xl font-semibold text-white text-sm flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #6C5CE7, #5B4ED4)' }}
            onClick={onNavigate}
          >
            <Map className="w-4 h-4" />
            커리어 패스 보기
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Recommended Jobs Section ─── */
function RecommendedJobsSection({
  riasec,
  onJobClick,
}: {
  riasec: RIASECResult | null;
  onJobClick: (starId: string) => void;
}) {
  const recommended = useMemo(() => {
    const allJobs: { job: StarJob; star: StarData }[] = [];
    ALL_STARS.forEach(star => {
      star.jobs.forEach(job => allJobs.push({ job, star }));
    });

    if (!riasec) {
      return allJobs.slice(0, 4);
    }

    const topTypes = riasec.topTypes;
    const scored = allJobs.map(({ job, star }) => {
      let score = 0;
      const hollandTypes = job.holland.split('+');
      hollandTypes.forEach(t => {
        if (topTypes.includes(t as 'R' | 'I' | 'A' | 'S' | 'E' | 'C')) score += 2;
      });
      score += job.futureGrowth;
      return { job, star, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 4).map(({ job, star }) => ({ job, star }));
  }, [riasec]);

  return (
    <div className="px-5 mb-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Briefcase className="w-3.5 h-3.5" />
          추천 직업
        </h2>
        <button
          className="text-xs text-primary flex items-center gap-1"
          onClick={() => onJobClick('')}
        >
          전체보기 <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="space-y-2.5">
        {recommended.map(({ job, star }) => (
          <RecommendedJobCard
            key={`${star.id}-${job.id}`}
            job={job}
            star={star}
            onClick={() => onJobClick(star.id)}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Recent Activity ─── */
function RecentActivitySection() {
  const timeline = storage.timeline.getAll();
  if (timeline.length === 0) return null;

  return (
    <div className="px-5 mb-5">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">최근 활동</h2>
      <div className="glass-card p-4 space-y-3">
        {timeline.slice(0, 3).map((log, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="mt-1 flex-shrink-0">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: '#6C5CE7', boxShadow: '0 0 6px #6C5CE744' }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white">{log.description}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {new Date(log.date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
              </p>
            </div>
            {log.xp != null && log.xp > 0 && (
              <span className="text-xs font-bold text-yellow-400 flex items-center gap-0.5 flex-shrink-0">
                <Zap className="w-3 h-3" />+{log.xp}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main ─── */
export default function HomePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [mounted, setMounted] = useState(false);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [riasec, setRiasec] = useState<RIASECResult | null>(null);
  const { newBadges } = useBadgeChecker();

  useEffect(() => {
    setMounted(true);
    const data = storage.user.get();
    if (!data || !data.onboardingCompleted) {
      router.push('/');
      return;
    }
    setUserData(data);
    setRiasec(storage.riasec.get());
    try {
      const raw = localStorage.getItem('career_plans');
      if (raw) setSavedPlans(JSON.parse(raw));
    } catch {}
  }, [router]);

  if (!mounted || !userData) return null;

  const xpLog = storage.xp.get();
  const currentXP = xpLog?.totalXP ?? 0;
  const currentLevel = getLevelForXP(currentXP);
  const progress = getXPProgress(currentXP);

  const handleJobClick = (starId: string) => {
    router.push('/jobs/explore');
  };

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden">
      <StarField />

      {/* ===== Hero ===== */}
      <div className="relative px-5 pt-6 pb-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center font-black text-lg text-white"
              style={{ background: 'linear-gradient(135deg, #6C5CE7, #5B4ED4)', boxShadow: '0 0 20px #6C5CE744' }}
            >
              {currentLevel.level}
            </div>
            <div>
              <p className="text-sm text-gray-400">커리어 탐험가</p>
              <h1 className="text-xl font-bold text-white">{userData.nickname}</h1>
            </div>
          </div>
          <button
            className="w-10 h-10 rounded-full glass flex items-center justify-center"
            onClick={() => router.push('/settings')}
          >
            <Moon className="w-5 h-5 text-yellow-300" />
          </button>
        </div>

        <XPCard xp={currentXP} level={currentLevel} progress={progress} />
      </div>

      {/* ===== Aptitude Summary ===== */}
      <div className="px-5 mb-5">
        <AptitudeSummaryCard
          riasec={riasec}
          onDetailTest={() => router.push('/quiz')}
        />
      </div>

      {/* ===== Career Path Status ===== */}
      <div className="px-5 mb-5">
        <CareerPathCard
          savedPlans={savedPlans}
          onNavigate={() => router.push('/career')}
        />
      </div>

      {/* ===== Recommended Jobs ===== */}
      <RecommendedJobsSection riasec={riasec} onJobClick={handleJobClick} />

      {/* ===== Recent Activity ===== */}
      <RecentActivitySection />

      <TabBar />
      <BadgeToastManager badgeIds={newBadges.map(b => b.badgeId)} />
    </div>
  );
}
