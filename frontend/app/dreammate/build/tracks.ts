import projectFieldsData from '@/data/execution/templates-project-fields.json';
import templatesData from '@/data/execution/templates.json';
import type { DreamItemType, SharedRoadmap } from '../types';
import type { TemplateLike } from './utils/templateToBlocks';

export type TrackId = 'project' | 'paper';

/** CSRT 프롬프트 4요소 — Context·Specific·Role·Task */
export interface CsrtPrompt {
  context: string;   // 맥락: 내 상황·목표
  specific: string;  // 구체: 정확히 무엇을
  role: string;      // 역할: AI에게 어떤 전문가가 되라고
  task: string;      // 과제: 어떤 결과물로
}

export interface PhaseGuide {
  /** 이 단계에서 실제로 해보는 행동 예시 (고등학생 눈높이) */
  examples: string[];
  /** 이 단계에서 AI를 무엇에 쓰는지 한 줄 */
  aiUse: string;
  /** CSRT 예시 프롬프트 */
  csrt: CsrtPrompt;
}

export interface PhaseMeta {
  key: string;
  label: string;
  emoji: string;
  color: string;
  hint: string;
  guide: PhaseGuide;
}

export interface GalleryField {
  id: string;
  label: string;
  emoji: string;
  templates: TemplateLike[];
}

export interface TrackDef {
  id: TrackId;
  label: string;          // "프로젝트" / "논문·보고서"
  emoji: string;
  focusItemType: DreamItemType;
  /** 4단계 (순서 = 표시 순서) */
  phases: PhaseMeta[];
  /** 시작 갤러리 분야 */
  galleryFields: GalleryField[];
  /** phase 키워드 매핑 (제목 → phase). phases 순서대로 먼저 맞는 것 채택 */
  phaseKeywords: Record<string, string[]>;
  fallbackPhase: string;
}

/* ── 프로젝트 트랙 ─────────────────────── */
const PROJECT_FIELDS: GalleryField[] =
  ((projectFieldsData as { fields?: GalleryField[] }).fields ?? []).map((f) => ({
    id: f.id, label: f.label, emoji: f.emoji, templates: f.templates as TemplateLike[],
  }));

