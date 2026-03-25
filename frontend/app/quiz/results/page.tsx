'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { storage } from '@/lib/storage';
import { getRecommendedJobs } from '@/lib/recommendations';
import kingdomsData from '@/data/kingdoms.json';
import jobsData from '@/data/jobs.json';
import * as LucideIcons from 'lucide-react';
import { Sparkles, ArrowRight, Star, Orbit, Rocket, Trophy, Briefcase, RotateCcw } from 'lucide-react';
import { StarfieldCanvas } from '@/components/shared/StarfieldCanvas';
import { JobDetailModal } from '@/app/jobs/explore/components/JobDetailModal';
import { StarDetailPanel } from '@/app/jobs/explore/components/StarDetailPanel';
import { QUIZ_RESULTS_INTRO_CONFIG, LABELS as QUIZ_LABELS, ROUTES as QUIZ_ROUTES } from '@/app/quiz/config';
import { getQuizLandingPath } from '@/lib/navigation/quizLandingPath';
import { QuizResultsAnalyzingView } from './components/QuizResultsAnalyzingView';
import { fetchStarJsonByKingdomId, starJsonQueryKey } from '@/lib/queries/fetchStarJsonByKingdomId';
import { quizRiasecResultQueryKey, readStoredRiasecResult } from '@/lib/queries/quizRiasecQuery';
import type { Job, Kingdom, RIASECType } from '@/lib/types';
import type { Job as ExploreJob, StarData } from '@/app/jobs/explore/types';

