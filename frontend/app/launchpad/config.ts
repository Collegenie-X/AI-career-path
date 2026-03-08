import { Rocket, BookOpen, Zap, Video, School, Flame, Search, Map, Trophy, Users, GraduationCap } from 'lucide-react';

/* ─────────────────────────────────────────────────
 *  상위 탭
 * ───────────────────────────────────────────────── */
export type LaunchpadTabId = 'explore' | 'community' | 'my';

export const LAUNCHPAD_TABS: { id: LaunchpadTabId; label: string; emoji: string }[] = [
  { id: 'explore',   label: '탐색',       emoji: '🔍' },
  { id: 'community', label: '커뮤니티',   emoji: '👥' },
  { id: 'my',        label: '내 런치패드', emoji: '🚀' },
];

/* ─────────────────────────────────────────────────
 *  커뮤니티 서브탭
 * ───────────────────────────────────────────────── */
export type CommunitySubTab = 'school' | 'groups';

export const COMMUNITY_SUB_TABS: { id: CommunitySubTab; label: string; emoji: string }[] = [
  { id: 'school', label: '학교 동아리', emoji: '🏫' },
  { id: 'groups', label: '그룹',       emoji: '👥' },
];

/* ─────────────────────────────────────────────────
 *  내 런치패드 서브탭
 * ───────────────────────────────────────────────── */
export type MySubTab = 'joined' | 'owned';

export const MY_SUB_TABS: { id: MySubTab; label: string; icon: typeof Flame }[] = [
  { id: 'joined', label: '참여 중',     icon: Flame },
  { id: 'owned',  label: '내가 만든 것', icon: Rocket },
];

/* ─────────────────────────────────────────────────
 *  UI 라벨
 * ───────────────────────────────────────────────── */
export const LAUNCHPAD_LABELS = {
  title: '런치패드',
  subtitle: '커리어를 함께 실행하는 공간',
  createButton: '+ 런치패드 열기',
  quickCreateButton: '빠른 생성',
  emptyTitle: '아직 런치패드가 없어요',
  emptyDesc: '첫 번째 모임을 열어보세요',
  joinButton: '참여하기',
  cancelButton: '참여 취소',
  fullBadge: '마감',
  myBadge: '내 런치패드',
  joinedBadge: '참여 중',
  zoomJoinButton: 'Zoom 입장',
  clubBadge: '학교 동아리',
  teacherBadge: '진로 교사',
  onlineFirst: '온라인 우선',
  commentPlaceholder: '댓글을 입력하세요...',
  replyPlaceholder: '답글을 입력하세요...',
  commentSubmit: '등록',
  replySubmit: '답글',
  showReplies: '답글 보기',
  hideReplies: '답글 숨기기',
  deleteComment: '삭제',
  schoolRequired: '학교명 필수',
  zoomLinkPlaceholder: 'https://zoom.us/j/...',
  careerPathLink: '커리어 패스에서 가져오기',
  communityEmpty: '아직 등록된 모임이 없어요',
  communityEmptyDesc: '학교 동아리나 그룹을 만들어보세요',
  groupCreateButton: '그룹 만들기',
  groupJoinButton: '그룹 참여',
  groupMemberCount: '멤버',
  onlineBadge: '온라인',
  offlineBadge: '오프라인',
  hybridBadge: '온·오프',

  /* 탐색 전용 */
  exploreHeroTitle: '커리어를 함께',
  exploreHeroHighlight: '실행하는 공간',
  exploreHeroDesc: '진로 탐색 · 커리어 설계 · 공모전 도전 · 자격증 준비 모임을 열거나 참여해보세요',

  /* 커뮤니티 전용 */
  communityHeroTitle: '함께 성장하는',
  communityHeroHighlight: '커뮤니티',
  communityHeroDesc: '같은 목표를 가진 사람들과 지속적으로 활동하는 공간',
} as const;

/* ─────────────────────────────────────────────────
 *  탐색 전용: 모임 유형 (목적 기반)
 *  ─ 개별 모임의 "무엇을 하는가"
 * ───────────────────────────────────────────────── */