export const PROJECT_TRACK: TrackDef = {
  id: 'project',
  label: '프로젝트',
  emoji: '🧩',
  focusItemType: 'project',
  phases: [
    {
      key: 'problem', label: '문제 찾기', emoji: '🔍', color: '#3B82F6', hint: '벤치마킹 · 페르소나',
      guide: {
        examples: [
          '반 친구 5명에게 "공부할 때 가장 불편한 점"을 직접 물어보고 메모하기',
          '비슷한 앱 3개(콴다·클래스카드 등)를 써보고 좋은 점·아쉬운 점을 표로 정리하기',
          '가장 많이 나온 불편 1개를 "누가-언제-왜 불편한가" 한 문장으로 적기',
        ],
        aiUse: '벤치마킹 비교표 만들기 · 인터뷰 질문 뽑기 · 문제 정의 문장 다듬기',
        csrt: {
          context: '나는 고등학생이고, 같은 반 친구들이 영어 단어 암기를 힘들어하는 문제를 풀려고 해.',
          specific: '비슷한 단어 암기 앱 3개를 기능·장점·아쉬운 점으로 비교하는 표를 만들어줘.',
          role: '너는 10년 차 서비스 기획자야.',
          task: '표 아래에 "우리가 다르게 할 수 있는 점" 3가지를 제안해줘.',
        },
      },
    },
    {
      key: 'build', label: '개발', emoji: '🛠', color: '#6C5CE7', hint: '프론트 구현 · 배포',
      guide: {
        examples: [
          '종이나 피그마로 화면 3개(시작-문제-결과)를 손으로 그려보기',
          'v0·Claude에게 "간단한 단어 카드 화면"을 만들어 달라고 해서 첫 화면 띄우기',
          '친구 1명에게 보여주고 "이게 뭔지 알겠어?" 확인하기',
        ],
        aiUse: '화면 코드 생성 · 막힌 에러 해결 · 버튼/문구 제안',
        csrt: {
          context: 'React로 단어 카드 앱을 만들고 있어. 카드를 넘기면 뜻이 보여야 해.',
          specific: '카드를 클릭하면 앞(단어)↔뒤(뜻)가 뒤집히는 컴포넌트 코드를 만들어줘.',
          role: '너는 프론트엔드 개발 튜터야. 초보가 이해하게 주석을 달아줘.',
          task: '코드와 함께, 내가 직접 바꿔볼 수 있는 부분 2곳을 알려줘.',
        },
      },
    },
    {
      key: 'test', label: '테스트', emoji: '🧪', color: '#22C55E', hint: '사용자 테스트',
      guide: {
        examples: [
          '친구 5~10명에게 1주일 써보게 하고, 매일 몇 분 썼는지 적기',
          '"어디서 헷갈렸어?"를 물어보고 멈춘 지점(이탈 지점) 기록하기',
          '끝까지 한 사람 비율 세기 (예: 10명 중 7명)',
        ],
        aiUse: '사용성 테스트 질문지 만들기 · 후기 요약·분류',
        csrt: {
          context: '단어 카드 앱을 친구 10명이 1주일 써봤고, 후기 카톡 캡처가 있어.',
          specific: '후기를 "좋았던 점 / 불편한 점 / 개선 아이디어"로 분류해 표로 정리해줘.',
          role: '너는 UX 리서처야.',
          task: '가장 많이 나온 불편 3가지를 우선순위로 뽑아줘.',
        },
      },
    },
    {
      key: 'refine', label: '디버깅·성찰', emoji: '🔄', color: '#F97316', hint: 'UI · 흐름 개선',
      guide: {
        examples: [
          '테스트에서 나온 불편 1순위를 골라 화면 고치기 (예: 글자 키우기)',
          '고치기 전/후 화면을 캡처해 나란히 두기',
          '"무엇을 배웠나 / 다음에 뭘 바꿀까"를 5줄로 회고하기',
        ],
        aiUse: '개선 우선순위 정하기 · 버그 원인 추론 · 회고 글 다듬기',
        csrt: {
          context: '테스트 후 "글씨가 작다, 다음 버튼이 안 보인다"는 피드백을 받았어.',
          specific: '이 둘을 고칠 구체적 방법과, 먼저 고칠 순서를 알려줘.',
          role: '너는 시니어 UI 디자이너야.',
          task: '각 개선의 기대 효과를 한 줄씩 붙여줘.',
        },
      },
    },
  ],
  galleryFields: PROJECT_FIELDS,
  phaseKeywords: {
    problem: ['벤치마킹', '문제', '페르소나', '조사', '정의', '리서치', '탐색', '기획', '아이디어', '요구'],
    build:   ['구현', '개발', '프론트', 'v0', '제작', '배포', '코딩', '빌드', '디자인', '프로토타입'],
    test:    ['테스트', '사용성', '검증', '설문', '실험', '사용자'],
    refine:  ['수정', '개선', 'ui', '회고', '발표', '디버깅', '리팩', '흐름', '정리', '보완'],
  },
  fallbackPhase: 'build',
};

/* ── 논문·보고서 트랙 ──────────────────── */
const PAPER_FIELDS: GalleryField[] = (() => {
  const paper = (templatesData.categories as { id: string; subgroups?: GalleryField[] }[]).find((c) => c.id === 'paper');
  return (paper?.subgroups ?? []).map((g) => ({
    id: g.id, label: g.label, emoji: g.emoji, templates: g.templates as TemplateLike[],
  }));
})();

