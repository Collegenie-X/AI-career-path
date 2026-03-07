import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';
import { JOBS_EXPLORE_LABELS } from '../../config/labels';
import { ProcessTab } from './tabs/ProcessTab';
import { DailyScheduleTab } from './tabs/DailyScheduleTab';
import { CareerPathTab } from './tabs/CareerPathTab';
import { StarryBackground } from './StarryBackground';
import type { StarJob, StarData } from '../../lib/types';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface JobDetailModalProps {
  visible: boolean;
  job: StarJob | null;
  star: StarData | null;
  onClose: () => void;
}

const TAB_KEYS = ['process', 'dailySchedule', 'careerPath'] as const;
type TabKey = typeof TAB_KEYS[number];

const TAB_CONFIG: { key: TabKey; icon: string; label: string }[] = [
  { key: 'process', icon: '🏛️', label: JOBS_EXPLORE_LABELS.modalTabs.process },
  { key: 'dailySchedule', icon: '☀️', label: JOBS_EXPLORE_LABELS.modalTabs.dailySchedule },
  { key: 'careerPath', icon: '🗓️', label: JOBS_EXPLORE_LABELS.modalTabs.careerPath },
];

export function JobDetailModal({ visible, job, star, onClose }: JobDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('process');
  const scrollViewRef = useRef<ScrollView>(null);

  if (!job || !star) return null;

  const handleTabPress = (tab: TabKey) => {
    setActiveTab(tab);
    scrollViewRef.current?.scrollTo({ y: 0, animated: false });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <StarryBackground />
        <ModalHeader job={job} star={star} onClose={onClose} />
        <FavorableTraitsBanner job={job} star={star} />
        <TabBar activeTab={activeTab} starColor={star.color} onTabPress={handleTabPress} />

        <ScrollView
          ref={scrollViewRef}
          style={styles.tabContent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.tabContentInner}
        >
          {activeTab === 'process' && <ProcessTab job={job} starColor={star.color} />}
          {activeTab === 'dailySchedule' && <DailyScheduleTab job={job} starColor={star.color} />}
          {activeTab === 'careerPath' && <CareerPathTab job={job} starColor={star.color} />}
        </ScrollView>
      </View>
    </Modal>
  );
}

function ModalHeader({ job, star, onClose }: { job: StarJob; star: StarData; onClose: () => void }) {
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={[styles.headerIcon, { backgroundColor: `${star.color}25` }]}>
          <Text style={styles.headerEmoji}>{job.icon}</Text>
        </View>
        <View style={styles.headerTextBlock}>
          <Text style={styles.headerTitle}>{job.name}</Text>
          <Text style={styles.headerSubtitle}>
            {star.name} · {job.holland}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
        <Text style={styles.closeIcon}>✕</Text>
      </TouchableOpacity>
    </View>
  );
}

function FavorableTraitsBanner({ job, star }: { job: StarJob; star: StarData }) {
  const coreCompetencies = job.coreCompetencies ?? [];

  return (
    <View style={styles.traitsBanner}>
      <Text style={styles.traitsDescription}>{job.description}</Text>
      {coreCompetencies.length > 0 && (
        <View style={[styles.traitsSection, { borderColor: `${star.color}25` }]}>
          <View style={styles.traitsHeader}>
            <Text style={styles.traitsIcon}>🎯</Text>
            <Text style={styles.traitsLabel}>{JOBS_EXPLORE_LABELS.favorableTraits}</Text>
            <View style={styles.traitsSpacer} />
            <View style={[styles.hollandBadge, { backgroundColor: `${star.color}20` }]}>
              <Text style={[styles.hollandType, { color: star.color }]}>
                {star.starProfile?.hollandCode
                  ? `${star.starProfile.hollandCode.split(' ')[0]}`
                  : job.holland}
              </Text>
            </View>
          </View>
          <View style={styles.traitsRow}>
            {coreCompetencies.map((trait) => (
              <View key={trait} style={styles.traitChip}>
                <Text style={styles.traitChipText}>{trait}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

function TabBar({
  activeTab,
  starColor,
  onTabPress,
}: {
  activeTab: TabKey;
  starColor: string;
  onTabPress: (tab: TabKey) => void;
}) {
  return (
    <View style={styles.tabBar}>
      {TAB_CONFIG.map(({ key, icon, label }) => {
        const isActive = activeTab === key;
        return (
          <TouchableOpacity
            key={key}
            style={[
              styles.tabItem,
              isActive
                ? { backgroundColor: `${starColor}22`, borderColor: `${starColor}60` }
                : styles.tabItemInactive,
            ]}
            onPress={() => onTabPress(key)}
            activeOpacity={0.7}
          >
            <Text style={styles.tabIcon}>{icon}</Text>
            <Text style={[styles.tabLabel, isActive && { color: COLORS.white, fontWeight: '700' }]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#0A0A18',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: 20,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerEmoji: {
    fontSize: 20,
  },
  headerTextBlock: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '900',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  closeIcon: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  traitsBanner: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  traitsDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  traitsSection: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    padding: SPACING.md,
  },
  traitsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  traitsIcon: {
    fontSize: 12,
  },
  traitsLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.primaryLight,
  },
  traitsSpacer: {
    flex: 1,
  },
  hollandBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  hollandType: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
  traitsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  traitChip: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  traitChipText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  tabItemInactive: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tabIcon: {
    fontSize: 11,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  tabContent: {
    flex: 1,
  },
  tabContentInner: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: 40,
  },
});
