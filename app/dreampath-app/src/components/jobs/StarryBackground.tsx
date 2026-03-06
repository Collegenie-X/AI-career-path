import React, { useEffect, useRef, useMemo } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface StarDot {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: Animated.Value;
  duration: number;
  delay: number;
}

const STAR_COUNT = 80;

function generateStars(): StarDot[] {
  return Array.from({ length: STAR_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * SCREEN_WIDTH,
    y: Math.random() * SCREEN_HEIGHT,
    size: Math.random() < 0.15 ? 2.5 : Math.random() < 0.4 ? 1.8 : 1.2,
    opacity: new Animated.Value(Math.random() * 0.4 + 0.1),
    duration: Math.random() * 2500 + 1500,
    delay: Math.random() * 3000,
  }));
}

function StarDotItem({ star }: { star: StarDot }) {
  useEffect(() => {
    const twinkle = () => {
      const targetOpacity = Math.random() * 0.7 + 0.15;
      Animated.sequence([
        Animated.timing(star.opacity, {
          toValue: targetOpacity,
          duration: star.duration,
          delay: star.delay,
          useNativeDriver: true,
        }),
        Animated.timing(star.opacity, {
          toValue: Math.random() * 0.2 + 0.05,
          duration: star.duration * 0.8,
          useNativeDriver: true,
        }),
      ]).start(() => twinkle());
    };
    twinkle();
  }, []);

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: star.x,
          top: star.y,
          width: star.size,
          height: star.size,
          borderRadius: star.size / 2,
          opacity: star.opacity,
        },
      ]}
    />
  );
}

export function StarryBackground() {
  const stars = useMemo(() => generateStars(), []);

  return (
    <View style={styles.container} pointerEvents="none">
      {stars.map((star) => (
        <StarDotItem key={star.id} star={star} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
  },
});
