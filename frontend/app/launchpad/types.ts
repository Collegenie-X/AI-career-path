import type { SessionType, ModeType, PurposeTagKey, GroupCategoryKey } from './config';

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

/* ─────────────────────────────────────────────────
 *  탐색 모임 (개별 세션)
 *  ─ groupId 가 있으면 커뮤니티 그룹 소속 모임
 *  ─ groupId 가 없으면 탐색 탭에만 노출되는 독립 모임
 * ───────────────────────────────────────────────── */
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
  purposeTags: PurposeTagKey[];
  groupId?: string;
  maxParticipants: number;
  currentParticipants: number;
  hostName: string;
  tags: string[];
  resources: Resource[];
  createdAt: string;
};

/* ─────────────────────────────────────────────────
 *  커뮤니티: 학교 동아리
 * ───────────────────────────────────────────────── */
export type SchoolClub = {
  id: string;
  code?: string;
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

/* ─────────────────────────────────────────────────
 *  커뮤니티: 그룹
 * ───────────────────────────────────────────────── */
export type LaunchpadGroup = {
  id: string;
  inviteCode?: string;
  name: string;
  description: string;
  category: GroupCategoryKey;
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
