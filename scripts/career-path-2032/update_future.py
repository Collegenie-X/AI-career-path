# -*- coding: utf-8 -*-
"""career-path-templates-future.json — 2032 창직·AI 역량 개편"""
from common import load, save, build_growth, assign_goal_index, fix_admission_self_intro

STAGES = ["고1", "고2", "고3"]

NORTH_STAR = {
    "tpl-future-ai-core-engineer-2028": {
        "goal": "AI를 '쓰는 사람'에서 '한 사람이 서비스 하나를 끝까지 굴리는 사람'이 된다 — 내가 만든 AI 도구를 학교 안에서 50명이 실제로 쓰게 만든다.",
        "proof": "실사용자 50명 · 만족도 응답 30건 · 못 답한 질문 표 1개 · 개선 전후 비교 2회",
        "byWhen": "고3 6월까지",
        "ventureNote": "창직 관점 — 이 기록이 그대로 '1인 AI 서비스 운영자' 이력이 된다. 대학 합격은 그 과정의 부산물.",
    },
    "tpl-future-physical-ai-robotics-2028": {
        "goal": "화면 밖으로 나오는 AI를 만든다 — 학교 어딘가에서 매일 켜져 있는 장치 1개를 내 손으로 만들어 3개월 이상 운영한다.",
        "proof": "상시 가동 장치 1대 · 연속 운영 90일 로그 · 고장·수리 기록 10건 · 사용자 인터뷰 10건",
        "byWhen": "고3 9월까지",
        "ventureNote": "창직 관점 — 피지컬 AI는 '설치·유지보수까지 책임지는 1인 사업'이 성립하는 영역. 운영 로그가 곧 사업 실적.",
    },
    "tpl-future-ai-bio-health-2028": {
        "goal": "가족·이웃의 건강 문제 1개를 AI로 3개월 이상 추적해, 실제로 습관이 바뀐 사람 5명을 만든다.",
        "proof": "추적 대상 5명 · 90일 기록 데이터 · 변화 전후 비교표 5건 · 보건교사·의료인 확인 코멘트 2건",
        "byWhen": "고3 8월까지",
        "ventureNote": "창직 관점 — '동네 건강 데이터 코치'는 자격 없이도 시작 가능한 1인 서비스의 원형. 단, 진단·처방은 절대 하지 않는다.",
    },
    "tpl-future-ai-governance-2028": {
        "goal": "AI가 만든 규칙 초안을 사람들이 실제로 받아들이게 만든다 — 내가 제안한 규칙 1개를 학교 공식 규정·안내문으로 채택시킨다.",
        "proof": "설문 응답 100건 · 공청회 1회(참석 30명) · 채택된 규칙 문서 1건 · 학교 공식 게시 기록 1건",
        "byWhen": "고3 7월까지",
        "ventureNote": "창직 관점 — AI 도입이 빨라질수록 '규칙을 설계하고 합의를 만드는 사람'의 값이 오른다. 합의 기록이 포트폴리오.",
    },
}

