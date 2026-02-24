'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import { TabBar } from '@/components/tab-bar';
import { BadgeToastManager } from '@/components/badge-toast';
import { useBadgeChecker } from '@/hooks/use-badge-checker';
import { getLevelForXP, getXPProgress } from '@/lib/xp';
import careerMakerData from '@/data/career-maker.json';
import {
  Sparkles, Zap, ChevronRight, Map,
  Briefcase, History, Activity, Trophy, Award,
  TrendingUp, Moon, Star,
} from 'lucide-react';
import type { UserProfile } from '@/lib/types';

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

const MONTH_KR = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
const TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  activity:      { label: '활동',     icon: Activity, color: '#3B82F6' },
  award:         { label: '수상',     icon: Trophy,   color: '#FBBF24' },
  certification: { label: '자격증',  icon: Award,    color: '#22C55E' },
};

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
function XPCard({ xp, level, progress }: { xp: number; level: { level: number; name: string }; progress: { current: number; max: number; percentage: number } }) {
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

/* ─── Quick Nav Card ─── */
function QuickNav({
  icon: Icon, label, sub, color, badge, onClick,
}: {
  icon: React.ElementType;
  label: string;
  sub: string;
  color: string;
  badge?: string;
  onClick: () => void;
}) {
  return (
    <button
      className="glass-card p-4 text-left relative overflow-hidden w-full transition-transform active:scale-95"
      onClick={onClick}
    >
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
      </div>
      <h3 className="font-semibold text-white text-sm">{label}</h3>
      <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
      {badge && (
        <div
          className="absolute top-3 right-3 px-1.5 py-0.5 rounded-md text-[9px] font-bold"
          style={{ backgroundColor: `${color}33`, color }}
        >
          {badge}
        </div>
      )}
    </button>
  );
}

/* ─── Upcoming Plan Card ─── */
function UpcomingPlanCard({ plan }: { plan: SavedPlan }) {
  const cfg = TYPE_CONFIG[plan.type];
  const Icon = cfg.icon;
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl"
      style={{ backgroundColor: `${plan.color}12`, border: `1px solid ${plan.color}2a` }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${cfg.color}22` }}
      >
        <Icon className="w-4 h-4" style={{ color: cfg.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm text-white font-medium truncate">{plan.title}</div>
        <div className="text-xs text-gray-400 flex items-center gap-1">
          <span style={{ color: plan.color }}>{plan.kingdomName}</span>
          <span>·</span>
          <span>{plan.grade}</span>
          <span>·</span>
          <span>{MONTH_KR[plan.targetMonth - 1]}</span>
        </div>
      </div>
      <span
        className="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
        style={{ backgroundColor: `${cfg.color}22`, color: cfg.color }}
      >
        {cfg.label}
      </span>
    </div>
  );
}

/* ─── Main ─── */
export default function HomePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [mounted, setMounted] = useState(false);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const { newBadges } = useBadgeChecker();

  useEffect(() => {
    setMounted(true);
    const data = storage.user.get();
    if (!data || !data.onboardingCompleted) {
      router.push('/');
      return;
    }
    setUserData(data);
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

  /* Next 3 upcoming plans sorted by month */
  const currentMonth = new Date().getMonth() + 1;
  const upcomingPlans = savedPlans
    .slice()
    .sort((a, b) => {
      const da = a.targetMonth >= currentMonth ? a.targetMonth - currentMonth : a.targetMonth + 12 - currentMonth;
      const db = b.targetMonth >= currentMonth ? b.targetMonth - currentMonth : b.targetMonth + 12 - currentMonth;
      return da - db;
    })
    .slice(0, 3);

  /* Kingdom distribution for mini bar */
  const kingdoms = careerMakerData.kingdoms;
  const kingdomStats = kingdoms
    .map(k => ({ ...k, count: savedPlans.filter(p => p.kingdomId === k.id).length }))
    .filter(k => k.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

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

      {/* ===== Career Path Status ===== */}
      <div className="px-5 mb-5">
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
                onClick={() => router.push('/career')}
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
              {/* Type stats */}
              <div className="flex gap-3 mb-3">
                {['activity', 'award', 'certification'].map(type => {
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
                onClick={() => router.push('/career')}
              >
                <Map className="w-4 h-4" />
                커리어 패스 보기
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ===== Upcoming Plans ===== */}
      {upcomingPlans.length > 0 && (
        <div className="px-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">다가오는 계획</h2>
            <button
              className="text-xs text-primary flex items-center gap-1"
              onClick={() => router.push('/history')}
            >
              전체보기 <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            {upcomingPlans.map(plan => (
              <UpcomingPlanCard key={plan.id} plan={plan} />
            ))}
          </div>
        </div>
      )}

      {/* ===== Kingdom Progress ===== */}
      {kingdomStats.length > 0 && (
        <div className="px-5 mb-5">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">왕국별 진행</h2>
          <div className="glass-card p-4 space-y-2.5">
            {kingdomStats.map(k => (
              <div key={k.id} className="flex items-center gap-3">
                <span className="text-lg w-6 text-center">{k.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-300">{k.name}</span>
                    <span style={{ color: k.color }}>{k.count}개</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${Math.min((k.count / 5) * 100, 100)}%`, backgroundColor: k.color }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== Quick Navigation ===== */}
      <div className="px-5 mb-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">빠른 이동</h2>
        <div className="grid grid-cols-3 gap-3">
          <QuickNav
            icon={Briefcase}
            label="Job 체험"
            sub="8개 왕국"
            color="#3B82F6"
            onClick={() => router.push('/jobs/explore')}
          />
          <QuickNav
            icon={Map}
            label="커리어 제작"
            sub="활동·수상"
            color="#6C5CE7"
            onClick={() => router.push('/career')}
          />
          <QuickNav
            icon={History}
            label="히스토리"
            sub="진행 기록"
            color="#22C55E"
            badge={savedPlans.length > 0 ? `${savedPlans.length}` : undefined}
            onClick={() => router.push('/history')}
          />
        </div>
      </div>

      {/* ===== Recent Activity ===== */}
      {(() => {
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
      })()}

      <TabBar />
      <BadgeToastManager badgeIds={newBadges.map(b => b.badgeId)} />
    </div>
  );
}
