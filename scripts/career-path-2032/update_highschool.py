# -*- coding: utf-8 -*-
"""career-path-templates-highschool.json — 2032 창직·AI 역량 개편 (고입 5종)"""
from common import load, save, build_growth, assign_goal_index

FILE = "career-path-templates-highschool.json"
STAGES = ["중1", "중2", "중3"]

NORTH_STAR = {
    "tpl-hs-admission-business-001": {
        "goal": "'회계를 배운 학생'이 아니라 '작은 장사를 직접 돌려본 학생'이 된다 — 중3까지 내 손으로 매출·비용·이익을 정산한 사업 3회를 남긴다.",
        "proof": "미니 창업 3회 · 누적 매출 30만원 이상 · 정산표 3장 · 재구매·재의뢰 5건",
        "byWhen": "중3 8월까지",
        "ventureNote": "창직 관점 — AI가 회계·마케팅 실무를 대신하는 시대에 남는 건 '팔아본 경험'과 '숫자를 책임진 기록'이다.",
    },
    "tpl-hs-admission-meister-specialized-001": {
        "goal": "'만들 줄 아는 학생'을 넘어 '남이 쓰는 물건을 만든 학생'이 된다 — 실제 사용자 10명이 쓰는 장치·서비스 1개를 완성한다.",
        "proof": "작동하는 결과물 3개 · 실사용자 10명 · 개선 요청 10건 중 5건 반영 · 시연 영상 3편",
        "byWhen": "중3 9월까지",
        "ventureNote": "창직 관점 — 마이스터고 졸업 후 바로 기술로 먹고사는 길. 그 첫 증거가 '남이 쓰는 내 결과물'이다.",
    },
    "tpl-hs-admission-science-gifted-001": {
        "goal": "문제를 푸는 사람에서 '문제를 만들고 검증하는 사람'이 된다 — 내가 세운 가설을 데이터로 검증한 탐구 3편을 남긴다.",
        "proof": "탐구보고서 3편(중1 미니 · 중2 융합 · 중3 심화) · 직접 계산·실험 데이터 3세트 · 교사 검토 6회",
        "byWhen": "중3 8월까지",
        "ventureNote": "창직 관점 — AI가 계산을 대신할수록 '무엇을 물을지 정하는 사람'의 값이 오른다. 질문 설계력이 곧 자산.",
    },
    "tpl-hs-admission-foreign-language-001": {
        "goal": "번역기를 이기려 하지 않고 '번역기가 못 하는 자리'를 찾는다 — AI 번역의 오류·뉘앙스 붕괴를 100건 잡아내 기록한다.",
        "proof": "번역 오류 사례 100건 · 원인 분류표 1장 · 문화 배경 설명 카드 30장 · 다국어 콘텐츠 12편",
        "byWhen": "중3 9월까지",
        "ventureNote": "창직 관점 — 1인 다국어 콘텐츠·현지화 사업은 AI 시대에 오히려 커진다. 필요한 건 '문화 맥락을 아는 검수자'.",
    },
    "tpl-hs-admission-international-001": {
        "goal": "영어를 잘하는 학생이 아니라 '국제 이슈를 영어로 설계하고 설득하는 학생'이 된다 — 내가 만든 제안이 실제 활동으로 이어지게 한다.",
        "proof": "영어 제안서 3편 · 모의UN·토론 3회 · 국제 이슈 캠페인 2건(참여 50명) · 봉사 누적 60시간",
        "byWhen": "중3 9월까지",
        "ventureNote": "창직 관점 — 국경 없는 1인 프로젝트(글로벌 캠페인·리서치 용역)의 출발선은 '영어로 설득해 본 경험'이다.",
    },
}