GROWTH = {
    "tpl-future-ai-core-engineer-2028": {
        "ai": [(40, "ChatGPT·Claude·Gemini 3종 비교 노트 30편"), (70, "GPTs 1개 제작 + 오답 5건 원인 분리·수정"), (88, "에이전트 3종 분업 운영 + 로그 기반 개선 2회")],
        "plan": [(30, "카드뉴스 10편 주제 선정·개선 사이클 1회"), (65, "사용자 인터뷰 5명 → 개선 우선순위 표 1장"), (85, "50명 대상 배포 계획 + 회고록 1p")],
        "fusion": [(35, "정보·통합과학 발표 2회에 AI 주제 접목"), (60, "설문 25건 통계 + 텍스트 분석 결합 보고서 1편"), (80, "기술·윤리·교육 3영역 묶은 발표 1편")],
        "venture": [(15, "무료 도구만으로 결과물 10편 생산"), (45, "친구 5명이 반복 사용하는 서비스 1개"), (75, "학년 50명 사용 + 유지보수 규칙 1장")],
        "deliver": [(35, "카드뉴스 피드백 캡처 15건"), (65, "워크숍 1회 개최 · 참석 20명"), (85, "1분 답변 영상 20편 + 시연 발표 1회")],
    },
    "tpl-future-physical-ai-robotics-2028": {
        "ai": [(35, "마이크로비트 코드 10개 AI 보조로 작성"), (65, "라즈베리파이 음성·카메라 인식 파이프라인 1개"), (85, "센서 로그 자동 분석 에이전트 1개 운영")],
        "plan": [(30, "만들 장치 후보 5개 → 1개 선정 근거 1p"), (60, "부품·예산·일정 계획표 1장으로 제작 완주"), (85, "설치·운영·고장 대응 매뉴얼 1부")],
        "fusion": [(35, "물리·정보 교과 개념을 장치 설명에 사용"), (65, "하드웨어 + AI 인식 + 사용자 안내 결합"), (85, "기술·안전·학교 규정까지 묶은 도입 보고서 1편")],
        "venture": [(15, "부품비 5만원 이내 시제품 2개"), (45, "학급에서 실제 쓰이는 장치 1대"), (75, "상시 가동 90일 + 수리 요청 10건 처리")],
        "deliver": [(30, "제작 과정 사진 기록 30장"), (60, "3분 시연 영상 4편"), (85, "사용 설명 영상 1편 + 인수인계 발표 1회")],
    },
    "tpl-future-ai-bio-health-2028": {
        "ai": [(35, "건강 기록 정리 프롬프트 20건 실습"), (65, "AI 요약 + 근거 논문 확인 루틴 30건"), (85, "AI가 틀린 건강 정보 20건 검증·기록")],
        "plan": [(30, "관찰 대상·측정 항목 3개 확정"), (60, "90일 추적 계획표 + 중간 점검 4회"), (85, "변화 전후 비교 설계 + 한계 명시 1p")],
        "fusion": [(35, "생명과학 교과 개념 + 생활 관찰 연결"), (65, "봉사 현장 관찰 + 데이터 기록 결합"), (85, "의료 윤리·데이터·돌봄을 묶은 보고서 1편")],
        "venture": [(15, "가족 1명 대상 기록 습관 정착"), (45, "이웃·친구 5명 참여 확보"), (75, "습관이 실제로 바뀐 사례 5건 확보")],
        "deliver": [(30, "건강 정보 카드 10장"), (60, "보건 캠페인 영상 2편(각 2분)"), (85, "결과 공유회 1회 + 면접 답변 영상 20편")],
    },
    "tpl-future-ai-governance-2028": {
        "ai": [(35, "AI 답변의 편향 사례 20건 수집"), (65, "쟁점별 찬반 요약 자동화 루틴 1개"), (85, "규칙 초안 AI 생성 → 사람 검증 3회 반복")],
        "plan": [(30, "시사 이슈 10개 중 다룰 주제 1개 선정"), (65, "설문 100건 설계·수거 계획 완주"), (88, "공청회 → 수정 → 채택까지 절차 설계 1부")],
        "fusion": [(35, "사회·국어 교과와 AI 쟁점 연결 발표 2회"), (65, "설문 데이터 + 인터뷰 + 법·제도 자료 결합"), (85, "기술 이해 + 제도 설계 결합 제안서 1편")],
        "venture": [(15, "학급 규칙 제안 1건 시도"), (45, "학교 규칙 개정 제안서 1건 접수"), (75, "채택된 규칙 1건 + 시행 후 점검 1회")],
        "deliver": [(35, "카드뉴스 10편 발행"), (65, "공청회 진행 1회 · 참석 30명"), (88, "학교 신문 기고 1건 + 3분 요약 영상 1편")],
    },
}

ORCHESTRA = {
    "tpl-future-ai-core-engineer-2028": [
        ("고1 — 비교하며 감 잡기", ["ChatGPT", "Claude", "Gemini", "Notion"], "같은 질문을 3개 모델에 넣고 답이 갈리는 지점을 기록. '어떤 도구가 무엇에 강한지'를 몸으로 익히는 단계."),
        ("고2 — 도구를 만들어 쓰기", ["ChatGPT GPTs", "Google Forms", "Canva"], "지식 문서를 올린 나만의 GPTs를 만들고, 친구 사용 로그로 프롬프트를 고친다."),
        ("고3 — 에이전트 분업", ["GPTs(상담)", "Claude(검토)", "Zapier(자동화)"], "답변·검토·기록을 도구 3개에 나눠 맡기고 사람은 최종 판단만 한다."),
    ],
    "tpl-future-physical-ai-robotics-2028": [
        ("고1 — 코드 보조", ["ChatGPT", "micro:bit MakeCode", "Tinkercad"], "센서 코드 오류를 AI에게 설명시키고 스스로 고치는 훈련."),
        ("고2 — 인식 파이프라인", ["Teachable Machine", "Raspberry Pi", "Whisper"], "카메라·음성 인식을 붙여 '보고 듣는 장치'로 확장."),
        ("고3 — 운영 자동화", ["Python 스크립트", "ChatGPT(로그 분석)", "Google Sheets"], "장치 로그를 매일 자동 요약해 고장 징후를 미리 잡는다."),
    ],
    "tpl-future-ai-bio-health-2028": [
        ("고1 — 정리 도구", ["ChatGPT", "Google Sheets", "Notion"], "건강 기록을 표로 만들고 용어를 쉬운 말로 바꾸는 데 사용."),
        ("고2 — 근거 확인", ["Elicit", "PubMed", "Consensus"], "AI 요약을 그대로 믿지 않고 원문 초록으로 되짚는 습관."),
        ("고3 — 검증·전달", ["ChatGPT(초안)", "CapCut(영상)", "Canva(카드)"], "초안은 AI, 사실 확인과 최종 문장은 사람이 책임진다."),
    ],
    "tpl-future-ai-governance-2028": [
        ("고1 — 쟁점 수집", ["ChatGPT", "Perplexity", "Notion"], "같은 이슈의 찬반 근거를 모아 편향 사례를 기록."),
        ("고2 — 여론 수집", ["Google Forms", "ChatGPT(응답 분류)", "Canva"], "설문 100건 응답을 AI로 분류하고 사람이 오분류를 잡아낸다."),
        ("고3 — 규칙 설계", ["Claude(초안)", "ChatGPT(반론)", "Google Docs"], "AI에 규칙 초안과 반론을 동시에 시키고, 합의 문장은 사람이 쓴다."),
    ],
}

