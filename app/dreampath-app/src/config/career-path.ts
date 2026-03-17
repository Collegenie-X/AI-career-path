export type CareerItemType = 'activity' | 'award' | 'portfolio' | 'certification';
export type CareerItemCategoryTag = 'project' | 'award' | 'paper' | 'intern' | 'volunteer' | 'camp' | 'activity';
export type CareerActivitySubtype = 'project' | 'intern' | 'volunteer' | 'camp' | 'research' | 'paper' | 'general';

export interface CareerItemLink {
  title: string;
  url: string;
  kind?: 'official' | 'application' | 'reference' | 'portfolio' | 'result';
}

export interface CareerPathComment {
  id: string;
  templateId: string;
  authorName: string;
  authorEmoji: string;
  content: string;
  likes: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CareerPlanItem {
  id: string;
  type: CareerItemType;
  title: string;
  months: number[];
  difficulty: number;
  cost: string;
  organizer: string;
  url?: string;
  links?: CareerItemLink[];
  description?: string;
  categoryTags?: CareerItemCategoryTag[];
  activitySubtype?: CareerActivitySubtype;
  custom?: boolean;
  checked?: boolean;
}

export interface CareerPlanGroup {
  id: string;
  label: string;
  items: CareerPlanItem[];
}

export interface GoalActivityGroup {
  id: string;
  goal: string;
  items: CareerPlanItem[];
  isExpanded?: boolean;
}

export interface CareerYearPlan {
  gradeId: string;
  gradeLabel: string;
  goals: string[];
  items: CareerPlanItem[];
  groups?: CareerPlanGroup[];
  goalGroups?: GoalActivityGroup[];
}

export interface CareerPlan {
  id: string;
  starId: string;
  starName: string;
  starEmoji: string;
  starColor: string;
  jobId: string;
  jobName: string;
  jobEmoji: string;
  years: CareerYearPlan[];
  createdAt: string;
  title: string;
  isPublic?: boolean;
  sharedAt?: string;
}

export const CAREER_LABELS = {
  pageTitle: '드림 패스',
  pageSubtitle: '나만의 진로 로드맵',

  tabExplore: '탐색',
  tabBuilder: '빌더',
  tabTimeline: '내 패스',

  exploreHeroLabel: '커리어 패스 탐색',
  exploreHeroTitle: '나의 진로 로드맵,\n여기서 찾아보세요',
  exploreHeroDescription: '다양한 직업의 커리어 패스를 참고하거나\n나만의 패스를 직접 만들어 보세요.',
  exploreFilterAll: '전체',
  exploreCount: '개 커리어 패스',
  exploreTapHint: '탭해서 펼쳐보기',
  exploreEmpty: '해당 왕국의 커리어 패스가 없어요',
  exploreCreateButton: '커리어 패스 만들기',
  exploreOfficial: '공식',
  exploreUseTemplate: '이 패스 사용하기',

  builderHeroTitle: '커리어 패스 빌더',
  builderHeroDescription: '왕국 선택부터 학년별 계획까지\n단계별로 쉽게 만들어요',
  builderGuideTitle: '단계별 가이드',
  builderSteps: [
    { emoji: '🌟', title: '왕국 선택', desc: '8개 별 중 관심 분야를 선택해요' },
    { emoji: '🎯', title: '직업 선택', desc: '왕국의 대표 직업 중 목표를 골라요' },
    { emoji: '📅', title: '학년 선택', desc: '계획할 학년을 모두 체크해요' },
    { emoji: '✏️', title: '계획 추가', desc: '학년별로 목표·활동·수상·자격증을 추가해요' },
    { emoji: '🎉', title: '완성!', desc: '저장 후 타임라인으로 확인해요' },
  ],

  timelineHeader: '내 커리어 패스',
  timelineEmpty: '아직 커리어 패스가 없어요',
  timelineEmptyDescription: '빌더에서 나만의 로드맵을 만들어보세요',
  timelineCreateButton: '커리어 패스 만들기',
  timelineEdit: '수정하기',
  timelineEditDone: '수정 완료',
  timelineEditMode: '수정 모드',
  timelineViewMode: '보기 모드',
  timelineDelete: '삭제',
  timelineDeleteConfirm: '삭제 확인',
  timelineDeleteCancel: '취소',
  timelineComplete: '완료',
  timelineAddItem: '항목 추가',
  timelinePlanTitlePlaceholder: '커리어 패스 이름을 입력하세요',

  stepKingdom: '왕국 선택',
  stepJob: '직업 선택',
  stepPlan: '계획 세우기',
  stepDone: '완성!',

  headingKingdom: '어떤 왕국이 끌리나요?',
  headingKingdomDesc: '관심 분야에 가까운 별을 선택하세요',
  headingJob: '목표 직업을 선택하세요',
  headingPlan: '학년별 계획을 세워요',
  headingPlanDesc: '학년 추가 → 목표·활동·작품·자격증을 채워가세요',
  headingDone: '커리어 패스 완성!',
  headingDoneDesc: '저장 후 타임라인에서 전체 로드맵을 확인하세요',

  tipKingdom: '8개의 별은 각각 다른 직업 세계예요. 나의 관심사와 가장 잘 맞는 왕국을 선택해 보세요!',
  tipPlan: '의 커리어를 학년별로 쌓아가 보세요. 학년을 추가하면 계획표가 바로 펼쳐져요!',

  nextButton: '다음으로',
  previewButton: '미리보기',
  saveButton: '저장하고 타임라인 보기',
  gradeAddFirst: '첫 번째 학년을 추가해요',
  gradeAddFirstDesc: '아래에서 시작 학년을 선택하세요',
  gradeAddNext: '다음 학년 추가하기',
  gradeAddSelect: '학년 선택하기',
  gradePickerTitle: '어떤 학년을 추가할까요?',
  gradeRemove: '이 학년 제거',
  gradeMinNotice: '학년을 1개 이상 추가해야 다음으로 넘어갈 수 있어요',

  goalTitle: '이 학년의 목표',
  goalHint: '2~3개 추천',
  goalPlaceholder: '목표를 입력하세요',
  goalTemplateButton: '목표 템플릿 선택',

  itemTitle: '활동 · 수상 · 작품 · 자격증',
  itemAdd: '항목',
  itemGroupAdd: '그룹',
  itemGroupPlaceholder: '예: 1학기, 여름방학, 3~6월...',
  itemGroupEmpty: '이 그룹에 항목 추가',
  itemEmptyHint: '항목 추가 또는 그룹으로 묶기',
  itemAddMore: '더 추가하기',
  itemUrl: 'URL',
  itemDescription: '설명',
  itemShowDetails: '상세 보기',
  itemHideDetails: '접기',
  itemEditUrl: 'URL 수정',
  itemEditDescription: '설명 수정',
  
  goalAddActivity: '이 목표에 활동 추가',
  goalNoActivity: '아직 세부 활동이 없어요',
  goalActivityCount: '개 활동',

  addItemTitle: '항목 추가',
  addItemMonthTitle: '목표 월 설정',
  addItemRecommend: '추천 선택',
  addItemCustom: '직접 입력',
  addItemFilterAll: '전체',
  addItemEmpty: '항목이 없어요',
  addItemMonthLabel: '목표 월 선택',
  addItemMonthHint: '다중 선택 가능',
  addItemPresetLabel: '추천:',
  addItemPresetSelect: '선택',
  addItemPresetReset: '초기화',
  addItemSelectedMonth: '선택된 월:',
  addItemSelectMonth: '월을 선택하세요',
  addItemCustomType: '유형 *',
  addItemCustomName: '이름 *',
  addItemCustomMonthLabel: '목표 월',
  addItemCustomDifficulty: '난이도',
  addItemCustomCost: '비용',
  addItemCustomOrganizer: '주관 / 출처',
  addItemCustomCostPlaceholder: '무료',
  addItemCustomOrganizerPlaceholder: '예: 학교·자체',
  addItemSubmit: '추가하기',
  addItemEditTitle: '항목 수정',
  addItemSaveEdit: '수정 완료',
  itemClickToEdit: '탭하여 수정',

  summaryTitle: '커리어 패스 완성!',
  summaryTotalItems: '총 계획 항목',
  summaryTotalYears: '계획 학년',
  summaryYearSummary: '학년별 요약',
  summaryNoGoal: '목표 없음',

  detailLikes: '좋아요',
  detailUses: '명 사용',
  detailYears: '학년',
  detailItems: '개',
  detailTimelineSectionTitle: '학년별 상세',
  detailRichInfoTitle: '합격 준비 상세 가이드',
  detailRichInfoSubtitle: '프로젝트·수상·논문·인턴·봉사·캠프를 학년 전체에서 요약했어요.',
  detailRichLinksTitle: '참고 URL · 공식 링크',
  detailRichLinksEmpty: '등록된 참고 URL이 아직 없어요',
  detailRichProject: '프로젝트',
  detailRichAward: '수상',
  detailRichPaper: '논문·연구',
  detailRichIntern: '인턴',
  detailRichVolunteer: '봉사활동',
  detailRichCamp: '캠프',
  detailRichActivity: '활동',
  detailRichExamplesSuffix: '개 예시',

  commentSectionTitle: '댓글',
  commentPlaceholder: '댓글 추가...',
  commentSubmit: '댓글 작성',
  commentEdit: '수정',
  commentDelete: '삭제',
  commentDeleteConfirm: '이 댓글을 삭제할까요?',
  commentDeleteCancel: '취소',
  commentEmpty: '아직 댓글이 없어요. 첫 댓글을 남겨보세요!',
  commentTimeAgo: '전',
  commentEdited: '(수정됨)',
  commentEditSave: '저장',
  commentEditCancel: '취소',
} as const;

export const CAREER_ITEM_TYPES = [
  { value: 'activity' as const, label: '활동', color: '#3B82F6', emoji: '🎯' },
  { value: 'award' as const, label: '수상·대회', color: '#FBBF24', emoji: '🏆' },
  { value: 'portfolio' as const, label: '작품', color: '#EC4899', emoji: '🖼️' },
  { value: 'certification' as const, label: '자격증', color: '#22C55E', emoji: '📜' },
] as const;

export const CAREER_GRADE_YEARS = [
  { id: 'elem3', label: '초3', fullLabel: '초등 3학년', order: 1, group: '초등', groupEmoji: '🏫' },
  { id: 'elem4', label: '초4', fullLabel: '초등 4학년', order: 2, group: '초등', groupEmoji: '🏫' },
  { id: 'elem5', label: '초5', fullLabel: '초등 5학년', order: 3, group: '초등', groupEmoji: '🏫' },
  { id: 'elem6', label: '초6', fullLabel: '초등 6학년', order: 4, group: '초등', groupEmoji: '🏫' },
  { id: 'mid1', label: '중1', fullLabel: '중학교 1학년', order: 5, group: '중학교', groupEmoji: '🎒' },
  { id: 'mid2', label: '중2', fullLabel: '중학교 2학년', order: 6, group: '중학교', groupEmoji: '🎒' },
  { id: 'mid3', label: '중3', fullLabel: '중학교 3학년', order: 7, group: '중학교', groupEmoji: '🎒' },
  { id: 'high1', label: '고1', fullLabel: '고등학교 1학년', order: 8, group: '고등학교', groupEmoji: '🎓' },
  { id: 'high2', label: '고2', fullLabel: '고등학교 2학년', order: 9, group: '고등학교', groupEmoji: '🎓' },
  { id: 'high3', label: '고3', fullLabel: '고등학교 3학년', order: 10, group: '고등학교', groupEmoji: '🎓' },
  { id: 'univ', label: '대학생', fullLabel: '대학생', order: 11, group: '일반', groupEmoji: '🎓' },
  { id: 'general', label: '일반', fullLabel: '일반', order: 12, group: '일반', groupEmoji: '👔' },
] as const;

export const STAR_FILTERS = [
  { id: 'all', label: '전체', emoji: '✨' },
  { id: 'highschool', label: '고입', emoji: '🏫' },
  { id: 'admission', label: '대입', emoji: '🎓' },
  { id: 'explore', label: '탐구', emoji: '🔬' },
  { id: 'create', label: '창작', emoji: '🎨' },
  { id: 'tech', label: '기술', emoji: '💻' },
  { id: 'nature', label: '자연', emoji: '🌱' },
  { id: 'connect', label: '연결', emoji: '🤝' },
  { id: 'order', label: '질서', emoji: '⚖️' },
  { id: 'communicate', label: '소통', emoji: '📡' },
  { id: 'challenge', label: '도전', emoji: '🚀' },
] as const;

export const BUILDER_STEPS = [
  { id: 1, title: '왕국 선택', emoji: '🌟' },
  { id: 2, title: '직업 선택', emoji: '🎯' },
  { id: 3, title: '계획 세우기', emoji: '📋' },
  { id: 4, title: '완성!', emoji: '🎉' },
] as const;