GROWTH = {
    "tpl-hs-admission-business-001": {
        "ai": [(30, "가계부·차트 자동화에 AI 3회 이상 사용"), (60, "SNS 게시물 20개 AI 분석 + 카피 20개 생성"), (85, "재고·정산·홍보를 AI 도구 3종으로 분업")],
        "plan": [(30, "소비 패턴 차트 3종 → 문제 1개 정의"), (65, "미니 창업 2회 기획서·정산표 작성"), (85, "3회차 사업 계획서 + 손익 목표 수립")],
        "fusion": [(25, "경제 도서 3권 → 생활 데이터 연결"), (60, "회계 지식 + 마케팅 실험 결합"), (82, "AI 트렌드 보고서 + 내 사업 데이터 결합 1편")],
        "venture": [(20, "용돈 가계부로 돈 흐름 파악"), (55, "미니 창업 2회 · 매출 발생"), (85, "누적 매출 30만원 + 재구매 5건")],
        "deliver": [(30, "마케팅 발표자료 10장"), (60, "홍보 콘텐츠 20편 발행"), (85, "판매 소개 영상 3편 + 면접 답변 30개")],
    },
    "tpl-hs-admission-meister-specialized-001": {
        "ai": [(30, "AI로 회로·코드 오류 설명 듣고 수정 10회"), (60, "미니 프로젝트에 AI 코드 보조 상시 사용"), (85, "AI 설계 검토 → 사람 최종 판단 루틴 확립")],
        "plan": [(30, "기술 분야 10편 탐색 → 1순위 확정"), (65, "부품·일정·예산 계획표로 프로젝트 완주"), (85, "사용자 요구 10건 → 개선 우선순위 결정")],
        "fusion": [(25, "기술가정·정보 교과와 메이커 활동 연결"), (60, "하드웨어 + 소프트웨어 결합 결과물 1개"), (82, "기술 + 안전 + 사용자 안내까지 포함한 결과물")],
        "venture": [(20, "메이커 작품 1개 완성"), (55, "학급에서 실제 쓰이는 결과물 1개"), (85, "실사용자 10명 + 개선 요청 5건 반영")],
        "deliver": [(30, "제작 과정 사진 10장 + 소감문 1편"), (60, "1분 시연 영상 1편"), (85, "시연 영상 3편 + 포트폴리오 15쪽")],
    },
    "tpl-hs-admission-science-gifted-001": {
        "ai": [(35, "Colab 노트북 5개 + AI 코드 설명 20회"), (65, "시뮬레이션·데이터 처리에 AI 상시 활용"), (85, "AI 계산 결과를 손계산으로 검증 20건")],
        "plan": [(35, "탐구 일지 20편 → 주제 후보 3개 압축"), (70, "가설·변인·검증 설계로 보고서 1편 완주"), (88, "심화 탐구 설계 + 한계·후속 과제 제시")],
        "fusion": [(30, "수학·과학 교과 개념을 탐구에 적용"), (65, "수학·과학 융합 보고서 1편(그래프 3개)"), (85, "실험 + 시뮬레이션 + 문헌 3축 결합")],
        "venture": [(15, "탐구 질문을 스스로 만드는 습관"), (45, "R&E·캠프에서 팀 연구 1건 수행"), (72, "탐구 결과를 공개 발표·기고로 확장")],
        "deliver": [(30, "탐구 일지 20편 기록"), (60, "R&E 결과 발표 1회"), (85, "구술 40문항 + 모의면접 5회")],
    },
    "tpl-hs-admission-foreign-language-001": {
        "ai": [(35, "AI 어휘·표현 일지 300개 + 오류 유형 5개"), (65, "AI 첨삭 에세이 12편 + 오류 추이표 1장"), (88, "AI 번역 오류 100건 수집·분류")],
        "plan": [(30, "제2외국어 4종 체험 → 1순위 확정"), (60, "에세이·토론 연간 계획 수립·완주"), (82, "학교별 학습계획서 3부 설계")],
        "fusion": [(30, "원서 10권 + 어휘 데이터 연결"), (62, "언어 + 국제 이슈 토론 결합"), (85, "언어 + 문화 배경 + AI 한계 묶은 에세이 1편")],
        "venture": [(15, "영어 요약 10편 축적"), (45, "영자신문 기사 4편 발행"), (72, "다국어 콘텐츠 12편 공개 · 구독 30명")],
        "deliver": [(35, "영어 요약 10편"), (65, "모의UN·토론 2회 발표"), (88, "면접 대본 30개 + 모의면접 5회")],
    },
    "tpl-hs-admission-international-001": {
        "ai": [(35, "AI 피드백 에세이 12편(초안·수정 비교)"), (65, "이슈 자료 AI 요약 + 원문 대조 30건"), (85, "영어 제안서 AI 초안 → 사람 검증 3회")],
        "plan": [(30, "봉사·독서 연간 계획 수립·완주"), (65, "IB/AP 비교 + 지원 학교 5곳 분석"), (85, "캠페인 기획 → 실행 → 결과 측정 완주")],
        "fusion": [(30, "원서 독서 + 글로벌 이슈 연결"), (62, "언어 + 국제 제도 이해 결합"), (85, "이슈 + 데이터 + 설득 전략 결합 제안서 3편")],
        "venture": [(15, "봉사 20시간으로 현장 감각 확보"), (50, "봉사 누적 40시간 + 활동 설계 참여"), (78, "국제 이슈 캠페인 2건 · 참여 50명")],
        "deliver": [(35, "영어 에세이 12편"), (68, "모의UN 스피치 원고 4편"), (88, "캠페인 영상 2편 + 모의면접 5회")],
    },
}

