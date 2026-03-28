'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { CareerPathList } from './components/CareerPathList';
import { CareerPathBuilder, type CareerPlan } from './components/CareerPathBuilder';
import { VerticalTimelineList } from './components/VerticalTimelineList';
import { CommunityTab } from './components/community/CommunityTab';
import { ShareSettingsDialog } from './components/community/ShareSettingsDialog';
import { CareerTabBar } from './components/CareerTabBar';
import { TimelineDetailPanel } from './components/TimelineDetailPanel';
import { CommunityDetailPanel } from './components/community/CommunityDetailPanel';
import { CareerPathExpandBottomSheetDialog } from './components/expandable-detail';
import { TwoColumnPanelLayout } from '@/components/TwoColumnPanelLayout';
import {
  SECTION_SHELL_FRAME_STYLE,
  SECTION_SHELL_TAB_NAVIGATION_AREA_CLASS_NAME_FLUSH_RIGHT,
  SECTION_SHELL_TAB_NAVIGATION_AREA_STYLE,
} from '@/components/section-shell/section-shell-layout.constants';
import { ExploreHeroBanner } from './components/ExploreHeroBanner';
import type { ShareChannel, CommunityGroup, SharedPlan } from './components/community/types';
import { channelsToShareType } from './components/community/types';
import { CAREER_PAGE_TABS, type CareerPageTabId } from './config';
import careerPathTemplates from '@/data/career-path-templates-index';
import { buildPlanFromTemplate } from './utils/buildPlanFromTemplate';
import { useCareerPlansController } from './hooks/useCareerPlansController';
import { useMySharedPlansQuery } from './hooks/useMySharedPlansQuery';
import { useSharedPlansQuery } from './hooks/useSharedPlansQuery';
import { useSharedPlanCommunityDetailQuery } from './hooks/useSharedPlanCommunityDetailQuery';
import { useCareerPathGroupsQuery } from './hooks/useCareerPathCommunityData';
import { useSharedPlanReactions } from './hooks/useSharedPlanReactions';
import { isUuidString } from '@/lib/career-path/isUuidString';
import { createSharedPlanApi, updateSharedPlanApi, fetchSharedPlanByCareerPlanId, deleteSharedPlanApi, sanitizeSharedPlanGroupIds } from '@/lib/career-path/sharedPlanApi';
import { hasCareerPathBackendAuth } from '@/lib/career-path/careerPathApi';

