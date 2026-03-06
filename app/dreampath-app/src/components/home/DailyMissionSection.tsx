import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';
import { HOME_LABELS, DAILY_MISSIONS } from '../../config/labels';

interface DailyMissionSectionProps {
  onQuiz: () => void;
}

export function DailyMissionSection({ onQuiz }: DailyMissionSectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>🔥</Text>
        <Text style={styles.headerTitle}>{HOME_LABELS.dailyMission}</Text>
        <View style={styles.resetBadge}>
          <Text style={styles.resetBadgeText}>{HOME_LABELS.dailyMissionReset}</Text>
        </View>
      </View>

      <View style={styles.missionList}>
        {DAILY_MISSIONS.map((mission, index) => (
          <TouchableOpacity
            key={index}
            style={styles.missionItem}
            onPress={onQuiz}
            activeOpacity={0.8}
          >
            <Text style={styles.missionEmoji}>{mission.icon}</Text>
            <Text style={styles.missionText}>{mission.text}</Text>
            <View style={styles.xpBadge}>
              <Text style={styles.xpIcon}>⚡</Text>
              <Text style={styles.xpText}>+{mission.xp}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  headerIcon: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '900',
    color: COLORS.white,
  },
  resetBadge: {
    backgroundColor: 'rgba(251,146,60,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  resetBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.orange,
  },
  missionList: {
    gap: SPACING.sm,
  },
  missionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  missionEmoji: {
    fontSize: 20,
  },
  missionText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  xpIcon: {
    fontSize: 12,
  },
  xpText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.yellow,
  },
});
