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
  jobModalGameSubtitle: 'AI 시대 직업 스펙',
  jobModalRiskDungeonTitle: '던전 난이도 (3단계)',
  jobModalRiskDungeonHint: '아래 5점 척도는 같은 직업을 더 세밀하게 본 보조 스탯이에요.',
  jobModalXpSectionTitle: '능력치 게이지 (1~5)',
  jobModalEvolutionTitle: '클래스 진화',
  jobModalEvolutionBeforeLabel: 'Lv.1 · 이전 메타',
  jobModalEvolutionAfterLabel: '업그레이드 · AI 시대',
  jobModalCoopQuestTitle: '협동 퀘스트 (단계별)',
  jobModalGearLockerTitle: '추가 장비함',
  jobModalGearLockerSubtitle: '데이터에 적힌 대표 도구',
  jobModalSurvivalBoardTitle: '생존 퀘스트',
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
