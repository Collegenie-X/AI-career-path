'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import { getQuizLandingPath } from '@/lib/navigation/quizLandingPath';
import { BadgeToastManager } from '@/components/badge-toast';
import { WhyTabStructureSection } from '../home/components/why-tab-structure-section';
import { useBadgeChecker } from '@/hooks/use-badge-checker';
import { getLevelForXP } from '@/lib/xp';
import exploreStar from '@/data/stars/explore-star.json';
import createStar from '@/data/stars/create-star.json';
import techStar from '@/data/stars/tech-star.json';
import connectStar from '@/data/stars/connect-star.json';
import {
  Zap, ChevronRight, Map,
  Activity, Trophy, Award,
  Settings, Star, Brain, ClipboardList,
  Flame, Rocket, Target,
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

const RIASEC_META: Record<string, { label: string; color: string; emoji: string; desc: string }> = {
  R: { label: '현실형', color: '#EF4444', emoji: '🔧', desc: '도구로 만들고 고치는 걸 좋아해요' },
  I: { label: '탐구형', color: '#3B82F6', emoji: '🔬', desc: '분석하며 문제 해결을 즐겨요' },
  A: { label: '예술형', color: '#A855F7', emoji: '🎨', desc: '상상력으로 창의적 표현을 해요' },
  S: { label: '사회형', color: '#22C55E', emoji: '🤝', desc: '사람들을 돕고 협력해요' },
  E: { label: '기업형', color: '#FBBF24', emoji: '🚀', desc: '목표를 세우고 실행해요' },
  C: { label: '관습형', color: '#6B7280', emoji: '📋', desc: '체계적으로 정리하고 관리해요' },
};

const TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; emoji: string }> = {
  activity:      { label: '활동',    icon: Activity, color: '#3B82F6', emoji: '⚡' },
  award:         { label: '수상',    icon: Trophy,   color: '#FBBF24', emoji: '🏆' },
  certification: { label: '자격증', icon: Award,    color: '#22C55E', emoji: '📜' },
};

const ALL_STARS: StarData[] = [exploreStar, createStar, techStar, connectStar] as StarData[];

