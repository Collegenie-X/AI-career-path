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

interface EducationInstitution {
  id: string;
  name: string;
  shortName: string;
  emoji: string;
  color: string;
  tier: string;
  category: string;
  location: string;
  founded: number;
  type: string;
  ranking: {
    domestic: number;
    qs: number;
  };
  admissionInfo: {
    totalCapacity: number;
    susiRatio: number;
    jeongsiRatio: number;
    competitionRate: number;
  };
  majorDepartments: Array<{
    name: string;
    capacity: number;
    cutline: string;
    features: string[];
  }>;
  scholarships: string[];
  careerPathTemplates: string[];
}

interface EducationInstitutionDetailModalProps {
  visible: boolean;
  institution: EducationInstitution | null;
  onClose: () => void;
  onCareerPathPress?: (templateId: string) => void;
}

export function EducationInstitutionDetailModal({
  visible,
  institution,
  onClose,
  onCareerPathPress,
}: EducationInstitutionDetailModalProps) {
  if (!institution) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={[styles.modalHeader, { backgroundColor: `${institution.color}15` }]}>
          <View style={styles.modalHeaderTop}>
            <View style={styles.modalHeaderLeft}>
              <Text style={styles.modalEmoji}>{institution.emoji}</Text>
              <View>
                <Text style={styles.modalTitle}>{institution.name}</Text>
                <Text style={styles.modalSubtitle}>{institution.shortName}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalHeaderInfo}>
            <View style={styles.infoChip}>
              <Text style={styles.infoChipLabel}>국내 순위</Text>
              <Text style={styles.infoChipValue}>{institution.ranking.domestic}위</Text>
            </View>
            <View style={styles.infoChip}>
              <Text style={styles.infoChipLabel}>QS 순위</Text>
              <Text style={styles.infoChipValue}>{institution.ranking.qs}위</Text>
            </View>
            <View style={styles.infoChip}>
              <Text style={styles.infoChipLabel}>경쟁률</Text>
              <Text style={styles.infoChipValue}>{institution.admissionInfo.competitionRate}:1</Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏛️ 대학 정보</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoGridItem}>
                <Text style={styles.infoGridLabel}>위치</Text>
                <Text style={styles.infoGridValue}>{institution.location}</Text>
              </View>
              <View style={styles.infoGridItem}>
                <Text style={styles.infoGridLabel}>설립</Text>
                <Text style={styles.infoGridValue}>{institution.founded}년</Text>
              </View>
              <View style={styles.infoGridItem}>
                <Text style={styles.infoGridLabel}>유형</Text>
                <Text style={styles.infoGridValue}>{institution.type}</Text>
              </View>
              <View style={styles.infoGridItem}>
                <Text style={styles.infoGridLabel}>등급</Text>
                <Text style={styles.infoGridValue}>{institution.tier}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 입시 정보</Text>
            <View style={styles.admissionGrid}>
              <View style={[styles.admissionGridItem, { backgroundColor: '#3B82F615' }]}>
                <Text style={styles.admissionGridLabel}>수시 비율</Text>
                <Text style={[styles.admissionGridValue, { color: '#3B82F6' }]}>
                  {institution.admissionInfo.susiRatio}%
                </Text>
              </View>
              <View style={[styles.admissionGridItem, { backgroundColor: '#EF444415' }]}>
                <Text style={styles.admissionGridLabel}>정시 비율</Text>
                <Text style={[styles.admissionGridValue, { color: '#EF4444' }]}>
                  {institution.admissionInfo.jeongsiRatio}%
                </Text>
              </View>
              <View style={[styles.admissionGridItem, { backgroundColor: '#10B98115' }]}>
                <Text style={styles.admissionGridLabel}>총 정원</Text>
                <Text style={[styles.admissionGridValue, { color: '#10B981' }]}>
                  {institution.admissionInfo.totalCapacity}명
                </Text>
              </View>
              <View style={[styles.admissionGridItem, { backgroundColor: '#F59E0B15' }]}>
                <Text style={styles.admissionGridLabel}>경쟁률</Text>
                <Text style={[styles.admissionGridValue, { color: '#F59E0B' }]}>
                  {institution.admissionInfo.competitionRate}:1
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎓 주요 학과</Text>
            {institution.majorDepartments.map((dept, index) => (
              <View key={index} style={styles.departmentCard}>
                <View style={styles.departmentHeader}>
                  <Text style={styles.departmentName}>{dept.name}</Text>
                  <View style={styles.departmentInfo}>
                    <Text style={styles.departmentCapacity}>정원 {dept.capacity}명</Text>
                    <Text style={styles.departmentCutline}>합격선 {dept.cutline}</Text>
                  </View>
                </View>
                <View style={styles.featureList}>
                  {dept.features.map((feature, featureIndex) => (
                    <View key={featureIndex} style={styles.featureChip}>
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💰 장학금</Text>
            <View style={styles.scholarshipList}>
              {institution.scholarships.map((scholarship, index) => (
                <View key={index} style={styles.scholarshipItem}>
                  <Text style={styles.scholarshipBullet}>💎</Text>
                  <Text style={styles.scholarshipText}>{scholarship}</Text>
                </View>
              ))}
            </View>
          </View>

          {institution.careerPathTemplates.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎯 커리어 패스</Text>
              <Text style={styles.careerPathDescription}>
                이 대학의 합격 커리어 패스를 확인해보세요
              </Text>
              <TouchableOpacity
                style={[styles.careerPathButton, { backgroundColor: `${institution.color}15` }]}
                onPress={() => onCareerPathPress?.(institution.careerPathTemplates[0])}
              >
                <Text style={[styles.careerPathButtonText, { color: institution.color }]}>
                  커리어 패스 보기 →
                </Text>
              </TouchableOpacity>
            </View>
          )}

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
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  infoGridItem: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  infoGridLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  infoGridValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
  },
  admissionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  admissionGridItem: {
    width: '48%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  admissionGridLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  admissionGridValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  departmentCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  departmentHeader: {
    marginBottom: SPACING.sm,
  },
  departmentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  departmentInfo: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  departmentCapacity: {
    fontSize: 13,
    color: '#6B7280',
  },
  departmentCutline: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600',
  },
  featureList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  featureChip: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  featureText: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '500',
  },
  scholarshipList: {
    gap: SPACING.sm,
  },
  scholarshipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  scholarshipBullet: {
    fontSize: 16,
  },
  scholarshipText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: '#4B5563',
  },
  careerPathDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: SPACING.md,
  },
  careerPathButton: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  careerPathButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  bottomPadding: {
    height: 40,
  },
});
