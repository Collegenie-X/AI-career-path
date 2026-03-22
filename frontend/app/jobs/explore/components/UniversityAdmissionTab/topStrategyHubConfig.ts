export const TOP_STRATEGY_HUB_CONFIG = {
  title: '대입 전략 허브',
  badgeLabel: '핵심 4탭',
  summaryTitle: '핵심 한 줄',
  objectiveTitle: '지금 학년 우선 목표',
  examplesTitle: '빠른 실행 예시',
  detailButtonLabel: '상세 가이드 열기',
  detailDialogTitle: '상세 실행 가이드',
  detailDialogDescription: '전략·학년·보기 방식만 고르면 아래에서 상세 내용을 확인할 수 있어요.',
  detailDialogCloseAriaLabel: '상세 실행 가이드 닫기',
  expandWideDialogAriaLabel: '넓은 창(다이얼로그)으로 보기',
  /** 상세 패널 상단 컨트롤 바(전략/학년/보기) 라벨 */
  detailControlBarLabels: {
    strategy: '전략',
    grade: '학년',
    content: '보기',
  },
  /** 보기 탭 짧은 이름(한 줄 세그먼트용) */
  detailContentTabShortLabels: {
    core: '핵심',
    actionCards: '실행',
    deepQa: 'Q&A',
  },
  detailSections: {
    necessity: '왜 필요한가 (평가 포인트)',
    advantage: '입학사정관 관점 유리 포인트',
    evidence: '활동 증빙 위치 (어디에 쓰나)',
    checklist: '리스크 점검 체크리스트',
    cards: '실전 실행 카드',
    qa: '심화 Q&A 20 (면접·서류 대응)',
  },
  sectionIcons: {
    strategy2028: 'Zap',
    aiProject: 'Rocket',
    paperMaker: 'FlaskConical',
    gradeRoadmap: 'Calendar',
  },
  gradeIcons: {
    grade1: '🌱',
    grade2: '🌿',
    grade3: '🌳',
  },
  detailSectionIcons: {
    necessity: '💡',
    advantage: '✨',
    evidence: '📝',
    checklist: '✅',
    cards: 'CheckCircle2',
    qa: 'Lightbulb',
  },
} as const;
