/**
 * AI 시대 직업 변화 탭 — 라벨·5점 척도 설명·기본 협업 플레이북 템플릿
 * (직업별 JSON에 playbook 이 없을 때 resolveAiTransformationDetail 에서 조합)
 */

/** 별 상세 패널「AI 시대 직업 변화」아코디언 안내 (직업 카드에서 모달로 이어짐) */
export const STAR_PANEL_AI_ERA_INTRO =
  '각 직업 카드를 열면「AI 변화」탭에서 5점 척도(대체 압력·협업 설계 역량), 단계별 인간/AI 역할, 예시, 추천 도구가 더 길게 정리되어 있습니다. 아래 숫자는 대체 위험도(low/medium/high) 직업 개수 요약입니다.';

export const AI_ERA_SECTION_LABELS = {
  replacementPressureTitle: 'AI 대체 압력 (1~5)',
  replacementPressureHint:
    '루틴·패턴화된 업무가 AI·자동화에 넘어가기 쉬운 정도입니다. 1에 가까울수록 판단·관계·현장 맥락이 강하고, 5에 가까울수록 표준 절차·문서·코딩의 자동화 압력이 큽니다.',
  collaborationDesignTitle: 'AI 협업 설계 역량 요구 (1~5)',
  collaborationDesignHint:
    '프롬프트·워크플로·검증·윤리 감독까지 AI를 \'도구\'가 아니라 \'시스템\'으로 다루어야 하는 난이도입니다. 1은 가끔 활용, 5는 매일 오케스트레이션·품질 책임이 핵심입니다.',
  scaleAxisLow: '낮음',
  scaleAxisHigh: '높음',
  collaborationHowToTitle: 'AI와 협업하는 방법 (단계별)',
  collaborationHowToIntro:
    '아래는 대표적인 협업 루프입니다. 실제 직장·병원·스튜디오마다 도구 이름은 다르지만, \'인간이 무엇을 끝까지 책임질지\'와 \'AI에게 무엇을 맡길지\'를 나누는 방식은 비슷합니다.',
  humanColumn: '인간이 하는 일',
  aiColumn: 'AI가 하는 일',
  exampleColumn: '현장 예시',
  toolsColumn: '추천 도구·스택 (예시)',
  beforeAfterTitle: '역할 변화',
  survivalTitle: 'AI 시대 생존 전략',
  mainToolsTitle: '이 직업에서 자주 쓰는 AI·도구',
} as const;

/** 1~5 각 점수에 대한 짧은 설명 (대체 압력) */
export const REPLACEMENT_PRESSURE_SCALE_ANCHORS: Record<
  1 | 2 | 3 | 4 | 5,
  string
> = {
  1: '대체 압력 최소: 맥락·신뢰·윤리·신체·현장 판단이 중심.',
  2: '일부 보조 가능: 문서·검색은 AI, 최종 판단은 사람.',
  3: '혼합: 반복 업무는 자동화되고, 설계·예외 처리가 남음.',
  4: '자동화 침투 큼: 산출물 초안·코드·분석의 상당 부분이 AI.',
  5: '대체 압력 최대: 표준 루틴은 빠르게 AI로 이전될 수 있음.',
};

/** 1~5 각 점수에 대한 짧은 설명 (협업 설계 역량) */
export const COLLABORATION_DESIGN_SCALE_ANCHORS: Record<
  1 | 2 | 3 | 4 | 5,
  string
> = {
  1: '가끔 검색·요약 수준. 특별한 설계 없이 도구만 사용.',
  2: '프롬프트·템플릿을 정해 반복 활용.',
  3: '업무 단계별로 AI 입력·출력을 설계하고 검증.',
  4: '여러 도구·모델을 연결하고 품질 기준을 문서화.',
  5: '조직 단위 AI 거버넌스·감사·교육까지 책임지는 수준.',
};

export type AiPlaybookTemplateStep = {
  stepKey: 'frame' | 'draft' | 'verify' | 'learn';
  stepTitle: string;
  humanRoleTemplate: string;
  aiRoleTemplate: string;
  exampleTemplate: string;
  /** 단계별로 흔히 붙는 도구 (직업 aiTools 와 합쳐짐) */
  defaultTools: string[];
};