NEW_ITEMS = {
    "tpl-future-ai-core-engineer-2028": [
        (1, "AI 에이전트 3종 분업 실험 — 상담·검토·기록을 나눠 맡기기 (9~11월)",
         {
             "type": "portfolio", "months": [9, 10, 11], "difficulty": 3, "organizer": "자체",
             "description": "한 개의 AI에게 다 시키지 않고 역할을 쪼개는 훈련입니다. ① 상담 답변은 GPTs, 답변 검토는 Claude, 기록·집계는 스프레드시트로 역할을 나눕니다. ② 같은 질문 20개를 '한 도구만 쓴 경우'와 '3종 분업' 두 방식으로 처리해 걸린 시간과 오답 수를 표로 비교합니다. ③ 어느 단계에서 사람이 반드시 개입해야 했는지 3줄로 적습니다. 완료 기준: 비교표 1장(20문항 × 2방식) + 사람 개입 지점 3개 문서화.",
             "categoryTags": ["project"], "activitySubtype": "project", "projectTrack": True, "priority": "boost",
             "aiTools": ["ChatGPT GPTs", "Claude", "Google Sheets"],
             "deliverable": "분업 비교표 1장(20문항 × 2방식, 시간·오답 수) + 사람 개입 지점 정리 3개",
             "cost": "무료",
         }),
        (2, "'혼자서 서비스 하나 굴리기' 창직 기록 — 운영 매뉴얼 1부 + 3분 소개 영상 1편 (7~9월)",
         {
             "type": "portfolio", "months": [7, 8, 9], "difficulty": 3, "organizer": "자체",
             "description": "졸업 후에도 이 서비스가 굴러가게 만드는 단계입니다. ① 챗봇 운영에 필요한 일(질문 확인·지식 문서 갱신·오답 수정)을 주 단위 체크리스트로 적어 A4 2장 매뉴얼을 만듭니다. ② 후배 1명에게 매뉴얼만 보고 1주간 운영하게 해보고 막힌 지점을 매뉴얼에 반영합니다. ③ '이 서비스는 무엇이고 누가 왜 쓰는가'를 3분 영상으로 찍어 남깁니다. 완료 기준: 매뉴얼 A4 2장 + 인수인계 1회 + 3분 소개 영상 1편.",
             "categoryTags": ["project"], "activitySubtype": "project", "projectTrack": True, "priority": "boost",
             "aiTools": ["ChatGPT", "CapCut", "Notion"],
             "deliverable": "운영 매뉴얼 A4 2장 + 인수인계 기록 1건 + 3분 소개 영상 1편",
             "cost": "무료",
         }),
    ],
    "tpl-future-physical-ai-robotics-2028": [
        (1, "센서 로그 자동 요약 에이전트 만들기 — 매일 1줄 보고 받기 (9~12월)",
         {
             "type": "portfolio", "months": [9, 10, 11, 12], "difficulty": 3, "organizer": "자체",
             "description": "장치를 만드는 것보다 어려운 건 '계속 돌아가는지 아는 것'입니다. ① 센서값을 구글 시트에 쌓고 ② 하루치를 ChatGPT에 넣어 '평소와 다른 점 1줄'을 뽑는 루틴을 12주간 돌립니다. ③ 이상 징후를 미리 잡은 사례와 놓친 사례를 각각 기록합니다. 완료 기준: 12주 일일 요약 기록 + 이상 징후 사전 감지 사례 3건 + 놓친 사례 정리 1p.",
             "categoryTags": ["project"], "activitySubtype": "project", "projectTrack": True, "priority": "boost",
             "aiTools": ["Google Sheets", "ChatGPT", "Python"],
             "deliverable": "12주 일일 요약 로그 + 사전 감지 사례 3건 + 실패 사례 정리 1p",
             "cost": "무료",
         }),
        (2, "창직 기록 — 설치·수리까지 책임지는 '1인 장치 운영자' 포트폴리오 (7~9월)",
         {
             "type": "portfolio", "months": [7, 8, 9], "difficulty": 3, "organizer": "자체",
             "description": "만든 사람이 아니라 '책임지는 사람'이 되는 단계입니다. ① 장치 사용자 10명을 인터뷰해 불편 10건을 받아 적고 그중 5건을 실제로 고칩니다. ② 부품비·소요 시간을 정산해 '이 장치를 남에게 만들어 준다면 얼마인가'를 계산합니다. ③ 설치·수리·폐기까지 담은 안내 영상 1편(3분)을 만듭니다. 완료 기준: 불편 10건 접수 · 수리 5건 · 원가 정산표 1장 · 안내 영상 1편.",
             "categoryTags": ["project"], "activitySubtype": "project", "projectTrack": True, "priority": "boost",
             "aiTools": ["ChatGPT", "CapCut", "Google Sheets"],
             "deliverable": "불편 접수 10건 + 수리 기록 5건 + 원가·시급 정산표 1장 + 안내 영상 1편(3분)",
             "cost": "부품 실비 2~5만원",
         }),
    ],
    "tpl-future-ai-bio-health-2028": [
        (1, "AI 건강정보 오류 검증 프로젝트 — 20건 사실 확인 (9~12월)",
         {
             "type": "portfolio", "months": [9, 10, 11, 12], "difficulty": 3, "organizer": "자체",
             "description": "건강 분야에서 AI를 쓰려면 '틀린 답을 잡아내는 능력'이 먼저입니다. ① 흔한 건강 질문 20개를 AI에 물어 답을 저장합니다. ② 각 답을 질병관리청·대한의학회 자료로 확인해 맞음·애매함·틀림으로 나눕니다. ③ 틀린 답 사례는 왜 그럴듯하게 들렸는지 한 줄씩 적습니다. 완료 기준: 검증표 20행 + 오류 사례 5건 원인 메모 + 보건교사 확인 코멘트 1건.",
             "categoryTags": ["paper", "project"], "activitySubtype": "research", "projectTrack": True, "priority": "boost",
             "aiTools": ["ChatGPT", "Elicit", "Consensus"],
             "deliverable": "AI 건강정보 검증표 20행 + 오류 원인 메모 5건 + 보건교사 확인 1건",
             "cost": "무료",
         }),
        (2, "창직 기록 — '동네 건강 기록 코치' 90일 운영 + 캠페인 영상 2편 (5~8월)",
         {
             "type": "portfolio", "months": [5, 6, 7, 8], "difficulty": 3, "organizer": "자체",
             "description": "진단·처방은 하지 않고, 기록과 습관만 돕는 역할을 실제로 해봅니다. ① 가족·이웃 5명에게 90일 기록(수면·걸음·물 섭취 중 1개)을 제안하고 주 1회 문자로 확인합니다. ② 90일 뒤 전후 비교표를 만들어 각자에게 전달합니다. ③ '기록만으로 바뀐 것'을 2분 영상 2편으로 만들어 학교·마을 게시판에 공유합니다. 완료 기준: 참여 5명 · 90일 기록 · 전후 비교표 5건 · 캠페인 영상 2편.",
             "categoryTags": ["project", "volunteer"], "activitySubtype": "project", "projectTrack": True, "priority": "boost",
             "aiTools": ["Google Sheets", "ChatGPT", "CapCut"],
             "deliverable": "참여자 5명 90일 기록 + 전후 비교표 5건 + 캠페인 영상 2편(각 2분)",
             "cost": "무료",
         }),
    ],
    "tpl-future-ai-governance-2028": [
        (1, "AI 규칙 초안 만들기 — 생성 → 반론 → 수정 3회 (9~12월)",
         {
             "type": "portfolio", "months": [9, 10, 11, 12], "difficulty": 3, "organizer": "자체",
             "description": "규칙은 한 번에 써지지 않습니다. ① '수업 중 AI 사용 범위' 같은 주제로 Claude에 규칙 초안을 쓰게 합니다. ② 같은 초안을 ChatGPT에 넘겨 반론 5개를 뽑습니다. ③ 반론을 반영해 사람이 직접 고치고, 이 과정을 3회 반복하며 버전을 남깁니다. 완료 기준: 규칙 v1~v3 문서 3부 + 반론 15개 목록 + 최종 수정 근거 메모 1p.",
             "categoryTags": ["paper", "project"], "activitySubtype": "research", "projectTrack": True, "priority": "boost",
             "aiTools": ["Claude", "ChatGPT", "Google Docs"],
             "deliverable": "규칙 초안 v1~v3 3부 + AI 반론 15개 목록 + 수정 근거 메모 1p",
             "cost": "무료",
         }),
        (2, "창직 기록 — 학교 규칙 1건 채택시키기 + 공청회 1회 (3~7월)",
         {
             "type": "portfolio", "months": [3, 4, 5, 6, 7], "difficulty": 4, "organizer": "학교",
             "description": "제안서를 쓰는 것과 채택되는 것은 다릅니다. ① 설문 100건 결과와 규칙 v3을 묶어 학생회·학교에 정식 제안합니다. ② 반대 의견을 듣는 공청회를 1회 열어(참석 30명 목표) 수정안을 만듭니다. ③ 채택 여부와 관계없이 '어디서 막혔는지'를 회고 1p로 남깁니다. 완료 기준: 제안서 접수 1건 · 공청회 1회(참석 30명) · 채택 또는 반려 사유 문서 1건 · 회고 1p.",
             "categoryTags": ["project"], "activitySubtype": "project", "projectTrack": True, "priority": "must",
             "aiTools": ["Google Forms", "ChatGPT", "Canva"],
             "deliverable": "정식 제안서 1부 + 공청회 기록(참석 30명) + 채택·반려 문서 1건 + 회고 1p",
             "cost": "무료",
         }),
    ],
}

