import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, FlatList,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';
import {
  CAREER_LABELS, CAREER_ITEM_TYPES, STAR_FILTERS,
  type CareerPlan,
} from '../../config/career-path';
import { storage } from '../../lib/storage';
import templates from '../../data/career-path-templates.json';
import { TemplateDetailModal } from './TemplateDetailModal';

type Template = (typeof templates)[0];

interface ExploreTabProps {
  onUseTemplate: (template: Template) => void;
  onNewPath: () => void;
}

function HeroBanner() {
  return (
    <View style={styles.heroBanner}>
      <Text style={styles.heroLabel}>✨ {CAREER_LABELS.exploreHeroLabel}</Text>
      <Text style={styles.heroTitle}>{CAREER_LABELS.exploreHeroTitle}</Text>
      <Text style={styles.heroDescription}>{CAREER_LABELS.exploreHeroDescription}</Text>
      <View style={styles.statsRow}>
        <StatItem icon="📖" value={templates.length.toString()} label="커리어 패스" />
        <View style={styles.statDivider} />
        <StatItem icon="⭐" value="8" label="왕국" />
        <View style={styles.statDivider} />
        <StatItem
          icon="👥"
          value={templates.reduce((s, t) => s + t.uses, 0).toLocaleString()}
          label="총 사용"
        />
      </View>
    </View>
  );
}

