import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface EducationInstitution {
  id: string;
  name: string;
  shortName: string;
  emoji: string;
  color: string;
  tier: string;
  location: string;
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
}

interface EducationInstitutionCardProps {
  institution: EducationInstitution;
  onPress: () => void;
}

export function EducationInstitutionCard({ institution, onPress }: EducationInstitutionCardProps) {
  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: institution.color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.emoji}>{institution.emoji}</Text>
        <View style={styles.headerText}>
          <Text style={styles.name}>{institution.name}</Text>
          <Text style={styles.shortName}>{institution.shortName}</Text>
        </View>
        <View style={[styles.tierBadge, { backgroundColor: `${institution.color}20` }]}>
          <Text style={[styles.tierText, { color: institution.color }]}>{institution.tier}</Text>
        </View>
      </View>

      <View style={styles.locationRow}>
        <Text style={styles.locationIcon}>📍</Text>
        <Text style={styles.locationText}>{institution.location}</Text>
        <Text style={styles.typeText}>• {institution.type}</Text>
      </View>

      <View style={styles.rankingRow}>
        <View style={styles.rankingItem}>
          <Text style={styles.rankingLabel}>국내</Text>
          <Text style={styles.rankingValue}>{institution.ranking.domestic}위</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.rankingItem}>
          <Text style={styles.rankingLabel}>QS</Text>
          <Text style={styles.rankingValue}>{institution.ranking.qs}위</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.rankingItem}>
          <Text style={styles.rankingLabel}>경쟁률</Text>
          <Text style={styles.rankingValue}>{institution.admissionInfo.competitionRate}:1</Text>
        </View>
      </View>

      <View style={styles.admissionRow}>
        <View style={styles.admissionItem}>
          <Text style={styles.admissionLabel}>수시</Text>
          <Text style={[styles.admissionValue, { color: '#3B82F6' }]}>
            {institution.admissionInfo.susiRatio}%
          </Text>
        </View>
        <View style={styles.admissionItem}>
          <Text style={styles.admissionLabel}>정시</Text>
          <Text style={[styles.admissionValue, { color: '#EF4444' }]}>
            {institution.admissionInfo.jeongsiRatio}%
          </Text>
        </View>
        <View style={styles.admissionItem}>
          <Text style={styles.admissionLabel}>정원</Text>
          <Text style={styles.admissionValue}>{institution.admissionInfo.totalCapacity}명</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.detailButton, { color: institution.color }]}>자세히 보기 →</Text>
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
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tierText: {
    fontSize: 12,
    fontWeight: '700',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  locationText: {
    fontSize: 13,
    color: '#6B7280',
  },
  typeText: {
    fontSize: 13,
    color: '#9CA3AF',
    marginLeft: 6,
  },
  rankingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  rankingItem: {
    alignItems: 'center',
    flex: 1,
  },
  rankingLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  rankingValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
  },
  admissionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  admissionItem: {
    flex: 1,
    alignItems: 'center',
  },
  admissionLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  admissionValue: {
    fontSize: 15,
    fontWeight: '700',
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