function FloatingParticles() {
  const particles = useMemo(() =>
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: ((i * 137.5) % 100),
      y: ((i * 97.3) % 100),
      size: (i % 3) + 1,
      delay: (i * 0.4) % 4,
      dur: 2 + (i % 3),
      opacity: 0.12 + (i % 5) * 0.06,
    })), []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size, opacity: p.opacity,
            animation: `twinkle ${p.dur}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
      <div className="absolute top-20 right-8 w-32 h-32 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #6C5CE7, transparent)', animation: 'float 6s ease-in-out infinite' }} />
      <div className="absolute top-60 left-4 w-24 h-24 rounded-full opacity-8"
        style={{ background: 'radial-gradient(circle, #A855F7, transparent)', animation: 'float 8s ease-in-out 2s infinite' }} />
    </div>
  );
}

function HeroSection({
  nickname, level, onSettings,
}: {
  nickname: string;
  level: { level: number; name: string };
  onSettings: () => void;
}) {
  const greetings = ['안녕하세요', '오늘도 파이팅', '어서오세요'];
  const greeting = greetings[level.level % greetings.length];

  return (
    <div className="relative px-5 pt-6 pb-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #6C5CE7, #A855F7)',
                boxShadow: '0 0 24px #6C5CE766, 0 4px 12px rgba(0,0,0,0.3)',
              }}
            >
              <div className="absolute inset-0 opacity-30"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.3), transparent)' }} />
              <span className="relative z-10">{level.level}</span>
            </div>
            <div className="absolute -inset-1 rounded-2xl opacity-30"
              style={{ background: 'linear-gradient(135deg, #6C5CE7, #A855F7)', filter: 'blur(6px)', animation: 'pulse 2s ease-in-out infinite' }} />
          </div>
          <div>
            <p className="text-xs text-purple-300 font-semibold">{greeting}! 👋</p>
            <h1 className="text-xl font-black text-white leading-tight">{nickname}</h1>
            <div className="flex items-center gap-1 mt-0.5">
              <Flame className="w-3 h-3 text-orange-400" style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
              <span className="text-xs text-orange-300 font-bold">Lv.{level.level} {level.name}</span>
            </div>
          </div>
        </div>
        <button
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
          onClick={onSettings}
        >
          <Settings className="w-4.5 h-4.5 text-gray-300" />
        </button>
      </div>
    </div>
  );
}

function CareerPathSection({ savedPlans, onNavigate }: {
  savedPlans: SavedPlan[];
  onNavigate: () => void;
}) {
  const preview = savedPlans.slice(0, 2);
  const hasPlans = savedPlans.length > 0;

  const typeEmoji: Record<string, string> = {
    activity: '⚡', award: '🏆', certification: '📜',
  };
  const typeColor: Record<string, string> = {
    activity: '#3B82F6', award: '#FBBF24', certification: '#22C55E',
  };

  return (
    <div className="px-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6C5CE7, #A855F7)' }}>
            <Rocket className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-black text-white">내 커리어 패스</span>
          {hasPlans && (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(108,92,231,0.3)', color: '#a78bfa' }}
            >
              {savedPlans.length}개
            </span>
          )}
        </div>
        {hasPlans && (
          <button
            className="text-xs font-bold flex items-center gap-0.5"
            style={{ color: '#a78bfa' }}
            onClick={onNavigate}
          >
            전체보기 <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {!hasPlans ? (
        <div
          className="rounded-3xl p-5 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(108,92,231,0.3) 0%, rgba(168,85,247,0.2) 50%, rgba(236,72,153,0.15) 100%)',
            border: '1.5px solid rgba(108,92,231,0.5)',
          }}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <span className="absolute text-3xl opacity-10" style={{ top: '10%', left: '5%', animation: 'float 4s ease-in-out infinite' }}>🎯</span>
            <span className="absolute text-2xl opacity-10" style={{ top: '20%', right: '10%', animation: 'float 5s ease-in-out 1s infinite' }}>⭐</span>
            <span className="absolute text-3xl opacity-10" style={{ bottom: '15%', left: '15%', animation: 'float 6s ease-in-out 0.5s infinite' }}>🏆</span>
            <span className="absolute text-2xl opacity-10" style={{ bottom: '10%', right: '20%', animation: 'float 4.5s ease-in-out 2s infinite' }}>📜</span>
            <span className="absolute text-2xl opacity-10" style={{ top: '50%', left: '45%', animation: 'float 5.5s ease-in-out 1.5s infinite' }}>⚡</span>
          </div>

          <div className="flex items-center justify-center gap-2 mb-4">
            {['🎯', '📚', '🏆', '🚀'].map((icon, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    animation: `float ${3 + i * 0.5}s ease-in-out ${i * 0.3}s infinite`,
                  }}
                >
                  {icon}
                </div>
                {i < 3 && (
                  <div className="flex gap-0.5">
                    {[0, 1, 2].map(j => (
                      <div
                        key={j}
                        className="w-1 h-1 rounded-full"
                        style={{
                          background: 'rgba(168,85,247,0.6)',
                          animation: `pulse 1.5s ease-in-out ${j * 0.2}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <h3 className="text-white font-black text-lg mb-1 text-center">나만의 커리어 패스를 만들어봐요!</h3>
          <p className="text-sm text-gray-300 text-center mb-4 leading-relaxed">
            목표 직업을 정하고 🎯<br/>
            어떤 활동·수상·자격증이 필요한지 알아봐요
          </p>

          <button
            className="w-full h-12 rounded-2xl font-black text-white text-sm flex items-center justify-center gap-2 relative overflow-hidden transition-all active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #6C5CE7, #A855F7)',
              boxShadow: '0 4px 20px rgba(108,92,231,0.5)',
            }}
            onClick={onNavigate}
          >
            <div className="absolute inset-0 opacity-0 hover:opacity-20 transition-opacity"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.3), transparent)' }} />
            <Rocket className="w-4 h-4" style={{ animation: 'float 2s ease-in-out infinite' }} />
            커리어 패스 시작하기
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(108,92,231,0.25) 0%, rgba(168,85,247,0.15) 100%)',
            border: '1.5px solid rgba(108,92,231,0.45)',
          }}
        >
          <div className="px-4 pt-4 pb-3 flex items-center gap-3">
            {(['activity', 'award', 'certification'] as const).map(type => {
              const count = savedPlans.filter(p => p.type === type).length;
              const cfg = TYPE_CONFIG[type];
              return (
                <div key={type} className="flex-1 rounded-xl py-2 px-2 text-center"
                  style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}30` }}>
                  <div className="text-lg mb-0.5">{cfg.emoji}</div>
                  <div className="text-base font-black" style={{ color: cfg.color }}>{count}</div>
                  <div className="text-[10px] text-gray-400">{cfg.label}</div>
                </div>
              );
            })}
          </div>

          <div className="px-4 pb-3 space-y-2">
            {preview.map((plan, i) => (
              <div
                key={plan.id}
                className="flex items-center gap-3 rounded-2xl px-3 py-2.5"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  animation: `fadeSlideIn 0.4s ease-out ${i * 0.1}s both`,
                }}
              >
                <span className="text-xl flex-shrink-0">{typeEmoji[plan.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{plan.title}</p>
                  <p className="text-[11px] text-gray-400">{plan.grade} · {plan.kingdomName}</p>
                </div>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                  style={{ background: `${typeColor[plan.type]}20`, color: typeColor[plan.type] }}
                >
                  {plan.targetMonth}월
                </span>
              </div>
            ))}
          </div>

          <div className="px-4 pb-4">
            <button
              className="w-full h-11 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #6C5CE7, #A855F7)',
                boxShadow: '0 4px 16px rgba(108,92,231,0.4)',
              }}
              onClick={onNavigate}
            >
              <Map className="w-4 h-4" />
              전체 커리어 패스 보기
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AptitudeSection({ riasec, onTest, onViewReport }: {
  riasec: RIASECResult | null;
  onTest: () => void;
  onViewReport: () => void;
}) {
  if (!riasec) {
    return (
      <div className="px-5 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-black text-white">내 적성 유형</span>
        </div>
        <button
          className="w-full rounded-2xl p-5 text-left transition-all active:scale-95 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(59,130,246,0.12) 100%)',
            border: '1px solid rgba(168,85,247,0.4)',
          }}
          onClick={onTest}
        >
          <div className="absolute -right-4 -top-4 opacity-8">
            <Brain className="w-24 h-24 text-purple-400" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                style={{ background: 'rgba(168,85,247,0.25)', animation: 'float 3s ease-in-out infinite' }}
              >
                🧩
              </div>
              <div className="flex-1">
                <p className="text-white font-bold text-base">적성 퀴즈 풀기</p>
                <p className="text-xs text-gray-400 mt-0.5">나한테 맞는 직업이 뭔지 알아봐요!</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
                <div className="h-full w-0 rounded-full" style={{ background: 'linear-gradient(90deg, #6C5CE7, #A855F7)' }} />
              </div>
              <span className="text-xs text-gray-500 font-bold">0%</span>
            </div>
            <p className="text-[11px] text-purple-300 mt-2 flex items-center gap-1">
              <Zap className="w-3 h-3" />
              퀴즈 완료하면 +50 XP
            </p>
          </div>
        </button>
      </div>
    );
  }

  const topType = riasec.topTypes[0];
  const secondType = riasec.topTypes[1];
  const topMeta = RIASEC_META[topType];
  const secondMeta = RIASEC_META[secondType];

  return (
    <div className="px-5 mb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-black text-white">내 적성 유형</span>
        </div>
        <button
          className="text-xs font-bold flex items-center gap-0.5"
          style={{ color: '#a78bfa' }}
          onClick={onViewReport}
        >
          상세 리포트 <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div
        className="rounded-2xl p-5 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${topMeta.color}20 0%, ${secondMeta.color}12 100%)`,
          border: `1.5px solid ${topMeta.color}40`,
        }}
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="flex gap-2 flex-shrink-0">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl relative"
              style={{ background: `${topMeta.color}30`, border: `1.5px solid ${topMeta.color}50` }}
            >
              {topMeta.emoji}
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white"
                style={{ background: '#FBBF24' }}>1</div>
            </div>
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl relative"
              style={{ background: `${secondMeta.color}30`, border: `1.5px solid ${secondMeta.color}50` }}
            >
              {secondMeta.emoji}
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white"
                style={{ background: '#9CA3AF' }}>2</div>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-black" style={{ color: topMeta.color }}>{topMeta.label}</span>
              <span className="text-gray-600 text-sm">+</span>
              <span className="text-sm font-black" style={{ color: secondMeta.color }}>{secondMeta.label}</span>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed">{topMeta.desc}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            className="rounded-xl px-3 py-2.5 flex items-center justify-center gap-1.5 text-xs font-bold text-white transition-all active:scale-95"
            style={{ background: 'rgba(168,85,247,0.3)', border: '1px solid rgba(168,85,247,0.4)' }}
            onClick={onTest}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            다시 검사
          </button>
          <button
            className="rounded-xl px-3 py-2.5 flex items-center justify-center gap-1.5 text-xs font-bold transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #6C5CE7, #A855F7)', color: 'white' }}
            onClick={onViewReport}
          >
            <Brain className="w-3.5 h-3.5" />
            리포트
          </button>
        </div>
      </div>
    </div>
  );
}

