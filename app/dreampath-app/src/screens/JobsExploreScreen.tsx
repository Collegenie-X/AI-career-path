import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../config/theme';
import { JOBS_EXPLORE_LABELS } from '../config/labels';
import { ALL_STARS } from '../data/stars';
import { IntroBanner, StarCard, StarInfoBanner, JobCard, JobDetailModal } from '../components/jobs';
import { StarryBackground } from '../components/jobs/StarryBackground';
import type { StarData, StarJob } from '../lib/types';

type ScreenView = 'starSelect' | 'starDetail';
type ExploreTabId = 'star' | 'admission' | 'university';

const EXPLORE_TABS: { id: ExploreTabId; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'star', label: JOBS_EXPLORE_LABELS.exploreTabStar ?? '직업 탐색', icon: 'star' },
  { id: 'admission', label: JOBS_EXPLORE_LABELS.exploreTabAdmission ?? '고입 탐색', icon: 'school' },
  { id: 'university', label: JOBS_EXPLORE_LABELS.exploreTabUniversity ?? '대입 탐색', icon: 'business' },
];

export function JobsExploreScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<ExploreTabId>('star');
  const [currentView, setCurrentView] = useState<ScreenView>('starSelect');
  const [selectedStar, setSelectedStar] = useState<StarData | null>(null);
  const [selectedJob, setSelectedJob] = useState<StarJob | null>(null);
  const [isJobModalVisible, setIsJobModalVisible] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const handleStarPress = useCallback((star: StarData) => {
    setSelectedStar(star);
    setCurrentView('starDetail');
  }, []);

  const handleBackToStarSelect = useCallback(() => {
    setCurrentView('starSelect');
    setSelectedStar(null);
  }, []);

  const handleJobPress = useCallback((job: StarJob) => {
    setSelectedJob(job);
    setIsJobModalVisible(true);
  }, []);

  const handleCloseJobModal = useCallback(() => {
    setIsJobModalVisible(false);
    setSelectedJob(null);
  }, []);

  const handleTabPress = useCallback((tabId: ExploreTabId) => {
    setActiveTab(tabId);
    if (tabId !== 'star') {
      setCurrentView('starSelect');
      setSelectedStar(null);
      setSelectedJob(null);
    }
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StarryBackground />
      <ExploreTabBar activeTab={activeTab} onTabPress={handleTabPress} />
      {activeTab === 'star' ? (
        <>
          {currentView === 'starSelect' ? (
            <StarSelectView onStarPress={handleStarPress} />
          ) : (
            <StarDetailView
              star={selectedStar!}
              onBack={handleBackToStarSelect}
              onJobPress={handleJobPress}
            />
          )}
        </>
      ) : (
        <ComingSoonTab />
      )}

      <JobDetailModal
        visible={isJobModalVisible}
        job={selectedJob}
        star={selectedStar}
        onClose={handleCloseJobModal}
      />
    </View>
  );
}

