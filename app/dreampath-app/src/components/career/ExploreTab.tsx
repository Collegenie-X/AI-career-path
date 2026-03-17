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
import careerPathTemplates from '../../data/career-path-templates-index';
import { TemplateDetailModal } from './TemplateDetailModal';

type Template = (typeof careerPathTemplates)[0];

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
        <StatItem icon="📖" value={careerPathTemplates.length.toString()} label="커리어 패스" />
        <View style={styles.statDivider} />
        <StatItem icon="⭐" value="8" label="왕국" />
        <View style={styles.statDivider} />
        <StatItem
          icon="👥"
          value={careerPathTemplates.reduce((s, t) => s + t.uses, 0).toLocaleString()}
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

function GameTemplateCard({
  template, liked, onShowDetail, onToggleLike,
}: { template: Template; liked: boolean; onShowDetail: () => void; onToggleLike: () => void }) {
  const localLikes = liked ? template.likes + 1 : template.likes;

  return (
    <TouchableOpacity
      style={[styles.gameCard, { 
        backgroundColor: template.starColor + '12',
        borderColor: template.starColor + '35',
        shadowColor: template.starColor,
      }]}
      onPress={onShowDetail}
      activeOpacity={0.8}
    >
      {/* 상단: 큰 이모지 + 왕국 뱃지 */}
      <View style={styles.cardHeader}>
        <View style={[styles.largeEmojiCircle, { 
          backgroundColor: template.starColor + '25',
          borderColor: template.starColor + '45',
        }]}>
          <Text style={styles.largeEmoji}>{template.jobEmoji}</Text>
        </View>
        <View style={[styles.kingdomBadge, { backgroundColor: template.starColor }]}>
          <Text style={styles.kingdomEmoji}>{template.starEmoji}</Text>
          <Text style={styles.kingdomName}>{template.starName}</Text>
        </View>
      </View>

      {/* 중앙: 제목 */}
      <Text style={styles.cardTitle} numberOfLines={2}>{template.title}</Text>

      {/* 하단: 통계 + 좋아요 */}
      <View style={styles.cardFooter}>
        <View style={styles.statsRow}>
          <View style={styles.statBubble}>
            <Text style={styles.statIcon}>📚</Text>
            <Text style={styles.statText}>{template.totalItems}</Text>
          </View>
          <View style={styles.statBubble}>
            <Text style={styles.statIcon}>📅</Text>
            <Text style={styles.statText}>{template.years.length}년</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={onToggleLike}
          style={[styles.likeCircle, liked && styles.likeCircleActive]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.likeIcon}>{liked ? '❤️' : '🤍'}</Text>
          <Text style={[styles.likeCount, liked && styles.likeCountActive]}>{localLikes}</Text>
        </TouchableOpacity>
      </View>

      {/* 공식 뱃지 */}
      {template.authorType === 'official' && (
        <View style={styles.officialCornerBadge}>
          <Text style={styles.officialCornerText}>✓</Text>
        </View>
      )}
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
    if (activeFilter === 'all') return careerPathTemplates;
    if (activeFilter === 'highschool') {
      return careerPathTemplates.filter((t) => (t as { category?: string }).category === 'highschool');
    }
    if (activeFilter === 'admission') {
      return careerPathTemplates.filter((t) => (t as { category?: string }).category === 'admission');
    }
    return careerPathTemplates.filter((t) => t.starId === activeFilter);
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
          <View style={styles.gameCardGrid}>
            {filtered.map((template) => (
              <GameTemplateCard
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
  
  // 게임 카드 그리드
  gameCardGrid: { 
    gap: SPACING.lg,
  },
  gameCard: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 2,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
  },
  
  // 카드 헤더 (이모지 + 왕국)
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  largeEmojiCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
  },
  largeEmoji: {
    fontSize: 40,
  },
  kingdomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
  },
  kingdomEmoji: {
    fontSize: 16,
  },
  kingdomName: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
    color: '#fff',
  },
  
  // 카드 제목
  cardTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 24,
    marginBottom: SPACING.md,
    minHeight: 48,
  },
  
  // 카드 하단 (통계 + 좋아요)
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  statBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  statIcon: {
    fontSize: 14,
  },
  statText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: '#fff',
  },
  likeCircle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  likeCircleActive: {
    backgroundColor: 'rgba(255,100,119,0.2)',
  },
  likeIcon: {
    fontSize: 16,
  },
  likeCount: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  likeCountActive: {
    color: '#FF6477',
  },
  
  // 공식 뱃지 (우측 상단 코너)
  officialCornerBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  officialCornerText: {
    fontSize: 14,
    color: '#fff',
  },
  
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
