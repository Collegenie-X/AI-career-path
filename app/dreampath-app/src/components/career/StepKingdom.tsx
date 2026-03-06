import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';
import { CAREER_LABELS } from '../../config/career-path';
import careerMaker from '../../data/career-maker.json';

interface StepKingdomProps {
  selectedId: string;
  onSelect: (id: string) => void;
}

export function StepKingdom({ selectedId, onSelect }: StepKingdomProps) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <View style={styles.tipBox}>
        <Text style={styles.tipIcon}>💡</Text>
        <Text style={styles.tipText}>{CAREER_LABELS.tipKingdom}</Text>
      </View>

      <View style={styles.grid}>
        {careerMaker.kingdoms.map((k) => {
          const isSelected = selectedId === k.id;
          return (
            <TouchableOpacity
              key={k.id}
              onPress={() => onSelect(k.id)}
              style={[
                styles.card,
                isSelected
                  ? { backgroundColor: k.color + '22', borderColor: k.color, borderWidth: 2 }
                  : { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1.5 },
              ]}
              activeOpacity={0.7}
            >
              {isSelected && (
                <View style={[styles.checkBadge, { backgroundColor: k.color }]}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              )}
              <Text style={styles.emoji}>{k.emoji}</Text>
              <Text style={[styles.name, isSelected && { color: k.color }]}>{k.name}</Text>
              <Text style={styles.desc} numberOfLines={2}>{k.description.slice(0, 22)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xxl, gap: SPACING.xl },
  tipBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md,
    paddingHorizontal: 14, paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    backgroundColor: 'rgba(108,92,231,0.12)', borderWidth: 1, borderColor: 'rgba(108,92,231,0.25)',
  },
  tipIcon: { fontSize: 14, marginTop: 1 },
  tipText: { flex: 1, fontSize: FONT_SIZES.xs, color: '#c4b5fd', lineHeight: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
  card: {
    width: '47.5%' as any,
    alignItems: 'center', gap: SPACING.md, padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg, position: 'relative',
  },
  checkBadge: {
    position: 'absolute', top: 10, right: 10,
    width: 20, height: 20, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
  },
  checkText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  emoji: { fontSize: 30 },
  name: { fontSize: FONT_SIZES.md, fontWeight: '700', color: 'rgba(255,255,255,0.8)' },
  desc: { fontSize: 10, color: '#6B7280', textAlign: 'center', lineHeight: 14 },
});
