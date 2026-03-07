import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS } from '../../config/theme';

interface IconWithOrbitProps {
  icon: string;
  color?: string;
  size?: number;
}

/**
 * SVG 아이콘 + 궤도를 도는 작은 원 (지구 공전처럼)
 */
export function IconWithOrbit({ icon, color = COLORS.white, size = 64 }: IconWithOrbitProps) {
  const orbitAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(orbitAnim, {
        toValue: 1,
        duration: 6000,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [orbitAnim]);

  const orbitRotation = orbitAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const orbitRadius = size * 0.55;
  const orbitDotSize = size * 0.08;

  const renderIcon = () => {
    const iconSize = size;
    const strokeWidth = size * 0.06;

    switch (icon) {
      case '✦':
        return (
          <Svg width={iconSize} height={iconSize} viewBox="0 0 64 64">
            <Path d="M32,6 L32,58" stroke={color} strokeWidth={strokeWidth * 1.5} strokeLinecap="round" />
            <Path d="M6,32 L58,32" stroke={color} strokeWidth={strokeWidth * 1.5} strokeLinecap="round" />
            <Path d="M14,14 L50,50" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Path d="M50,14 L14,50" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
            <Path d="M52,10 L52,14" stroke={color} strokeWidth={strokeWidth * 0.8} strokeLinecap="round" />
            <Path d="M50,12 L54,12" stroke={color} strokeWidth={strokeWidth * 0.8} strokeLinecap="round" />
            <Circle cx="14" cy="54" r={strokeWidth * 0.8} fill={color} />
          </Svg>
        );
      case '◇':
        return (
          <Svg width={iconSize} height={iconSize} viewBox="0 0 64 64">
            <Circle cx="32" cy="32" r="26" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <Path d="M32,12 L38,32 L32,52 L26,32 Z" stroke={color} strokeWidth={strokeWidth} fill="none" />
          </Svg>
        );
      case '⊞':
        return (
          <Svg width={iconSize} height={iconSize} viewBox="0 0 64 64">
            <Path d="M12,16 L52,16 L52,52 L12,52 Z" stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinejoin="round" />
            <Path d="M22,16 L22,52" stroke={color} strokeWidth={strokeWidth} />
            <Path d="M32,16 L32,52" stroke={color} strokeWidth={strokeWidth} />
            <Path d="M42,16 L42,52" stroke={color} strokeWidth={strokeWidth} />
            <Path d="M22,16 L22,12 C22,10 24,8 28,8 L36,8 C40,8 42,10 42,12 L42,16" stroke={color} strokeWidth={strokeWidth} fill="none" />
          </Svg>
        );
      case '☰':
        return (
          <Svg width={iconSize} height={iconSize} viewBox="0 0 64 64">
            <Path d="M10,18 L24,12 L40,18 L54,12 L54,48 L40,54 L24,48 L10,54 Z" stroke={color} strokeWidth={strokeWidth} fill="none" strokeLinejoin="round" />
            <Path d="M24,12 L24,48" stroke={color} strokeWidth={strokeWidth} />
            <Path d="M40,18 L40,54" stroke={color} strokeWidth={strokeWidth} />
          </Svg>
        );
      case '🏆':
        return (
          <Svg width={iconSize} height={iconSize} viewBox="0 0 64 64">
            <Path d="M20,12 L44,12 L42,32 C42,38 38,42 32,42 C26,42 22,38 22,32 Z" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <Path d="M20,16 C14,16 10,18 10,22 C10,26 14,28 20,28" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <Path d="M44,16 C50,16 54,18 54,22 C54,26 50,28 44,28" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <Path d="M32,42 L32,50" stroke={color} strokeWidth={strokeWidth} />
            <Path d="M22,50 L42,50 L40,56 L24,56 Z" stroke={color} strokeWidth={strokeWidth} fill="none" />
          </Svg>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { width: size * 1.4, height: size * 1.4 }]}>
      <View style={[styles.iconWrap, { width: size, height: size }]}>{renderIcon()}</View>

      {/* 궤도 궤적 (점선 원) */}
      <View
        style={[
          styles.orbitTrack,
          {
            width: orbitRadius * 2,
            height: orbitRadius * 2,
            borderRadius: orbitRadius,
            borderColor: color + '40',
          },
        ]}
      />

      {/* 공전하는 작은 원 (지구처럼) */}
      <Animated.View
        style={[
          styles.orbitWrapper,
          {
            width: orbitRadius * 2,
            height: orbitRadius * 2,
            transform: [{ rotate: orbitRotation }],
          },
        ]}
      >
        <View
          style={[
            styles.orbitDot,
            {
              width: orbitDotSize,
              height: orbitDotSize,
              borderRadius: orbitDotSize / 2,
              backgroundColor: color,
              top: -orbitDotSize / 2,
              left: orbitRadius - orbitDotSize / 2,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
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
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
});
