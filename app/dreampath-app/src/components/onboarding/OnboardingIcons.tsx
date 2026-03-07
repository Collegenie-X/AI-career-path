import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

/**
 * Lucide 스타일 아이콘 SVG (원본 참조)
 * viewBox 24x24, stroke 기반
 */
const ICON_SIZE = 56;
const STROKE = 1.8;

export function SparklesIcon({ color = '#fff', size = ICON_SIZE }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M12 3l1.5 4.5a1.5 1.5 0 0 0 1 1l4.5 1.5-4.5 1.5a1.5 1.5 0 0 0-1 1L12 21l-1.5-4.5a1.5 1.5 0 0 0-1-1L5 14l4.5-1.5a1.5 1.5 0 0 0 1-1L12 3z" />
    </Svg>
  );
}

export function CompassIcon({ color = '#fff', size = ICON_SIZE }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round">
      <Circle cx="12" cy="12" r="10" />
      <Path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
    </Svg>
  );
}

export function BriefcaseIcon({ color = '#fff', size = ICON_SIZE }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <Path d="M20 8H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2Z" />
      <Path d="M12 12v.01" />
    </Svg>
  );
}

export function MapIcon({ color = '#fff', size = ICON_SIZE }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round">
      <Path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3z" />
      <Path d="M9 3v15" />
      <Path d="M15 6v15" />
    </Svg>
  );
}

export function TrophyIcon({ color = '#fff', size = ICON_SIZE }: { color?: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <Path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <Path d="M4 22h16" />
      <Path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <Path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <Path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </Svg>
  );
}

const ICON_MAP: Record<string, React.ComponentType<{ color?: string; size?: number }>> = {
  '✦': SparklesIcon,
  '◇': CompassIcon,
  '⊞': BriefcaseIcon,
  '☰': MapIcon,
  '🏆': TrophyIcon,
};

export function OnboardingIcon({ icon, color = '#fff', size = ICON_SIZE }: { icon: string; color?: string; size?: number }) {
  const IconComponent = ICON_MAP[icon] ?? SparklesIcon;
  return <IconComponent color={color} size={size} />;
}