function RiasecReportDialog({ riasec, onClose }: {
  riasec: RIASECResult;
  onClose: () => void;
}) {
  const sortedScores = Object.entries(riasec.scores)
    .sort(([, a], [, b]) => b - a);
  const maxScore = Math.max(...Object.values(riasec.scores));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1e 100%)', maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <span className="text-lg font-black text-white">내 적성 리포트</span>
          </div>
          <button
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90"
            style={{ background: 'rgba(255,255,255,0.08)' }}
            onClick={onClose}
          >
            <span className="text-white text-lg">×</span>
          </button>
        </div>

        <div className="px-5 py-4 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 72px)' }}>
          <div className="mb-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">주요 적성 유형</p>
            <div className="flex gap-3">
              {riasec.topTypes.slice(0, 2).map((type, i) => {
                const meta = RIASEC_META[type];
                return (
                  <div
                    key={type}
                    className="flex-1 rounded-2xl p-4 relative overflow-hidden"
                    style={{ background: `${meta.color}18`, border: `1.5px solid ${meta.color}40` }}
                  >
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white"
                      style={{ background: i === 0 ? '#FBBF24' : '#9CA3AF' }}>
                      {i + 1}
                    </div>
                    <div className="text-3xl mb-2">{meta.emoji}</div>
                    <p className="text-sm font-black mb-1" style={{ color: meta.color }}>{meta.label}</p>
                    <p className="text-[11px] text-gray-400 leading-relaxed">{meta.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mb-5">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">전체 점수</p>
            <div className="space-y-3">
              {sortedScores.map(([key, score]) => {
                const meta = RIASEC_META[key];
                const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{meta.emoji}</span>
                        <span className="text-sm font-bold text-white">{meta.label}</span>
                      </div>
                      <span className="text-sm font-black" style={{ color: meta.color }}>{score}점</span>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${percentage}%`,
                          background: `linear-gradient(90deg, ${meta.color}, ${meta.color}cc)`,
                          boxShadow: `0 0 8px ${meta.color}66`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className="rounded-2xl p-4"
            style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)' }}
          >
            <p className="text-sm font-bold text-white mb-1">💡 이런 직업이 잘 맞아요!</p>
            <p className="text-xs text-gray-400 leading-relaxed">
              아래 추천 직업 섹션에서 내 적성에 맞는 직업들을 확인해보세요
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RecommendedJobsSection({
  riasec,
  onJobClick,
}: {
  riasec: RIASECResult | null;
  onJobClick: (starId: string, jobId?: string) => void;
}) {
  const recommended = useMemo(() => {
    const allJobs: { job: StarJob; star: StarData }[] = [];
    ALL_STARS.forEach(star => {
      star.jobs.forEach(job => allJobs.push({ job, star }));
    });
    if (!riasec) return allJobs.slice(0, 3);
    const topTypes = riasec.topTypes;
    const scored = allJobs.map(({ job, star }) => {
      let score = 0;
      job.holland.split('+').forEach(t => {
        if (topTypes.includes(t as 'R' | 'I' | 'A' | 'S' | 'E' | 'C')) score += 2;
      });
      score += job.futureGrowth;
      return { job, star, score };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 3).map(({ job, star }) => ({ job, star }));
  }, [riasec]);

  return (
    <div className="px-5 mb-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-orange-400" />
          <span className="text-sm font-black text-white">
            {riasec ? '나한테 맞는 직업' : '추천 직업'}
          </span>
        </div>
        <button
          className="text-xs font-bold flex items-center gap-0.5"
          style={{ color: '#a78bfa' }}
          onClick={() => onJobClick('')}
        >
          전체보기 <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="space-y-2">
        {recommended.map(({ job, star }, i) => (
          <button
            key={`${star.id}-${job.id}`}
            className="w-full rounded-2xl p-3.5 flex items-center gap-3 text-left transition-all active:scale-95 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${star.color}15, rgba(255,255,255,0.03))`,
              border: `1px solid ${star.color}30`,
              animation: `fadeSlideIn 0.4s ease-out ${i * 0.08}s both`,
            }}
            onClick={() => onJobClick(star.id, job.id)}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 relative"
              style={{
                background: `linear-gradient(135deg, ${star.color}40, ${star.color}20)`,
                border: `1.5px solid ${star.color}50`,
                boxShadow: `0 4px 12px ${star.color}30`,
              }}
            >
              {job.icon}
              <div
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white"
                style={{ background: i === 0 ? '#FBBF24' : i === 1 ? '#9CA3AF' : '#CD7C2F' }}
              >
                {i + 1}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="font-black text-white text-sm">{job.name}</span>
              </div>
              <p className="text-xs text-gray-400 truncate">{job.shortDesc}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                  style={{ background: `${star.color}22`, color: star.color }}
                >
                  {star.emoji} {star.name}
                </span>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, si) => (
                    <Star key={si} className="w-2.5 h-2.5"
                      style={{ color: si < job.futureGrowth ? '#FBBF24' : '#2D2D4E', fill: si < job.futureGrowth ? '#FBBF24' : 'none' }} />
                  ))}
                </div>
              </div>
            </div>
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${star.color}25` }}
            >
              <ChevronRight className="w-4 h-4" style={{ color: star.color }} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function DailyMissionSection({ onQuiz }: { onQuiz: () => void }) {
  const missions = [
    { icon: '🧩', text: '적성 퀴즈 1번 풀기', xp: 10, done: false },
    { icon: '🔭', text: '직업 1개 탐험하기', xp: 15, done: false },
    { icon: '📋', text: '커리어 패스 확인하기', xp: 5, done: false },
  ];

  return (
    <div className="px-5 mb-5">
      <div className="flex items-center gap-2 mb-3">
        <Flame className="w-4 h-4 text-orange-400" />
        <span className="text-sm font-black text-white">오늘의 미션</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
          style={{ background: 'rgba(251,146,60,0.2)', color: '#fb923c' }}>
          매일 초기화
        </span>
      </div>
      <div className="space-y-2">
        {missions.map((m, i) => (
          <button
            key={i}
            className="w-full rounded-2xl px-4 py-3 flex items-center gap-3 text-left transition-all active:scale-95"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
            }}
            onClick={onQuiz}
          >
            <span className="text-xl flex-shrink-0">{m.icon}</span>
            <span className="flex-1 text-sm text-gray-300 font-medium">{m.text}</span>
            <span className="flex items-center gap-1 text-xs font-bold text-yellow-400 flex-shrink-0">
              <Zap className="w-3 h-3" />+{m.xp}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [mounted, setMounted] = useState(false);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [riasec, setRiasec] = useState<RIASECResult | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
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

  const handleJobClick = (starId: string, jobId?: string) => {
    if (starId && jobId) {
      router.push(`/jobs/explore?starId=${starId}&jobId=${jobId}`);
    } else {
      router.push('/jobs/explore');
    }
  };

  return (
    <div className="min-h-screen pb-12 relative overflow-hidden">
      <FloatingParticles />

      <HeroSection
        nickname={userData.nickname}
        level={currentLevel}
        onSettings={() => router.push('/settings')}
      />

      <CareerPathSection
        savedPlans={savedPlans}
        onNavigate={() => router.push('/career')}
      />

      <AptitudeSection
        riasec={riasec}
        onTest={() => router.push(getQuizLandingPath())}
        onViewReport={() => setShowReportDialog(true)}
      />

      <RecommendedJobsSection riasec={riasec} onJobClick={handleJobClick} />

      <DailyMissionSection onQuiz={() => router.push(getQuizLandingPath())} />

      <WhyTabStructureSection />

      <BadgeToastManager badgeIds={newBadges.map(b => b.badgeId)} />

      {showReportDialog && riasec && (
        <RiasecReportDialog riasec={riasec} onClose={() => setShowReportDialog(false)} />
      )}

      <style jsx global>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
