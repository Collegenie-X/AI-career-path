import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { COLORS } from '../../config/theme';

interface IconWithOrbitProps {
  icon: string;
  color?: string;
  size?: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * SVG 아이콘 + 궤도를 도는 작은 원
 */
export function IconWithOrbit({ icon, color = COLORS.white, size = 64 }: IconWithOrbitProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => animation.stop();
  }, [rotateAnim]);

  const orbitRadius = size * 0.65;
  const centerX = size / 2;
  const centerY = size / 2;

  const orbitX = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, Math.PI * 2],
  });

  const AnimatedOrbitCircle = () => {
    const [x, setX] = React.useState(centerX + orbitRadius);
    const [y, setY] = React.useState(centerY);

    React.useEffect(() => {
      const listener = orbitX.addListener(({ value }) => {
        setX(centerX + orbitRadius * Math.cos(value));
        setY(centerY + orbitRadius * Math.sin(value));
      });
      return () => orbitX.removeListener(listener);
    }, []);

    return <Circle cx={x} cy={y} r={size * 0.06} fill={color} opacity={0.9} />;
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const renderIcon = () => {
    const iconSize = size;
    const strokeWidth = size * 0.06;

    switch (icon) {
      case '✦': // 4각 별
        return (
          <Svg width={iconSize} height={iconSize} viewBox="0 0 64 64">
            {/* 세로 팔 */}
            <Path
              d={`M32,6 L32,58`}
              stroke={color}
              strokeWidth={strokeWidth * 1.5}
              strokeLinecap="round"
            />
            {/* 가로 팔 */}
            <Path
              d={`M6,32 L58,32`}
              stroke={color}
              strokeWidth={strokeWidth * 1.5}
              strokeLinecap="round"
            />
            {/* 대각선 \ */}
            <Path
              d={`M14,14 L50,50`}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            {/* 대각선 / */}
            <Path
              d={`M50,14 L14,50`}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            {/* 우측 상단 + */}
            <Path d={`M52,10 L52,14`} stroke={color} strokeWidth={strokeWidth * 0.8} strokeLinecap="round" />
            <Path d={`M50,12 L54,12`} stroke={color} strokeWidth={strokeWidth * 0.8} strokeLinecap="round" />
            {/* 좌측 하단 원 */}
            <Circle cx="14" cy="54" r={strokeWidth * 0.8} fill={color} />
          </Svg>
        );

      case '◇': // 나침반
        return (
          <Svg width={iconSize} height={iconSize} viewBox="0 0 64 64">
            <Circle cx="32" cy="32" r="26" stroke={color} strokeWidth={strokeWidth} fill="none" />
            <Path
              d={`M32,12 L38,32 L32,52 L26,32 Z`}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
            />
          </Svg>
        );

      case '⊞': // 가방 (사각형 + 세로줄 3개)
        return (
          <Svg width={iconSize} height={iconSize} viewBox="0 0 64 64">
            <Path
              d={`M12,16 L52,16 L52,52 L12,52 Z`}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinejoin="round"
            />
            <Path d={`M22,16 L22,52`} stroke={color} strokeWidth={strokeWidth} />
            <Path d={`M32,16 L32,52`} stroke={color} strokeWidth={strokeWidth} />
            <Path d={`M42,16 L42,52`} stroke={color} strokeWidth={strokeWidth} />
            <Path
              d={`M22,16 L22,12 C22,10 24,8 28,8 L36,8 C40,8 42,10 42,12 L42,16`}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
            />
          </Svg>
        );

      case '☰': // 지도 (펼쳐진 책)
        return (
          <Svg width={iconSize} height={iconSize} viewBox="0 0 64 64">
            <Path
              d={`M10,18 L24,12 L40,18 L54,12 L54,48 L40,54 L24,48 L10,54 Z`}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinejoin="round"
            />
            <Path d={`M24,12 L24,48`} stroke={color} strokeWidth={strokeWidth} />
            <Path d={`M40,18 L40,54`} stroke={color} strokeWidth={strokeWidth} />
          </Svg>
        );

      case '🏆': // 트로피
        return (
          <Svg width={iconSize} height={iconSize} viewBox="0 0 64 64">
            {/* 컵 몸체 */}
            <Path
              d={`M20,12 L44,12 L42,32 C42,38 38,42 32,42 C26,42 22,38 22,32 Z`}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* 손잡이 왼쪽 */}
            <Path
              d={`M20,16 C14,16 10,18 10,22 C10,26 14,28 20,28`}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* 손잡이 오른쪽 */}
            <Path
              d={`M44,16 C50,16 54,18 54,22 C54,26 50,28 44,28`}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
            />
            {/* 받침대 */}
            <Path d={`M32,42 L32,50`} stroke={color} strokeWidth={strokeWidth} />
            <Path
              d={`M22,50 L42,50 L40,56 L24,56 Z`}
              stroke={color}
              strokeWidth={strokeWidth}
              fill="none"
            />
          </Svg>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {renderIcon()}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [{ rotate }],
          },
        ]}
      >
        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
          <AnimatedOrbitCircle />
        </Svg>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