function getJobIcon(iconName: string) {
  const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>)[iconName];
  return Icon ?? Briefcase;
}

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
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<'analyzing' | 'reveal' | 'done'>('analyzing');
  const [selectedJobForDialog, setSelectedJobForDialog] = useState<ExploreJob | null>(null);
  const [selectedStarForDialog, setSelectedStarForDialog] = useState<StarData | null>(null);
  const [isJobDialogOpen, setIsJobDialogOpen] = useState(false);
  const [isStarPanelOpen, setIsStarPanelOpen] = useState(false);
  const [starDataForPanel, setStarDataForPanel] = useState<StarData | null>(null);

  const { data: riasec, isPending: isRiasecPending } = useQuery({
    queryKey: quizRiasecResultQueryKey,
    queryFn: readStoredRiasecResult,
    staleTime: 0,
    gcTime: 30 * 60_000,
  });

  useEffect(() => {
    if (isRiasecPending) return;
    if (!riasec) {
      router.replace(getQuizLandingPath());
    }
  }, [isRiasecPending, riasec, router]);

  useEffect(() => {
    if (!riasec) return;

    let cancelled = false;
    const { revealMs, doneMs, failSafeMaxMs, sessionStorageKey } = QUIZ_RESULTS_INTRO_CONFIG;

    const markIntroDone = () => {
      try {
        sessionStorage.setItem(sessionStorageKey, JSON.stringify({ completedAt: riasec.completedAt }));
      } catch {
        // ignore quota / private mode
      }
    };

    try {
      const raw = sessionStorage.getItem(sessionStorageKey);
      const parsed = raw ? (JSON.parse(raw) as { completedAt?: string }) : null;
      if (parsed?.completedAt === riasec.completedAt) {
        setPhase('done');
        return;
      }
    } catch {
      // ignore
    }

    const tReveal = window.setTimeout(() => {
      if (!cancelled) setPhase('reveal');
    }, revealMs);
    const tDone = window.setTimeout(() => {
      if (!cancelled) {
        setPhase('done');
        markIntroDone();
      }
    }, doneMs);
    const tFailSafe = window.setTimeout(() => {
      if (!cancelled) {
        setPhase('done');
        markIntroDone();
      }
    }, failSafeMaxMs);

    return () => {
      cancelled = true;
      window.clearTimeout(tReveal);
      window.clearTimeout(tDone);
      window.clearTimeout(tFailSafe);
    };
  }, [riasec]);

  const { data: jobsWithExploreData = new Set<string>() } = useQuery({
    queryKey: [...quizRiasecResultQueryKey, 'explore-job-ids', riasec?.completedAt ?? 'none'],
    enabled: !!riasec,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      if (!riasec) return new Set<string>();

      const swipeLogs = storage.swipes.getAll();
      const favoriteJobs = storage.favorites.getAll();
      const recommended = getRecommendedJobs(riasec.scores, jobs, swipeLogs, favoriteJobs, 5);
      const jobsWithData = new Set<string>();

      for (const item of recommended) {
        const job = item.job;
        const kingdom = kingdoms.find((k) => k.id === job.kingdomId);
        if (!kingdom) continue;

        const star = await queryClient.fetchQuery({
          queryKey: starJsonQueryKey(kingdom.id),
          queryFn: () => fetchStarJsonByKingdomId(kingdom.id),
          staleTime: Number.POSITIVE_INFINITY,
        });

        if (!star) continue;
        if (star.jobs?.some((ej: ExploreJob) => ej.id === job.id)) {
          jobsWithData.add(job.id);
        }
      }

      return jobsWithData;
    },
  });

  if (isRiasecPending) {
    return (
      <QuizResultsAnalyzingView accentColor="#6C5CE7" message={QUIZ_LABELS.quiz_analyzing} />
    );
  }

  if (!riasec) {
    return null;
  }

  const scoreEntries = Object.entries(riasec.scores) as Array<[string, number]>;
  const sortedTypes = scoreEntries
    .sort(([, a], [, b]) => b - a)
    .map(([key]) => key);

  const topTypeRaw = riasec.topTypes[0];
  const topType = (
    topTypeRaw && topTypeRaw in RIASEC_META ? topTypeRaw : sortedTypes[0] ?? 'I'
  ) as RIASECType;
  const topMeta = RIASEC_META[topType] ?? RIASEC_META.I;
  const topStar = kingdoms.find((k) => k.riasecTypes?.includes(topType));

  const swipeLogs = storage.swipes.getAll();
  const favoriteJobs = storage.favorites.getAll();
  const recommendedJobs = getRecommendedJobs(riasec.scores, jobs, swipeLogs, favoriteJobs, 5);

  const handleRetakeQuiz = () => {
    storage.riasec.clear();
    queryClient.removeQueries({ queryKey: [...quizRiasecResultQueryKey] });
    try {
      sessionStorage.removeItem(QUIZ_RESULTS_INTRO_CONFIG.sessionStorageKey);
    } catch {
      // ignore
    }
    router.push(QUIZ_ROUTES.quizPlay);
  };

  const handleStart = () => {
    storage.xp.add(100, '적성 검사 완료', 'quiz');
    router.push(QUIZ_ROUTES.careerExplore);
  };

  const handleJobClick = async (job: Job) => {
    const kingdom = kingdoms.find((k) => k.id === job.kingdomId);
    if (!kingdom) return;

    const star = await queryClient.fetchQuery({
      queryKey: starJsonQueryKey(kingdom.id),
      queryFn: () => fetchStarJsonByKingdomId(kingdom.id),
      staleTime: Number.POSITIVE_INFINITY,
    });
    if (!star) return;

    const exploreJob = star.jobs?.find((ej: ExploreJob) => ej.id === job.id);
    if (!exploreJob) {
      console.warn(`No explore job found for ${job.id} in ${kingdom.id}`);
      return;
    }

    setSelectedJobForDialog(exploreJob);
    setSelectedStarForDialog(star);
    setIsJobDialogOpen(true);
  };

  const handleCloseJobDialog = () => {
    setIsJobDialogOpen(false);
    setTimeout(() => {
      setSelectedJobForDialog(null);
      setSelectedStarForDialog(null);
    }, 300);
  };

  const handleKingdomClick = async (kingdom: Kingdom) => {
    try {
      const star = await queryClient.fetchQuery({
        queryKey: starJsonQueryKey(kingdom.id),
        queryFn: () => fetchStarJsonByKingdomId(kingdom.id),
        staleTime: Number.POSITIVE_INFINITY,
      });
      if (!star) return;

      setStarDataForPanel(star);
      setIsStarPanelOpen(true);
    } catch (error) {
      console.error('Failed to load star data:', error);
    }
  };

  const handleCloseStarPanel = () => {
    setIsStarPanelOpen(false);
    setTimeout(() => {
      setStarDataForPanel(null);
    }, 300);
  };

  const handleOpenJobFromPanel = (job: ExploreJob) => {
    setSelectedJobForDialog(job);
    setSelectedStarForDialog(starDataForPanel);
    setIsJobDialogOpen(true);
  };

  if (phase === 'analyzing') {
    return <QuizResultsAnalyzingView accentColor={topMeta.color} message={QUIZ_LABELS.quiz_analyzing} />;
  }

  return (
    <div className="min-h-screen pb-16 relative overflow-hidden bg-black">
      <StarfieldCanvas count={100} />
      
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/8 to-transparent pointer-events-none" />

      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${topMeta.color}15 0%, transparent 70%)`,
        }}
      />

      <div className="web-container relative z-10 py-12 md:py-16">
        <section className="max-w-5xl mx-auto space-y-8 md:space-y-10 rounded-3xl border border-white/10 bg-white/[0.03] px-5 py-8 md:px-10 md:py-12">

          {/* Header Badge */}
          <div className="text-center animate-scale-bounce">
            <div
              className="inline-flex items-center gap-2 px-5 py-2 md:px-6 md:py-2.5 rounded-full text-sm md:text-base font-bold"
              style={{ backgroundColor: `${topMeta.color}20`, color: topMeta.color, border: `1px solid ${topMeta.color}30` }}
            >
              <Star className="w-4 h-4 md:w-5 md:h-5" />
              적성 분석 완료
            </div>
          </div>

          {/* Main Type Reveal */}
          <div className="text-center space-y-3 md:space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <p className="text-white/50 text-base md:text-lg">당신의 적성 유형은</p>
            <div className="relative inline-block">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-black" style={{ color: topMeta.color }}>
                {topType}
              </h1>
              <div className="absolute -inset-6 md:-inset-8 rounded-full animate-pulse-glow" style={{ opacity: 0.3 }} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white">{topMeta.label}</h2>
            <p className="text-white/50 text-base md:text-lg">{topMeta.desc} 유형</p>
          </div>

          {/* RIASEC Score Bars */}
          <div
            className="rounded-2xl md:rounded-3xl p-6 md:p-8 space-y-4 md:space-y-5 animate-slide-up"
            style={{
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              animationDelay: '0.2s',
            }}
          >
            <div className="flex items-center gap-2.5 mb-2">
              <Orbit className="w-5 h-5 md:w-6 md:h-6 text-white/40" />
              <span className="text-base md:text-lg font-semibold text-white/60">RIASEC 스펙트럼</span>
            </div>
            {sortedTypes.map((type, index) => {
              const meta = RIASEC_META[type] ?? RIASEC_META.I;
              const score = riasec.scores[type as keyof typeof riasec.scores];
              const pct = Math.round(score * 100);
              const isTop = index === 0;
              return (
                <div key={type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center text-sm md:text-base font-black text-white transition-transform hover:scale-110"
                        style={{ backgroundColor: meta.color }}
                      >
                        {type}
                      </div>
                      <span className="text-sm md:text-base font-medium text-white/80">{meta.label}</span>
                      {isTop && (
                        <span
                          className="text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: `${meta.color}25`, color: meta.color }}
                        >
                          TOP
                        </span>
                      )}
                    </div>
                    <span className="text-sm md:text-base font-bold" style={{ color: isTop ? meta.color : 'rgba(255,255,255,0.5)' }}>
                      {pct}%
                    </span>
                  </div>
                  <div className="h-2.5 md:h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: phase === 'done' ? `${pct}%` : '0%',
                        background: isTop
                          ? `linear-gradient(90deg, ${meta.color}, ${meta.color}99)`
                          : `${meta.color}60`,
                        boxShadow: isTop ? `0 0 16px ${meta.color}50` : 'none',
                        animation: 'progress-fill 1.2s ease-out',
                        animationDelay: `${index * 0.15}s`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Matching Star → 커리어 탐색(별/직업군) */}
          {topStar && (
            <button
              type="button"
              onClick={() => handleKingdomClick(topStar)}
              aria-label={`${topStar.name} 직업군 상세 정보 보기`}
              className="w-full text-left rounded-2xl md:rounded-3xl p-6 md:p-8 animate-slide-up relative overflow-hidden transition-all hover:scale-[1.01] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              style={{
                background: `linear-gradient(135deg, ${topStar.color}15 0%, ${topStar.color}05 100%)`,
                border: `1px solid ${topStar.color}30`,
                animationDelay: '0.3s',
              }}
            >
              <div
                className="absolute inset-0 rounded-2xl md:rounded-3xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ boxShadow: `0 0 50px ${topStar.color}20` }}
              />
              
              {Array.from({ length: 8 }).map((_, i) => (
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

              <div className="relative flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 md:w-6 md:h-6" style={{ color: topStar.color }} />
                  <span className="text-base md:text-lg font-bold" style={{ color: topStar.color }}>추천 직업군</span>
                </div>
                <span className="inline-flex items-center gap-1 text-xs md:text-sm font-semibold text-white/50">
                  상세 보기
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
              <div className="relative flex items-center gap-5 md:gap-6">
                <div
                  className="w-20 h-20 md:w-24 md:h-24 rounded-2xl md:rounded-3xl flex items-center justify-center relative shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${topStar.color} 0%, ${topStar.color}80 100%)`,
                    boxShadow: `0 0 40px ${topStar.color}30`,
                  }}
                >
                  <Sparkles className="w-10 h-10 md:w-12 md:h-12 text-white" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-orbit" style={{ animationDuration: '5s' }}>
                      <div className="w-2 h-2 rounded-full bg-white" style={{ boxShadow: `0 0 8px ${topStar.color}` }} />
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl md:text-2xl text-white mb-1">{topStar.name}</h3>
                  <p className="text-sm md:text-base text-white/50 leading-relaxed">{topStar.description}</p>
                </div>
              </div>
            </button>
          )}

          {/* Recommended Jobs */}
          <div
            className="rounded-2xl md:rounded-3xl p-6 md:p-8 space-y-4 md:space-y-5 animate-slide-up"
            style={{
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              animationDelay: '0.4s',
            }}
          >
            <div className="flex items-center gap-2.5 mb-2">
              <Trophy className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
              <span className="text-base md:text-lg font-semibold text-white/60">추천 직업 TOP 5</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedJobs.map((item, index) => {
                const job = item.job;
                const star = kingdoms.find((k) => k.id === job.kingdomId);
                const JobIcon = getJobIcon(job.icon);
                const rankColors = ['#FBBF24', '#9CA3AF', '#CD7C2F', '#6B7280', '#4B5563'];
                const rankColor = rankColors[index] ?? rankColors[4];
                const hasExploreData = jobsWithExploreData.has(job.id);
                
                return (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => hasExploreData && handleJobClick(job)}
                    disabled={!hasExploreData}
                    aria-label={hasExploreData ? `${job.name} 직업 상세 정보 보기` : `${job.name} (상세 정보 준비 중)`}
                    className="group relative flex items-start gap-4 p-4 md:p-5 rounded-xl md:rounded-2xl transition-all text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      boxShadow: index === 0 ? `0 0 30px ${topMeta.color}15` : 'none',
                      cursor: hasExploreData ? 'pointer' : 'not-allowed',
                      opacity: hasExploreData ? 1 : 0.5,
                      transform: hasExploreData ? 'none' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (hasExploreData) {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (hasExploreData) {
                        e.currentTarget.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    <div
                      className="absolute inset-0 rounded-xl md:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{ boxShadow: `0 0 30px ${star?.color ?? topMeta.color}20` }}
                    />
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-16 h-16 md:w-18 md:h-18 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110"
                        style={{
                          background: `linear-gradient(135deg, ${star?.color ?? topMeta.color}35, ${star?.color ?? topMeta.color}15)`,
                          border: `1.5px solid ${star?.color ?? topMeta.color}50`,
                          boxShadow: `0 4px 20px ${star?.color ?? topMeta.color}25`,
                        }}
                      >
                        <JobIcon className="w-8 h-8 md:w-9 md:h-9 text-white opacity-95" />
                      </div>
                      <div
                        className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white shadow-lg"
                        style={{
                          backgroundColor: rankColor,
                          border: '2px solid rgba(11,11,22,0.9)',
                          boxShadow: `0 2px 10px ${rankColor}60`,
                        }}
                      >
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-white text-base md:text-lg mb-1">{job.name}</div>
                      <div className="text-xs md:text-sm text-white/50 mb-2" style={{ color: star?.color ?? topMeta.color }}>
                        {star?.name}
                      </div>
                      {(job.shortDescription ?? job.description) && (
                        <p className="text-xs md:text-sm text-white/45 line-clamp-2 leading-relaxed">
                          {job.shortDescription ?? (typeof job.description === 'string' ? job.description : '')}
                        </p>
                      )}
                      <div
                        className="inline-flex items-center gap-2 flex-wrap text-xs md:text-sm font-bold px-3 py-1.5 rounded-full mt-3"
                        style={{
                          backgroundColor: `${topMeta.color}20`,
                          color: topMeta.color,
                          border: `1px solid ${topMeta.color}40`,
                        }}
                      >
                        매칭도 {item.score}%
                      </div>
                      {!hasExploreData && (
                        <p className="text-[10px] text-gray-500 mt-2">상세 정보 준비 중</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* XP Earned Banner */}
          <div
            className="rounded-2xl md:rounded-3xl p-5 md:p-6 flex items-center gap-4 animate-slide-up"
            style={{
              background: 'linear-gradient(135deg, rgba(108,92,231,0.15) 0%, rgba(108,92,231,0.05) 100%)',
              border: '1px solid rgba(108,92,231,0.25)',
              animationDelay: '0.5s',
            }}
          >
            <div 
              className="w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(108,92,231,0.2)' }}
            >
              <Sparkles className="w-7 h-7 md:w-8 md:h-8 text-[#a29bfe]" />
            </div>
            <div className="flex-1">
              <p className="text-base md:text-lg font-bold text-white">적성 검사 보상</p>
              <p className="text-xs md:text-sm text-white/40">첫 퀘스트 완료!</p>
            </div>
            <div className="text-2xl md:text-3xl font-black text-[#a29bfe]">+100 XP</div>
          </div>

          <p className="text-center text-[11px] text-white/35">
            적성 결과는 이 브라우저의 localStorage에 저장됩니다. 다른 기기나 브라우저에서는 이어지지 않을 수 있어요.
          </p>

          {/* 재검사 */}
          <div className="w-full">
            <button
              type="button"
              className="w-full h-12 md:h-14 rounded-2xl text-sm md:text-base font-bold text-white/90 border border-white/15 bg-white/[0.04] transition-all hover:bg-white/[0.08] hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
              onClick={handleRetakeQuiz}
            >
              <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
              적성 검사 다시 하기
            </button>
          </div>

          {/* CTA Button */}
          <div className="w-full">
            <button
              className="w-full h-14 md:h-16 rounded-2xl text-base md:text-lg font-bold text-white relative overflow-hidden transition-all hover:scale-105 active:scale-95 group"
              style={{
                background: `linear-gradient(135deg, ${topMeta.color} 0%, #6C5CE7 100%)`,
                boxShadow: `0 8px 40px ${topMeta.color}30`,
              }}
              onClick={handleStart}
            >
              <span className="absolute inset-0 animate-shimmer" />
              <span className="relative flex items-center justify-center gap-2.5">
                <Rocket className="w-5 h-5 md:w-6 md:h-6" />
                커리어 경험 탐색 시작하기
                <ArrowRight className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          </div>

        </section>
      </div>

      {selectedJobForDialog && selectedStarForDialog && isJobDialogOpen && (
        <JobDetailModal
          job={selectedJobForDialog}
          star={selectedStarForDialog}
          onClose={handleCloseJobDialog}
        />
      )}

      {isStarPanelOpen && starDataForPanel && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-4xl h-[85vh] bg-slate-950 rounded-3xl border border-violet-500/30 overflow-hidden">
            <StarDetailPanel
              star={starDataForPanel}
              onClose={handleCloseStarPanel}
              onOpenJob={handleOpenJobFromPanel}
            />
          </div>
        </div>
      )}
    </div>
  );
}