export const SESSION_TYPES = {
  career_explore: {
    label: '진로 탐색',
    icon: Search,
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.15)',
    desc: '직업·진로 알아보기, 현직자 토크',
    defaultMode: 'online' as const,
  },
  career_design: {
    label: '커리어 설계',
    icon: Map,
    color: '#6C5CE7',
    bg: 'rgba(108,92,231,0.15)',
    desc: '커리어 패스·로드맵 작성 실습',
    defaultMode: 'online' as const,
  },
  challenge: {
    label: '실행·도전',
    icon: Zap,
    color: '#FBBF24',
    bg: 'rgba(251,191,36,0.15)',
    desc: '공모전·프로젝트 기획 및 실행',
    defaultMode: 'online' as const,
  },
  certification: {
    label: '자격·수상 준비',
    icon: Trophy,
    color: '#22C55E',
    bg: 'rgba(34,197,94,0.15)',
    desc: '자격증 스터디, 포트폴리오 피드백',
    defaultMode: 'online' as const,
  },
} as const;

export type SessionType = keyof typeof SESSION_TYPES;

/* ─────────────────────────────────────────────────
 *  커뮤니티 전용: 그룹 카테고리
 *  ─ 지속 활동 그룹의 "어떤 성격인가"
 * ───────────────────────────────────────────────── */
export const GROUP_CATEGORIES = {
  study:       { label: '스터디',     emoji: '📖', color: '#3B82F6', desc: '함께 학습하고 지식을 나누는 그룹' },
  project:     { label: '프로젝트팀', emoji: '⚡', color: '#FBBF24', desc: '공모전·프로젝트를 함께 실행하는 팀' },
  mentoring:   { label: '멘토링',     emoji: '🎓', color: '#6C5CE7', desc: '선배·현직자에게 조언을 받는 그룹' },
  school_club: { label: '동아리',     emoji: '🏫', color: '#22C55E', desc: '학교 내 진로·커리어 동아리' },
} as const;

export type GroupCategoryKey = keyof typeof GROUP_CATEGORIES;

/* ─────────────────────────────────────────────────
 *  진행 방식 (탐색 · 커뮤니티 공통)
 * ───────────────────────────────────────────────── */
export const MODE_LABELS = {
  online:  { label: '온라인 (Zoom)', color: '#3B82F6', icon: Video,  desc: 'Zoom 링크로 진행' },
  offline: { label: '오프라인',      color: '#22C55E', icon: School, desc: '학교·장소에서 오프라인 진행' },
  hybrid:  { label: '온·오프',       color: '#A855F7', icon: Rocket, desc: 'Zoom + 오프라인 병행' },
} as const;

export type ModeType = keyof typeof MODE_LABELS;

/* ─────────────────────────────────────────────────
 *  탐색 필터 탭
 * ───────────────────────────────────────────────── */
export const FILTER_TABS = [
  { key: 'all',            label: '전체' },
  { key: 'career_explore', label: '진로 탐색' },
  { key: 'career_design',  label: '커리어 설계' },
  { key: 'challenge',      label: '실행·도전' },
  { key: 'certification',  label: '자격·수상' },
] as const;

export type FilterKey = typeof FILTER_TABS[number]['key'];

/* ─────────────────────────────────────────────────
 *  목적 태그 (모임 생성 시 필수 선택, 1개 이상)
 * ───────────────────────────────────────────────── */
export const PURPOSE_TAGS = [
  { key: 'career_planning', label: '커리어 기획',   emoji: '🗺️' },
  { key: 'project',         label: '프로젝트',      emoji: '🚀' },
  { key: 'certification',   label: '자격증',        emoji: '📜' },
  { key: 'award',           label: '수상·공모전',   emoji: '🏆' },
  { key: 'portfolio',       label: '포트폴리오',    emoji: '📁' },
  { key: 'networking',      label: '네트워킹',      emoji: '🤝' },
  { key: 'job_talk',        label: '직업인 토크',   emoji: '🎤' },
  { key: 'study',           label: '스터디',        emoji: '📖' },
] as const;

export type PurposeTagKey = typeof PURPOSE_TAGS[number]['key'];

/* ─────────────────────────────────────────────────
 *  학교 목록
 * ───────────────────────────────────────────────── */
export const SCHOOL_LIST = [
  '서울중학교', '강남중학교', '신도림중학교', '미래중학교', '한빛중학교',
  '서울고등학교', '강남고등학교', '과학고등학교', '외국어고등학교', '자율형사립고등학교',
  '경기고등학교', '인천중학교', '부산고등학교', '대구중학교', '광주고등학교',
  '기타 학교 직접 입력',
] as const;

/* ─────────────────────────────────────────────────
 *  빠른 생성 템플릿 (탐색 전용)
 * ───────────────────────────────────────────────── */
