export type ShareType = 'public' | 'operator';

export type CommentAuthorRole = 'operator' | 'peer';

export type PlanItemType = 'activity' | 'award' | 'portfolio' | 'certification';

export interface OperatorComment {
  id: string;
  authorId: string;
  authorName: string;
  authorEmoji: string;
  authorRole: CommentAuthorRole;
  content: string;
  createdAt: string;
}

export interface SharedPlanItem {
  id: string;
  type: PlanItemType;
  title: string;
  month: number;
  difficulty: number;
  cost?: string;
  organizer?: string;
}

export interface SharedPlanYear {
  gradeId: string;
  gradeLabel: string;
  goals: string[];
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
  jobEmoji: string;
  jobName: string;
  starName: string;
  starEmoji: string;
  starColor: string;
  yearCount: number;
  itemCount: number;
  sharedAt: string;
  likes: number;
  bookmarks: number;
  years: SharedPlanYear[];
  operatorComments: OperatorComment[];
  groupIds: string[];
}

export interface UserReactionState {
  likedPlanIds: string[];
  bookmarkedPlanIds: string[];
}

export interface GroupMember {
  id: string;
  name: string;
  emoji: string;
  grade: string;
  joinedAt: string;
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
  createdAt: string;
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
  createdAt: string;
}