NEW_GOALS = {
    "tpl-future-ai-core-engineer-2028": {
        1: "11월까지 AI 에이전트 3종 분업 비교표 1장(20문항 × 2방식) + 사람이 꼭 개입해야 하는 지점 3개 문서화",
        2: "9월까지 서비스 운영 매뉴얼 A4 2장 + 후배 인수인계 1회 + 3분 소개 영상 1편 완성",
    },
    "tpl-future-physical-ai-robotics-2028": {
        1: "12월까지 센서 로그 12주 자동 요약 기록 + 이상 징후 사전 감지 3건 확보",
        2: "9월까지 불편 접수 10건 중 5건 수리 + 원가·시급 정산표 1장 + 안내 영상 1편 완성",
    },
    "tpl-future-ai-bio-health-2028": {
        1: "12월까지 AI 건강정보 검증표 20행 + 오류 사례 5건 원인 메모 + 보건교사 확인 1건",
        2: "8월까지 참여자 5명 90일 기록 + 전후 비교표 5건 + 캠페인 영상 2편 완성",
    },
    "tpl-future-ai-governance-2028": {
        1: "12월까지 규칙 초안 v1~v3 3부 + AI 반론 15개 목록 + 수정 근거 메모 1p 완성",
        2: "7월까지 학교 규칙 제안 1건 접수 + 공청회 1회(참석 30명) + 채택·반려 문서 1건 확보",
    },
}

