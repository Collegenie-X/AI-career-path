import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';
import { JOBS_EXPLORE_LABELS } from '../../config/labels';
import type { StarData } from '../../lib/types';

interface StarInfoBannerProps {
  star: StarData;
}

function DifficultyDots({ level }: { level: number }) {
  return (
    <View style={styles.dotsRow}>
      {[...Array(5)].map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            { backgroundColor: i < level ? COLORS.yellow : 'rgba(255,255,255,0.1)' },
          ]}
        />
      ))}
    </View>
  );
}

function FutureGrowthBar({ level, color }: { level: number; color: string }) {
  return (
    <View style={styles.growthBarRow}>
      {[...Array(5)].map((_, i) => (
        <View
          key={i}
          style={[
            styles.growthBar,
            { backgroundColor: i < level ? color : 'rgba(255,255,255,0.1)' },
          ]}
        />
      ))}
    </View>
  );
}

function AccordionSection({
  isExpanded,
  onToggle,
  backgroundColor,
  icon,
  title,
  previewContent,
  children,
}: {
  isExpanded: boolean;
  onToggle: () => void;
  backgroundColor: string;
  icon: string;
  title: string;
  previewContent?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.accordionSection, { backgroundColor }]}>
      <TouchableOpacity onPress={onToggle} activeOpacity={0.8}>
        <View style={styles.accordionHeader}>
          <Text style={styles.accordionIcon}>{icon}</Text>
          <Text style={styles.accordionTitle}>{title}</Text>
          <View style={styles.accordionSpacer} />
          <Text style={styles.accordionToggle}>{isExpanded ? '▼' : '▶'}</Text>
        </View>
        {!isExpanded && previewContent}
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.accordionExpandedContent}>
          {children}
        </View>
      )}
    </View>
  );
}

