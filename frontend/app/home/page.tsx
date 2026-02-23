'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import { TabBar } from '@/components/tab-bar';
import { getRecommendedJobs } from '@/lib/recommendations';
import { getLevelForXP, getXPProgress } from '@/lib/xp';
import kingdomsData from '@/data/kingdoms.json';
import jobsData from '@/data/jobs.json';
import {
  Sparkles, Rocket, Star, Compass, BookOpen, Trophy,
  ChevronRight, Zap, Moon, Sun
} from 'lucide-react';
import type { UserProfile, Kingdom, Job } from '@/lib/types';

const kingdoms = kingdomsData as unknown as Kingdom[];
const jobs = jobsData as unknown as Job[];

/* ---- Tiny star particle (Little Prince style) ---- */
function StarField({ count = 40 }: { count?: number }) {
  const stars = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 4,
      dur: 2 + Math.random() * 3,
    })), [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {stars.map(s => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            opacity: 0.15 + Math.random() * 0.5,
            animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ---- Little Prince Planet SVG ---- */
function PlanetIllustration({ color, size = 80, className = '' }: { color: string; size?: number; className?: string }) {
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Planet body */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 35% 30%, ${color}dd, ${color}66)`,
          boxShadow: `0 0 ${size / 3}px ${color}44, inset -${size / 6}px -${size / 6}px ${size / 4}px rgba(0,0,0,0.3)`,
        }}
      />
      {/* Atmosphere ring */}
      <div
        className="absolute rounded-full"
        style={{
          top: -4, left: -4, right: -4, bottom: -4,
          border: `1px solid ${color}22`,
          borderRadius: '50%',
        }}
      />
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const data = storage.user.get();
    if (!data || !data.onboardingCompleted) {
      router.push('/');
      return;
    }
    setUserData(data);
  }, [router]);

  if (!mounted || !userData) return null;

  const xpLog = storage.xp.get();
  const currentXP = xpLog?.totalXP ?? 0;
  const currentLevel = getLevelForXP(currentXP);
  const progress = getXPProgress(currentXP);

  const riasecResult = storage.riasec.get();
  const swipeLogs = storage.swipes.getAll();
  const favoriteJobs = storage.favorites.getAll();
  const recommendedJobs = riasecResult
    ? getRecommendedJobs(riasecResult.scores, jobs, swipeLogs, favoriteJobs, 3)
    : [];
  const topJobs = recommendedJobs.map(item => item.job);

  const topType = riasecResult?.topTypes?.[0];
  const mainStar = topType ? kingdoms.find(k => k.riasecTypes?.includes(topType)) : null;

  const timeline = storage.timeline.getAll();

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden">
      <StarField />

      {/* ===== Hero / Greeting ===== */}
      <div className="relative px-5 pt-6 pb-4">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            {/* Avatar planet */}
            <div className="relative">
              <PlanetIllustration color="#6C5CE7" size={48} />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center text-[10px] font-black text-gray-900 border-2 border-[#1A1A2E]">
                {currentLevel.level}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-400">{"안녕, 우주 탐험가!"}</p>
              <h1 className="text-xl font-bold text-white">{userData.nickname}</h1>
            </div>
          </div>
          <button
            className="w-10 h-10 rounded-full glass flex items-center justify-center"
            onClick={() => router.push('/settings')}
            aria-label="설정"
          >
            <Moon className="w-5 h-5 text-yellow-300" />
          </button>
        </div>

        {/* XP Bar - cosmic style */}
        <div className="glass-card p-4 relative overflow-hidden">
          <div className="absolute -top-2 -right-2 animate-sparkle-spin opacity-30">
            <Star className="w-8 h-8 text-yellow-400" />
          </div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="font-bold text-sm text-white">Lv.{currentLevel.level} {currentLevel.name}</span>
            </div>
            <span className="text-xs text-gray-400 font-mono">
              {progress.current} / {progress.max} XP
            </span>
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
      </div>

      {/* ===== Main Star Card ===== */}
      {mainStar && (
        <div className="px-5 mb-5">
          <button
            className="w-full glass-card p-5 text-left relative overflow-hidden group"
            onClick={() => router.push(`/explore/${mainStar.id}`)}
          >
            <div className="absolute top-0 right-0 w-32 h-32 opacity-10 -mr-4 -mt-4">
              <PlanetIllustration color={mainStar.color} size={128} />
            </div>
            <p className="text-xs text-gray-400 mb-1 uppercase tracking-wider">My Home Star</p>
            <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
              <span className="text-3xl">{mainStar.icon}</span>
              {mainStar.name}
            </h2>
            <p className="text-sm text-gray-400 mb-3">{mainStar.description}</p>
            <div className="flex items-center gap-1 text-xs font-medium" style={{ color: mainStar.color }}>
              <Rocket className="w-3.5 h-3.5" />
              {"탐험하기"}
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
            {/* Shimmer overlay */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity animate-shimmer rounded-2xl" />
          </button>
        </div>
      )}

      {/* ===== Daily Quest ===== */}
      <div className="px-5 mb-5">
        <div
          className="relative rounded-2xl p-5 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(108,92,231,0.2) 0%, rgba(59,130,246,0.15) 100%)',
            border: '1px solid rgba(108,92,231,0.25)',
          }}
        >
          <div className="absolute top-3 right-3 animate-float">
            <div className="w-12 h-12 rounded-full bg-yellow-400/20 flex items-center justify-center">
              <Sun className="w-7 h-7 text-yellow-400" />
            </div>
          </div>
          <p className="text-xs text-primary uppercase tracking-wider font-semibold mb-1">Daily Quest</p>
          <h3 className="text-lg font-bold text-white mb-1">{"오늘의 우주 미션"}</h3>
          <p className="text-sm text-gray-400 mb-4">{"새로운 별의 직업을 체험해보세요"}</p>
          <div className="flex items-center gap-3">
            <button
              className="flex-1 h-12 rounded-xl font-semibold text-white text-sm flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #6C5CE7, #5B4ED4)' }}
              onClick={() => router.push('/explore')}
            >
              <Rocket className="w-4 h-4" />
              {"출발하기"}
            </button>
            <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              +50 XP
            </div>
          </div>
        </div>
      </div>

      {/* ===== Quick Action Grid - 4 planets ===== */}
      <div className="px-5 mb-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">{"우주 정거장"}</h2>
        <div className="grid grid-cols-2 gap-3">
          <QuickPlanet
            icon={Compass}
            label="별 탐험"
            sub="8개의 별"
            color="#3B82F6"
            onClick={() => router.push('/explore')}
          />
          <QuickPlanet
            icon={Rocket}
            label="커리어 패스"
            sub="진로 설계"
            color="#FBBF24"
            onClick={() => router.push('/path')}
            locked={currentLevel.level < 2}
          />
          <QuickPlanet
            icon={Trophy}
            label="뱃지 수집"
            sub="업적 확인"
            color="#22C55E"
            onClick={() => router.push('/portfolio')}
          />
          <QuickPlanet
            icon={BookOpen}
            label="드림북"
            sub="포트폴리오"
            color="#A855F7"
            onClick={() => router.push('/portfolio')}
          />
        </div>
      </div>

      {/* ===== Recommended Jobs - Star map style ===== */}
      {topJobs.length > 0 && (
        <div className="px-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{"추천 직업 성좌"}</h2>
            <button
              className="text-xs text-primary flex items-center gap-1"
              onClick={() => router.push('/explore')}
            >
              {"더보기"}<ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-3">
            {topJobs.map((job, i) => {
              if (!job) return null;
              const star = kingdoms.find(k => k.id === job.kingdomId);
              return (
                <button
                  key={job.id}
                  className="w-full glass-card p-4 flex items-center gap-4 text-left group relative overflow-hidden"
                  onClick={() => router.push(`/jobs/${job.id}`)}
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {/* Job icon with planet glow */}
                  <div className="relative flex-shrink-0">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                      style={{
                        background: `linear-gradient(135deg, ${star?.color || '#6C5CE7'}22, ${star?.color || '#6C5CE7'}44)`,
                        boxShadow: `0 0 20px ${star?.color || '#6C5CE7'}22`,
                      }}
                    >
                      {job.icon}
                    </div>
                    {/* Tiny orbiting dot */}
                    <div
                      className="absolute"
                      style={{
                        top: '50%', left: '50%',
                        width: 4, height: 4,
                        marginTop: -2, marginLeft: -2,
                        animation: `orbit ${6 + i}s linear infinite`,
                      }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: star?.color || '#6C5CE7' }} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-base">{job.name}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <span>{star?.icon}</span>
                      <span>{star?.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-yellow-400 text-xs font-semibold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {recommendedJobs[i]?.score ?? '--'}%
                  </div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity animate-shimmer rounded-2xl" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== Activity Timeline ===== */}
      {timeline.length > 0 && (
        <div className="px-5 mb-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">{"항해 일지"}</h2>
          <div className="glass-card p-4 space-y-4">
            {timeline.slice(0, 4).map((log, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="mt-1 flex-shrink-0">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: '#6C5CE7', boxShadow: '0 0 6px #6C5CE744' }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">{log.description}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(log.date).toLocaleDateString('ko-KR', {
                      month: 'short', day: 'numeric',
                    })}
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
      )}

      <TabBar />
    </div>
  );
}

/* ===== Quick Planet Card ===== */
function QuickPlanet({
  icon: Icon, label, sub, color, onClick, locked = false,
}: {
  icon: React.ElementType;
  label: string;
  sub: string;
  color: string;
  onClick: () => void;
  locked?: boolean;
}) {
  return (
    <button
      className={`glass-card p-4 text-left relative overflow-hidden w-full transition-transform ${
        locked ? 'opacity-40 grayscale' : 'active:scale-95'
      }`}
      onClick={locked ? undefined : onClick}
      disabled={locked}
    >
      {/* Planet orb */}
      <div className="mb-3 relative">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: `radial-gradient(circle at 35% 30%, ${color}cc, ${color}44)`,
            boxShadow: `0 0 16px ${color}33`,
          }}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
        {/* Tiny orbiting dot */}
        <div className="absolute" style={{ top: '50%', left: '50%', width: 4, height: 4, marginTop: -2, marginLeft: -2, animation: 'orbit 8s linear infinite' }}>
          <div className="w-1 h-1 rounded-full bg-white/60" />
        </div>
      </div>
      <h3 className="font-semibold text-white text-sm">{label}</h3>
      <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
      {locked && (
        <div className="absolute top-3 right-3 text-xs text-gray-500 flex items-center gap-1">
          <span>LOCKED</span>
        </div>
      )}
    </button>
  );
}
