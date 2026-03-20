'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { CareerPathList } from './components/CareerPathList';
import { CareerPathBuilder, type CareerPlan } from './components/CareerPathBuilder';
import { VerticalTimelineList } from './components/VerticalTimelineList';
import { CommunityTab } from './components/community/CommunityTab';
import { ShareSettingsDialog } from './components/community/ShareSettingsDialog';
import { CareerPageHeader } from './components/CareerPageHeader';
import { CareerTabBar } from './components/CareerTabBar';
import { CareerPathDetailPanel } from './components/CareerPathDetailPanel';
import { TimelineDetailPanel } from './components/TimelineDetailPanel';
import { CommunityDetailPanel } from './components/community/CommunityDetailPanel';
import { TwoColumnPanelLayout } from '@/components/TwoColumnPanelLayout';
import { ExploreHeroBanner } from './components/ExploreHeroBanner';
import type { ShareChannel, CommunityGroup } from './components/community/types';
import { channelsToShareType } from './components/community/types';
import { CAREER_PAGE_TABS, type CareerPageTabId } from './config';
import communityData from '@/data/share-community.json';
import careerPathTemplates from '@/data/career-path-templates-index';
import { buildPlanFromTemplate } from './utils/buildPlanFromTemplate';
import { useCommunityReactions } from './hooks/useCommunityReactions';

type Template = typeof careerPathTemplates[0];

const STORAGE_KEY = 'career_plans_v3';
const DEFAULT_TAB_ID: CareerPageTabId = 'explore';