function StatItem({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statIcon}>{icon}</Text>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

function TemplateRow({
  template, liked, onShowDetail, onToggleLike,
}: { template: Template; liked: boolean; onShowDetail: () => void; onToggleLike: () => void }) {
  const localLikes = liked ? template.likes + 1 : template.likes;

  return (
    <TouchableOpacity
      style={[styles.templateRow, { borderColor: template.starColor + '18' }]}
      onPress={onShowDetail}
      activeOpacity={0.7}
    >
      {/* 큰 아이콘: 전체 좌측 고정 */}
      <View style={[styles.templateEmoji, { backgroundColor: template.starColor + '28', borderColor: template.starColor + '30' }]}>
        <Text style={{ fontSize: 24 }}>{template.jobEmoji}</Text>
      </View>

      {/* 우측: 제목 + 메타 + 액션 + 화살표(2줄 옆 우측, 수직 중앙 정렬) */}
      <View style={styles.templateRight}>
        <View style={styles.templateContent}>
          <Text style={styles.templateTitle} numberOfLines={2}>{template.title}</Text>
          {template.description ? (
            <Text style={styles.templateDescription} numberOfLines={1}>{template.description}</Text>
          ) : null}
          <View style={styles.templateBottomRow}>
            <View style={styles.templateMeta}>
              <Text style={styles.templateMetaText}>{template.starEmoji} {template.starName}</Text>
              <Text style={styles.templateMetaDot}>·</Text>
              <Text style={styles.templateMetaText}>{template.totalItems}개</Text>
              <Text style={styles.templateMetaDot}>·</Text>
              <Text style={styles.templateMetaText}>{template.years.length}학년</Text>
              {template.authorType === 'official' && (
                <View style={styles.officialBadge}>
                  <Text style={styles.officialBadgeText}>{CAREER_LABELS.exploreOfficial}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              onPress={onToggleLike}
              style={styles.likeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={{ color: liked ? '#FF6477' : '#555570', fontSize: 12 }}>
                {liked ? '❤️' : '🤍'} {localLikes}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={[styles.chevronWrapper, { backgroundColor: template.starColor + '50', borderColor: template.starColor + '70' }]}>
          <Text style={styles.chevron}>›</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export function ExploreTab({ onUseTemplate, onNewPath }: ExploreTabProps) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [likedTemplateIds, setLikedTemplateIds] = useState<string[]>([]);

  useEffect(() => {
    storage.templateLikes.getAll().then(setLikedTemplateIds);
  }, []);

  const handleToggleLike = async (templateId: string) => {
    const result = await storage.templateLikes.toggle(templateId);
    setLikedTemplateIds(result.likedIds);
  };

  const filtered = useMemo(() => {
    return activeFilter === 'all'
      ? templates
      : templates.filter((t) => t.starId === activeFilter);
  }, [activeFilter]);

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      onUseTemplate(selectedTemplate);
      setSelectedTemplate(null);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <HeroBanner />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
          contentContainerStyle={styles.filterContent}
        >
          {STAR_FILTERS.map((f) => (
            <TouchableOpacity
              key={f.id}
              onPress={() => setActiveFilter(f.id)}
              style={[
                styles.filterChip,
                activeFilter === f.id ? styles.filterChipActive : styles.filterChipInactive,
              ]}
            >
              <Text style={[
                styles.filterChipText,
                activeFilter === f.id ? styles.filterChipTextActive : styles.filterChipTextInactive,
              ]}>
                {f.emoji} {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.countRow}>
          <Text style={styles.countText}>{filtered.length}{CAREER_LABELS.exploreCount}</Text>
          <Text style={styles.countHint}>{CAREER_LABELS.exploreTapHint}</Text>
        </View>

        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>✨</Text>
            <Text style={styles.emptyText}>{CAREER_LABELS.exploreEmpty}</Text>
          </View>
        ) : (
          <View style={styles.templateList}>
            {filtered.map((template) => (
              <TemplateRow
                key={template.id}
                template={template}
                liked={likedTemplateIds.includes(template.id)}
                onShowDetail={() => setSelectedTemplate(template)}
                onToggleLike={() => handleToggleLike(template.id)}
              />
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity style={styles.floatingButton} onPress={onNewPath} activeOpacity={0.85}>
          <Text style={styles.floatingButtonText}>+ {CAREER_LABELS.exploreCreateButton}</Text>
        </TouchableOpacity>
      </View>

      {selectedTemplate && (
        <TemplateDetailModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          onUseTemplate={handleUseTemplate}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: SPACING.lg, paddingBottom: 24 },
  heroBanner: {
    borderRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    backgroundColor: 'rgba(108,92,231,0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(108,92,231,0.35)',
  },
  heroLabel: { fontSize: FONT_SIZES.xs, fontWeight: '700', color: '#a78bfa', marginBottom: SPACING.sm },
  heroTitle: { fontSize: FONT_SIZES.xxl, fontWeight: '900', color: '#fff', lineHeight: 30, marginBottom: SPACING.sm },
  heroDescription: { fontSize: FONT_SIZES.xs, color: '#9CA3AF', lineHeight: 18, marginBottom: SPACING.lg },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.lg },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  statIcon: { fontSize: 16 },
  statValue: { fontSize: FONT_SIZES.md, fontWeight: '900', color: '#fff' },
  statLabel: { fontSize: 9, color: '#6B7280', marginTop: -2 },
  statDivider: { width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.1)' },
  filterRow: { marginBottom: SPACING.md },
  filterContent: { gap: SPACING.sm, paddingRight: SPACING.lg },
  filterChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.lg },
  filterChipActive: { backgroundColor: COLORS.primary },
  filterChipInactive: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  filterChipText: { fontSize: FONT_SIZES.xs, fontWeight: '600' },
  filterChipTextActive: { color: '#fff' },
  filterChipTextInactive: { color: 'rgba(255,255,255,0.45)' },
  countRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md, paddingHorizontal: 2 },
  countText: { fontSize: FONT_SIZES.xs, fontWeight: '600', color: '#9CA3AF' },
  countHint: { fontSize: 10, color: '#4B5563' },
  templateList: { gap: SPACING.sm },
  templateRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    paddingHorizontal: SPACING.lg, paddingVertical: 14,
    borderRadius: BORDER_RADIUS.lg, borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  templateEmoji: {
    width: 56, height: 56, borderRadius: BORDER_RADIUS.xl,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1,
  },
  templateRight: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  templateContent: { flex: 1, minWidth: 0, justifyContent: 'center', gap: 4 },
  templateBottomRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: SPACING.sm,
  },
  templateMeta: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, flexWrap: 'wrap', flex: 1 },
  templateTitle: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#fff' },
  templateDescription: { fontSize: 11, color: '#9CA3AF', lineHeight: 16, marginTop: 2 },
  chevronWrapper: {
    width: 36, height: 36, borderRadius: 18,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1.5,
  },
  templateMetaText: { fontSize: 10, color: '#9CA3AF' },
  templateMetaDot: { fontSize: 10, color: '#4B5563' },
  officialBadge: { backgroundColor: '#6C5CE720', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 99 },
  officialBadgeText: { fontSize: 9, fontWeight: '700', color: '#a78bfa' },
  likeButton: { paddingHorizontal: SPACING.sm },
  chevron: { fontSize: 18, fontWeight: '700', color: '#fff' },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 32, marginBottom: SPACING.md },
  emptyText: { fontSize: FONT_SIZES.md, color: '#6B7280' },
  floatingButtonContainer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: SPACING.xl, paddingBottom: SPACING.xl,
  },
  floatingButton: {
    height: 56, borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.55, shadowRadius: 28, elevation: 12,
  },
  floatingButtonText: { fontSize: FONT_SIZES.lg, fontWeight: '900', color: '#fff' },
});