export function StarInfoBanner({ star }: StarInfoBannerProps) {
  const profile = star.starProfile;
  const [isTraitsExpanded, setIsTraitsExpanded] = useState(false);
  const [isFitExpanded, setIsFitExpanded] = useState(false);
  const [isNotFitExpanded, setIsNotFitExpanded] = useState(false);
  const [isWhyExpanded, setIsWhyExpanded] = useState(false);

  if (!profile) return null;

  return (
    <View style={styles.container}>
      <View style={[styles.mainCard, { backgroundColor: `${star.color}08`, borderColor: `${star.color}25` }]}>

        {/* 태그라인 & 해시태그 */}
        <View style={styles.taglineSection}>
          <Text style={styles.taglineQuote}>"{profile.tagline}"</Text>
          {profile.careerKeyword && (
            <View style={styles.careerKeywordRow}>
              {profile.careerKeyword
                .split(/\s+/)
                .filter((tag) => tag.startsWith('#'))
                .map((tag) => (
                  <View key={tag} style={[styles.careerKeywordChip, { backgroundColor: `${star.color}15` }]}>
                    <Text style={[styles.careerKeywordText, { color: star.color }]}>{tag}</Text>
                  </View>
                ))}
            </View>
          )}
        </View>

        {/* 핵심 특성 아코디언 */}
        <AccordionSection
          isExpanded={isTraitsExpanded}
          onToggle={() => setIsTraitsExpanded(!isTraitsExpanded)}
          backgroundColor="rgba(255,255,255,0.04)"
          icon="🎯"
          title={JOBS_EXPLORE_LABELS.coreTraitsTitle}
          previewContent={
            <View style={styles.traitsPreview}>
              {profile.coreTraits.map((trait) => (
                <View key={trait.label} style={styles.traitPreviewItem}>
                  <Text style={styles.traitPreviewIcon}>{trait.icon}</Text>
                  <Text style={styles.traitPreviewLabel}>{trait.label}</Text>
                </View>
              ))}
            </View>
          }
        >
          <View style={styles.traitsGrid}>
            {profile.coreTraits.map((trait) => (
              <View key={trait.label} style={[styles.traitCard, { borderColor: `${star.color}20` }]}>
                <Text style={styles.traitCardIcon}>{trait.icon}</Text>
                <Text style={styles.traitCardLabel}>{trait.label}</Text>
                <Text style={styles.traitCardDesc}>{trait.desc}</Text>
              </View>
            ))}
          </View>
        </AccordionSection>

        {/* 잘 맞는 사람 아코디언 */}
        <AccordionSection
          isExpanded={isFitExpanded}
          onToggle={() => setIsFitExpanded(!isFitExpanded)}
          backgroundColor="rgba(34,197,94,0.08)"
          icon="✨"
          title={profile.fitPersonality.title}
          previewContent={
            <Text style={styles.accordionPreview}>
              {profile.fitPersonality.traits.length}{JOBS_EXPLORE_LABELS.viewMoreTraits}
            </Text>
          }
        >
          <View style={styles.fitContent}>
            {profile.fitPersonality.traits.map((trait, index) => (
              <View key={index} style={styles.fitItem}>
                <Text style={styles.fitCheck}>✓</Text>
                <Text style={styles.fitText}>{trait}</Text>
              </View>
            ))}
          </View>
        </AccordionSection>

        {/* 맞지 않는 사람 아코디언 */}
        {profile.fitPersonality.notFit && profile.fitPersonality.notFit.length > 0 && (
          <AccordionSection
            isExpanded={isNotFitExpanded}
            onToggle={() => setIsNotFitExpanded(!isNotFitExpanded)}
            backgroundColor="rgba(239,68,68,0.06)"
            icon="⚠️"
            title={JOBS_EXPLORE_LABELS.notFitTitle}
            previewContent={
              <Text style={styles.accordionPreview}>
                {profile.fitPersonality.notFit.length}가지 주의 사항
              </Text>
            }
          >
            <View style={styles.fitContent}>
              {profile.fitPersonality.notFit.map((trait, index) => (
                <View key={index} style={styles.notFitItem}>
                  <Text style={styles.notFitCheck}>✗</Text>
                  <Text style={styles.notFitText}>{trait}</Text>
                </View>
              ))}
            </View>
          </AccordionSection>
        )}

        {/* 왜 이 직업들을 묶었나 아코디언 */}
        <AccordionSection
          isExpanded={isWhyExpanded}
          onToggle={() => setIsWhyExpanded(!isWhyExpanded)}
          backgroundColor="rgba(168,85,247,0.08)"
          icon="💡"
          title={profile.whyThisGroup.title}
          previewContent={
            <View style={styles.dnaPreviewRow}>
              {profile.whyThisGroup.commonDNA.slice(0, 3).map((dna) => (
                <View key={dna} style={[styles.dnaPreviewChip, { backgroundColor: `${star.color}15` }]}>
                  <Text style={[styles.dnaPreviewText, { color: star.color }]}>{dna}</Text>
                </View>
              ))}
              {profile.whyThisGroup.commonDNA.length > 3 && (
                <Text style={styles.dnaMoreText}>+{profile.whyThisGroup.commonDNA.length - 3}</Text>
              )}
            </View>
          }
        >
          <View style={styles.whyContent}>
            <Text style={styles.whyReason}>{profile.whyThisGroup.reason}</Text>
            <View style={styles.dnaRow}>
              {profile.whyThisGroup.commonDNA.map((dna) => (
                <View key={dna} style={[styles.dnaChip, { backgroundColor: `${star.color}15` }]}>
                  <Text style={[styles.dnaText, { color: star.color }]}>{dna}</Text>
                </View>
              ))}
            </View>
          </View>
        </AccordionSection>

        {/* 메타 정보 카드 */}
        <View style={styles.metaSection}>
          <View style={styles.metaCard}>
            <Text style={styles.metaCardIcon}>📊</Text>
            <Text style={styles.metaCardLabel}>{JOBS_EXPLORE_LABELS.difficultyLabel}</Text>
            <DifficultyDots level={profile.difficultyLevel} />
            <Text style={[styles.metaDifficultyText, { color: star.color }]}>
              {(JOBS_EXPLORE_LABELS.difficultyLevels as Record<string, string>)?.[String(profile.difficultyLevel)] ?? ''}
            </Text>
          </View>
          <View style={styles.metaCard}>
            <Text style={styles.metaCardIcon}>⏱️</Text>
            <Text style={styles.metaCardLabel}>{JOBS_EXPLORE_LABELS.preparationLabel}</Text>
            <Text style={[styles.metaCardValue, { color: star.color }]}>
              {profile.avgPreparationYears}{JOBS_EXPLORE_LABELS.preparationUnit}
            </Text>
            <Text style={styles.metaCardSubLabel}>{JOBS_EXPLORE_LABELS.preparationSubLabel}</Text>
          </View>
        </View>

        {/* Holland 코드 + 핵심 과목 */}
        <View style={styles.hollandSection}>
          <View style={styles.hollandRow}>
            <Text style={styles.hollandIcon}>🔖</Text>
            <Text style={styles.hollandLabel}>{JOBS_EXPLORE_LABELS.hollandCodeLabel}</Text>
            <View style={styles.hollandSpacer} />
            <View style={[styles.hollandBadge, { backgroundColor: `${star.color}25` }]}>
              <Text style={[styles.hollandText, { color: star.color }]}>{profile.hollandCode}</Text>
            </View>
          </View>
          <View style={styles.subjectsRow}>
            <Text style={styles.subjectsLabel}>{JOBS_EXPLORE_LABELS.keySubjectsLabel}</Text>
            <View style={styles.subjectsChips}>
              {profile.keySubjects.map((subject) => (
                <View key={subject} style={[styles.subjectChip, { backgroundColor: `${star.color}15` }]}>
                  <Text style={[styles.subjectChipText, { color: star.color }]}>{subject}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
  },
  mainCard: {
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1.5,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  taglineSection: {
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
    gap: SPACING.xs,
  },
  taglineQuote: {
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.white,
    lineHeight: 22,
    textAlign: 'center',
  },
  careerKeywordRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
  },
  careerKeywordChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  careerKeywordText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
  accordionExpandedContent: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: SPACING.md,
    marginTop: SPACING.sm,
  },
  accordionSection: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  accordionIcon: {
    fontSize: 16,
  },
  accordionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '900',
    color: COLORS.white,
  },
  accordionSpacer: {
    flex: 1,
  },
  accordionToggle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  accordionPreview: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },
  traitsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  traitPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.full,
  },
  traitPreviewIcon: {
    fontSize: 14,
  },
  traitPreviewLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.white,
  },
  traitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  traitCard: {
    width: '48.5%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    padding: SPACING.md,
    gap: 4,
  },
  traitCardIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  traitCardLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '800',
    color: COLORS.white,
  },
  traitCardDesc: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  fitContent: {
    gap: SPACING.sm,
  },
  fitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  fitCheck: {
    fontSize: 14,
    color: '#22C55E',
    marginTop: 1,
    fontWeight: '700',
  },
  fitText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  notFitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
  },
  notFitCheck: {
    fontSize: 14,
    color: '#EF4444',
    marginTop: 1,
    fontWeight: '700',
  },
  notFitText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  whyContent: {
    gap: SPACING.md,
  },
  whyReason: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  dnaPreviewRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginTop: SPACING.sm,
    alignItems: 'center',
  },
  dnaPreviewChip: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
  },
  dnaPreviewText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
  dnaMoreText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  dnaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  dnaChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  dnaText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
  },
  metaSection: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  metaCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    gap: 4,
    alignItems: 'center',
  },
  metaCardIcon: {
    fontSize: 18,
  },
  metaCardLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  metaCardValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '900',
  },
  metaCardSubLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  metaDifficultyText: {
    fontSize: 10,
    fontWeight: '700',
  },
  growthBarRow: {
    flexDirection: 'row',
    gap: 3,
  },
  growthBar: {
    width: 16,
    height: 6,
    borderRadius: 3,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 3,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  hollandSection: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  hollandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  hollandIcon: {
    fontSize: 14,
  },
  hollandLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.white,
  },
  hollandSpacer: {
    flex: 1,
  },
  hollandBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  hollandText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '900',
  },
  subjectsRow: {
    gap: SPACING.xs,
  },
  subjectsLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  subjectsChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  subjectChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.full,
  },
  subjectChipText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
  },
});
