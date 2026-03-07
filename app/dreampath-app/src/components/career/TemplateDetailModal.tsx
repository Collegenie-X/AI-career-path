import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal,
} from 'react-native';
import { SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';
import { CAREER_LABELS, CAREER_GRADE_YEARS } from '../../config/career-path';
import { storage } from '../../lib/storage';
import { TemplateYearSection } from './TemplateYearSection';
import { CommentSection } from './CommentSection';
import templates from '../../data/career-path-templates.json';

type Template = (typeof templates)[0];

interface TemplateDetailModalProps {
  template: Template;
  onClose: () => void;
  onUseTemplate: () => void;
}

/* ─── Header ─── */
function DetailHeader({ template, onClose }: { template: Template; onClose: () => void }) {
  const color = template.starColor;
  return (
    <View style={[hdrS.container, { backgroundColor: color + '18', borderBottomColor: color + '30' }]}>
      <View style={hdrS.row}>
        <View style={[hdrS.emojiBox, { backgroundColor: color + '30', borderColor: color + '44' }]}>
          <Text style={hdrS.emoji}>{template.jobEmoji}</Text>
        </View>
        <View style={hdrS.info}>
          <Text style={hdrS.title} numberOfLines={2}>{template.title}</Text>
          <View style={hdrS.metaRow}>
            <Text style={[hdrS.metaAccent, { color }]}>{template.starEmoji} {template.starName}</Text>
            <Text style={hdrS.metaDot}>·</Text>
            <Text style={hdrS.metaText}>{template.years.length}개 학년</Text>
            <Text style={hdrS.metaDot}>·</Text>
            <Text style={hdrS.metaText}>{template.totalItems}개 항목</Text>
            {template.authorType === 'official' && (
              <View style={hdrS.officialBadge}>
                <Text style={hdrS.officialText}>✓ {CAREER_LABELS.exploreOfficial}</Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity onPress={onClose} style={hdrS.closeButton}>
          <Text style={hdrS.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const hdrS = StyleSheet.create({
  container: { paddingHorizontal: SPACING.xl, paddingVertical: SPACING.lg, borderBottomWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md },
  emojiBox: {
    width: 52, height: 52, borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1.5,
  },
  emoji: { fontSize: 28 },
  info: { flex: 1 },
  title: { fontSize: FONT_SIZES.md, fontWeight: '700', color: '#fff', lineHeight: 20 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, flexWrap: 'wrap' },
  metaAccent: { fontSize: FONT_SIZES.xs, fontWeight: '600' },
  metaText: { fontSize: FONT_SIZES.xs, color: '#6B7280' },
  metaDot: { fontSize: FONT_SIZES.xs, color: '#4B5563' },
  officialBadge: { backgroundColor: '#6C5CE720', paddingHorizontal: 6, paddingVertical: 2, borderRadius: BORDER_RADIUS.full },
  officialText: { fontSize: 9, fontWeight: '700', color: '#a78bfa' },
  closeButton: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  closeIcon: { color: '#9CA3AF', fontSize: 14 },
});

/* ─── Action bar ─── */
function ActionBar({ template, liked, bookmarked, onLike, onBookmark }: {
  template: Template; liked: boolean; bookmarked: boolean;
  onLike: () => void; onBookmark: () => void;
}) {
  const localLikes = liked ? template.likes + 1 : template.likes;
  return (
    <View style={actS.container}>
      <View style={actS.left}>
        <TouchableOpacity
          onPress={onLike}
          style={[actS.likeButton, liked && actS.likeButtonActive]}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 14 }}>{liked ? '❤️' : '🤍'}</Text>
          <Text style={actS.likeCount}>{localLikes}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onBookmark}
          style={[actS.bookmarkButton, bookmarked && actS.bookmarkButtonActive]}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 14 }}>{bookmarked ? '🔖' : '🏷️'}</Text>
        </TouchableOpacity>
      </View>
      <View style={actS.right}>
        <Text style={actS.usesText}>👥 {template.uses}{CAREER_LABELS.detailUses}</Text>
        <TouchableOpacity style={actS.menuButton}>
          <Text style={actS.menuIcon}>⋮</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const actS = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  likeButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: SPACING.md, paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full, backgroundColor: 'rgba(255,255,255,0.07)',
  },
  likeButtonActive: { backgroundColor: 'rgba(255,100,119,0.15)' },
  likeCount: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: '#fff' },
  bookmarkButton: {
    padding: 6, borderRadius: BORDER_RADIUS.full,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  bookmarkButtonActive: { backgroundColor: 'rgba(251,191,36,0.15)' },
  right: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  usesText: { fontSize: FONT_SIZES.xs, color: '#6B7280' },
  menuButton: { padding: 6 },
  menuIcon: { fontSize: 18, color: 'rgba(255,255,255,0.5)' },
});

/* ─── Tags ─── */
function TagsRow({ tags, accentColor }: { tags: string[]; accentColor: string }) {
  return (
    <View style={tagS.row}>
      {tags.map((tag) => (
        <View key={tag} style={[tagS.chip, { borderColor: accentColor + '40' }]}>
          <Text style={[tagS.chipText, { color: accentColor }]}>#{tag}</Text>
        </View>
      ))}
    </View>
  );
}

