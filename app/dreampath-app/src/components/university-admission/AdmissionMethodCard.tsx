import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface AdmissionMethodCardProps {
  method: {
    id: string;
    name: string;
    shortName: string;
    emoji: string;
    color: string;
    difficulty: number;
    preparationYears: string;
    description: string;
    successRate: string;
  };
  onPress: () => void;
}

export function AdmissionMethodCard({ method, onPress }: AdmissionMethodCardProps) {
  const renderDifficultyStars = (difficulty: number) => {
    return '⭐'.repeat(difficulty);
  };

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: method.color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.emoji}>{method.emoji}</Text>
        <View style={styles.headerText}>
          <Text style={styles.name}>{method.name}</Text>
          <Text style={styles.shortName}>{method.shortName}</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {method.description}
      </Text>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>난이도</Text>
          <Text style={styles.infoValue}>{renderDifficultyStars(method.difficulty)}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>준비 기간</Text>
          <Text style={styles.infoValue}>{method.preparationYears}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>합격률</Text>
          <Text style={styles.infoValue}>{method.successRate}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.detailButton, { color: method.color }]}>자세히 보기 →</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  emoji: {
    fontSize: 40,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  shortName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#4B5563',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    alignItems: 'flex-end',
  },
  detailButton: {
    fontSize: 14,
    fontWeight: '600',
  },
});