function ExploreTabBar({
  activeTab,
  onTabPress,
}: {
  activeTab: ExploreTabId;
  onTabPress: (id: ExploreTabId) => void;
}) {
  return (
    <View style={styles.tabBar}>
      {EXPLORE_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tabItem, isActive && styles.tabItemActive]}
            onPress={() => onTabPress(tab.id)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={tab.icon}
              size={14}
              color={isActive ? COLORS.white : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tabLabel,
                isActive && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function ComingSoonTab() {
  const comingSoon = JOBS_EXPLORE_LABELS.comingSoon ?? '준비 중';
  const comingSoonDesc = JOBS_EXPLORE_LABELS.comingSoonDescription ?? '곧 만나보실 수 있어요!';
  return (
    <View style={styles.comingSoonContainer}>
      <Text style={styles.comingSoonEmoji}>🚧</Text>
      <Text style={styles.comingSoonTitle}>{comingSoon}</Text>
      <Text style={styles.comingSoonDescription}>{comingSoonDesc}</Text>
    </View>
  );
}

function StarSelectView({ onStarPress }: { onStarPress: (star: StarData) => void }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <PageHeader />
      <IntroBanner />

      <View style={styles.starGridWrapper}>
        <View style={styles.starGridSection}>
          <View style={styles.starGridHeader}>
            <Text style={styles.starGridIcon}>⭐</Text>
            <Text style={styles.starGridTitle}>{JOBS_EXPLORE_LABELS.starSelectTitle}</Text>
          </View>

          <View style={styles.starGrid}>
            {ALL_STARS.map((star) => (
              <View key={star.id} style={styles.starGridItem}>
                <StarCard star={star} onPress={() => onStarPress(star)} />
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

function StarDetailView({
  star,
  onBack,
  onJobPress,
}: {
  star: StarData;
  onBack: () => void;
  onJobPress: (job: StarJob) => void;
}) {
  const jobCount = star.jobCount ?? star.jobs.length;

  return (
    <View style={styles.detailContainer}>
      <View style={styles.detailHeaderWrapper}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <View style={styles.detailHeaderText}>
          <View style={styles.detailTitleRow}>
            <Text style={styles.detailEmoji}>{star.emoji}</Text>
            <Text style={styles.detailTitle}>{star.name}</Text>
          </View>
          <Text style={styles.detailSubtitle}>
            {jobCount}{JOBS_EXPLORE_LABELS.starDetailJobCount}
          </Text>
        </View>
        <View style={[styles.settingsButton, { backgroundColor: `${star.color}20` }]}>
          <Text style={[styles.settingsIcon, { color: star.color }]}>⚙️</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.detailContent}>
          <StarInfoBanner star={star} />

          <View style={[styles.jobListSection, { backgroundColor: `${star.color}06`, borderColor: `${star.color}20` }]}>
            <View style={styles.jobListHeader}>
              <Text style={styles.jobListIcon}>🏛️</Text>
              <Text style={styles.jobListTitle}>
                {jobCount}{JOBS_EXPLORE_LABELS.starDetailJobExperience}
              </Text>
            </View>

            <View style={styles.jobList}>
              {star.jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job as StarJob}
                  starColor={star.color}
                  onPress={() => onJobPress(job as StarJob)}
                />
              ))}
            </View>
          </View>

          <CareerPassCTA star={star} />
        </View>
      </ScrollView>
    </View>
  );
}

function PageHeader() {
  return (
    <View style={styles.pageHeader}>
      <View style={styles.pageHeaderLeft}>
        <Text style={styles.pageTitle}>{JOBS_EXPLORE_LABELS.pageTitle}</Text>
        <Text style={styles.pageSubtitle}>{JOBS_EXPLORE_LABELS.pageSubtitle}</Text>
      </View>
      <View style={styles.pageHeaderIcon}>
        <Text style={styles.pageHeaderEmoji}>✨</Text>
      </View>
    </View>
  );
}

function CareerPassCTA({ star }: { star: StarData }) {
  return (
    <TouchableOpacity
      style={[styles.ctaCard, { backgroundColor: `${star.color}06`, borderColor: `${star.color}25` }]}
      activeOpacity={0.8}
    >
      <View style={[styles.ctaIconCircle, { backgroundColor: `${star.color}20` }]}>
        <Text style={styles.ctaIcon}>➡️</Text>
      </View>
      <View style={styles.ctaText}>
        <Text style={styles.ctaTitle}>{JOBS_EXPLORE_LABELS.careerPassMake}</Text>
        <Text style={styles.ctaDescription}>{JOBS_EXPLORE_LABELS.careerPassDescription}</Text>
      </View>
      <View style={[styles.ctaButton, { backgroundColor: `${star.color}20` }]}>
        <Text style={[styles.ctaButtonText, { color: star.color }]}>
          {JOBS_EXPLORE_LABELS.careerPassStart}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#03030E',
  },
  scrollContent: {
    paddingBottom: 100,
  },

  tabBar: {
    flexDirection: 'row',
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    marginBottom: SPACING.sm,
    padding: 4,
    borderRadius: BORDER_RADIUS.xl,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
  },
  tabItemActive: {
    backgroundColor: 'rgba(132,94,247,0.35)',
  },
  tabLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabLabelActive: {
    color: COLORS.white,
  },

  comingSoonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  comingSoonEmoji: {
    fontSize: 48,
    marginBottom: SPACING.lg,
  },
  comingSoonTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '900',
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  comingSoonDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },

  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  pageHeaderLeft: {
    flex: 1,
  },
  pageTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '900',
    color: COLORS.white,
    marginBottom: 2,
  },
  pageSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  pageHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageHeaderEmoji: {
    fontSize: 16,
  },

  starGridWrapper: {
    paddingHorizontal: SPACING.xl,
  },
  starGridSection: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: SPACING.lg,
  },
  starGridHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  starGridIcon: {
    fontSize: 18,
  },
  starGridTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '900',
    color: COLORS.white,
  },
  starGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  starGridItem: {
    width: '47.5%',
  },

  detailContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  detailHeaderWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    gap: SPACING.md,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    marginTop: -2,
  },
  detailHeaderText: {
    flex: 1,
  },
  detailTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  detailEmoji: {
    fontSize: 18,
  },
  detailTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '900',
    color: COLORS.white,
  },
  detailSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  settingsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: {
    fontSize: 14,
  },

  detailContent: {
    paddingHorizontal: SPACING.xl,
  },

  jobListSection: {
    marginBottom: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1.5,
    padding: SPACING.lg,
  },
  jobListHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  jobListIcon: {
    fontSize: 16,
  },
  jobListTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '900',
    color: COLORS.white,
  },
  jobList: {
    gap: SPACING.md,
  },

  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1.5,
    padding: SPACING.lg,
  },
  ctaIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaIcon: {
    fontSize: 20,
  },
  ctaText: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '900',
    color: COLORS.white,
    marginBottom: 4,
  },
  ctaDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  ctaButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  ctaButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '900',
  },
});
