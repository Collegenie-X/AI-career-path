import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../config/theme';

interface QuizFeedbackPanelProps {
  zoneIcon: string;
  zoneName: string;
  feedbackText: string;
  color: string;
  isLast: boolean;
  onNext: () => void;
  bottomInset: number;
}

export function QuizFeedbackPanel({
  zoneIcon,
  zoneName,
  feedbackText,
  color,
  isLast,
  onNext,
  bottomInset,
}: QuizFeedbackPanelProps) {
  const slideAnim = useRef(new Animated.Value(200)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 12,
        useNativeDriver: true,
      }),
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* 반투명 배경 (위쪽만 흐림) */}
      <Animated.View
        style={[styles.backdrop, { opacity: backdropAnim }]}
        pointerEvents="none"
      />

      {/* 슬라이드 패널 */}
      <Animated.View
        style={[
          styles.panel,
          { paddingBottom: bottomInset + SPACING.lg },
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* 패널 핸들 */}
        <View style={styles.panelHandle} />

        {/* 헤더 행 */}
        <View style={styles.panelHeader}>
          <View style={[styles.panelIconBadge, { backgroundColor: `${color}25` }]}>
            <Text style={styles.panelIcon}>{zoneIcon}</Text>
          </View>
          <Text style={styles.panelZoneName}>{zoneName} 분석 완료</Text>
          <View style={[styles.checkCircle, { backgroundColor: `${color}30`, borderColor: color }]}>
            <Text style={[styles.checkMark, { color }]}>✓</Text>
          </View>
        </View>

        {/* 피드백 텍스트 */}
        <Text style={styles.feedbackText}>{feedbackText}</Text>

        {/* 다음 버튼 */}
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: color }]}
          onPress={onNext}
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>
            {isLast ? '결과 보기 🏆' : '다음 문제로'}
          </Text>
          {!isLast && <Text style={styles.nextBtnArrow}> →</Text>}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10,10,20,0.65)',
  },
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#15152A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
  },
  panelHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center',
    marginBottom: SPACING.lg,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  panelIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelIcon: {
    fontSize: 20,
  },
  panelZoneName: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: '800',
    color: COLORS.white,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: {
    fontSize: 14,
    fontWeight: '800',
  },
  feedbackText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: SPACING.xl,
  },
  nextBtn: {
    flexDirection: 'row',
    height: 52,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.white,
  },
  nextBtnArrow: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '800',
    color: COLORS.white,
  },
});
