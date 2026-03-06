import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';
import careerMaker from '../../data/career-maker.json';

type Kingdom = (typeof careerMaker.kingdoms)[0];

interface StepJobProps {
  kingdom: Kingdom;
  selectedJobId: string;
  onSelect: (id: string) => void;
}

export function StepJob({ kingdom, selectedJobId, onSelect }: StepJobProps) {
  const color = kingdom.color;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <View style={[styles.kingdomBanner, { backgroundColor: color + '15', borderColor: color + '33' }]}>
        <Text style={styles.kingdomEmoji}>{kingdom.emoji}</Text>
        <View style={styles.kingdomInfo}>
          <Text style={styles.kingdomName}>{kingdom.name}</Text>
          <Text style={styles.kingdomDesc}>{kingdom.description}</Text>
        </View>
      </View>

      <View style={styles.tipBox}>
        <Text style={styles.tipIcon}>💡</Text>
        <Text style={styles.tipText}>{kingdom.name}의 대표 직업이에요. 가장 흥미로운 직업을 하나 선택하세요!</Text>
      </View>

      <View style={styles.jobList}>
        {kingdom.representativeJobs.map((job) => {
          const isSelected = selectedJobId === job.id;
          return (
            <TouchableOpacity
              key={job.id}
              onPress={() => onSelect(job.id)}
              style={[
                styles.jobCard,
                isSelected
                  ? { backgroundColor: color + '18', borderColor: color, borderWidth: 2 }
                  : { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1.5 },
              ]}
              activeOpacity={0.7}
            >
              <View style={[styles.jobEmoji, { backgroundColor: isSelected ? color + '28' : 'rgba(255,255,255,0.06)' }]}>
                <Text style={{ fontSize: 28 }}>{job.icon}</Text>
              </View>
              <View style={styles.jobInfo}>
                <Text style={[styles.jobName, isSelected && { color }]}>{job.name}</Text>
                <Text style={styles.jobDesc} numberOfLines={2}>{job.description}</Text>
              </View>
              <View style={[styles.jobCheck, isSelected ? { backgroundColor: color } : { borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)' }]}>
                {isSelected ? (
                  <Text style={styles.jobCheckText}>✓</Text>
                ) : (
                  <Text style={styles.jobChevron}>›</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxl, gap: SPACING.xl },
  kingdomBanner: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingHorizontal: 14, paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg, borderWidth: 1,
  },
  kingdomEmoji: { fontSize: 20 },
  kingdomInfo: { flex: 1 },
  kingdomName: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#fff' },
  kingdomDesc: { fontSize: FONT_SIZES.xs, color: '#9CA3AF' },
  tipBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md,
    paddingHorizontal: 14, paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(108,92,231,0.12)', borderWidth: 1, borderColor: 'rgba(108,92,231,0.25)',
  },
  tipIcon: { fontSize: 14, marginTop: 1 },
  tipText: { flex: 1, fontSize: FONT_SIZES.xs, color: '#c4b5fd', lineHeight: 18 },
  jobList: { gap: SPACING.md },
  jobCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: SPACING.lg, borderRadius: BORDER_RADIUS.lg,
  },
  jobEmoji: { width: 56, height: 56, borderRadius: BORDER_RADIUS.lg, justifyContent: 'center', alignItems: 'center' },
  jobInfo: { flex: 1 },
  jobName: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: '#fff' },
  jobDesc: { fontSize: FONT_SIZES.xs, color: '#9CA3AF', marginTop: 2, lineHeight: 16 },
  jobCheck: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  jobCheckText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  jobChevron: { color: '#6B7280', fontSize: 14 },
});
