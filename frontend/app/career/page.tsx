'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TabBar } from '@/components/tab-bar';
import { Sparkles, Plus } from 'lucide-react';
import { CareerPathList } from './components/CareerPathList';
import { CareerPathBuilder, type CareerPlan } from './components/CareerPathBuilder';
import { CareerPathSelector } from './components/CareerPathSelector';
import { VerticalTimelineList } from './components/VerticalTimelineList';
import templates from '@/data/career-path-templates.json';

type TabId = 'explore' | 'builder' | 'timeline';

const TABS: { id: TabId; label: string; emoji: string }[] = [
  { id: 'explore', label: '탐색', emoji: '🔍' },
  { id: 'builder', label: '빌더', emoji: '🛠️' },
  { id: 'timeline', label: '타임라인', emoji: '🗺️' },
];

const STORAGE_KEY = 'career_plans_v3'; // Changed to support multiple plans

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

/* ─── Builder landing (빌더 탭 — 다이얼로그 열기 전) ─── */
function BuilderLanding({
  plans,
  selectedPlanId,
  onSelectPlan,
  onNew,
  onEdit,
  onDelete,
  onViewTimeline,
}: {
  plans: CareerPlan[];
  selectedPlanId: string | null;
  onSelectPlan: (planId: string) => void;
  onNew: () => void;
  onEdit: (plan: CareerPlan) => void;
  onDelete: (planId: string) => void;
  onViewTimeline: () => void;
}) {
  return (
    <div className="space-y-4 pt-2">
      {/* Hero */}
      <div
        className="rounded-3xl p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(108,92,231,0.22), rgba(168,85,247,0.10))',
          border: '1.5px solid rgba(108,92,231,0.28)',
        }}
      >
        <div className="text-5xl mb-4 text-center">🛠️</div>
        <h2 className="text-xl font-black text-white text-center mb-1.5">커리어 패스 빌더</h2>
        <p className="text-sm text-gray-400 text-center mb-5 leading-relaxed">
          왕국 선택부터 학년별 계획까지<br />단계별로 쉽게 만들어요
        </p>
      </div>

      {/* Career path selector */}
      <CareerPathSelector
        plans={plans}
        selectedPlanId={selectedPlanId}
        onSelectPlan={onSelectPlan}
        onNewPlan={onNew}
        onEditPlan={onEdit}
        onDeletePlan={onDelete}
      />

      {/* How it works */}
      <div
        className="rounded-2xl p-4 space-y-4"
        style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="text-xs font-bold text-gray-300 flex items-center gap-2">
          <span>💡</span> 단계별 가이드
        </div>
        {[
          { step: 1, emoji: '🌟', title: '왕국 선택', desc: '8개 별 중 관심 분야를 선택해요' },
          { step: 2, emoji: '🎯', title: '직업 선택', desc: '왕국의 대표 직업 중 목표를 골라요' },
          { step: 3, emoji: '📅', title: '학년 선택', desc: '계획할 학년을 모두 체크해요' },
          { step: 4, emoji: '✏️', title: '계획 추가', desc: '학년별로 목표·활동·수상·자격증을 추가해요' },
          { step: 5, emoji: '🎉', title: '완성!', desc: '저장 후 타임라인으로 확인해요' },
        ].map(item => (
          <div key={item.step} className="flex items-start gap-3">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5"
              style={{ background: 'linear-gradient(135deg, #6C5CE7, #a855f7)', color: '#fff' }}
            >
              {item.step}
            </div>
            <div>
              <div className="text-sm font-bold text-white">{item.emoji} {item.title}</div>
              <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Main page ─── */
function CareerPageContent() {
  const searchParams = useSearchParams();

  // Always start with 'explore' on server to avoid hydration mismatch.
  // After mount we sync from the URL query param.
  const [activeTab, setActiveTab] = useState<TabId>('explore');
  const [plans, setPlans] = useState<CareerPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<CareerPlan | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderInitialStep, setBuilderInitialStep] = useState<number | undefined>(undefined);
  const [mounted, setMounted] = useState(false);

  /* Client-only bootstrap — runs once after hydration */
  useEffect(() => {
    setMounted(true);

    // Sync tab from URL now that we're on the client
    const tabParam = searchParams.get('tab') as TabId | null;
    if (tabParam && ['explore', 'builder', 'timeline'].includes(tabParam)) {
      setActiveTab(tabParam);
    }

    // Load saved plans from localStorage
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const loadedPlans = JSON.parse(raw) as CareerPlan[];
        setPlans(loadedPlans);
        if (loadedPlans.length > 0) {
          setSelectedPlanId(loadedPlans[0].id);
        }
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const savePlans = (updatedPlans: CareerPlan[]) => {
    setPlans(updatedPlans);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlans));
  };

  const savePlan = (plan: CareerPlan) => {
    const existingIndex = plans.findIndex((p) => p.id === plan.id);
    let updatedPlans: CareerPlan[];

    if (existingIndex >= 0) {
      updatedPlans = [...plans];
      updatedPlans[existingIndex] = plan;
    } else {
      updatedPlans = [...plans, plan];
    }

    savePlans(updatedPlans);
    setSelectedPlanId(plan.id);
    setBuilderOpen(false);
    setEditingPlan(null);
    setActiveTab('timeline');
  };

  const deletePlan = (planId: string) => {
    const updatedPlans = plans.filter((p) => p.id !== planId);
    savePlans(updatedPlans);
    
    if (selectedPlanId === planId) {
      setSelectedPlanId(updatedPlans.length > 0 ? updatedPlans[0].id : null);
    }
  };

  const openNew = () => {
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
    const plan: CareerPlan = {
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
            : 'month' in item
            ? [(item as { month: number }).month]
            : [3],
          difficulty: item.difficulty,
          cost: item.cost,
          organizer: item.organizer,
        })),
      })),
    };
    savePlan(plan);
  };

  const selectedPlan = mounted ? (plans.find((p) => p.id === selectedPlanId) ?? null) : null;

  /* Propagate inline plan edits from timeline back to storage */
  const updatePlanInline = (updatedPlan: CareerPlan) => {
    const updatedPlans = plans.map((p) => p.id === updatedPlan.id ? updatedPlan : p);
    setPlans(updatedPlans);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlans));
  };

  const handleSharePlan = (plan: CareerPlan, isPublic: boolean) => {
    // 실제 서버 연동 시 여기서 API 호출
    // 현재는 로컬 상태만 업데이트 (updatePlanInline이 이미 처리)
    if (isPublic) {
      setActiveTab('explore');
    }
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

        {/* Tab bar — inactive style is always the same on server, active style applied after mount */}
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

      {/* Tab content — render nothing until mounted so SSR HTML is stable */}
      <div className="relative z-10 px-4 pt-4">
        {!mounted ? null : activeTab === 'explore' ? (
          <>
            <CareerPathList
              onUseTemplate={handleUseTemplate}
              onNewPath={openNew}
              myPublicPlans={plans.filter(p => p.isPublic)}
              onViewMyPlan={(plan) => {
                // 추후 내 공개 플랜 상세 다이얼로그 연결
              }}
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
        ) : activeTab === 'builder' ? (
          <BuilderLanding
            plans={plans}
            selectedPlanId={selectedPlanId}
            onSelectPlan={setSelectedPlanId}
            onNew={openNew}
            onEdit={openEdit}
            onDelete={deletePlan}
            onViewTimeline={() => setActiveTab('timeline')}
          />
        ) : activeTab === 'timeline' ? (
          <VerticalTimelineList
            allPlans={plans}
            onEdit={openEdit}
            onUpdatePlan={updatePlanInline}
            onDeletePlan={deletePlan}
            onNewPlan={openNew}
            onSharePlan={handleSharePlan}
          />
        ) : null}
      </div>

      <TabBar />

      {/* Builder dialog — full-screen overlay */}
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
