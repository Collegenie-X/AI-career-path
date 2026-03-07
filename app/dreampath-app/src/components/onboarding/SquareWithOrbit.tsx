import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { OnboardingIcon } from './OnboardingIcons';
import { COLORS } from '../../config/theme';

const SQUARE_SIZE = 88;
const ORBIT_MARGIN = 14;
const ORBIT_RADIUS = SQUARE_SIZE / 2 + ORBIT_MARGIN;
const ORBIT_DOT_SIZE = 12;

interface SquareWithOrbitProps {
  icon: string;
  accentColor: string;
}

/**
 * 사각형(아이콘 컨테이너) 주변을 비스듬히 도는 큰 원
 * 궤도: 45도 회전하여 대각선 느낌
 */
export function SquareWithOrbit({ icon, accentColor }: SquareWithOrbitProps) {
  const orbitAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const a = Animated.loop(
      Animated.timing(orbitAnim, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: true,
      }),
    );
    a.start();
    return () => a.stop();
  }, [orbitAnim]);

  const rotate = orbitAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.wrapper}>
      {/* 궤도 궤적 - 45도 회전 (비스듬히) */}
      <View
        style={[
          styles.orbitTrack,
          {
            width: ORBIT_RADIUS * 2,
            height: ORBIT_RADIUS * 2,
            borderRadius: ORBIT_RADIUS,
            borderColor: accentColor + '35',
            transform: [{ rotate: '45deg' }],
          },
        ]}
      />

      {/* 공전하는 큰 원 - 사각형 주변을 45도 회전 궤도로 */}
      <Animated.View
        style={[
          styles.orbitWrapper,
          {
            width: ORBIT_RADIUS * 2,
            height: ORBIT_RADIUS * 2,
            transform: [{ rotate: '45deg' }, { rotate: rotate }],
          },
        ]}
      >
        <View
          style={[
            styles.orbitDot,
            {
              width: ORBIT_DOT_SIZE,
              height: ORBIT_DOT_SIZE,
              borderRadius: ORBIT_DOT_SIZE / 2,
              backgroundColor: accentColor,
              top: -ORBIT_DOT_SIZE / 2,
              left: ORBIT_RADIUS - ORBIT_DOT_SIZE / 2,
            },
          ]}
        />
      </Animated.View>

      {/* 아이콘 사각형 (중앙) - 그라디언트 배경 */}
      <LinearGradient
        colors={[accentColor, `${accentColor}BB`] as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.iconSquare, { width: SQUARE_SIZE, height: SQUARE_SIZE, borderRadius: 15}]}
      >
        <OnboardingIcon icon={icon} color={COLORS.white} size={55} />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: ORBIT_RADIUS * 2 + ORBIT_DOT_SIZE,
    height: ORBIT_RADIUS * 2 + ORBIT_DOT_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  orbitTrack: {
    position: 'absolute',
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  orbitWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  orbitDot: {
    position: 'absolute',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 6,
  },
  iconSquare: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
