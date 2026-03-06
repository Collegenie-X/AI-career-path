import React from 'react';
import { View, StyleSheet, type ColorValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type GradientColors = readonly [ColorValue, ColorValue, ...ColorValue[]];

interface GradientBackgroundProps {
  colors: GradientColors;
  style?: object;
  children?: React.ReactNode;
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
}

export function GradientBackground({
  colors,
  style,
  children,
  borderRadius = 0,
  borderColor,
  borderWidth = 0,
}: GradientBackgroundProps) {
  return (
    <View
      style={[
        borderRadius ? { borderRadius } : undefined,
        borderColor ? { borderColor, borderWidth } : undefined,
        { overflow: 'hidden' },
        style,
      ]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}
