import type {
  CareerGroupCategoryId,
  CareerGroupModeId,
} from '@/app/career/config/communityGroupForm';

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
  /** 계획 단계에서 정한 이 주차의 산출물·사진 (포트폴리오 근거). 템플릿의 weeklyGoals[].output에서 옴 */
  plannedOutput?: string;
  /** 실행 중 작성한 진행 메모 또는 업무 기록 */
  note?: string;
  /** 완료 후 산출물 링크 또는 파일명 (예: "탐구계획서_v1.pdf", "https://github.com/...") */
  outputRef?: string;
  /** 산출물 전체 내용 컨텐츠 (글·설명 등 텍스트 본문) — 산출물 입력란의 "내용" */
  outputContent?: string;
  /** 이 주차 결과물 사진 (data URL 또는 이미지 링크) — 포트폴리오 갤러리에 모임 */
  outputImageUrl?: string;
  /** 완료 후 회고 (잘된 점·개선점·다음 주 반영 사항) */
  reviewNote?: string;
  /** 목표별 Jira 스타일 코멘트 스레드 (진짜 문제·바뀐 변화 등을 시간순으로 기록) */
  comments?: RoadmapGoalComment[];
  /** 목표(goal)의 Jira식 진행 상태. entryType === 'goal'에서만 사용. 미지정 시 'todo'로 간주 */
  goalStatus?: RoadmapGoalStatus;
}

/** 주차 목표의 Jira식 진행 상태 — 할 일 / 진행 중 / 완료 / 막힘 */
export type RoadmapGoalStatus = 'todo' | 'inprogress' | 'done' | 'blocked';

/** 목표 코멘트 종류 — 진짜 문제·바뀐 변화를 우선으로 추적. 'status'는 상태 변경 자동 기록 */
export type RoadmapGoalCommentKind =
  | 'problem'
  | 'change'
  | 'debug'
  | 'progress'
  | 'reflection'
  | 'note'
  | 'status';

/** 주차 목표에 시간순으로 쌓이는 코멘트 한 건 */
export interface RoadmapGoalComment {
  id: string;
  kind: RoadmapGoalCommentKind;
  body: string;
  createdAt: string;
  /** kind === 'status'일 때 상태 전이(이전→이후) 자동 기록용 */
  statusFrom?: RoadmapGoalStatus;
  statusTo?: RoadmapGoalStatus;
}

export type RoadmapShareScope = 'private' | 'public' | 'space';

/** 공유 채널 (전체 공유, 그룹 공유). 비공개 시 빈 배열. */
export type RoadmapShareChannel = 'public' | 'space';

export interface RoadmapMilestoneResult {
  id: string;
  title: string;
  description?: string;
  monthWeekLabel?: string;
  timeLog?: string;
  resultUrl?: string;
  imageUrl?: string;
  recordedAt?: string;
}

export interface SharedRoadmap {
  id: string;
  /** 공유 행 PK — 댓글·좋아요·공유 설정 API (`shared-dream-roadmaps`) */
  sharedDreamRoadmapId?: string;
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
  /** 멀티 선택: ['public','space'] 가능. 빈 배열 = 비공개. */
  shareChannels?: RoadmapShareChannel[];
  items: RoadmapItem[];
  finalResultTitle?: string;
  finalResultDescription?: string;
  finalResultUrl?: string;
  finalResultImageUrl?: string;
  milestoneResults?: RoadmapMilestoneResult[];
  groupIds: string[];
  likes: number;
  bookmarks: number;
  /** 백엔드 피드 — 현재 사용자 좋아요 여부 */
  likedByMe?: boolean;
  /** 백엔드 피드 — 현재 사용자 북마크 여부 */
  bookmarkedByMe?: boolean;
  /** 조회 수 — 백엔드 `SharedDreamRoadmap.view_count`와 대응 */
  viewCount?: number;
  /** 댓글 수(집계) — 백엔드 `comment_count` (UI `comments` 배열과 별개일 수 있음) */
  commentCount?: number;
  /** 신고 수 — 백엔드 `report_count` (career_path.SharedPlan 과 동일 패턴) */
  reportCount?: number;
  sharedAt: string;
  comments: RoadmapComment[];
}

/** shareChannels가 있으면 사용, 없으면 shareScope에서 변환 (하위 호환) */
export function getShareChannelsFromRoadmap(roadmap: SharedRoadmap): RoadmapShareChannel[] {
  if (roadmap.shareChannels && roadmap.shareChannels.length > 0) return roadmap.shareChannels;
  const scope = roadmap.shareScope ?? 'private';
  if (scope === 'public') return ['public'];
  if (scope === 'space') return ['space'];
  return [];
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
  authorId?: string;
  resourceUrl?: string;
  attachmentFileName?: string;
  attachmentFileType?: 'md' | 'pdf';
  attachmentMarkdownContent?: string;
  attachmentDataUrl?: string;
  authorName: string;
  authorEmoji: string;
  authorGrade: string;
  tags: string[];
  likes: number;
  bookmarks: number;
  createdAt: string;
}

export interface DreamResourceComment {
  id: string;
  resourceId: string;
  authorId: string;
  authorName: string;
  authorEmoji: string;
  content: string;
  createdAt: string;
}

export interface DreamResourceReportRecord {
  id: string;
  resourceId: string;
  reasonId: string;
  detail: string;
  reportedByUserId: string;
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
  /** 커리어 패스 그룹 생성 폼과 동일 — 최대 인원(슬라이더) */
  maxMembers?: number;
  groupCategory?: CareerGroupCategoryId;
  groupMode?: CareerGroupModeId;
  /** 목록 공개(그룹 폼 토글) — 비공개 시 초대 위주 UX에 사용 */
  isPublic?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type DreamTabId = 'feed' | 'library' | 'space' | 'my' | 'portfolio';

export interface UserDreamReactions {
  likedRoadmapIds: string[];
  bookmarkedRoadmapIds: string[];
  likedResourceIds: string[];
  bookmarkedResourceIds: string[];
}
