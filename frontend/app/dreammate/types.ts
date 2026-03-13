export type DreamItemType = 'award' | 'activity' | 'project' | 'paper';

export type PeriodType = 'afterschool' | 'vacation' | 'semester';

export interface RoadmapItem {
  id: string;
  type: DreamItemType;
  title: string;
  months: number[];
  difficulty: number;
  /** 이 항목을 통해 만들어야 할 최종 산출물 (예: "탐구 보고서 PDF", "GitHub 저장소 URL") */
  targetOutput?: string;
  /** 완료 판단 기준 (예: "교사 제출 완료", "대회 접수 확인") */
  successCriteria?: string;
  subItems?: RoadmapTodoItem[];
}

export interface RoadmapTodoItem {
  id: string;
  weekLabel?: string;
  weekNumber?: number;
  entryType?: 'goal' | 'task';
  title: string;
  isDone?: boolean;
  /** 실행 중 작성한 진행 메모 또는 업무 기록 */
  note?: string;
  /** 완료 후 산출물 링크 또는 파일명 (예: "탐구계획서_v1.pdf", "https://github.com/...") */
  outputRef?: string;
  /** 완료 후 회고 (잘된 점·개선점·다음 주 반영 사항) */
  reviewNote?: string;
}

export type RoadmapShareScope = 'private' | 'public' | 'space';

export interface SharedRoadmap {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerEmoji: string;
  ownerGrade: string;
  title: string;
  description: string;
  period: PeriodType;
  starColor: string;
  focusItemTypes?: DreamItemType[];
  shareScope?: RoadmapShareScope;
  items: RoadmapItem[];
  groupIds: string[];
  likes: number;
  bookmarks: number;
  sharedAt: string;
  comments: RoadmapComment[];
}

export interface RoadmapComment {
  id: string;
  parentId?: string;
  authorId?: string;
  authorName: string;
  authorEmoji: string;
  content: string;
  createdAt: string;
}

export interface RoadmapReportRecord {
  id: string;
  roadmapId: string;
  reasonId: string;
  detail: string;
  reportedByUserId: string;
  createdAt: string;
}

export type ResourceCategoryId =
  | 'admission'
  | 'contest'
  | 'project'
  | 'roadmap'
  | 'study'
  | 'portfolio';

export interface DreamResource {
  id: string;
  category: ResourceCategoryId;
  title: string;
  description: string;
  authorName: string;
  authorEmoji: string;
  authorGrade: string;
  tags: string[];
  likes: number;
  bookmarks: number;
  createdAt: string;
}

export type SpaceMemberRole = 'creator' | 'member';

export type SpaceRecruitmentStatus = 'open' | 'closed';

export type SpaceProgramType = 'class' | 'project' | 'mentoring';

export type ParticipationApplicationStatus =
  | 'applied'
  | 'approved'
  | 'confirmed'
  | 'inProgress';

export interface SpaceMember {
  id: string;
  name: string;
  emoji: string;
  grade: string;
  joinedAt: string;
  role?: SpaceMemberRole;
}

export interface SpaceNotice {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  createdByUserId: string;
  createdByName: string;
}

export interface ProjectProposalWeeklyDeliverable {
  weekLabel: string;
  deliverable: string;
}

export interface ProjectProposalTemplate {
  goal: string;
  duration: string;
  weeklyDeliverables: ProjectProposalWeeklyDeliverable[];
  preparations: string[];
  estimatedCost: string;
  participantCapacity: string;
}

export interface SpaceProgramProposal {
  id: string;
  title: string;
  summary: string;
  programType: SpaceProgramType;
  template: ProjectProposalTemplate;
}

export interface SpaceParticipationApplication {
  id: string;
  applicantUserId: string;
  applicantName: string;
  applicantEmoji: string;
  applicantGrade: string;
  message: string;
  appliedAt: string;
  status: ParticipationApplicationStatus;
  approvedAt?: string;
  confirmedAt?: string;
  inProgressAt?: string;
  handledByUserId?: string;
}

export interface DreamSpace {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  creatorId: string;
  creatorName: string;
  memberCount: number;
  members: SpaceMember[];
  sharedRoadmapCount: number;
  recruitmentStatus?: SpaceRecruitmentStatus;
  notices?: SpaceNotice[];
  programProposals?: SpaceProgramProposal[];
  participationApplications?: SpaceParticipationApplication[];
  inviteCode?: string;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
}

export type DreamTabId = 'feed' | 'library' | 'space' | 'my';

export interface UserDreamReactions {
  likedRoadmapIds: string[];
  bookmarkedRoadmapIds: string[];
  likedResourceIds: string[];
  bookmarkedResourceIds: string[];
}
