import { Rocket, BookOpen, Users, Zap } from 'lucide-react';

export const LAUNCHPAD_LABELS = {
  title: '런치패드',
  subtitle: '커리어를 함께 실행하는 공간',
  createButton: '+ 런치패드 열기',
  emptyTitle: '아직 런치패드가 없어요',
  emptyDesc: '첫 번째 세미나나 실행 모임을 열어보세요',
  joinButton: '참여하기',
  cancelButton: '참여 취소',
  fullBadge: '마감',
  myBadge: '내 런치패드',
  joinedBadge: '참여 중',
};

export const SESSION_TYPES = {
  seminar: {
    label: '세미나',
    icon: BookOpen,
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.15)',
    desc: '직업·진로 관련 강연 및 토크',
  },
  career_workshop: {
    label: '커리어 워크숍',
    icon: Rocket,
    color: '#6C5CE7',
    bg: 'rgba(108,92,231,0.15)',
    desc: '커리어 패스 작성 및 로드맵 설계',
  },
  project_group: {
    label: '프로젝트 실행',
    icon: Zap,
    color: '#FBBF24',
    bg: 'rgba(251,191,36,0.15)',
    desc: '공모전·프로젝트 함께 실행',
  },
} as const;

export type SessionType = keyof typeof SESSION_TYPES;

export const MODE_LABELS = {
  offline: { label: '오프라인', color: '#22C55E' },
  online:  { label: '온라인',   color: '#3B82F6' },
  hybrid:  { label: '온·오프',  color: '#A855F7' },
} as const;

export type ModeType = keyof typeof MODE_LABELS;

export const FILTER_TABS = [
  { key: 'all',             label: '전체' },
  { key: 'seminar',         label: '세미나' },
  { key: 'career_workshop', label: '커리어 워크숍' },
  { key: 'project_group',   label: '프로젝트 실행' },
] as const;

export type FilterKey = typeof FILTER_TABS[number]['key'];
