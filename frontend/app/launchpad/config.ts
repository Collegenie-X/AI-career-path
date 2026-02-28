import { Rocket, BookOpen, Zap, Video, School } from 'lucide-react';

export const LAUNCHPAD_LABELS = {
  title: '런치패드',
  subtitle: '커리어를 함께 실행하는 공간',
  createButton: '+ 런치패드 열기',
  quickCreateButton: '빠른 생성',
  emptyTitle: '아직 런치패드가 없어요',
  emptyDesc: '첫 번째 세미나나 실행 모임을 열어보세요',
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
} as const;

export const SESSION_TYPES = {
  seminar: {
    label: '세미나',
    icon: BookOpen,
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.15)',
    desc: '직업·진로 관련 강연 및 토크',
    defaultMode: 'online' as const,
  },
  career_workshop: {
    label: '커리어 워크숍',
    icon: Rocket,
    color: '#6C5CE7',
    bg: 'rgba(108,92,231,0.15)',
    desc: '커리어 패스 작성 및 로드맵 설계',
    defaultMode: 'online' as const,
  },
  project_group: {
    label: '프로젝트 실행',
    icon: Zap,
    color: '#FBBF24',
    bg: 'rgba(251,191,36,0.15)',
    desc: '공모전·프로젝트 함께 실행',
    defaultMode: 'online' as const,
  },
} as const;

export type SessionType = keyof typeof SESSION_TYPES;

export const MODE_LABELS = {
  online:  { label: '온라인 (Zoom)', color: '#3B82F6', icon: Video,  desc: 'Zoom 링크로 진행' },
  offline: { label: '학교 동아리',   color: '#22C55E', icon: School, desc: '학교 내 오프라인 동아리 활동' },
  hybrid:  { label: '온·오프',       color: '#A855F7', icon: Rocket, desc: 'Zoom + 오프라인 병행' },
} as const;

export type ModeType = keyof typeof MODE_LABELS;

export const FILTER_TABS = [
  { key: 'all',             label: '전체' },
  { key: 'seminar',         label: '세미나' },
  { key: 'career_workshop', label: '커리어 워크숍' },
  { key: 'project_group',   label: '프로젝트 실행' },
] as const;

export type FilterKey = typeof FILTER_TABS[number]['key'];

export const SCHOOL_LIST = [
  '서울중학교', '강남중학교', '신도림중학교', '미래중학교', '한빛중학교',
  '서울고등학교', '강남고등학교', '과학고등학교', '외국어고등학교', '자율형사립고등학교',
  '경기고등학교', '인천중학교', '부산고등학교', '대구중학교', '광주고등학교',
  '기타 학교 직접 입력',
] as const;

export const CAREER_PATH_QUICK_TEMPLATES = [
  {
    id: 'cp-it',
    label: 'IT/개발 커리어',
    emoji: '💻',
    sessionTitle: 'IT 커리어 탐색 Zoom 세미나',
    type: 'seminar' as SessionType,
    mode: 'online' as ModeType,
    description: 'IT 개발자 진로에 대해 함께 탐색하는 온라인 세미나',
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
    label: '디자인 커리어',
    emoji: '🎨',
    sessionTitle: '디자이너 커리어 워크숍 (Zoom)',
    type: 'career_workshop' as SessionType,
    mode: 'online' as ModeType,
    description: '디자인 분야 커리어 패스를 함께 작성하는 워크숍',
    agenda: [
      'UX/UI 디자이너 직무 소개 (15분)',
      '디자인 툴 로드맵 작성 (20분)',
      '포트폴리오 구성 실습 (20분)',
      '커리어 패스 공유 및 피드백 (5분)',
    ],
    tags: ['디자인', 'UX/UI', '워크숍'],
  },
  {
    id: 'cp-science',
    label: '이공계 진로',
    emoji: '🔬',
    sessionTitle: '이공계 진로 탐색 세미나',
    type: 'seminar' as SessionType,
    mode: 'online' as ModeType,
    description: '과학·공학 분야 진로를 Zoom으로 함께 탐색합니다',
    agenda: [
      '이공계 직업 종류 및 특징 (20분)',
      '대학 진학 전략 (15분)',
      '수학·과학 선행 학습 가이드 (15분)',
      'Q&A (10분)',
    ],
    tags: ['이공계', '과학', '진로탐색'],
  },
  {
    id: 'cp-business',
    label: '경영·경제 커리어',
    emoji: '📊',
    sessionTitle: '경영·창업 커리어 워크숍',
    type: 'career_workshop' as SessionType,
    mode: 'online' as ModeType,
    description: '경영·경제·창업 진로를 함께 설계하는 온라인 워크숍',
    agenda: [
      '경영·경제 직무 소개 (15분)',
      '창업 아이디어 발굴 (20분)',
      '비즈니스 로드맵 작성 (20분)',
      '피드백 및 커리어 패스 정리 (5분)',
    ],
    tags: ['경영', '창업', '비즈니스'],
  },
  {
    id: 'cp-art',
    label: '예술·문화 커리어',
    emoji: '🎭',
    sessionTitle: '예술·문화 진로 탐색 Zoom 세션',
    type: 'seminar' as SessionType,
    mode: 'online' as ModeType,
    description: '예술·음악·영상·공연 분야 진로를 온라인으로 탐색합니다',
    agenda: [
      '예술계 직업 소개 (15분)',
      '전문학교 vs 일반대학 진로 (15분)',
      '포트폴리오 및 오디션 준비 (20분)',
      'Q&A (10분)',
    ],
    tags: ['예술', '문화', '진로'],
  },
  {
    id: 'cp-club',
    label: '학교 동아리 활동',
    emoji: '🏫',
    sessionTitle: '학교 진로 동아리 모임',
    type: 'career_workshop' as SessionType,
    mode: 'offline' as ModeType,
    description: '학교 내 진로 동아리 정기 모임',
    agenda: [
      '진로 관련 활동 공유 (20분)',
      '커리어 패스 업데이트 (30분)',
      '다음 활동 계획 수립 (20분)',
    ],
    tags: ['동아리', '학교', '진로'],
  },
] as const;