ORCHESTRA = {
    "tpl-hs-admission-business-001": [
        ("중1 — 숫자 정리", ["Google Sheets", "ChatGPT"], "가계부 데이터를 표·차트로 바꾸고, 이상한 지출을 AI에게 찾게 한다."),
        ("중2 — 팔아보기", ["ChatGPT(카피)", "Canva(상세페이지)", "Sheets(정산)"], "홍보 문구와 이미지는 AI, 가격 결정과 응대는 사람이 한다."),
        ("중3 — 분업 운영", ["ChatGPT", "Canva", "CapCut", "Sheets"], "기획·제작·정산·홍보를 도구 4개에 나눠 맡기고 하루 30분으로 운영."),
    ],
    "tpl-hs-admission-meister-specialized-001": [
        ("중1 — 만들기 보조", ["ChatGPT", "Tinkercad", "MakeCode"], "설계 오류와 코드 에러를 AI에게 설명시키고 스스로 고친다."),
        ("중2 — 제작 가속", ["ChatGPT(코드)", "Teachable Machine", "Canva(도면 설명)"], "AI로 만든 코드는 반드시 손으로 한 번 다시 읽고 주석을 단다."),
        ("중3 — 인수인계", ["ChatGPT", "CapCut", "Notion"], "사용 설명서와 시연 영상을 만들어 '남이 쓸 수 있게' 정리한다."),
    ],
    "tpl-hs-admission-science-gifted-001": [
        ("중1 — 계산 도구", ["Colab", "ChatGPT", "GeoGebra"], "코드로 계산을 자동화하되 결과는 손계산으로 검산한다."),
        ("중2 — 탐구 보조", ["Elicit", "Colab", "ChatGPT"], "선행 연구 요약은 AI, 가설과 변인 설정은 사람이 한다."),
        ("중3 — 검증 습관", ["ChatGPT", "Wolfram Alpha", "Google Scholar"], "AI가 준 풀이의 오류를 찾아내는 훈련이 구술 면접 대비가 된다."),
    ],
    "tpl-hs-admission-foreign-language-001": [
        ("중1 — 어휘 축적", ["ChatGPT", "DeepL", "Quizlet"], "같은 문장을 두 번역기에 넣고 다른 지점을 기록한다."),
        ("중2 — 글쓰기 첨삭", ["ChatGPT(첨삭)", "Grammarly", "Notion"], "AI 첨삭 전후를 나란히 저장해 내 오류 유형을 추적한다."),
        ("중3 — 문화 검수", ["DeepL", "ChatGPT", "CapCut"], "AI 번역이 놓친 뉘앙스를 사람이 잡아 콘텐츠로 만든다."),
    ],
    "tpl-hs-admission-international-001": [
        ("중1 — 읽고 요약", ["ChatGPT", "Google Translate", "Notion"], "원서·기사 요약은 AI, 내 의견 문장은 직접 쓴다."),
        ("중2 — 이슈 분석", ["Perplexity", "ChatGPT", "Google Forms"], "국제 이슈의 찬반 근거를 모으고 또래 의견을 수집한다."),
        ("중3 — 설득·확산", ["Claude(영문 제안서)", "Canva", "CapCut"], "영문 초안은 AI, 최종 논리와 숫자는 사람이 책임진다."),
    ],
}

