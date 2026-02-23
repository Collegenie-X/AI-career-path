'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import { getRecommendedJobs } from '@/lib/recommendations';
import kingdomsData from '@/data/kingdoms.json';
import jobsData from '@/data/jobs.json';
import { Sparkles, ArrowRight, Star, Orbit, Rocket, Trophy } from 'lucide-react';
import type { RIASECResult, Job, Kingdom } from '@/lib/types';

const kingdoms = kingdomsData as unknown as Kingdom[];
const jobs = jobsData as unknown as Job[];

const RIASEC_META: Record<string, { label: string; desc: string; color: string; icon: string }> = {
  R: { label: '현실형', desc: '도구로 만들고 고치는 걸 좋아하는', color: '#EF4444', icon: 'wrench' },
  I: { label: '탐구형', desc: '분석하며 문제 해결을 즐기는', color: '#3B82F6', icon: 'search' },
  A: { label: '예술형', desc: '상상력으로 창의적 표현을 하는', color: '#A855F7', icon: 'palette' },
  S: { label: '사회형', desc: '사람들을 돕고 협력하는', color: '#22C55E', icon: 'heart' },
  E: { label: '기업형', desc: '목표를 세우고 실행하는', color: '#FBBF24', icon: 'target' },
  C: { label: '관습형', desc: '체계적으로 정리하고 관리하는', color: '#6B7280', icon: 'grid' },
};

