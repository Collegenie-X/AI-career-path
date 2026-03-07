import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RotatingDashedCircle } from '../RotatingDashedCircle';
import { SquareWithOrbit } from './SquareWithOrbit';
import { COLORS, SPACING } from '../../config/theme';

const ACCENT_COLOR_MAP: Record<string, string> = {
  primary: COLORS.primary,
  blue: COLORS.blue,
  green: COLORS.green,
  yellow: COLORS.yellow,
  accent: COLORS.accent,
};

export interface OnboardingSlideData {
  id: string;
  step: number;
  icon: string;
  title: string;
  subtitle: string;
  description: string;
  accentColor: string;
  featureBoxes?: { label: string; icon: string }[];
  flowSteps?: { label: string; icon: string }[];
}

interface OnboardingSlideContentProps {
  item: OnboardingSlideData;
  totalSteps: number;
}

function FeatureFlowRow({
  items,
  accentColor,
}: {
  items: { label: string; icon: string }[];
  accentColor: string;
}) {
  return (
    <View style={styles.flowRow}>
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          <View style={[styles.flowItem, { borderColor: `${accentColor}40` }]}>
            <View style={[styles.flowIconCircle, { backgroundColor: `${accentColor}20` }]}>
              <Text style={styles.flowItemIcon}>{item.icon}</Text>
            </View>
            <Text style={styles.flowItemLabel}>{item.label}</Text>
          </View>
          {idx < items.length - 1 && (
            <Text style={styles.flowArrow}>›</Text>
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

export function OnboardingSlideContent({ item, totalSteps }: OnboardingSlideContentProps) {
  const accentColor = ACCENT_COLOR_MAP[item.accentColor] ?? COLORS.primary;

  return (
    <View style={styles.slide}>
      <View style={styles.iconSection}>
        <RotatingDashedCircle
          color={`${accentColor}40`}
          size={160}
          glowColor={accentColor}
        >
          <SquareWithOrbit icon={item.icon} accentColor={accentColor} />
        </RotatingDashedCircle>
      </View>

      <View style={[styles.stepBadge, { backgroundColor: `${accentColor}25` }]}>
        <Text style={[styles.stepBadgeText, { color: `${accentColor}DD` }]}>
          STEP {item.step} / {totalSteps}
        </Text>
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={[styles.subtitle, { color: `${accentColor}EE` }]}>
          {item.subtitle}
        </Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>

      {item.featureBoxes && item.featureBoxes.length > 0 && (
        <FeatureFlowRow items={item.featureBoxes} accentColor={accentColor} />
      )}

      {item.flowSteps && item.flowSteps.length > 0 && (
        <FeatureFlowRow items={item.flowSteps} accentColor={accentColor} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  iconSection: {
    marginBottom: SPACING.md,
  },
  stepBadge: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: SPACING.lg,
  },
  stepBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  textContainer: {
    alignItems: 'center',
    width: '100%',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  flowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  flowItem: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: SPACING.sm,
    borderRadius: 14,
    borderWidth: 1,
    minWidth: 90,
  },
  flowIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  flowItemIcon: {
    fontSize: 20,
  },
  flowItemLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  flowArrow: {
    fontSize: 18,
    color: COLORS.textMuted,
    marginHorizontal: 0,
  },
});