# (year_index, goal, item)
NEW = {
    "tpl-hs-admission-business-001": [
        (2, "8월까지 3회차 미니 사업 완주 — 누적 매출 30만원 + 재구매 5건 + 원가·시급 정산표 1장",
         {
             "type": "activity", "title": "창직 프로젝트 — 3회차 미니 사업 + 누적 매출 30만원 (3~8월)",
             "months": [3, 4, 5, 6, 7, 8], "difficulty": 4, "organizer": "자체",
             "description": "중2 미니 창업 2회의 정산표를 열어 '가장 이익이 남은 방식' 하나만 골라 규모를 키웁니다. ① 판매 품목 1개를 정하고 원가·목표 이익을 먼저 계산합니다(팔기 전에 숫자부터). ② 홍보 문구·이미지는 AI로 20종을 만들어 반응이 좋은 3종만 사용합니다. ③ 매 판매 후 정산표에 매출·비용·소요 시간을 적어 시급을 계산하고, 다음 회차 가격을 조정합니다. 완료 기준: 누적 매출 30만원 이상 · 재구매 또는 재의뢰 5건 · 원가·시급 정산표 1장.",
             "categoryTags": ["project"], "activitySubtype": "project", "projectTrack": True, "priority": "must",
             "aiTools": ["ChatGPT", "Canva", "Google Sheets"],
             "deliverable": "3회차 사업 정산표 1장(매출·비용·시급) + 재구매 5건 기록 + 홍보 콘텐츠 20종 중 채택 3종",
             "cost": "재료 실비 3~10만원",
         }),
        (2, "9월까지 판매 과정 소개 영상 3편(각 2분) + 조회수·문의 기록 1장 완성",
         {
             "type": "activity", "title": "캠페인 영상 3편 — '중학생이 직접 팔아본 기록' (7~9월)",
             "months": [7, 8, 9], "difficulty": 2, "organizer": "자체",
             "description": "숫자만 남기면 면접에서 설명이 안 됩니다. ① 기획·제작·판매·정산 4단계 중 3개를 골라 각 2분 영상으로 찍습니다. ② 실패한 회차를 반드시 1편에 포함합니다(왜 안 팔렸는지). ③ 학교 게시판·동아리 계정에 올려 문의·반응을 기록합니다. 완료 기준: 영상 3편 · 조회수 기록 1장 · 문의·피드백 5건.",
             "categoryTags": ["project"], "activitySubtype": "project", "projectTrack": True, "priority": "boost",
             "aiTools": ["CapCut", "ChatGPT(대본)", "Canva(썸네일)"],
             "deliverable": "2분 소개 영상 3편(실패 회차 1편 포함) + 조회수·문의 기록 1장",
             "cost": "무료",
         }),
    ],
    "tpl-hs-admission-meister-specialized-001": [
        (2, "8월까지 실사용자 10명이 쓰는 결과물 1개 + 개선 요청 10건 중 5건 반영 완료",
         {
             "type": "activity", "title": "창직 프로젝트 — 남이 쓰는 결과물 만들기: 사용자 10명 확보 (3~8월)",
             "months": [3, 4, 5, 6, 7, 8], "difficulty": 4, "organizer": "자체",
             "description": "중2 미니 프로젝트를 '내가 만든 것'에서 '남이 쓰는 것'으로 올립니다. ① 학교·집·동아리에서 실제 불편 3가지를 찾아 그중 1개를 해결하는 장치·프로그램을 만듭니다. ② 사용자 10명에게 2주 이상 쓰게 하고 불편 10건을 받아 적습니다. ③ 그중 5건을 실제로 고치고 무엇을 못 고쳤는지도 남깁니다. 완료 기준: 사용자 10명 · 개선 요청 10건 접수 · 5건 반영 · 미해결 사유 정리 1p.",
             "categoryTags": ["project"], "activitySubtype": "project", "projectTrack": True, "priority": "must",
             "aiTools": ["ChatGPT", "Tinkercad", "Google Forms"],
             "deliverable": "실사용 결과물 1개 + 사용자 10명 기록 + 개선 요청 10건·반영 5건 표 1장",
             "cost": "부품 실비 3~8만원",
         }),
        (2, "9월까지 시연 영상 3편(각 1분) + 사용 설명서 1부로 인수인계 1회 완료",
         {
             "type": "activity", "title": "기술 인수인계 — 시연 영상 3편 + 사용 설명서 1부 (8~9월)",
             "months": [8, 9], "difficulty": 2, "organizer": "자체",
             "description": "기술자는 '설명할 수 있어야' 값이 매겨집니다. ① 만든 결과물의 작동·고장 대처·주의사항을 각 1분 영상으로 찍습니다. ② 사용 설명서 A4 2장을 만들어 후배나 담당 선생님께 넘깁니다. ③ 넘긴 사람이 설명서만 보고 1주 운영하게 해 막힌 곳을 보완합니다. 완료 기준: 1분 영상 3편 · 설명서 A4 2장 · 인수인계 1회 기록.",
             "categoryTags": ["project"], "activitySubtype": "project", "projectTrack": True, "priority": "boost",
             "aiTools": ["CapCut", "ChatGPT(설명서 초안)", "Canva"],
             "deliverable": "1분 시연 영상 3편 + 사용 설명서 A4 2장 + 인수인계 기록 1건",
             "cost": "무료",
         }),
    ],
    "tpl-hs-admission-science-gifted-001": [
        (1, "9월까지 AI 계산·풀이 오류 검증 20건 기록 + 원인 분류표 1장 완성",
         {
             "type": "research", "title": "AI 오류 검증 노트 20건 — AI 풀이를 손계산으로 되짚기 (5~9월)",
             "months": [5, 6, 7, 8, 9], "difficulty": 3, "organizer": "자체",
             "description": "AI가 수학·과학 문제에서 틀리는 지점을 직접 확인하는 훈련입니다. ① 기출·탐구 과정에서 나온 문제 20개를 AI에게 풀리고 답과 풀이를 저장합니다. ② 손계산·시뮬레이션으로 검증해 맞음·계산 오류·논리 비약으로 분류합니다. ③ 틀린 풀이가 왜 그럴듯해 보였는지 한 줄씩 적습니다. 완료 기준: 검증 20건 · 원인 분류표 1장 · 구술 대비 인용 사례 3건.",
             "categoryTags": ["paper", "activity"], "activitySubtype": "research", "projectTrack": True, "priority": "boost",
             "aiTools": ["ChatGPT", "Wolfram Alpha", "Colab"],
             "deliverable": "AI 풀이 검증 노트 20건 + 오류 원인 분류표 1장 + 구술 인용 사례 3건",
             "cost": "무료",
         }),
        (2, "7월까지 탐구 결과 공개 확장 — 3분 설명 영상 2편 + 후배 대상 강의 1회(참석 15명)",
         {
             "type": "activity", "title": "탐구 확산 — 3분 설명 영상 2편 + 후배 강의 1회 (5~7월)",
             "months": [5, 6, 7], "difficulty": 3, "organizer": "학교·동아리",
             "description": "설명해 보기 전에는 이해한 게 아닙니다. ① 3년간 탐구 중 2편을 골라 각 3분 영상으로 정리합니다(가설 → 방법 → 결과 → 한계). ② 후배 15명 대상 1회 강의를 열고 질문 10개를 받아 답합니다. ③ 답하지 못한 질문은 그대로 기록해 구술 대비 자료로 씁니다. 완료 기준: 영상 2편 · 강의 1회(참석 15명) · 미답변 질문 목록 1장.",
             "categoryTags": ["project"], "activitySubtype": "project", "projectTrack": True, "priority": "boost",
             "aiTools": ["CapCut", "ChatGPT(대본 검토)", "Canva"],
             "deliverable": "3분 탐구 설명 영상 2편 + 후배 강의 1회 기록 + 미답변 질문 목록 1장",
             "cost": "무료",
         }),
    ],
    "tpl-hs-admission-foreign-language-001": [
        (1, "12월까지 AI 번역 오류 사례 100건 수집 + 원인 4분류표 1장 완성",
         {
             "type": "activity", "title": "AI 번역 오류 사냥 100건 — 번역기가 못 하는 자리 찾기 (3~12월)",
             "months": [3, 4, 5, 6, 7, 8, 9, 10, 11, 12], "difficulty": 3, "organizer": "자체",
             "description": "번역기와 경쟁하지 않고 번역기의 한계를 자산으로 만드는 활동입니다. ① 매주 원문 2~3개를 골라 DeepL·ChatGPT에 넣고 결과를 저장합니다. ② 어색한 지점을 관용어·문화 배경·존댓말·전문 용어 4가지로 분류합니다. ③ 원어민 자료·사전으로 확인해 올바른 표현을 적습니다. 완료 기준: 사례 100건 · 4분류표 1장 · 대표 사례 10건 설명 카드.",
             "categoryTags": ["paper", "activity"], "activitySubtype": "research", "projectTrack": True, "priority": "must",
             "aiTools": ["DeepL", "ChatGPT", "Notion"],
             "deliverable": "번역 오류 사례 100건 표 + 원인 4분류표 1장 + 대표 사례 설명 카드 10장",
             "cost": "무료",
         }),
        (2, "9월까지 다국어 콘텐츠 12편 발행 + 구독·팔로워 30명 확보",
         {
             "type": "activity", "title": "창직 프로젝트 — 다국어 콘텐츠 채널 12편 운영 (3~9월)",
             "months": [3, 4, 5, 6, 7, 8, 9], "difficulty": 3, "organizer": "자체",
             "description": "'문화 맥락을 아는 검수자'를 1인 채널로 증명합니다. ① 한국 문화·학교 생활 주제를 골라 한국어 + 목표 외국어 2개 언어로 카드뉴스·짧은 영상을 만듭니다(월 2편). ② AI 번역 초안을 반드시 사람이 고치고, 고친 이유를 편마다 1줄 남깁니다. ③ 반응이 좋은 3편은 원어민 친구·선생님께 검수받아 개선판을 냅니다. 완료 기준: 콘텐츠 12편 · 구독 30명 · 번역 수정 사유 기록 12건.",
             "categoryTags": ["project"], "activitySubtype": "project", "projectTrack": True, "priority": "boost",
             "aiTools": ["DeepL", "ChatGPT", "Canva", "CapCut"],
             "deliverable": "다국어 콘텐츠 12편 + 구독 30명 기록 + 번역 수정 사유 노트 12건",
             "cost": "무료",
         }),
    ],
    "tpl-hs-admission-international-001": [
        (1, "11월까지 국제 이슈 영어 제안서 2편(각 A4 2장) + 또래 설문 응답 60건 확보",
         {
             "type": "research", "title": "국제 이슈 영어 제안서 2편 + 또래 설문 60건 (5~11월)",
             "months": [5, 6, 7, 8, 9, 10, 11], "difficulty": 3, "organizer": "자체",
             "description": "국제고는 '영어를 잘하는 학생'이 아니라 '영어로 문제를 다루는 학생'을 뽑습니다. ① 기후·난민·AI 격차 중 2개 주제를 골라 자료를 모읍니다. ② 또래 60명에게 영어·한국어 병기 설문을 돌려 의견을 수집합니다. ③ 설문 결과를 근거로 A4 2장 영어 제안서를 씁니다(AI 초안 → 직접 수정 3회). 완료 기준: 제안서 2편 · 설문 응답 60건 · AI 초안과 최종본 비교 2건.",
             "categoryTags": ["paper", "project"], "activitySubtype": "research", "projectTrack": True, "priority": "boost",
             "aiTools": ["Perplexity", "Claude", "Google Forms"],
             "deliverable": "영어 제안서 2편(각 A4 2장) + 설문 응답 60건 + 초안·최종본 비교 2건",
             "cost": "무료",
         }),
        (2, "9월까지 국제 이슈 캠페인 2건 실행 — 참여 50명 + 영어 캠페인 영상 2편 완성",
         {
             "type": "activity", "title": "창직 프로젝트 — 국제 이슈 캠페인 2건 실행 (3~9월)",
             "months": [3, 4, 5, 6, 7, 8, 9], "difficulty": 4, "organizer": "학교·지역",
             "description": "제안서를 실제 행동으로 옮기는 단계입니다. ① 중2 제안서 2편 중 하나를 골라 학교·지역에서 실행 가능한 캠페인으로 축소 설계합니다(예: 교내 다국어 안내판, 난민 이해 부스). ② 참여자 50명을 목표로 2건을 진행하고 참여 기록을 남깁니다. ③ 과정을 영어 자막 영상 2편으로 정리합니다. 완료 기준: 캠페인 2건 · 참여 50명 · 영어 자막 영상 2편 · 결과 보고 1p.",
             "categoryTags": ["project", "volunteer"], "activitySubtype": "project", "projectTrack": True, "priority": "must",
             "aiTools": ["Canva", "CapCut", "ChatGPT(영문 자막)"],
             "deliverable": "캠페인 2건 실행 기록(참여 50명) + 영어 자막 영상 2편 + 결과 보고 1p",
             "cost": "재료비 2~5만원",
         }),
    ],
}


