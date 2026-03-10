import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../config/theme';
import { CAREER_LABELS, type CareerPlan, type CareerPlanItem } from '../config/career-path';
import { storage } from '../lib/storage';
import { ExploreTab } from '../components/career/ExploreTab';
import { BuilderTab } from '../components/career/BuilderTab';
import { TimelineTab } from '../components/career/TimelineTab';
import { BuilderWizard } from '../components/career/BuilderWizard';
import { StarryBackground } from '../components/jobs/StarryBackground';

type TabKey = 'explore' | 'builder' | 'timeline';

const TABS: { key: TabKey; label: string; emoji: string }[] = [
  { key: 'explore', label: CAREER_LABELS.tabExplore, emoji: '🔍' },
  { key: 'builder', label: CAREER_LABELS.tabBuilder, emoji: '🛠' },
  { key: 'timeline', label: CAREER_LABELS.tabTimeline, emoji: '📋' },
];

function convertTemplateToCareerPlan(template: any): CareerPlan {
  return {
    id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    starId: template.starId,
    starName: template.starName,
    starEmoji: template.starEmoji,
    starColor: template.starColor,
    jobId: template.jobId,
    jobName: template.jobName,
    jobEmoji: template.jobEmoji,
    title: template.title.replace(' — ', ' · '),
    createdAt: new Date().toISOString(),
    years: (template.years ?? []).map((y: any) => {
      const goals = y.goals ?? [];
      const rawItems = y.items ?? [];
      const items: CareerPlanItem[] = rawItems.map((it: any): CareerPlanItem => ({
        id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        type: it.type ?? 'activity',
        title: it.title ?? '',
        months: Array.isArray(it.months) ? it.months : (typeof it.month === 'number' ? [it.month] : [3]),
        difficulty: it.difficulty ?? 2,
        cost: it.cost ?? '무료',
        organizer: it.organizer ?? '',
        url: it.url,
        description: it.description,
      }));

      // YearPlanCard는 goalGroups[].items만 렌더링함. goals+items → goalGroups로 변환
      const firstGoal = goals.length > 0 ? goals[0] : '활동 목록';
      const goalGroups: { id: string; goal: string; items: CareerPlanItem[]; isExpanded: boolean }[] =
        items.length > 0
          ? [
              { id: `goal-${y.gradeId}-0`, goal: firstGoal, items, isExpanded: true },
              ...goals.slice(1).map((g: string, idx: number) => ({
                id: `goal-${y.gradeId}-${idx + 1}`,
                goal: g,
                items: [] as CareerPlanItem[],
                isExpanded: true,
              })),
            ]
          : goals.map((g: string, idx: number) => ({
              id: `goal-${y.gradeId}-${idx}`,
              goal: g,
              items: [] as CareerPlanItem[],
              isExpanded: true,
            }));

      return {
        gradeId: y.gradeId,
        gradeLabel: y.gradeLabel,
        goals,
        items,
        goalGroups,
      };
    }),
  };
}

export function CareerPathScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabKey>('explore');
  const [plans, setPlans] = useState<CareerPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [wizardVisible, setWizardVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState<CareerPlan | null>(null);

  useEffect(() => {
    storage.careerPlans.get().then(setPlans);
  }, []);

  const savePlan = useCallback(async (plan: CareerPlan) => {
    const updated = await storage.careerPlans.save(plan);
    setPlans(updated);
    setSelectedPlanId(plan.id);
    setWizardVisible(false);
    setEditingPlan(null);
    setActiveTab('timeline');
  }, []);

  const deletePlan = useCallback(async (planId: string) => {
    const updated = await storage.careerPlans.remove(planId);
    setPlans(updated);
    if (selectedPlanId === planId) setSelectedPlanId(null);
  }, [selectedPlanId]);

  const updatePlan = useCallback(async (plan: CareerPlan) => {
    const updated = await storage.careerPlans.save(plan);
    setPlans(updated);
  }, []);

  const openNewWizard = useCallback(() => {
    setEditingPlan(null);
    setWizardVisible(true);
  }, []);

  const openEditWizard = useCallback((plan: CareerPlan) => {
    setEditingPlan(plan);
    setWizardVisible(true);
  }, []);

  const handleUseTemplate = useCallback(async (template: any) => {
    const plan = convertTemplateToCareerPlan(template);
    const updated = await storage.careerPlans.save(plan);
    setPlans(updated);
    setSelectedPlanId(plan.id);
    setActiveTab('timeline');
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StarryBackground />
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>{CAREER_LABELS.pageTitle}</Text>
          <Text style={styles.pageSubtitle}>{CAREER_LABELS.pageSubtitle}</Text>
        </View>
      </View>

      <View style={styles.tabBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.emoji} {tab.label}
              </Text>
              {isActive && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.content}>
        {activeTab === 'explore' && (
          <ExploreTab onUseTemplate={handleUseTemplate} onNewPath={openNewWizard} />
        )}
        {activeTab === 'builder' && (
          <BuilderTab
            plans={plans}
            selectedPlanId={selectedPlanId}
            onSelectPlan={setSelectedPlanId}
            onNew={openNewWizard}
            onEdit={openEditWizard}
            onDelete={deletePlan}
            onViewTimeline={() => setActiveTab('timeline')}
          />
        )}
        {activeTab === 'timeline' && (
          <TimelineTab
            plans={plans}
            onUpdatePlan={updatePlan}
            onDeletePlan={deletePlan}
            onEditPlan={openEditWizard}
            onNewPlan={openNewWizard}
          />
        )}
      </View>

      {wizardVisible && (
        <BuilderWizard
          initialPlan={editingPlan}
          initialStep={editingPlan ? 3 : undefined}
          onSave={savePlan}
          onClose={() => { setWizardVisible(false); setEditingPlan(null); }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg, paddingBottom: SPACING.md,
  },
  pageTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '900', color: '#fff' },
  pageSubtitle: { fontSize: FONT_SIZES.xs, color: '#6B7280', marginTop: 2 },
  tabBar: {
    flexDirection: 'row', gap: SPACING.xs,
    paddingHorizontal: SPACING.xl, paddingBottom: SPACING.md,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  tabButton: { flex: 1, alignItems: 'center', paddingVertical: SPACING.md, position: 'relative' },
  tabButtonActive: {},
  tabLabel: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#4B5563' },
  tabLabelActive: { color: '#fff', fontWeight: '700' },
  tabIndicator: {
    position: 'absolute', bottom: -1, left: '20%' as any, right: '20%' as any,
    height: 2, borderRadius: 1, backgroundColor: COLORS.primary,
  },
  content: { flex: 1 },
});