FILE = "career-path-templates-future.json"


def main():
    data = load(FILE)
    out = []
    for t in data:
        tid = t["id"]
        t = fix_admission_self_intro(t)
        t["northStar"] = NORTH_STAR[tid]
        t["competencyGrowth"] = build_growth(
            STAGES, GROWTH[tid],
            note="고1→고3 동안 '무엇이 몇 개 쌓였는지'로 5개 역량을 점수화했습니다.",
        )
        t["aiOrchestra"] = {
            "note": "한 도구에 다 맡기지 않고 단계마다 역할을 나눠 쓰는 법.",
            "agents": [{"stage": s, "tools": list(tools), "use": use} for s, tools, use in ORCHESTRA[tid]],
        }
        assign_goal_index(t)
        for year_idx, title, body in NEW_ITEMS[tid]:
            year = t["years"][year_idx]
            year["goals"].append(NEW_GOALS[tid][year_idx])
            item = {"type": body["type"], "title": title}
            item.update({k: v for k, v in body.items() if k != "type"})
            item["goalIndex"] = len(year["goals"]) - 1
            year["items"].append(item)
        t["totalItems"] = sum(len(y["items"]) for y in t["years"])
        out.append(t)
    save(FILE, out)
    print("updated", len(out), "templates;", sum(t["totalItems"] for t in out), "items")


if __name__ == "__main__":
    main()
