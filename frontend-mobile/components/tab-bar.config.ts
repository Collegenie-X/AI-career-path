import { Home, Briefcase, Map, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type BottomNavigationTabItem = {
  readonly id: string;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly path: string;
};

export const BOTTOM_NAVIGATION_TABS: readonly BottomNavigationTabItem[] = [
  { id: 'home', label: '홈', icon: Home, path: '/home' },
  { id: 'jobs', label: '커리어 경험', icon: Briefcase, path: '/jobs/explore' },
  { id: 'career', label: '커리어 패스', icon: Map, path: '/career' },
  { id: 'dreammate', label: '커리어 실행', icon: Users, path: '/dreammate' },
] as const;