const tagS = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full, borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  chipText: { fontSize: FONT_SIZES.xs, fontWeight: '600' },
});

/* ─── Stats cards ─── */
function StatsCards({ totalItems, totalYears, accentColor }: {
  totalItems: number; totalYears: number; accentColor: string;
}) {
  return (
    <View style={statS.row}>
      <View style={[statS.card, { backgroundColor: accentColor + '15', borderColor: accentColor + '25' }]}>
        <Text style={[statS.value, { color: accentColor }]}>{totalItems}</Text>
        <Text style={statS.label}>총 항목</Text>
      </View>
      <View style={[statS.card, { backgroundColor: '#A78BFA15', borderColor: '#A78BFA25' }]}>
        <Text style={[statS.value, { color: '#c4b5fd' }]}>{totalYears}</Text>
        <Text style={statS.label}>학년</Text>
      </View>
    </View>
  );
}

const statS = StyleSheet.create({
  row: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.xl },
  card: {
    flex: 1, padding: SPACING.lg, borderRadius: BORDER_RADIUS.lg, borderWidth: 1,
  },
  value: { fontSize: 28, fontWeight: '900' },
  label: { fontSize: FONT_SIZES.xs, color: '#9CA3AF', marginTop: 2 },
});

/* ─── Timeline: single vertical line + year sections ─── */
const LINE_LEFT = 19;

function TimelineSection({ years, accentColor }: { years: Template['years']; accentColor: string }) {
  const gradeOrder = CAREER_GRADE_YEARS.reduce(
    (acc, g, i) => { acc[g.id] = i; return acc; },
    {} as Record<string, number>,
  );
  const sortedYears = [...years].sort(
    (a, b) => (gradeOrder[a.gradeId] ?? 0) - (gradeOrder[b.gradeId] ?? 0),
  );

  return (
    <View style={tlS.container}>
      <View
        style={[tlS.line, { left: LINE_LEFT, backgroundColor: accentColor + '25' }]}
        pointerEvents="none"
      />
      <View style={tlS.content}>
        {sortedYears.map((year) => (
          <TemplateYearSection key={year.gradeId} year={year} accentColor={accentColor} />
        ))}
      </View>
    </View>
  );
}

const tlS = StyleSheet.create({
  container: { position: 'relative', marginBottom: SPACING.xl },
  line: {
    position: 'absolute', top: 0, bottom: 0, width: 2,
  },
  content: { paddingLeft: 0 },
});

/* ─── Main ─── */
export function TemplateDetailModal({ template, onClose, onUseTemplate }: TemplateDetailModalProps) {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const color = template.starColor;

  useEffect(() => {
    storage.templateLikes.getAll().then((ids) => setLiked(ids.includes(template.id)));
    storage.templateBookmarks.getAll().then((ids) => setBookmarked(ids.includes(template.id)));
  }, [template.id]);

  const handleLike = async () => {
    const result = await storage.templateLikes.toggle(template.id);
    setLiked(result.liked);
  };

  const handleBookmark = async () => {
    const result = await storage.templateBookmarks.toggle(template.id);
    setBookmarked(result.bookmarked);
  };

  return (
    <Modal visible animationType="slide" transparent>
      <View style={mainS.overlay}>
        <View style={mainS.container}>
          <DetailHeader template={template} onClose={onClose} />
          <ActionBar
            template={template}
            liked={liked}
            bookmarked={bookmarked}
            onLike={handleLike}
            onBookmark={handleBookmark}
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={mainS.scrollContent}
          >
            <Text style={mainS.description}>{template.description}</Text>

            <TagsRow tags={template.tags} accentColor={color} />

            <StatsCards
              totalItems={template.totalItems}
              totalYears={template.years.length}
              accentColor={color}
            />

            <View style={mainS.timelineSectionHeader}>
              <Text style={mainS.timelineSectionTitle}>{CAREER_LABELS.detailTimelineSectionTitle}</Text>
            </View>
            <TimelineSection years={template.years} accentColor={color} />

            <CommentSection templateId={template.id} accentColor={color} />

            <View style={{ height: 120 }} />
          </ScrollView>

          <View style={mainS.footer}>
            <TouchableOpacity
              style={[mainS.useButton, { backgroundColor: color, shadowColor: color }]}
              onPress={onUseTemplate}
              activeOpacity={0.85}
            >
              <Text style={mainS.useButtonText}>{CAREER_LABELS.exploreUseTemplate}  ↗</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const mainS = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.82)' },
  container: {
    flex: 1, backgroundColor: '#0d0d24',
    marginTop: 56, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderBottomWidth: 0,
  },
  scrollContent: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg },
  timelineSectionHeader: { marginTop: SPACING.xxl, marginBottom: SPACING.md },
  timelineSectionTitle: { fontSize: FONT_SIZES.sm, fontWeight: '700', color: '#fff' },
  description: {
    fontSize: FONT_SIZES.sm, color: '#9CA3AF', lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: SPACING.lg, paddingTop: SPACING.lg, paddingBottom: SPACING.xxl,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(13,13,36,0.95)',
  },
  useButton: {
    height: 52, borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center', alignItems: 'center',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 20,
    elevation: 8,
  },
  useButtonText: { fontSize: FONT_SIZES.sm, fontWeight: '800', color: '#fff' },
});