export default function QuizResultsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [riasec, setRiasec] = useState<RIASECResult | null>(null);
  const [phase, setPhase] = useState<'analyzing' | 'reveal' | 'done'>('analyzing');
  const [revealStep, setRevealStep] = useState(0);

  useEffect(() => {
    setMounted(true);
    const riasecResult = storage.riasec.get();
    if (!riasecResult) {
      router.push('/quiz');
      return;
    }
    setRiasec(riasecResult);

    // Analyzing animation sequence
    const t1 = setTimeout(() => setPhase('reveal'), 2200);
    const t2 = setTimeout(() => setRevealStep(1), 2600);
    const t3 = setTimeout(() => setRevealStep(2), 3200);
    const t4 = setTimeout(() => setRevealStep(3), 3800);
    const t5 = setTimeout(() => setPhase('done'), 4400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); clearTimeout(t5); };
  }, [router]);

  if (!mounted || !riasec) return null;

  const sortedTypes = Object.entries(riasec.scores)
    .sort(([, a], [, b]) => b - a)
    .map(([key]) => key);

  const topType = riasec.topTypes[0];
  const topMeta = RIASEC_META[topType];
  const topStar = kingdoms.find((k) => k.riasecTypes && k.riasecTypes.includes(topType));

  const swipeLogs = storage.swipes.getAll();
  const favoriteJobs = storage.favorites.getAll();
  const recommendedJobs = getRecommendedJobs(riasec.scores, jobs, swipeLogs, favoriteJobs, 5);

  const handleStart = () => {
    storage.xp.add(100, '적성 검사 완료');
    router.push('/home');
  };

  // === ANALYZING PHASE ===
  if (phase === 'analyzing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">
        {/* Star field */}
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 1 + Math.random() * 2.5,
              height: 1 + Math.random() * 2.5,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: '#fff',
              opacity: 0.1 + Math.random() * 0.5,
              animation: `float ${2 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}

        {/* Central analyzing orb */}
        <div className="relative">
          <div
            className="w-32 h-32 rounded-full flex items-center justify-center animate-pulse-glow"
            style={{
              background: `radial-gradient(circle, ${topMeta.color}40 0%, ${topMeta.color}10 60%, transparent 70%)`,
            }}
          >
            <Orbit className="w-16 h-16 text-white animate-sparkle-spin" style={{ animationDuration: '3s' }} />
          </div>
          {/* Orbiting particles */}
          {[0, 1, 2].map((i) => (
            <div key={i} className="absolute inset-0 flex items-center justify-center">
              <div className="animate-orbit" style={{ animationDuration: `${3 + i * 1.5}s`, animationDelay: `${i * 0.5}s` }}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: topMeta.color, boxShadow: `0 0 8px ${topMeta.color}` }} />
              </div>
            </div>
          ))}
        </div>

        <p className="text-white/60 text-lg font-semibold mt-8 animate-pulse">
          우주 적성 데이터 분석 중...
        </p>
        <div className="flex gap-1.5 mt-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary"
              style={{
                animation: 'float 1s ease-in-out infinite',
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // === REVEAL / DONE PHASE ===
  return (
    <div className="min-h-screen pb-8 relative overflow-hidden">
      {/* Background star field */}
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 1 + Math.random() * 2,
            height: 1 + Math.random() * 2,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            backgroundColor: '#fff',
            opacity: 0.05 + Math.random() * 0.3,
            animation: `float ${3 + Math.random() * 5}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}

      {/* Radial glow behind top section */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${topMeta.color}15 0%, transparent 70%)`,
        }}
      />

      <div className="relative z-10 px-5 pt-8 space-y-6">
        {/* Header Badge */}
        <div className="text-center animate-scale-bounce">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold"
            style={{ backgroundColor: `${topMeta.color}20`, color: topMeta.color, border: `1px solid ${topMeta.color}30` }}
          >
            <Star className="w-4 h-4" />
            적성 분석 완료
          </div>
        </div>

        {/* Main Type Reveal */}
        <div className="text-center space-y-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <p className="text-white/50 text-sm">당신의 적성 유형은</p>
          <div className="relative inline-block">
            <h1 className="text-5xl font-black" style={{ color: topMeta.color }}>
              {topType}
            </h1>
            <div className="absolute -inset-4 rounded-full animate-pulse-glow" style={{ opacity: 0.3 }} />
          </div>
          <h2 className="text-2xl font-bold text-white">{topMeta.label}</h2>
          <p className="text-white/50 text-sm">{topMeta.desc} 유형</p>
        </div>

        {/* RIASEC Score Bars - Space radar style */}
        <div
          className="rounded-2xl p-5 space-y-3 animate-slide-up"
          style={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            animationDelay: '0.2s',
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Orbit className="w-4 h-4 text-white/40" />
            <span className="text-sm font-semibold text-white/60">RIASEC 스펙트럼</span>
          </div>
          {sortedTypes.map((type, index) => {
            const meta = RIASEC_META[type];
            const score = riasec.scores[type];
            const pct = Math.round(score * 100);
            const isTop = index === 0;
            return (
              <div key={type} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white"
                      style={{ backgroundColor: meta.color }}
                    >
                      {type}
                    </div>
                    <span className="text-sm font-medium text-white/80">{meta.label}</span>
                    {isTop && (
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${meta.color}25`, color: meta.color }}
                      >
                        TOP
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-bold" style={{ color: isTop ? meta.color : 'rgba(255,255,255,0.5)' }}>
                    {pct}%
                  </span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: phase === 'done' ? `${pct}%` : '0%',
                      background: isTop
                        ? `linear-gradient(90deg, ${meta.color}, ${meta.color}99)`
                        : `${meta.color}60`,
                      boxShadow: isTop ? `0 0 12px ${meta.color}50` : 'none',
                      animation: 'progress-fill 1.2s ease-out',
                      animationDelay: `${index * 0.15}s`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Matching Star */}
        {topStar && (
          <div
            className="rounded-2xl p-5 animate-slide-up relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${topStar.color}15 0%, ${topStar.color}05 100%)`,
              border: `1px solid ${topStar.color}30`,
              animationDelay: '0.3s',
            }}
          >
            {/* Mini star particles */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full pointer-events-none animate-float"
                style={{
                  width: 2,
                  height: 2,
                  backgroundColor: topStar.color,
                  opacity: 0.3,
                  left: `${15 + Math.random() * 70}%`,
                  top: `${15 + Math.random() * 70}%`,
                  animationDuration: `${2 + Math.random() * 3}s`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              />
            ))}

            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4" style={{ color: topStar.color }} />
              <span className="text-sm font-bold" style={{ color: topStar.color }}>추천 별</span>
            </div>
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center relative"
                style={{
                  background: `linear-gradient(135deg, ${topStar.color} 0%, ${topStar.color}80 100%)`,
                  boxShadow: `0 0 30px ${topStar.color}30`,
                }}
              >
                <Sparkles className="w-8 h-8 text-white" />
                {/* Orbiting dot */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-orbit" style={{ animationDuration: '5s' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-white" style={{ boxShadow: `0 0 6px ${topStar.color}` }} />
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-white">{topStar.name}</h3>
                <p className="text-sm text-white/50 mt-0.5 leading-relaxed">{topStar.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Recommended Jobs */}
        <div
          className="rounded-2xl p-5 space-y-3 animate-slide-up"
          style={{
            backgroundColor: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            animationDelay: '0.4s',
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold text-white/60">추천 직업 TOP 5</span>
          </div>
          {recommendedJobs.map((item, index) => {
            const job = item.job;
            const star = kingdoms.find((k) => k.id === job.kingdomId);
            return (
              <div
                key={job.id}
                className="flex items-center gap-3 p-3 rounded-xl transition-colors"
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-sm"
                  style={{
                    backgroundColor: index === 0 ? `${topMeta.color}25` : 'rgba(255,255,255,0.05)',
                    color: index === 0 ? topMeta.color : 'rgba(255,255,255,0.4)',
                  }}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm">{job.name}</div>
                  <div className="text-xs text-white/35 mt-0.5">
                    {star?.name}
                  </div>
                </div>
                <div
                  className="text-xs font-bold px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: `${topMeta.color}15`,
                    color: topMeta.color,
                  }}
                >
                  {item.score}%
                </div>
              </div>
            );
          })}
        </div>

        {/* XP Earned Banner */}
        <div
          className="rounded-2xl p-4 flex items-center gap-3 animate-slide-up"
          style={{
            background: 'linear-gradient(135deg, rgba(108,92,231,0.15) 0%, rgba(108,92,231,0.05) 100%)',
            border: '1px solid rgba(108,92,231,0.25)',
            animationDelay: '0.5s',
          }}
        >
          <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">적성 검사 보상</p>
            <p className="text-xs text-white/40">첫 퀘스트 완료!</p>
          </div>
          <div className="text-xl font-black text-primary">+100 XP</div>
        </div>

        {/* CTA Button */}
        <button
          className="w-full h-14 rounded-2xl text-base font-bold text-white relative overflow-hidden transition-transform active:scale-[0.97] mb-4"
          style={{
            background: `linear-gradient(135deg, ${topMeta.color} 0%, #6C5CE7 100%)`,
            boxShadow: `0 8px 24px ${topMeta.color}30`,
          }}
          onClick={handleStart}
        >
          <span className="absolute inset-0 animate-shimmer" />
          <span className="relative flex items-center justify-center gap-2">
            <Rocket className="w-5 h-5" />
            우주 탐험 시작하기
            <ArrowRight className="w-5 h-5" />
          </span>
        </button>
      </div>
    </div>
  );
}
