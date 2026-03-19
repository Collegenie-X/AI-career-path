import { Home, Brain, Briefcase, Map, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type BottomNavigationTabItem = {
  readonly id: string;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly path: string;
  readonly step?: string;
  readonly color?: string;
};

export const BOTTOM_NAVIGATION_TABS: readonly BottomNavigationTabItem[] = [
  // { id: 'home', label: '홈', icon: Home, path: '/home' },
  { id: 'quiz', label: '적성검사', icon: Brain, path: '/quiz/intro', step: '01', color: '#3B82F6' },
  { id: 'jobs', label: '경험', icon: Briefcase, path: '/jobs/explore', step: '02', color: '#A855F7' },
  { id: 'career', label: '패스', icon: Map, path: '/career', step: '03', color: '#22C55E' },
  { id: 'dreammate', label: '실행', icon: Users, path: '/dreammate', step: '04', color: '#FBBF24' },
] as const;
