import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface CareerPathTemplate {
  id: string;
  title: string;
  description: string;
  universityName?: string;
  departmentName?: string;
  jobEmoji?: string;
  admissionTypes?: string[];
  likes?: number;
  uses?: number;
  totalItems?: number;
  [key: string]: any;
}

interface CareerPathTemplateCardProps {
  template: CareerPathTemplate;
  onPress: () => void;
}

export function CareerPathTemplateCard({ template, onPress }: CareerPathTemplateCardProps) {
  const emoji = template.jobEmoji || '🎓';
  const universityName = template.universityName || '';
  const departmentName = template.departmentName || '';
  const admissionTypes = template.admissionTypes || [];
  const likes = template.likes || 0;
  const uses = template.uses || 0;
  const totalItems = template.totalItems || 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{emoji}</Text>
        <View style={styles.headerText}>
          <Text style={styles.universityName}>{universityName}</Text>
          <Text style={styles.departmentName}>{departmentName}</Text>
        </View>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {template.title}
      </Text>

      <Text style={styles.description} numberOfLines={2}>
        {template.description}
      </Text>

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

      <View style={styles.footer}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>❤️</Text>
            <Text style={styles.statValue}>{likes}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>👥</Text>
            <Text style={styles.statValue}>{uses}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>📋</Text>
            <Text style={styles.statValue}>{totalItems}개</Text>
          </View>
        </View>
        <Text style={styles.detailButton}>자세히 보기 →</Text>
      </View>
    </TouchableOpacity>
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
  universityName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  departmentName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 20,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    color: '#6B7280',
    marginBottom: 12,
  },
  admissionTypesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  admissionTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  admissionTypeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statIcon: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  detailButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
});
