'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TabBar } from '@/components/tab-bar';
import { Sparkles, Plus } from 'lucide-react';
import { CareerPathList } from './components/CareerPathList';
import { CareerPathBuilder, type CareerPlan } from './components/CareerPathBuilder';
import { VerticalTimelineList } from './components/VerticalTimelineList';
import { CommunityTab } from './components/community/CommunityTab';
import { ShareSettingsDialog } from './components/community/ShareSettingsDialog';
import type { ShareChannel, CommunityGroup } from './components/community/types';
import { channelsToShareType } from './components/community/types';
import communityData from '@/data/share-community.json';
import careerPathTemplates from '@/data/career-path-templates-index';
import { buildStructuredCareerItem } from '@/data/career-item-structure';

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

  const [activeTab, setActiveTab] = useState<TabId>('explore');
  const [plans, setPlans] = useState<CareerPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<CareerPlan | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderInitialStep, setBuilderInitialStep] = useState<number | undefined>(undefined);
  const [mounted, setMounted] = useState(false);
  const [sharingPlan, setSharingPlan] = useState<CareerPlan | null>(null);

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

  const handleUseTemplate = (template: typeof careerPathTemplates[0], customTitle: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapItem = (item: any, prefix: string, iIdx: number) => buildStructuredCareerItem({
      id: item.id ?? `${prefix}-${iIdx}-${Date.now()}`,
      type: item.type ?? 'activity',
      title: item.title ?? '',
      months: Array.isArray(item.months) ? item.months : (typeof item.month === 'number' ? [item.month] : [3]),
      difficulty: item.difficulty ?? 2,
      cost: item.cost ?? '무료',
      organizer: item.organizer ?? '',
      url: item.url,
      description: item.description,
      links: item.links,
      categoryTags: item.categoryTags,
      activitySubtype: item.activitySubtype,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const planFromTemplate: CareerPlan = {
      id: `from-template-${Date.now()}`,
      starId: template.starId,
      starName: template.starName,
      starEmoji: template.starEmoji,
      starColor: template.starColor,
      jobId: template.jobId,
      jobName: template.jobName,
      jobEmoji: template.jobEmoji,
      title: customTitle.trim().length > 0 ? customTitle.trim() : template.title,
      createdAt: new Date().toISOString(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      years: (template.years as any[]).map((y: any, yIdx: number) => {
        const goals = y.goals ?? [];
        const rawItems = y.items ?? [];

        // goalGroups가 있으면 사용, 없으면 템플릿 형식(goals+items) → goalGroups 변환
        let goalGroups: { id: string; goal: string; items: ReturnType<typeof mapItem>[] }[];
        if (Array.isArray(y.goalGroups) && y.goalGroups.length > 0) {
          goalGroups = y.goalGroups.map((g: any, gi: number) => ({
            id: g.id ?? `tpl-g-${yIdx}-${gi}-${Date.now()}`,
            goal: g.goal ?? '',
            items: (g.items ?? []).map((item: any, iIdx: number) => mapItem(item, `tpl-${y.gradeId}-g${gi}`, iIdx)),
          }));
        } else {
          const items = rawItems.map((item: any, iIdx: number) => mapItem(item, `tpl-${y.gradeId}`, iIdx));
          const firstGoal = goals.length > 0 ? goals[0] : '활동 목록';
          goalGroups = items.length > 0
            ? [
                { id: `goal-${y.gradeId}-0`, goal: firstGoal, items },
                ...goals.slice(1).map((g: string, idx: number) => ({
                  id: `goal-${y.gradeId}-${idx + 1}`,
                  goal: g,
                  items: [] as ReturnType<typeof mapItem>[],
                })),
              ]
            : goals.map((g: string, idx: number) => ({
                id: `goal-${y.gradeId}-${idx}`,
                goal: g,
                items: [] as ReturnType<typeof mapItem>[],
              }));
        }

        // goalGroups / semesterPlans에 이미 포함된 항목은 year.items에 넣지 않음 (이중 표시 방지)
        const keyOf = (item: any) => {
          const id = item?.id;
          if (typeof id === 'string' && id.trim()) return `id:${id}`;
          const type = item?.type ?? 'activity';
          const title = item?.title ?? '';
          return `tt:${type}::${String(title).trim()}`;
        };
        const keysInGoalGroups = new Set<string>(
          (y.goalGroups ?? []).flatMap((g: any) => (g.items ?? []).map(keyOf))
        );
        const keysInSemesterPlans = new Set<string>(
          (y.semesterPlans ?? []).flatMap((sp: any) => (sp.goalGroups ?? []).flatMap((g: any) => (g.items ?? []).map(keyOf)))
        );
        const ungroupedItems =
          Array.isArray(rawItems) && rawItems.length > 0
            ? rawItems
                .filter((it: any) => !keysInGoalGroups.has(keyOf(it)) && !keysInSemesterPlans.has(keyOf(it)))
                .map((item: any, iIdx: number) => mapItem(item, `tpl-${y.gradeId}`, iIdx))
            : [];

        return {
          gradeId: y.gradeId,
          gradeLabel: y.gradeLabel,
          semester: y.semester ?? 'both',
          goals,
          items: ungroupedItems,
          goalGroups,
          semesterPlans: (y.semesterPlans ?? []).map((sp: any) => ({
            ...sp,
            goalGroups: (sp.goalGroups ?? []).map((g: any, gi: number) => ({
              ...g,
              id: g.id ?? `tpl-sp-${yIdx}-${gi}`,
              items: (g.items ?? []).map((item: any, iIdx: number) => mapItem(item, `tpl-sp-${y.gradeId}`, iIdx)),
            })),
          })),
        };
      }),
    };
    const updatedPlans = [...plans, planFromTemplate];
    savePlans(updatedPlans);
    setSelectedPlanId(planFromTemplate.id);
    setActiveTab('timeline');
    setBuilderOpen(false);
    setEditingPlan(null);
    setBuilderInitialStep(undefined);
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
              드림 패스
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
              <span className="text-[12px] font-bold" style={{ color: selectedPlan.starColor }}>
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
              onViewMyPlan={(plan) => {
                setSelectedPlanId(plan.id);
                setActiveTab('timeline');
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
        ) : activeTab === 'timeline' ? (
          <VerticalTimelineList
            allPlans={[...plans].sort((a, b) => {
              const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return timeB - timeA;
            })}
            preferredOpenPlanId={selectedPlanId}
            onEdit={openEdit}
            onUpdatePlan={updatePlanInline}
            onDeletePlan={deletePlan}
            onNewPlan={openNew}
            onSharePlan={handleSharePlan}
            onOpenShareDialog={(plan) => setSharingPlan(plan)}
          />
        ) : activeTab === 'community' ? (
          <CommunityTab onNewPlan={openNew} />
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

      {sharingPlan && (
        <ShareSettingsDialog
          planTitle={sharingPlan.title}
          currentDescription={sharingPlan.description}
          currentChannels={sharingPlan.shareChannels}
          currentGroupIds={sharingPlan.shareGroupIds}
          availableGroups={(communityData.groups ?? []) as CommunityGroup[]}
          isCurrentlyShared={sharingPlan.isPublic}
          onConfirm={(channels: ShareChannel[], description: string, groupIds: string[]) => {
            const isPublic = channels.length > 0;
            const shareType = isPublic ? channelsToShareType(channels) : undefined;
            const updated: CareerPlan = {
              ...sharingPlan,
              description: description || sharingPlan.description,
              isPublic,
              shareChannels: isPublic ? channels : undefined,
              shareType,
              shareGroupIds: channels.includes('group') ? groupIds : undefined,
              sharedAt: isPublic ? new Date().toISOString() : undefined,
            };
            updatePlanInline(updated);
            handleSharePlan(updated, isPublic, shareType);
            setSharingPlan(null);
          }}
          onClose={() => setSharingPlan(null)}
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
