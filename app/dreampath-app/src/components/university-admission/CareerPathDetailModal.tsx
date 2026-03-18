import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';

interface CareerPathTemplate {
  id: string;
  title: string;
  description: string;
  universityName?: string;
  departmentName?: string;
  jobEmoji?: string;
  admissionTypes?: string[];
  admissionTypeStrategies?: Record<string, string>;
  successStories?: Array<{
    year: string;
    admissionType: string;
    quote: string;
    strategy: string;
    tips: string[];
  }>;
  years?: Array<{
    gradeId: string;
    gradeLabel: string;
    goals: string[];
    items: Array<{
      type: string;
      title: string;
      months: number[];
      difficulty: number;
      cost: string;
      organizer: string;
      description: string;
    }>;
  }>;
  likes?: number;
  uses?: number;
  totalItems?: number;
  [key: string]: any;
}

interface CareerPathDetailModalProps {
  visible: boolean;
  template: CareerPathTemplate | null;
  onClose: () => void;
}

export function CareerPathDetailModal({
  visible,
  template,
  onClose,
}: CareerPathDetailModalProps) {
  if (!template) return null;

  const emoji = template.jobEmoji || '🎓';
  const universityName = template.universityName || '';
  const departmentName = template.departmentName || '';
  const admissionTypes = template.admissionTypes || [];
  const admissionTypeStrategies = template.admissionTypeStrategies || {};
  const successStories = template.successStories || [];
  const years = template.years || [];
  const likes = template.likes || 0;
  const uses = template.uses || 0;
  const totalItems = template.totalItems || 0;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <View style={styles.modalHeaderTop}>
            <View style={styles.modalHeaderLeft}>
              <Text style={styles.modalEmoji}>{emoji}</Text>
              <View>
                <Text style={styles.modalTitle}>{universityName}</Text>
                <Text style={styles.modalSubtitle}>{departmentName}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.modalDescription}>{template.description}</Text>

          {admissionTypes.length > 0 && (
            <View style={styles.admissionTypesRow}>
              {admissionTypes.map((type, index) => (
                <View key={index} style={[styles.admissionTypeBadge, getAdmissionTypeStyle(type)]}>
                  <Text style={[styles.admissionTypeText, getAdmissionTypeTextStyle(type)]}>
                    {type}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          {Object.keys(admissionTypeStrategies).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎯 전형별 전략</Text>
              {Object.entries(admissionTypeStrategies).map(([type, strategy], index) => (
                <View key={index} style={styles.strategyCard}>
                  <View style={[styles.strategyBadge, getAdmissionTypeStyle(type)]}>
                    <Text style={[styles.strategyBadgeText, getAdmissionTypeTextStyle(type)]}>
                      {type}
                    </Text>
                  </View>
                  <Text style={styles.strategyText}>{strategy}</Text>
                </View>
              ))}
            </View>
          )}

          {successStories.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💬 선배 합격 후기</Text>
              {successStories.map((story, index) => (
                <View key={index} style={styles.storyCard}>
                  <View style={styles.storyHeader}>
                    <View style={[styles.storyBadge, getAdmissionTypeStyle(story.admissionType)]}>
                      <Text style={[styles.storyBadgeText, getAdmissionTypeTextStyle(story.admissionType)]}>
                        {story.admissionType}
                      </Text>
                    </View>
                    <Text style={styles.storyYear}>{story.year}학년도</Text>
                  </View>
                  <Text style={styles.storyQuote}>"{story.quote}"</Text>
                  <Text style={styles.storyStrategy}>{story.strategy}</Text>
                  <View style={styles.tipsContainer}>
                    {story.tips.map((tip, tipIndex) => (
                      <View key={tipIndex} style={styles.tipItem}>
                        <Text style={styles.tipBullet}>✓</Text>
                        <Text style={styles.tipText}>{tip}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}

          {years.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📅 학년별 준비 항목</Text>
              {years.map((year, index) => (
                <View key={index} style={styles.yearCard}>
                  <View style={styles.yearHeader}>
                    <Text style={styles.yearLabel}>{year.gradeLabel}</Text>
                    <Text style={styles.yearItemCount}>{year.items.length}개 항목</Text>
                  </View>
                  <View style={styles.goalsContainer}>
                    <Text style={styles.goalsTitle}>목표</Text>
                    {year.goals.map((goal, goalIndex) => (
                      <View key={goalIndex} style={styles.goalItem}>
                        <Text style={styles.goalBullet}>🎯</Text>
                        <Text style={styles.goalText}>{goal}</Text>
                      </View>
                    ))}
                  </View>
                  <Text style={styles.itemsPreview}>
                    {year.items.slice(0, 3).map(item => item.title).join(', ')}
                    {year.items.length > 3 && ` 외 ${year.items.length - 3}개`}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.statsSection}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>❤️</Text>
              <Text style={styles.statValue}>{likes}</Text>
              <Text style={styles.statLabel}>좋아요</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>👥</Text>
              <Text style={styles.statValue}>{uses}</Text>
              <Text style={styles.statLabel}>사용 중</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📋</Text>
              <Text style={styles.statValue}>{totalItems}</Text>
              <Text style={styles.statLabel}>총 항목</Text>
            </View>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </Modal>
  );
}

function getAdmissionTypeStyle(type: string) {
  switch (type) {
    case '수시':
      return { backgroundColor: '#3B82F620' };
    case '정시':
      return { backgroundColor: '#EF444420' };
    case '유학':
      return { backgroundColor: '#8B5CF620' };
    default:
      return { backgroundColor: '#6B728020' };
  }
}

function getAdmissionTypeTextStyle(type: string) {
  switch (type) {
    case '수시':
      return { color: '#3B82F6' };
    case '정시':
      return { color: '#EF4444' };
    case '유학':
      return { color: '#8B5CF6' };
    default:
      return { color: '#6B7280' };
  }
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    paddingTop: 60,
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.lg,
    backgroundColor: '#F9FAFB',
  },
  modalHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  modalEmoji: {
    fontSize: 48,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: '600',
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
    marginBottom: SPACING.md,
  },
  admissionTypesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  admissionTypeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  admissionTypeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalContent: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: SPACING.md,
  },
  strategyCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  strategyBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginBottom: SPACING.xs,
  },
  strategyBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  strategyText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4B5563',
  },
  storyCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  storyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  storyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  storyBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  storyYear: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  storyQuote: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1F2937',
    fontStyle: 'italic',
    marginBottom: SPACING.sm,
  },
  storyStrategy: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4B5563',
    marginBottom: SPACING.sm,
  },
  tipsContainer: {
    gap: 4,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  tipBullet: {
    fontSize: 14,
    color: '#10B981',
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#6B7280',
  },
  yearCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  yearHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  yearLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
  },
  yearItemCount: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  goalsContainer: {
    marginBottom: SPACING.sm,
  },
  goalsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 6,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginBottom: 4,
  },
  goalBullet: {
    fontSize: 14,
  },
  goalText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#4B5563',
  },
  itemsPreview: {
    fontSize: 12,
    lineHeight: 16,
    color: '#9CA3AF',
  },
  statsSection: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  bottomPadding: {
    height: 40,
  },
});
