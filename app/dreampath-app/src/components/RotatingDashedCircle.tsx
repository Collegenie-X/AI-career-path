import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface RotatingDashedCircleProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  glowColor?: string;
  children: React.ReactNode;
}

export function RotatingDashedCircle({
  size = 200,
  color = 'rgba(255,255,255,0.6)',
  strokeWidth = 2,
  glowColor = '#6C5CE7',
  children,
}: RotatingDashedCircleProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 24000,
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

  return (
    <View style={[styles.container, { width: size + strokeWidth * 4, height: size + strokeWidth * 4 }]}>
      {/* 중앙 glow 효과 */}
      <View style={[styles.glowContainer, { width: size, height: size }]}>
        <LinearGradient
          colors={[`${glowColor}40`, `${glowColor}00`]}
          start={{ x: 0.5, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={styles.glowGradient}
        />
      </View>

      {/* 회전하는 점선 원 */}
      <Animated.View
        style={[
          styles.dashedRing,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            transform: [{ rotate: rotation }],
          },
        ]}
      />

      {/* 아이콘 */}
      <View style={[styles.iconWrapper, { width: size, height: size }]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
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
  dashedRing: {
    position: 'absolute',
    borderStyle: 'dashed',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
