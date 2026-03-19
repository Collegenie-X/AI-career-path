import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';

import whyThisAppData from '../../data/why-this-app.json';

type WhyStructureItem = (typeof whyThisAppData.items)[number];

const ICON_MAP: Record<string, 'home' | 'briefcase' | 'map' | 'rocket'> = {
  home: 'home',
  briefcase: 'briefcase',
  map: 'map',
  rocket: 'rocket',
};

function AnimatedDownArrow({ color }: { color: string }) {
  return (
    <View style={styles.arrowContainer}>
      {[0, 1, 2].map((i) => (
        <Ionicons
          key={i}
          name="chevron-down"
          size={20}
          color={color}
          style={[styles.arrowIcon, { opacity: 0.3 + i * 0.25 }]}
        />
      ))}
    </View>
  );
}

function WhyStructureCard({ item, index }: { item: WhyStructureItem; index: number }) {
  const iconName = ICON_MAP[item.icon] ?? 'home';

  return (
    <View
      style={[
        styles.card,
        {
          borderColor: `${item.color}66`,
          backgroundColor: `${item.color}15`,
        },
      ]}
    >
      <View style={styles.cardContent}>
        <View style={styles.iconColumn}>
          <View
            style={[
              styles.iconBox,
              {
                backgroundColor: `${item.color}40`,
                borderColor: `${item.color}80`,
              },
            ]}
          >
            <Ionicons name={iconName} size={24} color={COLORS.white} />
          </View>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: `${item.color}30`,
                borderColor: `${item.color}60`,
              },
            ]}
          >
            <Text style={[styles.badgeText, { color: item.color }]}>{item.badge}</Text>
          </View>
        </View>
        <View style={styles.textColumn}>
          <View style={styles.titleRow}>
            <Text style={styles.emoji}>{item.emoji}</Text>
            <Text style={[styles.title, { color: item.color }]}>{item.title}</Text>
          </View>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    </View>
  );
}

export function WhyTabStructureSection() {
  const { title, subtitle, items, footer } = whyThisAppData;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleBar} />
        <Text style={styles.titleText}>{title}</Text>
      </View>
      <Text style={styles.subtitle}>{subtitle}</Text>

      <View style={styles.cardsContainer}>
        {items.map((item, index) => (
          <View key={item.id}>
            <WhyStructureCard item={item} index={index} />
            {index < items.length - 1 && (
              <AnimatedDownArrow color={items[index + 1].color} />
            )}
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{footer}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.xxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  titleBar: {
    width: 4,
    height: 24,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  titleText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '900',
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
    paddingLeft: SPACING.lg,
  },
  cardsContainer: {
    gap: 0,
  },
  card: {
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1.5,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.md,
  },
  iconColumn: {
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.xl,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  textColumn: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  emoji: {
    fontSize: FONT_SIZES.md,
  },
  title: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '900',
    flex: 1,
  },
  description: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    lineHeight: 18,
  },
  arrowContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  arrowIcon: {
    marginVertical: -4,
  },
  footer: {
    marginTop: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    backgroundColor: 'rgba(108,92,231,0.15)',
    borderWidth: 1.5,
    borderColor: 'rgba(108,92,231,0.4)',
  },
  footerText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.primaryLight,
    textAlign: 'center',
    lineHeight: 18,
  },
});