const isCareerPageTabId = (value: string | null): value is CareerPageTabId => {
  if (!value) return false;
  return CAREER_PAGE_TABS.some((tab) => tab.id === value);
};

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

  const [activeTab, setActiveTab] = useState<CareerPageTabId>(DEFAULT_TAB_ID);
  const [plans, setPlans] = useState<CareerPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<CareerPlan | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderInitialStep, setBuilderInitialStep] = useState<number | undefined>(undefined);
  const [mounted, setMounted] = useState(false);
  const [sharingPlan, setSharingPlan] = useState<CareerPlan | null>(null);

  /* ── 2-컬럼 패널용 선택 상태 ── */
  const [selectedExploreTemplate, setSelectedExploreTemplate] = useState<Template | null>(null);
  const [selectedCommunityPlan, setSelectedCommunityPlan] = useState<SharedPlan | null>(null);

  useEffect(() => {
    setMounted(true);
    const tabParam = searchParams.get('tab');
    if (isCareerPageTabId(tabParam)) setActiveTab(tabParam);
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

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (isCareerPageTabId(tabParam) && tabParam !== activeTab) setActiveTab(tabParam);
  }, [activeTab, searchParams]);

  const savePlans = (updatedPlans: CareerPlan[]) => {
    setPlans(updatedPlans);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlans));
  };

  const handleTabChange = (nextTabId: CareerPageTabId) => {
    if (nextTabId === activeTab) return;
    setActiveTab(nextTabId);
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.set('tab', nextTabId);
    router.replace(`/career?${nextSearchParams.toString()}`, { scroll: false });
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
    handleTabChange('timeline');
  };

  const deletePlan = (planId: string) => {
    const updatedPlans = plans.filter(p => p.id !== planId);
    savePlans(updatedPlans);
    if (selectedPlanId === planId) {
      const nextId = updatedPlans.length > 0 ? updatedPlans[0].id : null;
      setSelectedPlanId(nextId);
    }
  };

  const openNew = () => { setEditingPlan(null); setBuilderInitialStep(1); setBuilderOpen(true); };
  const openEdit = (plan: CareerPlan) => { setEditingPlan(plan); setBuilderInitialStep(3); setBuilderOpen(true); };
  const closeBuilder = () => { setBuilderOpen(false); setEditingPlan(null); setBuilderInitialStep(undefined); };

  const handleUseTemplate = (template: Template, customTitle: string) => {
    const planFromTemplate = buildPlanFromTemplate(template, customTitle);
    const updatedPlans = [...plans, planFromTemplate];
    savePlans(updatedPlans);
    setSelectedPlanId(planFromTemplate.id);
    setSelectedExploreTemplate(null);
    handleTabChange('timeline');
    setBuilderOpen(false);
    setEditingPlan(null);
    setBuilderInitialStep(undefined);
  };

  const updatePlanInline = (updatedPlan: CareerPlan) => {
    const updatedPlans = plans.map(p => p.id === updatedPlan.id ? updatedPlan : p);
    setPlans(updatedPlans);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlans));
  };

  const handleSharePlan = (plan: CareerPlan, isPublic: boolean) => {
    if (isPublic) handleTabChange('community');
  };

  const selectedPlan = mounted ? (plans.find(p => p.id === selectedPlanId) ?? null) : null;
  const sortedPlans = [...plans].sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });
  const totalTemplateCount = careerPathTemplates.length;
  const totalTemplateUses = careerPathTemplates.reduce((sum, template) => sum + template.uses, 0);
  const totalCommunitySharedPlans = ((communityData as { sharedPlans?: unknown[] }).sharedPlans ?? []).length;
  const totalCommunityGroups = ((communityData as { groups?: unknown[] }).groups ?? []).length;
  const totalMyPublicPlans = plans.filter((plan) => plan.isPublic).length;

  /* ── 커뮤니티 패널용 reactions 상태 (CommunityDetailPanel에 전달) ── */
  const {
    reactions: communityReactions,
    handleToggleLike: handleCommunityToggleLike,
    handleToggleBookmark: handleCommunityToggleBookmark,
  } = useCommunityReactions();

  return (
    <div
      className="min-h-screen pb-12 relative"
      style={{ backgroundColor: '#0a0a1e' }}
    >
      <StarField />
      <CareerPageHeader
        selectedJobBadge={
          mounted && selectedPlan
            ? { jobEmoji: selectedPlan.jobEmoji, jobName: selectedPlan.jobName, starColor: selectedPlan.starColor }
            : null
        }
      />

      {/* ── Tab + Content (통합 테두리 컨테이너) ── */}
      <div className="web-container relative z-10 py-4 md:py-6 rounded-3xl">
        <div
          className="rounded-none border border-t-0 border-x border-b overflow-hidden"
          style={{
            borderColor: 'rgba(255,255,255,0.12)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
            boxShadow: '0 18px 50px rgba(0,0,0,0.4)',
          }}
        >
          <div
            className="border-b border-white/[0.08] px-4 pt-4 pb-3 md:px-5 md:pt-5 md:pb-3.5"
            style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
          >
            <CareerTabBar
              activeTab={activeTab}
              onTabChange={handleTabChange}
              embeddedInCareerShell
            />
          </div>
          <ExploreHeroBanner
            activeTab={activeTab}
            onNewPath={openNew}
            embeddedInCareerShell
            totalTemplateCount={totalTemplateCount}
            totalUses={totalTemplateUses}
            totalCommunitySharedPlans={totalCommunitySharedPlans}
            totalCommunityGroups={totalCommunityGroups}
            totalMyPlans={plans.length}
            totalMyPublicPlans={totalMyPublicPlans}
          />
          <div className="px-4 pb-4 md:px-5 md:pb-5">
            {!mounted ? null : activeTab === 'explore' ? (
          <>
            <TwoColumnPanelLayout
              hasSelection={selectedExploreTemplate !== null}
              onClearSelection={() => setSelectedExploreTemplate(null)}
              emptyPlaceholderText="커리어 패스를 선택하세요"
              emptyPlaceholderSubText="왼쪽 목록에서 패스를 클릭하면 상세 내용이 여기에 표시됩니다"
              listSlot={
                <div
                  className="rounded-none border px-4 py-4 md:px-5 md:py-5"
                  style={{
                    borderColor: 'rgba(255,255,255,0.12)',
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
                    boxShadow: '0 20px 55px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)',
                  }}
                >
                  <CareerPathList
                    onUseTemplate={handleUseTemplate}
                    myPublicPlans={plans.filter(p => p.isPublic)}
                    onViewMyPlan={(plan) => { setSelectedPlanId(plan.id); handleTabChange('timeline'); }}
                    selectedTemplateId={selectedExploreTemplate?.id ?? null}
                    onSelectTemplate={setSelectedExploreTemplate}
                  />
                </div>
              }
              detailSlot={
                selectedExploreTemplate ? (
                  <CareerPathDetailPanel
                    template={selectedExploreTemplate}
                    onClose={() => setSelectedExploreTemplate(null)}
                    onUseTemplate={(customTitle) => handleUseTemplate(selectedExploreTemplate, customTitle)}
                  />
                ) : null
              }
            />
          </>
        ) : activeTab === 'timeline' ? (
          <TwoColumnPanelLayout
            hasSelection={selectedPlanId !== null && selectedPlan !== null}
            onClearSelection={() => setSelectedPlanId(null)}
            emptyPlaceholderText="패스를 선택하세요"
            emptyPlaceholderSubText="왼쪽 목록에서 패스를 클릭하면 타임라인이 여기에 표시됩니다"
            listSlot={
              <div
                className="rounded-none border px-4 py-4 md:px-5 md:py-5"
                style={{
                  borderColor: 'rgba(255,255,255,0.12)',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
                  boxShadow: '0 20px 55px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
              >
                <VerticalTimelineList
                  allPlans={sortedPlans}
                  preferredOpenPlanId={selectedPlanId}
                  selectedPlanId={selectedPlanId}
                  onSelectPlan={setSelectedPlanId}
                  onNewPlan={openNew}
                />
              </div>
            }
            detailSlot={
              selectedPlan ? (
                <TimelineDetailPanel
                  plan={selectedPlan}
                  onClose={() => setSelectedPlanId(null)}
                  onEdit={openEdit}
                  onUpdatePlan={updatePlanInline}
                  onDeletePlan={deletePlan}
                  onSharePlan={handleSharePlan}
                  onOpenShareDialog={(plan) => setSharingPlan(plan)}
                />
              ) : null
            }
          />
        ) : activeTab === 'community' ? (
          <TwoColumnPanelLayout
            hasSelection={selectedCommunityPlan !== null}
            onClearSelection={() => setSelectedCommunityPlan(null)}
            emptyPlaceholderText="공유 패스를 선택하세요"
            emptyPlaceholderSubText="왼쪽 목록에서 패스를 클릭하면 상세 내용이 여기에 표시됩니다"
            listSlot={
              <div
                className="rounded-none border px-4 py-4 md:px-5 md:py-5"
                style={{
                  borderColor: 'rgba(255,255,255,0.12)',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
                  boxShadow: '0 20px 55px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
              >
                <CommunityTab
                  selectedPlanId={selectedCommunityPlan?.id ?? null}
                  onSelectPlan={setSelectedCommunityPlan}
                />
              </div>
            }
            detailSlot={
              selectedCommunityPlan ? (
                <CommunityDetailPanel
                  plan={selectedCommunityPlan}
                  isLiked={communityReactions.likedPlanIds.includes(selectedCommunityPlan.id)}
                  isBookmarked={communityReactions.bookmarkedPlanIds.includes(selectedCommunityPlan.id)}
                  likeCount={communityReactions.likeCounts[selectedCommunityPlan.id] ?? selectedCommunityPlan.likes}
                  bookmarkCount={communityReactions.bookmarkCounts[selectedCommunityPlan.id] ?? selectedCommunityPlan.bookmarks}
                  onToggleLike={() => handleCommunityToggleLike(selectedCommunityPlan.id)}
                  onToggleBookmark={() => handleCommunityToggleBookmark(selectedCommunityPlan.id)}
                  onClose={() => setSelectedCommunityPlan(null)}
                  onAddComment={() => {}}
                />
              ) : null
            }
          />
            ) : null}
          </div>
        </div>
      </div>

      {/* Builder dialog */}
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
            handleSharePlan(updated, isPublic);
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
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a1e' }}>
          <Sparkles className="w-6 h-6 animate-pulse" style={{ color: '#6C5CE7' }} />
        </div>
      }
    >
      <CareerPageContent />
    </Suspense>
  );
}
