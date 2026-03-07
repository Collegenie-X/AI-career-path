import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';

const DASH_STROKE_WIDTH = 2;
const DASH_LENGTH = 5;
const DASH_GAP = 5;

interface RotatingDashedCircleProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  glowColor?: string;
  children: React.ReactNode;
}

export function RotatingDashedCircle({
  size = 200,
  color = 'rgba(255,255,255,0.9)',
  strokeWidth = DASH_STROKE_WIDTH,
  glowColor = '#6C5CE7',
  children,
}: RotatingDashedCircleProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 16000,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [rotateAnim]);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const r = size / 2 - strokeWidth / 2;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <View style={[styles.container, { width: size + strokeWidth * 4, height: size + strokeWidth * 4 }]}>
      {/* 중앙 glow 효과 */}
      <View style={[styles.glowContainer, { width: size, height: size, opacity: 0.5 }]}>
        <LinearGradient
          colors={[`${glowColor}25`, `${glowColor}02`, 'transparent'] as [string, string, ...string[]]}
          locations={[0, 0.5, 1]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={styles.glowGradient}
        />
      </View>

      {/* 회전하는 점선 원 - SVG로 굵기·간격 조절 */}
      <Animated.View
        style={[
          styles.dashedRingWrapper,
          { width: size, height: size, transform: [{ rotate: rotation }] },
        ]}
      >
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${DASH_LENGTH} ${DASH_GAP}`}
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>

      {/* 아이콘 */}
      <View style={[styles.iconWrapper, { width: size, height: size }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
  glowContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 9999,
  },
  dashedRingWrapper: {
    position: 'absolute',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'visible',
  },
});
