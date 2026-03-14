/** 단일 공유 채널 단위 */
export type ShareChannel = 'public' | 'school' | 'group';

/**
 * 공유 상태 전체를 표현하는 타입.
 * - private: 비공개 (channels 없음)
 * - channels: 전체/학교/그룹 중 하나 이상 멀티 선택
 */
export type ShareType = 'private' | 'public' | 'school' | 'group';

/** 하위 호환: 기존 'operator' 값을 'school'로 정규화 */
export function normalizeShareType(raw: string): ShareType {
  if (raw === 'operator') return 'school';
  if (raw === 'private' || raw === 'public' || raw === 'school' || raw === 'group') return raw;
  return 'public';
}

/** 선택된 채널 목록으로 대표 ShareType 결정 (하위 호환용) */
export function channelsToShareType(channels: ShareChannel[]): ShareType {
  if (channels.length === 0) return 'private';
  if (channels.includes('public')) return 'public';
  if (channels.includes('school')) return 'school';
  return 'group';
}

export type CommentAuthorRole = 'operator' | 'peer';

export type PlanItemType = 'activity' | 'award' | 'portfolio' | 'certification';

export interface OperatorComment {
  id: string;
  parentId?: string; // 없으면 최상위 댓글, 있으면 대댓글(답글)
  authorId: string;
  authorName: string;
  authorEmoji: string;
  authorRole: CommentAuthorRole;
  content: string;
  createdAt: string;
}

/** 댓글 트리 노드 (대댓글 포함) */
export interface OperatorCommentNode extends OperatorComment {
  replies: OperatorCommentNode[];
}

/** 활동 하위의 작은 실행 단위 */
export interface SharedPlanSubItem {
  id: string;
  title: string;
  done?: boolean;
  url?: string;
  description?: string;
}

export interface SharedPlanItem {
  id: string;
  type: PlanItemType;
  title: string;
  month: number;
  difficulty: number;
  cost?: string;
  organizer?: string;
  url?: string;
  description?: string;
  /** 이 활동을 구성하는 하위 실행 항목들 */
  subItems?: SharedPlanSubItem[];
}

/** 목표 하나 + 그 목표에 연결된 세부 활동 그룹 */
export interface SharedPlanGoalGroup {
  goal: string;
  items: SharedPlanItem[];
}

export interface SharedPlanYear {
  gradeId: string;
  gradeLabel: string;
  /** 목표-활동 그룹핑 (신규 구조) */
  goalGroups?: SharedPlanGoalGroup[];
  /** 하위 호환: 그룹핑 없는 단순 목표 목록 */
  goals: string[];
  /** 하위 호환: 그룹핑 없는 단순 활동 목록 */
  items: SharedPlanItem[];
}

export interface SharedPlan {
  id: string;
  planId: string;
  ownerId: string;
  ownerName: string;
  ownerEmoji: string;
  ownerGrade: string;
  schoolId: string;
  shareType: ShareType;
  title: string;
  description?: string;
  jobEmoji: string;
  jobName: string;
  starName: string;
  starEmoji: string;
  starColor: string;
  yearCount: number;
  itemCount: number;
  sharedAt: string;
  updatedAt?: string; // 없으면 sharedAt 사용. 코멘트·수정 시 갱신
  likes: number;
  bookmarks: number;
  years: SharedPlanYear[];
  operatorComments: OperatorComment[];
  groupIds: string[];
  tags?: string[];
}

export interface UserReactionState {
  likedPlanIds: string[];
  bookmarkedPlanIds: string[];
}

export type GroupMemberRole = 'creator' | 'member' | 'operator';

export interface GroupMember {
  id: string;
  name: string;
  emoji: string;
  grade: string;
  joinedAt: string;
  role?: GroupMemberRole;
}

export interface CommunityGroup {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  creatorId: string;
  creatorName: string;
  memberCount: number;
  members: GroupMember[];
  sharedPlanCount: number;
  inviteCode?: string;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
  isOperatorTest?: boolean;  // 운영자 UI 테스트용 그룹
}

export interface School {
  id: string;
  name: string;
  code: string;
  operatorId: string;
  operatorName: string;
  operatorEmoji: string;
  grades: string[];
  memberCount: number;
  description?: string;
  createdAt: string;
  updatedAt?: string; // 학교 공간 전체 최신 활동 시각
}
