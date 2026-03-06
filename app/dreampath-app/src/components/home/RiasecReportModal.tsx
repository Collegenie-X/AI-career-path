import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';
import { RIASEC_META, HOME_LABELS } from '../../config/labels';
import type { RIASECResult } from '../../lib/types';

interface RiasecReportModalProps {
  visible: boolean;
  riasec: RIASECResult;
  onClose: () => void;
}

export function RiasecReportModal({ visible, riasec, onClose }: RiasecReportModalProps) {
  const sortedScores = Object.entries(riasec.scores).sort(([, a], [, b]) => b - a);
  const maxScore = Math.max(...Object.values(riasec.scores));

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.dialog}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerIcon}>🧠</Text>
              <Text style={styles.headerTitle}>{HOME_LABELS.reportTitle}</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionLabel}>{HOME_LABELS.reportTopTypes}</Text>
            <View style={styles.topTypesRow}>
              {riasec.topTypes.slice(0, 2).map((type, i) => {
                const meta = RIASEC_META[type];
                return (
                  <View
                    key={type}
                    style={[
                      styles.topTypeCard,
                      { backgroundColor: `${meta.color}18`, borderColor: `${meta.color}40` },
                    ]}
                  >
                    <View style={[styles.topTypeRank, { backgroundColor: i === 0 ? COLORS.yellow : COLORS.textSecondary }]}>
                      <Text style={styles.topTypeRankText}>{i + 1}</Text>
                    </View>
                    <Text style={styles.topTypeEmoji}>{meta.emoji}</Text>
                    <Text style={[styles.topTypeLabel, { color: meta.color }]}>{meta.label}</Text>
                    <Text style={styles.topTypeDesc}>{meta.desc}</Text>
                  </View>
                );
              })}
            </View>

            <Text style={styles.sectionLabel}>{HOME_LABELS.reportAllScores}</Text>
            <View style={styles.scoresList}>
              {sortedScores.map(([key, score]) => {
                const meta = RIASEC_META[key];
                const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
                return (
                  <View key={key} style={styles.scoreItem}>
                    <View style={styles.scoreHeader}>
                      <View style={styles.scoreLeft}>
                        <Text style={styles.scoreEmoji}>{meta.emoji}</Text>
                        <Text style={styles.scoreName}>{meta.label}</Text>
                      </View>
                      <Text style={[styles.scoreValue, { color: meta.color }]}>{score}점</Text>
                    </View>
                    <View style={styles.scoreBarTrack}>
                      <View
                        style={[
                          styles.scoreBarFill,
                          { width: `${percentage}%`, backgroundColor: meta.color },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={styles.recommendationCard}>
              <Text style={styles.recommendationTitle}>{HOME_LABELS.reportRecommendation}</Text>
              <Text style={styles.recommendationDesc}>{HOME_LABELS.reportRecommendationDesc}</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  dialog: {
    width: '100%',
    maxHeight: '85%',
    borderRadius: BORDER_RADIUS.xxl,
    backgroundColor: '#1a1a2e',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerIcon: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '900',
    color: COLORS.white,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.glassBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 18,
    color: COLORS.white,
  },
  content: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  sectionLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textDim,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  topTypesRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  topTypeCard: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1.5,
    position: 'relative',
  },
  topTypeRank: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTypeRankText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '900',
    color: COLORS.white,
  },
  topTypeEmoji: {
    fontSize: 28,
    marginBottom: SPACING.sm,
  },
  topTypeLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '900',
    marginBottom: 4,
  },
  topTypeDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  scoresList: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  scoreItem: {},
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  scoreLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  scoreEmoji: {
    fontSize: 18,
  },
  scoreName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.white,
  },
  scoreValue: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '900',
  },
  scoreBarTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  recommendationCard: {
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    backgroundColor: 'rgba(168,85,247,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(168,85,247,0.3)',
    marginBottom: SPACING.xl,
  },
  recommendationTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  recommendationDesc: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
