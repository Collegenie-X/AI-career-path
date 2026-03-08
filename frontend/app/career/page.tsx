'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TabBar } from '@/components/tab-bar';
import { Sparkles, Plus, X, UserPlus } from 'lucide-react';
import { storage } from '@/lib/storage';
import { CareerPathList } from './components/CareerPathList';
import { CareerPathBuilder, type CareerPlan } from './components/CareerPathBuilder';
import { VerticalTimelineList } from './components/VerticalTimelineList';
import { CommunityTab } from './components/community/CommunityTab';
import templates from '@/data/career-path-templates.json';

type TabId = 'explore' | 'timeline' | 'community';

const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: 'explore',   label: '탐색',     emoji: '🔍' },
  { id: 'community', label: '커뮤니티', emoji: '👥' },
  { id: 'timeline',  label: '내 패스',  emoji: '🗺️' },
];

const STORAGE_KEY = 'career_plans_v3';

/* ─── Star background ─── */
function StarField() {
  const stars = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: ((i * 149.3) % 100),
    y: ((i * 79.7) % 100),
    size: (i % 3) + 1,
    delay: (i * 0.35) % 3,
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
            width: s.size, height: s.size, opacity: 0.15,
            animation: `twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Main page ─── */
function CareerPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showSignupDialog, setShowSignupDialog] = useState(false);

  const [activeTab, setActiveTab] = useState<TabId>('explore');
  const [plans, setPlans] = useState<CareerPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<CareerPlan | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderInitialStep, setBuilderInitialStep] = useState<number | undefined>(undefined);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const tabParam = searchParams.get('tab') as TabId | null;
    if (tabParam && ['explore', 'timeline', 'community'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const loadedPlans = JSON.parse(raw) as CareerPlan[];
        setPlans(loadedPlans);
        if (loadedPlans.length > 0) setSelectedPlanId(loadedPlans[0].id);
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const savePlans = (updatedPlans: CareerPlan[]) => {
    setPlans(updatedPlans);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlans));
  };

  const savePlan = (plan: CareerPlan) => {
    const existingIndex = plans.findIndex(p => p.id === plan.id);
    const updatedPlans = existingIndex >= 0
      ? plans.map((p, i) => i === existingIndex ? plan : p)
      : [...plans, plan];
    savePlans(updatedPlans);
    setSelectedPlanId(plan.id);
    setBuilderOpen(false);
    setEditingPlan(null);
    setActiveTab('timeline');
  };

  const deletePlan = (planId: string) => {
    const updatedPlans = plans.filter(p => p.id !== planId);
    savePlans(updatedPlans);
    if (selectedPlanId === planId) {
      setSelectedPlanId(updatedPlans.length > 0 ? updatedPlans[0].id : null);
    }
  };

  const openNew = () => {
    const user = storage.user.get();
    if (!user?.onboardingCompleted) {
      setShowSignupDialog(true);
      return;
    }
    setEditingPlan(null);
    setBuilderInitialStep(1);
    setBuilderOpen(true);
  };

  const openEdit = (plan: CareerPlan) => {
    setEditingPlan(plan);
    setBuilderInitialStep(3);
    setBuilderOpen(true);
  };

  const closeBuilder = () => {
    setBuilderOpen(false);
    setEditingPlan(null);
    setBuilderInitialStep(undefined);
  };

  const handleUseTemplate = (template: typeof templates[0]) => {
    const user = storage.user.get();
    if (!user?.onboardingCompleted) {
      setShowSignupDialog(true);
      return;
    }
    const planFromTemplate: CareerPlan = {
      id: `from-template-${Date.now()}`,
      starId: template.starId,
      starName: template.starName,
      starEmoji: template.starEmoji,
      starColor: template.starColor,
      jobId: template.jobId,
      jobName: template.jobName,
      jobEmoji: template.jobEmoji,
      title: template.title,
      createdAt: new Date().toISOString(),
      years: template.years.map(y => ({
        gradeId: y.gradeId,
        gradeLabel: y.gradeLabel,
        goals: y.goals,
        items: y.items.map((item, idx) => ({
          id: `tpl-${y.gradeId}-${idx}-${Date.now()}`,
          type: item.type as 'activity' | 'award' | 'portfolio' | 'certification',
          title: item.title,
          months: 'months' in item && Array.isArray((item as { months?: number[] }).months)
            ? (item as { months: number[] }).months
            : 'month' in item ? [(item as { month: number }).month] : [3],
          difficulty: item.difficulty,
          cost: item.cost,
          organizer: item.organizer,
        })),
      })),
    };
    setEditingPlan(planFromTemplate);
    setBuilderInitialStep(3);
    setBuilderOpen(true);
  };

  const selectedPlan = mounted ? (plans.find(p => p.id === selectedPlanId) ?? null) : null;

  const updatePlanInline = (updatedPlan: CareerPlan) => {
    const updatedPlans = plans.map(p => p.id === updatedPlan.id ? updatedPlan : p);
    setPlans(updatedPlans);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlans));
  };

  const handleSharePlan = (plan: CareerPlan, isPublic: boolean, shareType?: string) => {
    if (isPublic) setActiveTab('community');
  };

  return (
    <div
      className="min-h-screen pb-24 relative overflow-hidden"
      style={{ backgroundColor: '#0a0a1e' }}
    >
      <StarField />

      {/* Page header */}
      <div
        className="sticky top-0 z-20 px-4"
        style={{
          backgroundColor: 'rgba(10,10,30,0.92)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center justify-between py-3">
          <div>
            <h1 className="text-xl font-black bg-gradient-to-r from-white via-purple-200 to-indigo-300 bg-clip-text text-transparent">
              커리어 패스
            </h1>
            <p className="text-xs text-gray-500">나만의 진로 로드맵</p>
          </div>
          {mounted && selectedPlan && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
              style={{
                backgroundColor: `${selectedPlan.starColor}18`,
                border: `1px solid ${selectedPlan.starColor}33`,
              }}
            >
              <span className="text-base">{selectedPlan.jobEmoji}</span>
              <span className="text-[11px] font-bold" style={{ color: selectedPlan.starColor }}>
                {selectedPlan.jobName}
              </span>
            </div>
          )}
        </div>

        {/* Tab bar */}
        <div className="flex gap-1.5 pb-3">
          {TABS.map(tab => {
            const active = mounted && activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all"
                style={active
                  ? {
                      background: 'linear-gradient(135deg, #6C5CE7, #a855f7)',
                      color: '#fff',
                      boxShadow: '0 4px 16px rgba(108,92,231,0.35)',
                    }
                  : {
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: 'rgba(255,255,255,0.4)',
                      border: '1px solid rgba(255,255,255,0.07)',
                    }}
              >
                <span>{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      <div className="relative z-10 px-4 pt-4">
        {!mounted ? null : activeTab === 'explore' ? (
          <>
            <CareerPathList
              onUseTemplate={handleUseTemplate}
              onNewPath={openNew}
              myPublicPlans={plans.filter(p => p.isPublic)}
              onViewMyPlan={() => {}}
            />
            {!builderOpen && (
              <div className="fixed bottom-20 left-0 right-0 z-30 px-5 max-w-[430px] mx-auto">
                <button
                  onClick={openNew}
                  className="w-full h-14 rounded-2xl font-black text-base text-white flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, #6C5CE7, #a855f7)',
                    boxShadow: '0 8px 28px rgba(108,92,231,0.55)',
                  }}
                >
                  <Plus className="w-5 h-5" />
                  커리어 패스 만들기
                </button>
              </div>
            )}
          </>
        ) : activeTab === 'timeline' ? (
          <VerticalTimelineList
            allPlans={plans}
            onEdit={openEdit}
            onUpdatePlan={updatePlanInline}
            onDeletePlan={deletePlan}
            onNewPlan={openNew}
            onSharePlan={handleSharePlan}
          />
        ) : activeTab === 'community' ? (
          <CommunityTab onNewPlan={openNew} />
        ) : null}
      </div>

      <TabBar />

      {/* Builder dialog — full-screen overlay */}
      {/* 커리어 패스 만들기 시 로그인 유도 다이얼로그 */}
      {showSignupDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSignupDialog(false)} />
          <div
            className="relative w-full max-w-[360px] rounded-2xl p-6 space-y-5"
            style={{ backgroundColor: '#12122a', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">커리어 패스 만들기</h3>
              <button
                onClick={() => setShowSignupDialog(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              커리어 패스를 만들려면 회원가입 또는 로그인이 필요해요.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowSignupDialog(false)}
                className="flex-1 h-12 rounded-xl font-semibold text-sm text-white/70"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
              >
                취소
              </button>
              <button
                onClick={() => {
                  setShowSignupDialog(false);
                  router.push('/signup?redirect=' + encodeURIComponent('/career'));
                }}
                className="flex-1 h-12 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #6C5CE7, #a855f7)' }}
              >
                <UserPlus className="w-4 h-4" />
                회원가입
              </button>
            </div>
          </div>
        </div>
      )}

      {builderOpen && (
        <CareerPathBuilder
          initialPlan={editingPlan}
          initialStep={builderInitialStep}
          onSave={savePlan}
          onClose={closeBuilder}
        />
      )}
    </div>
  );
}

export default function CareerPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: '#0a0a1e' }}
        >
          <Sparkles className="w-6 h-6 animate-pulse" style={{ color: '#6C5CE7' }} />
        </div>
      }
    >
      <CareerPageContent />
    </Suspense>
  );
}
