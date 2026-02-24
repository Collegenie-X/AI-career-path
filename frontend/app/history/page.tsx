'use client';

import { useState, useEffect } from 'react';
import { TabBar } from '@/components/tab-bar';
import { storage } from '@/lib/storage';
import { getLevelForXP } from '@/lib/xp';
import careerMakerData from '@/data/career-maker.json';
import {
  Clock, Trophy, Activity, Award,
  Zap, Star, Sparkles, BookOpen,
  TrendingUp, Calendar, Filter,
} from 'lucide-react';

type SavedPlan = {
  id: string;
  itemId: string;
  title: string;
  type: 'activity' | 'award' | 'certification';
  grade: string;
  targetMonth: number;
  kingdomId: string;
  kingdomName: string;
  color: string;
  savedAt: string;
};

type TimelineEvent = {
  type: string;
  description: string;
  date: string;
  xp?: number;
};

const TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  activity:       { label: '활동',     icon: Activity, color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
  award:          { label: '수상·대회', icon: Trophy,   color: '#FBBF24', bg: 'rgba(251,191,36,0.15)' },
  certification:  { label: '자격증',   icon: Award,    color: '#22C55E', bg: 'rgba(34,197,94,0.15)' },
};

const MONTH_KR = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

function StarField() {
  const stars = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: ((i * 163.7) % 100),
    y: ((i * 91.1) % 100),
    size: (i % 3) + 1,
    delay: (i * 0.45) % 4,
    dur: 2 + (i % 3),
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {stars.map(s => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`, top: `${s.y}%`,
            width: s.size, height: s.size, opacity: 0.2,
            animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Plan Timeline Section ─── */
function PlanTimeline({ plans }: { plans: SavedPlan[] }) {
  const grouped = MONTH_KR.reduce<Record<number, SavedPlan[]>>((acc, _, idx) => {
    const month = idx + 1;
    const items = plans.filter(p => p.targetMonth === month);
    if (items.length > 0) acc[month] = items;
    return acc;
  }, {});

  const months = Object.keys(grouped).map(Number).sort((a, b) => a - b);

  if (months.length === 0) {
    return (
      <div className="glass-card p-8 rounded-2xl text-center">
        <Calendar className="w-8 h-8 text-gray-600 mx-auto mb-2" />
        <p className="text-sm text-gray-400">아직 계획이 없어요</p>
        <p className="text-xs text-gray-600 mt-1">커리어 패스 제작소에서 활동을 추가해보세요</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {months.map(month => (
        <div key={month} className="relative">
          {/* Month Header */}
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
              {month}
            </div>
            <div className="text-sm font-semibold text-white">{MONTH_KR[month - 1]}</div>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          {/* Items */}
          <div className="pl-10 space-y-2">
            {grouped[month].map(plan => {
              const cfg = TYPE_CONFIG[plan.type];
              const Icon = cfg.icon;
              return (
                <div
                  key={plan.id}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ backgroundColor: `${plan.color}12`, border: `1px solid ${plan.color}2a` }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: cfg.bg }}
                  >
                    <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white font-medium truncate">{plan.title}</div>
                    <div className="text-xs mt-0.5 flex items-center gap-1.5">
                      <span style={{ color: plan.color }}>{plan.kingdomName}</span>
                      <span className="text-gray-600">·</span>
                      <span className="text-gray-500">{plan.grade}</span>
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
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Kingdom Progress ─── */
function KingdomProgress({ plans }: { plans: SavedPlan[] }) {
  const kingdoms = careerMakerData.kingdoms;
  const counts = kingdoms
    .map(k => ({
      ...k,
      count: plans.filter(p => p.kingdomId === k.id).length,
    }))
    .filter(k => k.count > 0)
    .sort((a, b) => b.count - a.count);

  if (counts.length === 0) return null;
  const maxCount = Math.max(...counts.map(k => k.count));

  return (
    <div className="glass-card p-4 rounded-2xl space-y-3">
      <div className="text-sm font-semibold text-white flex items-center gap-2">
        <TrendingUp className="w-4 h-4 text-primary" />
        왕국별 계획 현황
      </div>
      {counts.map(k => (
        <div key={k.id} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span>{k.emoji}</span>
              <span className="text-gray-300">{k.name}</span>
            </div>
            <span style={{ color: k.color }}>{k.count}개</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(k.count / maxCount) * 100}%`, backgroundColor: k.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Activity Log ─── */
function ActivityLog({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="glass-card p-6 rounded-2xl text-center">
        <Clock className="w-6 h-6 text-gray-600 mx-auto mb-2" />
        <p className="text-xs text-gray-500">아직 활동 기록이 없어요</p>
      </div>
    );
  }

  return (
    <div className="glass-card p-4 rounded-2xl space-y-3">
      {events.slice(0, 10).map((event, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="mt-0.5 flex-shrink-0">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: '#6C5CE7', boxShadow: '0 0 6px #6C5CE766' }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white leading-snug">{event.description}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {new Date(event.date).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
            </p>
          </div>
          {event.xp != null && event.xp > 0 && (
            <span className="text-xs font-bold text-yellow-400 flex items-center gap-0.5 flex-shrink-0">
              <Zap className="w-3 h-3" />
              +{event.xp}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Main Page ─── */
export default function HistoryPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'plan' | 'activity'>('plan');
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [xpTotal, setXpTotal] = useState(0);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem('career_plans');
      if (raw) setSavedPlans(JSON.parse(raw));
    } catch {}
    const events = storage.timeline.getAll();
    setTimelineEvents(events);
    const xpLog = storage.xp.get();
    setXpTotal(xpLog?.totalXP ?? 0);
  }, []);

  if (!mounted) return null;

  const level = getLevelForXP(xpTotal);

  const stats = {
    activity: savedPlans.filter(p => p.type === 'activity').length,
    award:    savedPlans.filter(p => p.type === 'award').length,
    cert:     savedPlans.filter(p => p.type === 'certification').length,
  };

  return (
    <div className="min-h-screen pb-24 relative overflow-hidden">
      <StarField />

      {/* Header */}
      <div
        className="sticky top-0 z-20 backdrop-blur-xl border-b border-white/10 px-4 py-3"
        style={{ backgroundColor: 'rgba(26,26,46,0.9)' }}
      >
        <h1 className="text-xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
          작업 히스토리
        </h1>
        <p className="text-xs text-gray-400">내 커리어 패스 진행 기록</p>
      </div>

      <div className="relative z-10 px-4 pt-4 space-y-4">
        {/* Level & XP Summary */}
        <div
          className="rounded-2xl p-4 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(108,92,231,0.25) 0%, rgba(59,130,246,0.15) 100%)', border: '1px solid rgba(108,92,231,0.3)' }}
        >
          <div className="absolute top-2 right-3 opacity-10 text-6xl">🚀</div>
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black"
              style={{ background: 'linear-gradient(135deg, #6C5CE7, #5B4ED4)' }}
            >
              {level.level}
            </div>
            <div>
              <div className="text-xs text-gray-400">현재 레벨</div>
              <div className="font-bold text-white text-lg">Lv.{level.level} {level.name}</div>
              <div className="text-xs text-yellow-400 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {xpTotal} XP 누적
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: '활동', value: stats.activity, icon: Activity, color: '#3B82F6' },
            { label: '수상·대회', value: stats.award, icon: Trophy, color: '#FBBF24' },
            { label: '자격증', value: stats.cert, icon: Award, color: '#22C55E' },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="rounded-xl p-3 text-center"
                style={{ backgroundColor: `${s.color}15`, border: `1px solid ${s.color}30` }}
              >
                <Icon className="w-5 h-5 mx-auto mb-1" style={{ color: s.color }} />
                <div className="text-lg font-black text-white">{s.value}</div>
                <div className="text-[10px] text-gray-400">{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Kingdom Progress */}
        <KingdomProgress plans={savedPlans} />

        {/* Tab Switcher */}
        <div className="flex gap-2">
          {[
            { key: 'plan' as const, label: '월별 계획', icon: Calendar },
            { key: 'activity' as const, label: '활동 로그', icon: Clock },
          ].map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                className="flex-1 h-10 rounded-xl flex items-center justify-center gap-1.5 text-sm font-semibold transition-all"
                style={activeTab === t.key
                  ? { background: 'linear-gradient(135deg, #6C5CE7, #5B4ED4)', color: '#fff' }
                  : { backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
                onClick={() => setActiveTab(t.key)}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {activeTab === 'plan' ? (
          <PlanTimeline plans={savedPlans} />
        ) : (
          <ActivityLog events={timelineEvents} />
        )}
      </div>

      <TabBar />
    </div>
  );
}
