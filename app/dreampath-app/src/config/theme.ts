export const COLORS = {
  background: '#0B0B1A',
  backgroundLight: '#0a0a16',
  primary: '#6C5CE7',
  primaryLight: '#a29bfe',
  secondary: '#A855F7',
  accent: '#EC4899',

  white: '#FFFFFF',
  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#666680',
  textDim: '#4B5563',

  yellow: '#FBBF24',
  orange: '#FB923C',
  orangeLight: '#FDBA74',
  green: '#22C55E',
  blue: '#3B82F6',
  red: '#EF4444',
  cyan: '#06B6D4',
  purple: '#A855F7',

  cardBackground: 'rgba(255,255,255,0.04)',
  cardBorder: 'rgba(255,255,255,0.08)',
  glassBg: 'rgba(255,255,255,0.08)',
  glassBorder: 'rgba(255,255,255,0.12)',

  riasec: {
    R: '#EF4444',
    I: '#3B82F6',
    A: '#A855F7',
    S: '#22C55E',
    E: '#FBBF24',
    C: '#6B7280',
  } as Record<string, string>,
} as const;

export const GRADIENTS = {
  primary: ['#6C5CE7', '#A855F7'] as const,
  primaryAccent: ['#6C5CE7', '#A855F7', '#EC4899'] as const,
  hero: ['rgba(108,92,231,0.25)', 'rgba(168,85,247,0.15)'] as const,
  careerPath: ['rgba(108,92,231,0.3)', 'rgba(168,85,247,0.2)', 'rgba(236,72,153,0.15)'] as const,
  /** Splash & Onboarding - 로고, 버튼 등에 사용 */
  splashLogo: ['#6C5CE7', '#a29bfe', '#6C5CE7'] as const,
  splashButton: ['#6C5CE7', '#A855F7'] as const,
} as const;

export const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  display: 32,
} as const;

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
} as const;