export const PAPER_TRACK: TrackDef = {
  id: 'paper',
  label: '논문·보고서',
  emoji: '📄',
  focusItemType: 'paper',
  phases: [
    {
      key: 'ask', label: '주제·질문', emoji: '🔍', color: '#3B82F6', hint: '선행조사 · 연구질문 · 가설',
      guide: {
        examples: [
          '수업 중 생긴 궁금증 1개를 "왜 ~할까?" 질문으로 적기 (예: 사과는 왜 갈변할까?)',
          '교과서·논문·뉴스에서 관련 자료 3개를 찾아 한 줄씩 요약하기',
          '검증 가능한 가설로 바꾸기 (예: 온도가 높을수록 갈변이 빠르다)',
        ],
        aiUse: '주제 좁히기 · 선행연구 키워드 추천 · 가설 문장 다듬기',
        csrt: {
          context: '화학 시간에 산화 반응을 배우다가 "사과 갈변"이 궁금해졌어.',
          specific: '이 주제로 고등학생이 직접 실험할 수 있는 연구 질문 3개를 제안해줘.',
          role: '너는 과학탐구 지도 선생님이야.',
          task: '각 질문마다 검증 가능한 가설을 한 줄로 붙여줘.',
        },
      },
    },
    {
      key: 'design', label: '조사·설계', emoji: '🧫', color: '#14B8A6', hint: '연구 설계 · 자료/데이터 수집',
      guide: {
        examples: [
          '바꿀 것(독립변인)·잴 것(종속변인)·고정할 것(통제변인)을 표로 적기',
          '실험 절차를 1·2·3 순서로 쓰고 준비물 적기',
          '예비 실험을 1번 돌려보고 문제점 메모하기',
        ],
        aiUse: '변인 설계 점검 · 실험 절차 검토 · 설문 문항 만들기',
        csrt: {
          context: '"온도가 높을수록 사과 갈변이 빠르다"를 검증하려고 해.',
          specific: '독립·종속·통제 변인을 정리하고, 집에서 가능한 실험 절차를 단계로 써줘.',
          role: '너는 실험 설계 멘토야.',
          task: '통제가 약한 부분 2곳과 보완법을 알려줘.',
        },
      },
    },
    {
      key: 'analyze', label: '분석·검증', emoji: '📊', color: '#22C55E', hint: '데이터 분석 · 결과 해석',
      guide: {
        examples: [
          '측정값을 표·그래프로 만들기 (시간별 갈변 정도)',
          '가설이 맞았는지 데이터로 확인하고 예외 찾기',
          '왜 그런 결과가 나왔는지 한 문단으로 해석하기',
        ],
        aiUse: '표→그래프 해석 · 통계 방법 추천 · 결과 해석 점검',
        csrt: {
          context: '온도 3단계에서 갈변 정도를 1시간마다 잰 데이터 표가 있어.',
          specific: '이 데이터에 어떤 그래프가 적절한지와 읽는 법을 알려줘.',
          role: '너는 데이터 분석 튜터야.',
          task: '결과 해석에서 빠뜨리기 쉬운 점 2가지를 짚어줘.',
        },
      },
    },
    {
      key: 'write', label: '집필·고쳐쓰기', emoji: '✍️', color: '#F97316', hint: '초고 · 첨삭 · 퇴고',
      guide: {
        examples: [
          '서론-방법-결과-결론 4칸에 핵심 문장을 먼저 한 줄씩 채우기',
          '초고를 쓰고 선생님께 첨삭받기',
          '지적받은 부분 고치고 참고자료 출처 정리하기',
        ],
        aiUse: '개요 잡기 · 문장 다듬기(맞춤법·논리) · 초록 요약',
        csrt: {
          context: '사과 갈변 탐구 보고서 초고를 썼는데 결론이 약해.',
          specific: '결론 문단을 "결과 요약 + 의미 + 한계"로 다시 써줘.',
          role: '너는 글쓰기 첨삭 선생님이야. 고친 이유도 알려줘.',
          task: '내가 직접 더 다듬을 부분 2곳을 표시해줘.',
        },
      },
    },
  ],
  galleryFields: PAPER_FIELDS,
  phaseKeywords: {
    ask:     ['주제', '선행', '질문', '가설', '선정', '배경', '문헌', '리서치'],
    design:  ['계획', '설계', '수집', '실험', '탐구', '자료', '인터뷰', '설문', '관찰'],
    analyze: ['분석', '해석', '결과', '검증', '통계', '데이터', '고찰'],
    write:   ['작성', '초안', '초고', '첨삭', '퇴고', '제출', '발표', '정리', '보고서', '논문'],
  },
  fallbackPhase: 'write',
};

export const TRACKS: Record<TrackId, TrackDef> = { project: PROJECT_TRACK, paper: PAPER_TRACK };

export function getTrack(id: TrackId): TrackDef {
  return TRACKS[id] ?? PROJECT_TRACK;
}

/** 기존 로드맵의 종류로 트랙 추론 (수정 모드) */
export function getTrackForRoadmap(roadmap: SharedRoadmap): TrackDef {
  const types = roadmap.focusItemTypes ?? [];
  if (types.includes('paper') && !types.includes('project')) return PAPER_TRACK;
  return PROJECT_TRACK;
}
