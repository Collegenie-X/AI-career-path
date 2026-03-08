import type { SessionType, ModeType } from './config';

export type Resource = {
  id: string;
  title: string;
  url: string;
};

export type AgendaItem = {
  id: string;
  text: string;
};

export type Reply = {
  id: string;
  text: string;
  author: string;
  createdAt: string;
};

export type Comment = {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  replies: Reply[];
};

export type LaunchpadSession = {
  id: string;
  title: string;
  type: SessionType;
  mode: ModeType;
  description: string;
  agenda: AgendaItem[];
  date: string;
  time: string;
  location: string;
  zoomLink?: string;
  schoolName?: string;
  clubName?: string;
  isTeacherCreated?: boolean;
  teacherName?: string;
  careerPathRef?: string;
  maxParticipants: number;
  currentParticipants: number;
  hostName: string;
  tags: string[];
  resources: Resource[];
  createdAt: string;
};

/* ─── 커뮤니티: 학교 동아리 ─── */
export type SchoolClub = {
  id: string;
  schoolName: string;
  clubName: string;
  description: string;
  teacherName?: string;
  memberCount: number;
  maxMembers: number;
  tags: string[];
  meetingSchedule: string;
  sessionIds: string[];
  createdAt: string;
};

/* ─── 커뮤니티: 그룹 ─── */
export type LaunchpadGroup = {
  id: string;
  name: string;
  description: string;
  category: 'study' | 'project' | 'mentoring' | 'free';
  mode: 'online' | 'offline' | 'hybrid';
  emoji: string;
  color: string;
  creatorName: string;
  memberCount: number;
  maxMembers: number;
  tags: string[];
  isPublic: boolean;
  sessionIds: string[];
  createdAt: string;
};

export const GROUP_CATEGORIES = {
  study:     { label: '스터디',   emoji: '📖', color: '#3B82F6' },
  project:   { label: '프로젝트', emoji: '⚡', color: '#FBBF24' },
  mentoring: { label: '멘토링',   emoji: '🎓', color: '#6C5CE7' },
  free:      { label: '자유 모임', emoji: '🌟', color: '#22C55E' },
} as const;
