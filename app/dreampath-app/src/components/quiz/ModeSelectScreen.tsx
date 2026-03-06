import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';

import quizConfigData from '../../data/quiz-config.json';

export type QuizMode = 'quick' | 'detailed';

interface ModeSelectScreenProps {
  onSelect: (mode: QuizMode) => void;
}

// 스크린샷 기준: 빠른 검사 = 보라 계열, 정밀 검사 = 황금/갈색 계열
const MODE_CARD_STYLE: Record<string, {
  cardBg: string;
  cardBorder: string;
  iconBg: string;
  badgeBg: string;
  badgeText: string;
  accentColor: string;
}> = {
  quick: {
    cardBg: '#1E1A3A',
    cardBorder: '#3D3580',
    iconBg: '#4A3FC0',
    badgeBg: '#2D2860',
    badgeText: '#a29bfe',
    accentColor: '#a29bfe',
  },
  detailed: {
    cardBg: '#251E10',
    cardBorder: '#6B4E1A',
    iconBg: '#7A5520',
    badgeBg: '#3D2E0A',
    badgeText: '#FBBF24',
    accentColor: '#FBBF24',
  },
};

export function ModeSelectScreen({ onSelect }: ModeSelectScreenProps) {
  const insets = useSafeAreaInsets();
  const { modeSelect } = quizConfigData;

  const titleAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef(modeSelect.modes.map(() => new Animated.Value(0))).current;
  const tipAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(titleAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.stagger(
        120,
        cardAnims.map((anim) =>
          Animated.spring(anim, { toValue: 1, tension: 70, friction: 10, useNativeDriver: true })
        )
      ),
      Animated.timing(tipAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* 흰색 별 파티클 - 스크린샷과 동일하게 */}
      {STAR_POSITIONS.map((star, i) => (
        <View
          key={i}
          style={[
            styles.star,
            {
              width: star.size,
              height: star.size,
              left: `${star.left}%` as any,
              top: `${star.top}%` as any,
              opacity: star.opacity,
              borderRadius: star.size,
            },
          ]}
        />
      ))}

      <View style={styles.content}>
        {/* 타이틀 */}
        <Animated.View
          style={[
            styles.titleSection,
            {
              opacity: titleAnim,
              transform: [
                {
                  translateY: titleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.heroEmoji}>🌟</Text>
          <Text style={styles.title}>{modeSelect.title}</Text>
          <Text style={styles.subtitle}>{modeSelect.subtitle}</Text>
        </Animated.View>

        {/* 모드 카드들 */}
        <View style={styles.modesContainer}>
          {modeSelect.modes.map((mode, idx) => {
            const cardStyle = MODE_CARD_STYLE[mode.id] ?? MODE_CARD_STYLE.quick;
            return (
              <Animated.View
                key={mode.id}
                style={{
                  opacity: cardAnims[idx],
                  transform: [
                    {
                      translateY: cardAnims[idx].interpolate({
                        inputRange: [0, 1],
                        outputRange: [30, 0],
                      }),
                    },
                    {
                      scale: cardAnims[idx].interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.95, 1],
                      }),
                    },
                  ],
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.modeCard,
                    {
                      backgroundColor: cardStyle.cardBg,
                      borderColor: cardStyle.cardBorder,
                    },
                  ]}
                  onPress={() => onSelect(mode.id as QuizMode)}
                  activeOpacity={0.8}
                >
                  {mode.recommended && (
                    <View style={[styles.recommendBadge, { backgroundColor: cardStyle.badgeBg }]}>
                      <Text style={[styles.recommendText, { color: cardStyle.accentColor }]}>
                        추천
                      </Text>
                    </View>
                  )}

                  <View style={styles.modeCardInner}>
                    {/* 아이콘 박스 - 단색 */}
                    <View style={[styles.modeIconBox, { backgroundColor: cardStyle.iconBg }]}>
                      <Text style={styles.modeIconText}>{mode.emoji}</Text>
                    </View>

                    {/* 정보 */}
                    <View style={styles.modeInfo}>
                      <View style={styles.modeTitleRow}>
                        <Text style={styles.modeTitle}>{mode.title}</Text>
                        <View
                          style={[
                            styles.modeBadge,
                            { backgroundColor: cardStyle.badgeBg },
                          ]}
                        >
                          <Text style={[styles.modeBadgeText, { color: cardStyle.badgeText }]}>
                            {mode.badge}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.modeDesc}>{mode.description}</Text>

                      {/* 영역 아이콘 */}
                      <View style={styles.zoneRow}>
                        {modeSelect.zoneIcons.map((icon, i) => (
                          <Text key={i} style={styles.zoneIcon}>{icon}</Text>
                        ))}
                        {mode.id === 'detailed' && (
                          <Text style={styles.zoneNote}>× 6문항</Text>
                        )}
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* 팁 */}
        <Animated.View style={[styles.tipContainer, { opacity: tipAnim }]}>
          <Text style={styles.tipText}>{modeSelect.tip}</Text>
        </Animated.View>
      </View>
    </View>
  );
}

// 스크린샷 분석: 흰색 점 별들, 다양한 크기(1~2px)와 투명도
const STAR_POSITIONS = [
  { left: 8,  top: 5,  size: 1, opacity: 0.35 },
  { left: 22, top: 12, size: 2, opacity: 0.25 },
  { left: 45, top: 3,  size: 1, opacity: 0.4  },
  { left: 68, top: 8,  size: 1, opacity: 0.3  },
  { left: 85, top: 15, size: 2, opacity: 0.2  },
  { left: 92, top: 4,  size: 1, opacity: 0.45 },
  { left: 5,  top: 25, size: 1, opacity: 0.2  },
  { left: 78, top: 30, size: 1, opacity: 0.35 },
  { left: 35, top: 20, size: 1, opacity: 0.25 },
  { left: 55, top: 18, size: 2, opacity: 0.15 },
  { left: 12, top: 45, size: 1, opacity: 0.3  },
  { left: 90, top: 50, size: 1, opacity: 0.25 },
  { left: 3,  top: 65, size: 2, opacity: 0.2  },
  { left: 60, top: 72, size: 1, opacity: 0.3  },
  { left: 82, top: 68, size: 1, opacity: 0.35 },
  { left: 25, top: 80, size: 1, opacity: 0.2  },
  { left: 48, top: 88, size: 2, opacity: 0.25 },
  { left: 70, top: 92, size: 1, opacity: 0.3  },
  { left: 15, top: 93, size: 1, opacity: 0.2  },
  { left: 95, top: 85, size: 1, opacity: 0.25 },
  { left: 38, top: 55, size: 1, opacity: 0.15 },
  { left: 72, top: 42, size: 1, opacity: 0.2  },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // 스크린샷: 매우 어두운 네이비 (#0D0D1A 수준)
    backgroundColor: '#0E0E1C',
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: SPACING.xxxl,
  },
  heroEmoji: {
    fontSize: 52,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '900',
    color: COLORS.white,
    marginBottom: SPACING.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.45)',
  },
  modesContainer: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  modeCard: {
    borderRadius: BORDER_RADIUS.xxl,
    borderWidth: 1.5,
    padding: SPACING.xl,
    position: 'relative',
    overflow: 'hidden',
  },
  recommendBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
  },
  recommendText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
  },
  modeCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  modeIconBox: {
    width: 52,
    height: 52,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  modeIconText: {
    fontSize: 26,
  },
  modeInfo: {
    flex: 1,
  },
  modeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  modeTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '900',
    color: COLORS.white,
  },
  modeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  modeBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '800',
  },
  modeDesc: {
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: SPACING.sm,
  },
  zoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  zoneIcon: {
    fontSize: 15,
  },
  zoneNote: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.35)',
    marginLeft: 2,
  },
  tipContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: {
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255,255,255,0.3)',
    textAlign: 'center',
  },
});
