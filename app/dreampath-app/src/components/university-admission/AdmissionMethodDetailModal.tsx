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
import { UNIVERSITY_ADMISSION_EXPLORE_LABELS } from '../../config/labels';

interface AdmissionMethod {
  id: string;
  name: string;
  shortName: string;
  emoji: string;
  color: string;
  difficulty: number;
  preparationYears: string;
  description: string;
  keyFeatures: string[];
  targetStudents: string[];
  majorUniversities: string[];
  preparationTimeline: Array<{
    grade: string;
    tasks: string[];
  }>;
  successRate: string;
  tips: string[];
}

interface AdmissionMethodDetailModalProps {
  visible: boolean;
  method: AdmissionMethod | null;
  onClose: () => void;
}

export function AdmissionMethodDetailModal({
  visible,
  method,
  onClose,
}: AdmissionMethodDetailModalProps) {
  if (!method) return null;

  const renderDifficultyStars = (difficulty: number) => {
    return '⭐'.repeat(difficulty);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={[styles.modalHeader, { backgroundColor: `${method.color}15` }]}>
          <View style={styles.modalHeaderTop}>
            <View style={styles.modalHeaderLeft}>
              <Text style={styles.modalEmoji}>{method.emoji}</Text>
              <View>
                <Text style={styles.modalTitle}>{method.name}</Text>
                <Text style={styles.modalSubtitle}>{method.shortName}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalHeaderInfo}>
            <View style={styles.infoChip}>
              <Text style={styles.infoChipLabel}>난이도</Text>
              <Text style={styles.infoChipValue}>{renderDifficultyStars(method.difficulty)}</Text>
            </View>
            <View style={styles.infoChip}>
              <Text style={styles.infoChipLabel}>준비 기간</Text>
              <Text style={styles.infoChipValue}>{method.preparationYears}</Text>
            </View>
            <View style={styles.infoChip}>
              <Text style={styles.infoChipLabel}>합격률</Text>
              <Text style={styles.infoChipValue}>{method.successRate}</Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 전형 설명</Text>
            <Text style={styles.description}>{method.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✨ 주요 특징</Text>
            {method.keyFeatures.map((feature, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>{feature}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👥 대상 학생</Text>
            {method.targetStudents.map((student, index) => (
              <View key={index} style={styles.listItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.listText}>{student}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏛️ 주요 대학</Text>
            <View style={styles.universityChips}>
              {method.majorUniversities.map((university, index) => (
                <View key={index} style={[styles.universityChip, { backgroundColor: `${method.color}15` }]}>
                  <Text style={[styles.universityChipText, { color: method.color }]}>
                    {university}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 준비 타임라인</Text>
            {method.preparationTimeline.map((timeline, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={[styles.timelineBadge, { backgroundColor: `${method.color}20` }]}>
                  <Text style={[styles.timelineBadgeText, { color: method.color }]}>
                    {timeline.grade}
                  </Text>
                </View>
                <View style={styles.timelineContent}>
                  {timeline.tasks.map((task, taskIndex) => (
                    <View key={taskIndex} style={styles.taskItem}>
                      <Text style={styles.taskBullet}>▸</Text>
                      <Text style={styles.taskText}>{task}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💡 합격 팁</Text>
            {method.tips.map((tip, index) => (
              <View key={index} style={[styles.tipItem, { backgroundColor: `${method.color}08` }]}>
                <Text style={styles.tipIcon}>💡</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </View>
    </Modal>
  );
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
  },
  modalHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
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
  modalHeaderInfo: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  infoChip: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
  },
  infoChipLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  infoChipValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
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
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: '#4B5563',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  bullet: {
    fontSize: 16,
    color: '#6B7280',
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#4B5563',
  },
  universityChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  universityChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  universityChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timelineItem: {
    marginBottom: SPACING.lg,
  },
  timelineBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  timelineBadgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  timelineContent: {
    paddingLeft: SPACING.md,
  },
  taskItem: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  taskBullet: {
    fontSize: 14,
    color: '#6B7280',
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  taskText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#4B5563',
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  tipIcon: {
    fontSize: 16,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
  },
  bottomPadding: {
    height: 40,
  },
});