export const CAREER_PATH_QUICK_TEMPLATES = [
  {
    id: 'cp-it',
    label: 'IT/개발 진로 탐색',
    emoji: '💻',
    sessionTitle: 'IT 개발자 진로 탐색 Zoom 모임',
    type: 'career_explore' as SessionType,
    mode: 'online' as ModeType,
    description: 'IT 개발자 진로에 대해 함께 탐색하는 온라인 모임',
    purposeTags: ['career_planning', 'job_talk'] as PurposeTagKey[],
    agenda: [
      '개발자 직무 소개 및 로드맵 공유 (20분)',
      '코딩 공부 시작하는 법 (15분)',
      '포트폴리오 준비 팁 (15분)',
      'Q&A 및 커리어 패스 리뷰 (10분)',
    ],
    tags: ['IT', '개발', '커리어'],
  },
  {
    id: 'cp-design',
    label: '디자인 커리어 설계',
    emoji: '🎨',
    sessionTitle: '디자이너 커리어 설계 Zoom 모임',
    type: 'career_design' as SessionType,
    mode: 'online' as ModeType,
    description: '디자인 분야 커리어 패스를 함께 작성하는 실습 모임',
    purposeTags: ['career_planning', 'portfolio'] as PurposeTagKey[],
    agenda: [
      'UX/UI 디자이너 직무 소개 (15분)',
      '디자인 툴 로드맵 작성 (20분)',
      '포트폴리오 구성 실습 (20분)',
      '커리어 패스 공유 및 피드백 (5분)',
    ],
    tags: ['디자인', 'UX/UI', '포트폴리오'],
  },
  {
    id: 'cp-science',
    label: '이공계 진로 탐색',
    emoji: '🔬',
    sessionTitle: '이공계 진로 탐색 모임',
    type: 'career_explore' as SessionType,
    mode: 'online' as ModeType,
    description: '과학·공학 분야 진로를 Zoom으로 함께 탐색합니다',
    purposeTags: ['career_planning', 'job_talk'] as PurposeTagKey[],
    agenda: [
      '이공계 직업 종류 및 특징 (20분)',
      '대학 진학 전략 (15분)',
      '수학·과학 선행 학습 가이드 (15분)',
      'Q&A (10분)',
    ],
    tags: ['이공계', '과학', '진로탐색'],
  },
  {
    id: 'cp-contest',
    label: '공모전 도전',
    emoji: '🏆',
    sessionTitle: '공모전 준비 프로젝트 모임 (Zoom)',
    type: 'challenge' as SessionType,
    mode: 'online' as ModeType,
    description: '공모전 참가를 목표로 함께 기획하고 실행하는 모임',
    purposeTags: ['award', 'project'] as PurposeTagKey[],
    agenda: [
      '참여 공모전 선정 및 팀 구성 (15분)',
      '아이디어 브레인스토밍 (20분)',
      '역할 분담 및 주간 목표 설정 (15분)',
      '다음 모임 일정 확인 (10분)',
    ],
    tags: ['공모전', '프로젝트', '수상'],
  },
  {
    id: 'cp-cert',
    label: '자격증 스터디',
    emoji: '📜',
    sessionTitle: '자격증 준비 스터디 모임',
    type: 'certification' as SessionType,
    mode: 'online' as ModeType,
    description: '목표 자격증을 함께 준비하는 온라인 스터디 모임',
    purposeTags: ['certification', 'study'] as PurposeTagKey[],
    agenda: [
      '각자 학습 진도 공유 (15분)',
      '핵심 개념 정리 및 질의응답 (25분)',
      '모의 문제 풀이 (15분)',
      '다음 주 학습 범위 설정 (5분)',
    ],
    tags: ['자격증', '스터디', '시험준비'],
  },
  {
    id: 'cp-club',
    label: '학교 동아리 활동',
    emoji: '🏫',
    sessionTitle: '학교 진로 동아리 모임',
    type: 'career_design' as SessionType,
    mode: 'offline' as ModeType,
    description: '학교 내 진로 동아리 정기 모임',
    purposeTags: ['career_planning'] as PurposeTagKey[],
    agenda: [
      '진로 관련 활동 공유 (20분)',
      '커리어 패스 업데이트 (30분)',
      '다음 활동 계획 수립 (20분)',
    ],
    tags: ['동아리', '학교', '진로'],
  },
] as const;