type Template = typeof careerPathTemplates[0];

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
  const {
    plans,
    savePlan: persistCareerPlan,
    deletePlan: removeCareerPlan,
    updatePlanInline: persistPlanInline,
  } = useCareerPlansController();
  const { data: mySharedPlansFromApi } = useMySharedPlansQuery();
  const { data: sharedPlansFeed = [] } = useSharedPlansQuery();
  const { data: careerPathGroups = [] } = useCareerPathGroupsQuery();
  const { reactions: sharedReactionState, toggleLike: toggleSharedLike, toggleBookmark: toggleSharedBookmark } =
    useSharedPlanReactions();
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<CareerPlan | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [builderInitialStep, setBuilderInitialStep] = useState<number | undefined>(undefined);
  const [mounted, setMounted] = useState(false);
  const [sharingPlan, setSharingPlan] = useState<CareerPlan | null>(null);

  /* ── 2-컬럼 패널용 선택 상태 ── */
  const [selectedCommunityPlan, setSelectedCommunityPlan] = useState<SharedPlan | null>(null);
  const [showTimelineExpandDialog, setShowTimelineExpandDialog] = useState(false);

  const sharedPlanCommunityDetail = useSharedPlanCommunityDetailQuery(
    activeTab === 'community' ? selectedCommunityPlan?.id ?? null : null,
  );
  const communityPanelPlan = useMemo(() => {
    if (!selectedCommunityPlan) return null;
    if (sharedPlanCommunityDetail.data) return sharedPlanCommunityDetail.data;
    return selectedCommunityPlan;
  }, [selectedCommunityPlan, sharedPlanCommunityDetail.data]);

  useEffect(() => {
    setMounted(true);
    const tabParam = searchParams.get('tab');
    if (isCareerPageTabId(tabParam)) setActiveTab(tabParam);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (plans.length === 0) {
      setSelectedPlanId(null);
      return;
    }
    setSelectedPlanId((prev) => {
      if (prev && plans.some((p) => p.id === prev)) return prev;
      return plans[0].id;
    });
  }, [mounted, plans]);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (isCareerPageTabId(tabParam) && tabParam !== activeTab) setActiveTab(tabParam);
  }, [activeTab, searchParams]);

  useEffect(() => {
    setShowTimelineExpandDialog(false);
  }, [selectedPlanId]);

  const handleTabChange = (nextTabId: CareerPageTabId) => {
    if (nextTabId === activeTab) return;
    setActiveTab(nextTabId);
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.set('tab', nextTabId);
    router.replace(`/career?${nextSearchParams.toString()}`, { scroll: false });
  };

  const savePlan = async (plan: CareerPlan) => {
    try {
      const saved = await persistCareerPlan(plan);
      setSelectedPlanId(saved.id);
      setBuilderOpen(false);
      setEditingPlan(null);
      handleTabChange('timeline');
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes(':401') || msg.includes('로그인')) {
        router.push('/auth/login');
      }
    }
  };

  const deletePlan = async (planId: string) => {
    await removeCareerPlan(planId);
  };

  const openNew = () => { setEditingPlan(null); setBuilderInitialStep(1); setBuilderOpen(true); };
  const openEdit = (plan: CareerPlan) => { setEditingPlan(plan); setBuilderInitialStep(3); setBuilderOpen(true); };
  const closeBuilder = () => { setBuilderOpen(false); setEditingPlan(null); setBuilderInitialStep(undefined); };

  const handleUseTemplate = async (template: Template, customTitle: string) => {
    try {
      const planFromTemplate = buildPlanFromTemplate(template, customTitle);
      const saved = await persistCareerPlan(planFromTemplate);
      setSelectedPlanId(saved.id);
      handleTabChange('timeline');
      setBuilderOpen(false);
      setEditingPlan(null);
      setBuilderInitialStep(undefined);
    } catch (err) {
      console.error('handleUseTemplate', err);
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes(':401') || msg.includes('로그인')) {
        router.push('/auth/login');
      }
    }
  };

  const updatePlanInline = async (updatedPlan: CareerPlan) => {
    await persistPlanInline(updatedPlan);
  };

  const handleSharePlan = async (plan: CareerPlan, isPublic: boolean) => {
    if (!isPublic) return;
    
    const useBackend = hasCareerPathBackendAuth() && isUuidString(plan.id);
    
    if (useBackend) {
      try {
        const channels = plan.shareChannels ?? [];
        let shareType: 'public' | 'school' | 'group' | 'private' = 'private';
        if (channels.includes('public')) shareType = 'public';
        else if (channels.includes('school')) shareType = 'school';
        else if (channels.includes('group')) shareType = 'group';
        
        const payload: Parameters<typeof createSharedPlanApi>[0] = {
          career_plan: plan.id,
          share_type: shareType,
          description: plan.description ?? '',
          tags: [],
          group_ids: sanitizeSharedPlanGroupIds(channels.includes('group') ? plan.shareGroupIds : undefined),
        };
        
        await createSharedPlanApi(payload);
      } catch (err) {
        console.error('Failed to share plan:', err);
      }
    }
    
    handleTabChange('community');
  };

  const selectedPlan = mounted ? (plans.find(p => p.id === selectedPlanId) ?? null) : null;
  const sortedPlans = [...plans].sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeB - timeA;
  });
  
  const myPublicPlans = hasCareerPathBackendAuth() ? mySharedPlansFromApi : [];
  const totalTemplateCount = careerPathTemplates.length;
  const totalTemplateUses = careerPathTemplates.reduce((sum, template) => sum + template.uses, 0);
  const totalCommunitySharedPlans = sharedPlansFeed.length;
  const totalCommunityGroups = careerPathGroups.length;
  const totalMyPublicPlans = myPublicPlans.length;

  return (
    <div
      className="min-h-screen pb-12 relative"
      style={{ backgroundColor: 'rgb(var(--background))' }}
    >
      <StarField />

      {/* ── Tab + Content (통합 테두리 컨테이너) ── */}
      <div className="web-container relative z-10 py-4 md:py-6 rounded-3xl">
        <div
          className="rounded-none border border-t-0 border-x border-b overflow-hidden"
          style={SECTION_SHELL_FRAME_STYLE}
        >
          <div
            className={SECTION_SHELL_TAB_NAVIGATION_AREA_CLASS_NAME_FLUSH_RIGHT}
            style={SECTION_SHELL_TAB_NAVIGATION_AREA_STYLE}
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
              <CareerPathList
                onUseTemplate={handleUseTemplate}
                onNewPath={openNew}
                myPublicPlans={myPublicPlans}
                onViewMyPlan={(plan) => {
                  setSelectedPlanId(plan.id);
                  handleTabChange('timeline');
                }}
              />
            ) : activeTab === 'timeline' ? (
          <>
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
                  onExpandToDialog={() => setShowTimelineExpandDialog(true)}
                />
              ) : null
            }
          />
          {showTimelineExpandDialog && selectedPlan && (
            <CareerPathExpandBottomSheetDialog
              onClose={() => setShowTimelineExpandDialog(false)}
              panelContent={
                <TimelineDetailPanel
                  plan={selectedPlan}
                  onClose={() => setShowTimelineExpandDialog(false)}
                  onEdit={openEdit}
                  onUpdatePlan={updatePlanInline}
                  onDeletePlan={deletePlan}
                  onSharePlan={handleSharePlan}
                  onOpenShareDialog={(plan) => setSharingPlan(plan)}
                  isExpandDialogMode
                />
              }
            />
          )}
          </>
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
              communityPanelPlan ? (
                <CommunityDetailPanel
                  plan={communityPanelPlan}
                  isLiked={sharedReactionState.likedPlanIds.includes(communityPanelPlan.id)}
                  isBookmarked={sharedReactionState.bookmarkedPlanIds.includes(communityPanelPlan.id)}
                  likeCount={communityPanelPlan.likes}
                  bookmarkCount={communityPanelPlan.bookmarks}
                  onToggleLike={() => toggleSharedLike(communityPanelPlan.id)}
                  onToggleBookmark={() => toggleSharedBookmark(communityPanelPlan.id)}
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
          availableGroups={careerPathGroups as CommunityGroup[]}
          isCurrentlyShared={sharingPlan.isPublic}
          onConfirm={async (channels: ShareChannel[], description: string, groupIds: string[]) => {
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
            await persistPlanInline(updated);
            
            const useBackend = hasCareerPathBackendAuth() && isUuidString(sharingPlan.id);
            
            if (useBackend) {
              try {
                const existingShared = await fetchSharedPlanByCareerPlanId(sharingPlan.id);
                
                if (isPublic) {
                  const channels = updated.shareChannels ?? [];
                  let shareType: 'public' | 'school' | 'group' | 'private' = 'private';
                  if (channels.includes('public')) shareType = 'public';
                  else if (channels.includes('school')) shareType = 'school';
                  else if (channels.includes('group')) shareType = 'group';
                  
                  if (existingShared) {
                    await updateSharedPlanApi(existingShared.id, {
                      share_type: shareType,
                      description: description,
                      tags: [],
                      group_ids: sanitizeSharedPlanGroupIds(channels.includes('group') ? groupIds : undefined),
                    });
                  } else {
                    await createSharedPlanApi({
                      career_plan: sharingPlan.id,
                      share_type: shareType,
                      description: description,
                      tags: [],
                      group_ids: sanitizeSharedPlanGroupIds(channels.includes('group') ? groupIds : undefined),
                    });
                  }
                } else if (existingShared) {
                  await deleteSharedPlanApi(existingShared.id);
                }
              } catch (err) {
                console.error('Failed to update share status:', err);
              }
            }
            
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
        <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(var(--background))' }}>
          <Sparkles className="w-6 h-6 animate-pulse" style={{ color: '#6C5CE7' }} />
        </div>
      }
    >
      <CareerPageContent />
    </Suspense>
  );
}