def main():
    data = load(FILE)
    for t in data:
        tid = t["id"]
        t["northStar"] = NORTH_STAR[tid]
        t["competencyGrowth"] = build_growth(
            STAGES, GROWTH[tid],
            note="중1→중3 동안 쌓인 결과물 개수로 5개 역량을 점수화했습니다.",
        )
        t["aiOrchestra"] = {
            "note": "고입 준비 3년 동안 단계별로 AI 도구를 어떻게 나눠 썼는지.",
            "agents": [{"stage": s, "tools": list(tools), "use": use} for s, tools, use in ORCHESTRA[tid]],
        }
        assign_goal_index(t)
        for year_idx, goal, item in NEW[tid]:
            year = t["years"][year_idx]
            year["goals"].append(goal)
            item = dict(item)
            item["goalIndex"] = len(year["goals"]) - 1
            year["items"].append(item)
        t["totalItems"] = sum(len(y["items"]) for y in t["years"])

    # 외고: 공인 어학시험은 외고 전형에 반영되지 않음을 명시 (실력 점검용으로만 유지)
    for t in data:
        if t["id"] != "tpl-hs-admission-foreign-language-001":
            continue
        for y in t["years"]:
            for it in y["items"]:
                if "공인 어학시험" in it.get("title", ""):
                    it["description"] = (
                        "공인 어학시험 성적은 외고 전형에 반영되지 않습니다(제출 시 0점 처리). "
                        "여기서는 오직 '내 실력이 지금 어디쯤인지' 확인하는 용도로만 1회 응시합니다. "
                        "① 제2외국어 단어 300개를 6개월간 누적하고 ② 응시 후 오답 유형 5개를 정리해 "
                        "다음 학습 계획에 반영합니다. 완료 기준: 응시 결과 1부 + 오답 유형 정리 5개."
                    )
    save(FILE, data)
    print("updated", len(data), "templates;", sum(t["totalItems"] for t in data), "items")


if __name__ == "__main__":
    main()
