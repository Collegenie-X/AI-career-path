/**
 * AI 시대 변화 UI — 게임 스타일 카피·정적 불릿 (직업군 패널·직업 모달 공통)
 */

export const AI_ERA_GAME_UI_LABELS = {
  kingdomHudBadge: '직업군 리스크 맵',
  kingdomStatSafeTitle: '안전 존',
  kingdomStatSafeSubtitle: '낮은 대체 압력',
  kingdomStatChangeTitle: '변화 존',
  kingdomStatChangeSubtitle: '역할 재설계',
  kingdomStatDangerTitle: '위험 존',
  kingdomStatDangerSubtitle: '루틴 압력↑',
  kingdomRoleArenaTitle: 'AI vs 인간 파티',
  kingdomRoleArenaSubtitle: '이 맵에서 누가 어떤 스킬을 쓰는지 요약했어요.',
  kingdomAiPartyLabel: 'AI 파티',
  kingdomHumanPartyLabel: '휴먼 파티',
  kingdomInventoryTitle: '장비 인벤토리',
  kingdomInventorySubtitle: '이 직업군에서 자주 등장하는 도구',
  kingdomQuestBoardTitle: '공통 퀘스트 보드',
  kingdomQuestBoardSubtitle: '레벨업에 가까운 실전 행동들',
  kingdomFooterHintTitle: '플레이 가이드',
  jobModalGameSubtitle: 'AI가 이 직업에 미치는 영향',
  jobModalRiskDungeonTitle: 'AI 영향 강도',
  jobModalRiskDungeonHint: '이 직업이 AI 자동화로 얼마나 흔들리는지 한눈에 보여줍니다.',
  jobModalXpSectionTitle: '두 가지 축으로 더 자세히 보기',
  jobModalEvolutionTitle: '일하는 모습이 어떻게 달라지나요?',
  jobModalEvolutionBeforeLabel: 'AI 이전 · 지금까지의 모습',
  jobModalEvolutionAfterLabel: 'AI 시대 · 달라지는 모습',
  jobModalCoopQuestTitle: '그래서 무엇을 해야 하나요? (4단계 행동 가이드)',
  jobModalGearLockerTitle: '함께 쓰면 좋은 도구',
  jobModalGearLockerSubtitle: '이 직업에서 자주 쓰이는 AI·도구',
  jobModalSurvivalBoardTitle: '핵심 생존 전략',
} as const;

/** 직업군 패널 — AI 역할 불릿 (고정 카피) */
export const KINGDOM_AI_ROLE_BULLETS: readonly string[] = [
  '반복·패턴 작업 자동화 (입력, 1차 분석, 초안)',
  '대량 데이터 처리·패턴 인식 (예측·추천·분류)',
  '24시간 모니터링·실시간 알림 (이상·위험 탐지)',
];

/** 직업군 패널 — 인간 역할 불릿 (고정 카피) */
export const KINGDOM_HUMAN_ROLE_BULLETS: readonly string[] = [
  'AI 결과 검증·감독·최종 의사결정 (책임·윤리)',
  '창의 기획·전략 (여러 옵션 중 선택·조합)',
  '공감·소통·설득 (신뢰 관계)',
];