/** JSON에 playbook 이 없을 때 쓰는 4단계 골격 (문자열에 {jobName} 치환) */
export const DEFAULT_AI_COLLABORATION_PLAYBOOK_TEMPLATES: readonly AiPlaybookTemplateStep[] = [
  {
    stepKey: 'frame',
    stepTitle: '① 과제·경계·책임 먼저 고정하기',
    humanRoleTemplate:
      '{jobName}에서 \'무엇을 성공으로 볼지\', \'어디까지 AI에 맡기지 않을지\', \'어떤 오류가 치명적인지\'를 먼저 글로 정합니다. 환자·고객·법규·브랜드 관점에서 경계를 정하지 않으면 AI는 엉뚱하게도 매우 자신 있게 답합니다.',
    aiRoleTemplate:
      '이 단계에서는 AI를 쓰지 않거나, 질문 목록·체크리스트 초안만 받습니다. (예: 이해관계자 인터뷰 질문 후보, 리스크 목록 초안)',
    exampleTemplate:
      '예: "{jobName} 업무에서 \'이 결정은 반드시 사람이 서명·설명\'으로 남길 항목 5가지를 팀이 합의하고, 그 외는 AI 초안 허용으로 표시합니다."',
    defaultTools: ['Notion / Confluence', 'Miro', '체크리스트 템플릿'],
  },
  {
    stepKey: 'draft',
    stepTitle: '② 초안·후보·코드·이미지는 AI에 맡기기',
    humanRoleTemplate:
      '프롬프트에 목적, 제약, 톤, 금지 사항을 넣고, 산출물은 \'초안\'으로만 취급합니다. 좋은 초안을 고르는 기준(정확도·출처·일관성)을 미리 정해 둡니다.',
    aiRoleTemplate:
      '문서 초안, 코드 스캐폴딩, 데이터 요약, 유사 사례 검색, 이미지·영상 변형 등 반복·대량 후보 생성을 담당합니다.',
    exampleTemplate:
      '예: "{jobName} 관련 보고서의 1차 목차·근거 링크 후보·표 초안을 뽑고, 사람은 숫자와 출처만 골라 검증합니다."',
    defaultTools: ['ChatGPT / Copilot', 'Claude', 'Cursor', 'Midjourney / SD', '사내 LLM'],
  },
  {
    stepKey: 'verify',
    stepTitle: '③ 검증·편향·보안·윤리는 사람이 닫기',
    humanRoleTemplate:
      'AI 출력의 사실 오류, 편향, 개인정보, 저작권, 의료·법적 리스크를 최종 확인합니다. \'AI가 그랬다\'는 이유로 책임을 넘길 수 없는 영역입니다.',
    aiRoleTemplate:
      '교차 검증용 질문 생성, 테스트 케이스 제안, 이상 징후 플래그, 문서 diff 등 보조 역할만 합니다.',
    exampleTemplate:
      '예: "{jobName} 산출물을 배포하기 전, \'환자·고객에게 그대로 읽혀도 되는가?\' \'수치 한 자리라도 틀리면 사고인가?\'를 기준으로 승인합니다."',
    defaultTools: ['테스트 자동화', '정책·가이드라인', '코드 리뷰', '로그·감사 툴'],
  },
  {
    stepKey: 'learn',
    stepTitle: '④ 피드백 루프·프롬프트·프로세스 개선',
    humanRoleTemplate:
      '틀린 사례·좋은 사례를 모아 프롬프트와 절차를 업데이트합니다. 팀 내 \'AI 사용 규약\'을 짧게라도 문서화합니다.',
    aiRoleTemplate:
      '로그·메트릭 요약, 회의록 초안, 개선 아이디어 브레인스토밍을 돕습니다.',
    exampleTemplate:
      '예: "{jobName} 팀 주간 회의에서 AI가 틀렸던 유형 3가지를 정리하고, 다음 주 프롬프트에 \'금지·필수\' 문장을 추가합니다."',
    defaultTools: ['노션·위키', '실험 노트', '대시보드', '사내 교육 자료'],
  },
] as const;
