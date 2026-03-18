export const RIASEC_META: Record<string, { label: string; color: string; emoji: string; desc: string }> = {
  R: { label: '현실형', color: '#EF4444', emoji: '🔧', desc: '도구로 만들고 고치는 걸 좋아해요' },
  I: { label: '탐구형', color: '#3B82F6', emoji: '🔬', desc: '분석하며 문제 해결을 즐겨요' },
  A: { label: '예술형', color: '#A855F7', emoji: '🎨', desc: '상상력으로 창의적 표현을 해요' },
  S: { label: '사회형', color: '#22C55E', emoji: '🤝', desc: '사람들을 돕고 협력해요' },
  E: { label: '기업형', color: '#FBBF24', emoji: '🚀', desc: '목표를 세우고 실행해요' },
  C: { label: '관습형', color: '#6B7280', emoji: '📋', desc: '체계적으로 정리하고 관리해요' },
};

export const TYPE_CONFIG: Record<string, { label: string; color: string; emoji: string }> = {
  activity: { label: '활동', color: '#3B82F6', emoji: '⚡' },
  award: { label: '수상', color: '#FBBF24', emoji: '🏆' },
  certification: { label: '자격증', color: '#22C55E', emoji: '📜' },
};

export const TAB_LABELS = {
  home: '홈',
  jobs: '드림 경험',
  career: '드림 패스',
  launchpad: '드림 실행',
} as const;

export const HOME_LABELS = {
  xpTitle: '경험치',
  xpRemaining: 'XP 남음',
  nextLevel: '다음 레벨까지',
  careerPath: '내 커리어 패스',
  viewAll: '전체보기',
  careerPathEmpty: {
    title: '나만의 커리어 패스를 만들어봐요!',
    description: '목표 직업을 정하고 🎯\n어떤 활동·수상·자격증이 필요한지 알아봐요',
    cta: '커리어 패스 시작하기',
  },
  careerPathViewAll: '전체 커리어 패스 보기',
  aptitude: '내 적성 유형',
  aptitudeReport: '상세 리포트',
  aptitudeQuiz: {
    title: '적성 퀴즈 풀기',
    description: '나한테 맞는 직업이 뭔지 알아봐요!',
    xpReward: '퀴즈 완료하면 +50 XP',
  },
  retakeTest: '다시 검사',
  viewReport: '리포트',
  recommendedJobs: '나한테 맞는 직업',
  recommendedJobsDefault: '추천 직업',
  dailyMission: '오늘의 미션',
  dailyMissionReset: '매일 초기화',
  reportTitle: '내 적성 리포트',
  reportTopTypes: '주요 적성 유형',
  reportAllScores: '전체 점수',
  reportRecommendation: '💡 이런 직업이 잘 맞아요!',
  reportRecommendationDesc: '아래 추천 직업 섹션에서 내 적성에 맞는 직업들을 확인해보세요',
} as const;

export const QUIZ_RESULTS_LABELS = {
  headerBadge: '적성 분석 완료',
  yourTypeIs: '당신의 적성 유형은',
  typeUnit: '유형',
  riasecSpectrum: 'RIASEC 스펙트럼',
  topBadge: 'TOP',
  recommendedStar: '추천 별',
  recommendedJobsTitle: '추천 직업 TOP 5',
  xpRewardTitle: '적성 검사 보상',
  xpRewardSubtitle: '첫 퀘스트 완료!',
  xpRewardAmount: '+100 XP',
  ctaButton: '우주 탐험 시작하기',
  analyzingText: '우주 적성 데이터 분석 중...',
} as const;

import jobsExploreConfig from '../data/jobs-explore-config.json';

export const JOBS_EXPLORE_LABELS = jobsExploreConfig.labels as {
  pageTitle: string;
  pageSubtitle: string;
  introBannerTitle: string;
  introBannerDescription: string;
  introBannerSubDescription: string;
  starSelectTitle: string;
  jobCountUnit: string;
  jobCountSuffix: string;
  starDetailJobCount: string;
  starDetailJobExperience: string;
  difficultyLabel: string;
  difficultyLevels: Record<number, string>;
  preparationLabel: string;
  preparationUnit: string;
  preparationSubLabel: string;
  detailView: string;
  careerPassMake: string;
  careerPassDescription: string;
  careerPassStart: string;
  accordionExpand: string;
  accordionCollapse: string;
  viewMoreTraits: string;
  coreTraitsTitle: string;
  fitPersonalityTitle: string;
  notFitTitle: string;
  whyGroupTitle: string;
  hollandCodeLabel: string;
  keySubjectsLabel: string;
  modalTabs: {
    process: string;
    dailySchedule: string;
    careerPath: string;
  };
  processStepPrefix: string;
  durationLabel: string;
  exampleLabel: string;
  toolsLabel: string;
  skillsLabel: string;
  dailyScheduleTitle: string;
  timelineTotalCost: string;
  timelineKeySuccess: string;
  favorableTraits: string;
  scheduleTypes: Record<string, { label: string; color: string }>;
};

export const GREETINGS = ['안녕하세요', '오늘도 파이팅', '어서오세요'];

export const DAILY_MISSIONS = [
  { icon: '🧩', text: '적성 퀴즈 1번 풀기', xp: 10 },
  { icon: '🔭', text: '직업 1개 탐험하기', xp: 15 },
  { icon: '📋', text: '커리어 패스 확인하기', xp: 5 },
];

