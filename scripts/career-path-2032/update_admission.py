# -*- coding: utf-8 -*-
"""career-path-templates-admission.json — 2032 창직·AI 역량 개편 (대입 5종)

- 2024 대입 개편으로 폐지된 자기소개서 항목을 '생기부 연계 면접 준비'로 교체
- 고3 학년이 없던 3개 템플릿에 고3 마무리 학년 추가
"""
from common import load, save, build_growth, assign_goal_index

FILE = "career-path-templates-admission.json"

NORTH_STAR = {
    "tpl-admission-snu-cse-001": {
        "goal": "코딩을 잘하는 학생이 아니라 'AI 에이전트로 서비스를 혼자 굴리는 학생'이 된다 — 실사용자 50명이 매달 쓰는 서비스 1개를 운영한다.",
        "proof": "배포 서비스 4개 · 최종 서비스 실사용자 50명 · 1개월 운영 통계 1편 · 누적 커밋 300회",
        "byWhen": "고3 6월까지",
        "ventureNote": "창직 관점 — 서울대 컴공 합격은 통과점일 뿐. 남는 자산은 '혼자서 서비스를 세우고 유지한 기록'이다.",
    },
    "tpl-admission-kaist-ee-001": {
        "goal": "회로를 아는 학생을 넘어 '물리 세계에서 AI를 돌리는 학생'이 된다 — 내가 만든 하드웨어 위에서 AI 모델이 실제로 동작하게 만든다.",
        "proof": "동작하는 보드 4종(Arduino·RPi·STM32·FPGA) · 엣지 AI 포팅 2건 · 성능 비교표 2장 · 논문 1편 공개",
        "byWhen": "고3 5월까지",
        "ventureNote": "창직 관점 — 피지컬 AI 시대의 1인 사업은 '설계·제작·포팅·유지보수를 혼자 끝내는 사람'에게 열린다.",
    },
    "tpl-admission-yonsei-med-001": {
        "goal": "성적만 좋은 지원자가 아니라 '환자의 말을 데이터로 옮길 줄 아는 지원자'가 된다 — 사람을 만나 얻은 기록 위에 AI 분석을 얹는다.",
        "proof": "봉사 누적 100시간 · 인터뷰 5건 질적 분석 1편 · R&E 논문 초고 1편 · AI 의료 오류 검증 20건",
        "byWhen": "고3 8월까지",
        "ventureNote": "창직 관점 — 진단은 AI가 빨라져도, 동의를 얻고 설명하고 책임지는 일은 사람 몫으로 남는다.",
    },
    "tpl-admission-korea-biz-001": {
        "goal": "경영을 배운 학생이 아니라 '고객을 직접 찾아 검증한 학생'이 된다 — 실제 매출과 고객 검증 50명을 남긴다.",
        "proof": "미니 창업 매출 정산 1건 · 고객 검증 누적 50명 · 사업계획서 3편 · 프로토타입 2개",
        "byWhen": "고3 6월까지",
        "ventureNote": "창직 관점 — AI가 분석·문서를 대신할수록 '고객을 만나 팔아본 사람'만 남는다.",
    },
    "tpl-admission-snu-law-001": {
        "goal": "법을 외우는 학생이 아니라 '규칙을 설계하고 근거로 설득하는 학생'이 된다 — 내가 쓴 서면·의견서가 실제 토론과 판단의 재료가 되게 한다.",
        "proof": "모의재판 서면 8부 · 의견서·에세이 3편 · 팩트체크 노트 12편 · 판례 RAG 챗봇 출처 정확도 80%",
        "byWhen": "고3 7월까지",
        "ventureNote": "창직 관점 — AI 규제·계약 검토 수요가 커질수록 '기술을 이해하는 법률 인재'의 1인 자문 시장이 열린다.",
    },
}

GROWTH = {
    "tpl-admission-snu-cse-001": {
        "ai": [(35, "RAG 챗봇 1개 배포"), (55, "Whisper 회의록 MVP 배포"), (72, "GPT API 챗봇 질문 50건 처리"), (85, "LangGraph 멀티 에이전트 공개"), (95, "에이전트 서비스 실사용자 50명 운영")],
        "plan": [(30, "게임 1편 기획·완성"), (50, "웹앱 요구사항 → 배포까지 완주"), (68, "앱 스토어 등록 절차 설계"), (85, "사용자 30명 서비스 운영 계획"), (95, "1개월 운영 통계 기반 개선 계획")],
        "fusion": [(25, "AI 기초 + 파이썬 결합"), (45, "음성·언어 모델 + 웹 결합"), (65, "ML 탐구 보고서 1편"), (85, "R&E 논문 초고 1편"), (92, "기술 + 사용자 데이터 결합 발표")],
        "venture": [(15, "공개 저장소 운영 시작"), (35, "베타 피드백 10건 수집"), (55, "실사용 글 10건 확보"), (78, "사용자 30명 · 커밋 80회"), (95, "사용자 50명 · 운영 통계 1편")],
        "deliver": [(20, "커밋 30회 · README 정비"), (40, "MVP 데모 공개"), (60, "탐구 보고서 발표 1회"), (80, "R&E 발표 1회"), (92, "모의면접 5회 + 답변 30문항")],
    },
    "tpl-admission-kaist-ee-001": {
        "ai": [(30, "센서 데이터 시각화 노트북 1개"), (55, "TFLite 엣지 분류기 1개"), (72, "신호처리 + 딥러닝 프로젝트 1편"), (88, "경량 AI MCU·FPGA 포팅 1건"), (95, "AI+EE 논문 1편 공개")],
        "plan": [(30, "Arduino 작품 12회 실습 설계"), (52, "IoT 7일 무중단 운영 설계"), (70, "STM32 프로젝트 일정·부품 계획"), (86, "FPGA CPU 구현 단계 설계"), (94, "논문 구성 + 발표 자료 15장")],
        "fusion": [(28, "전자기학 개념 + 회로 실습"), (50, "하드웨어 + 데이터 수집 결합"), (72, "실험 데이터 30회 + 보고서"), (88, "회로 + AI 모델 결합"), (95, "AI + EE 융합 논문 완성")],
        "venture": [(15, "작품 1개 완성"), (35, "저장소 공개 · 동작 영상 1편"), (55, "대회 출품 1건"), (75, "성능 비교표로 개선 증명"), (88, "설계·제작·포팅 전 과정 단독 수행")],
        "deliver": [(20, "회차 노트 12회분"), (40, "동작 영상 1편"), (62, "탐구 보고서 1편"), (82, "설계 보고서 1편"), (92, "발표 자료 15장 + 모의면접 5회")],
    },
    "tpl-admission-yonsei-med-001": {
        "ai": [(30, "공공 보건 데이터 시각화 1편"), (55, "논문 요약 10편 + 대조 검증 10건"), (72, "의료 영상 AI 분류 노트북 1개"), (85, "질적 분석에 AI 코딩 보조 활용"), (92, "AI 의료정보 오류 검증 20건")],
        "plan": [(30, "봉사 30시간 루틴 설계"), (52, "캠프·대회 일정 설계"), (70, "R&E 지원서 3부 작성"), (86, "실험 로그 20회 설계·수행"), (93, "면접 대비 활동 정리 설계")],
        "fusion": [(28, "생명·화학 실험 20편"), (50, "의학 논문 + 생명 교과 연결"), (72, "의료 데이터 + 윤리 고찰 결합"), (88, "정량 데이터 + 인터뷰 질적 분석 결합"), (94, "임상·데이터·윤리 3축 정리")],
        "venture": [(15, "보건실 봉사 시작"), (35, "봉사 누적 50시간"), (55, "환자·의료진 접점 확대"), (78, "인터뷰 5건 동의서 확보·수행"), (88, "봉사 누적 100시간 + 활동 설계 주도")],
        "deliver": [(22, "인포그래픽 1장"), (45, "논문 요약 공개 10편"), (65, "모의 MMI 3회"), (85, "학술제 발표 1회"), (93, "MMI 모의면접 8회 + 답변 30문항")],
    },
    "tpl-admission-korea-biz-001": {
        "ai": [(28, "모의투자 리포트에 AI 분석 활용"), (50, "고객 인터뷰 10건 AI 요약·분류"), (70, "산업 리포트 4편 AI 리서치 병행"), (88, "AI 비즈니스 모델 + 프로토타입 1개"), (94, "AI 도구 3종으로 1인 운영 체계 구성")],
        "plan": [(30, "종목 리포트 5편 작성"), (55, "사업계획서 1편(10쪽)"), (72, "고객 검증 20명 설계"), (88, "프로토타입 + 검증 30명 설계"), (95, "손익 목표 포함 사업계획서 최종본")],
        "fusion": [(28, "경제 뉴스 + 투자 데이터 결합"), (50, "고객 인터뷰 + 원가 계산 결합"), (70, "산업 분석 + 재무 정리 결합"), (86, "AI 기술 이해 + 비즈니스 모델 결합"), (93, "데이터 + 고객 + 수익 구조 통합")],
        "venture": [(20, "모의투자 6개월 운영"), (48, "미니 창업 실제 판매·정산 1건"), (68, "고객 검증 20명"), (85, "고객 검증 누적 50명 + 입상"), (95, "실매출 + 재구매 확보")],
        "deliver": [(25, "신문 토론 20회"), (45, "경진대회 출품 1건"), (65, "리포트 4편 공개"), (85, "제안 발표·시연 1회"), (93, "면접 답변 30문항 + 모의면접 5회")],
    },
    "tpl-admission-snu-law-001": {
        "ai": [(28, "팩트체크에 AI 교차 검증 6편"), (52, "판례 RAG 챗봇 출처 정확도 80%"), (70, "AI 법 쟁점 의견서 1편"), (86, "법령 텍스트 분석 노트북 1개"), (93, "AI 초안 → 근거 검증 루틴 확립")],
        "plan": [(30, "팩트체크 월 1편 루틴 설계"), (55, "모의재판 4회 기획·개최"), (72, "대회 서면 1부 제출 설계"), (86, "에세이·MUN 일정 설계"), (94, "면접 대비 쟁점 30개 설계")],
        "fusion": [(28, "역사·사회 + 법 개념 연결"), (52, "판례 + 기술(RAG) 결합"), (72, "AI 윤리 + 법 쟁점 결합"), (88, "법령 데이터 + 텍스트 분석 결합"), (94, "기술 이해 + 법 논증 통합")],
        "venture": [(15, "팩트체크 노트 공개 6편"), (35, "모의재판 동아리 운영"), (55, "대회 출전 1회"), (75, "에세이·MUN 대외 활동 확대"), (88, "AI 법 쟁점 자문형 콘텐츠 12편 운영")],
        "deliver": [(25, "토론 기록 20회"), (48, "서면 8부 작성"), (68, "입론서 3편"), (85, "Position Paper 1편"), (93, "모의면접 5회 + 답변 30문항")],
    },
}

ORCHESTRA = {
    "tpl-admission-snu-cse-001": [
        ("중2~중3 — 만들며 배우기", ["ChatGPT", "GitHub Copilot", "Streamlit"], "에러 메시지를 그대로 붙여 원인을 묻고, 고친 이유를 커밋 메시지에 남긴다."),
        ("고1~고2 — 에이전트 조립", ["LangChain", "LangGraph", "GPT API"], "역할이 다른 에이전트를 연결해 하나의 작업을 나눠 처리하게 만든다."),
        ("고3 — 운영·검증", ["ChatGPT(로그 분석)", "Sentry", "Google Analytics"], "사용자 로그를 자동 요약해 고칠 것 3개를 매주 뽑는다."),
    ],
    "tpl-admission-kaist-ee-001": [
        ("중2~중3 — 회로 보조", ["ChatGPT", "Tinkercad", "Arduino IDE"], "회로 오류 원인을 AI에게 설명시키고 계측기로 직접 확인한다."),
        ("고1 — 모델 올리기", ["PyTorch", "TFLite", "Colab"], "학습은 클라우드에서, 추론은 보드 위에서 돌린다."),
        ("고2~고3 — 최적화", ["ChatGPT(코드 리뷰)", "Verilog 시뮬레이터", "KiCad"], "성능·전력 수치를 표로 비교하며 사람이 최종 설계를 결정한다."),
    ],
    "tpl-admission-yonsei-med-001": [
        ("중2~중3 — 자료 읽기", ["Claude", "PubMed", "KOSIS"], "논문 요약은 AI에 맡기되 초록 원문과 반드시 대조한다."),
        ("고1 — 데이터 다루기", ["PyTorch", "Kaggle", "Colab"], "의료 영상 데이터로 분류 실험을 하고 한계를 1쪽으로 적는다."),
        ("고2~고3 — 사람 기록", ["ChatGPT(질적 코딩 보조)", "Google Forms", "Notion"], "인터뷰는 사람이 하고, 분류·정리만 AI에 맡긴다."),
    ],
    "tpl-admission-korea-biz-001": [
        ("중2~중3 — 숫자 감각", ["Google Sheets", "ChatGPT", "네이버 증권"], "리포트 초안은 AI, 매수·매도 판단과 회고는 사람이 쓴다."),
        ("고1 — 고객 찾기", ["Google Forms", "ChatGPT(인터뷰 질문)", "Canva"], "인터뷰 질문 설계와 응답 분류에 AI를 쓰고 만나는 건 직접 한다."),
        ("고2~고3 — 사업화", ["ChatGPT", "Figma", "Notion", "CapCut"], "제안서·시연 영상까지 혼자 만들어 1인 사업 구조를 익힌다."),
    ],
    "tpl-admission-snu-law-001": [
        ("중2~중3 — 사실 확인", ["ChatGPT", "Perplexity", "빅카인즈"], "AI 요약을 원문 기사 3곳과 대조해 팩트체크 노트를 만든다."),
        ("고1 — 쟁점 정리", ["Claude", "국가법령정보센터", "Notion"], "쟁점별 찬반 논거를 정리하고 반론까지 AI에 시켜본다."),
        ("고2~고3 — 논증 검증", ["Claude(초안)", "ChatGPT(반론)", "Python(법령 분석)"], "AI가 만든 논거의 출처를 하나씩 확인하는 습관이 곧 실력."),
    ],
}

# 자기소개서 폐지 대응: 대체 항목 (기존 항목 title 부분 일치 → 교체)
SELF_INTRO_REPLACEMENT = {
    "title": "생기부 연계 면접 자료 정리 (활동 6건 × 답변 카드, 5회 개정)",
    "description": (
        "2024학년도부터 대입 자기소개서는 전 대학에서 폐지됐습니다. 대신 학생부에 남은 활동을 "
        "면접에서 스스로 설명하는 능력이 평가됩니다. ① 3년 활동 중 6건을 골라 '무엇을 왜 했고, "
        "무엇이 바뀌었나'를 각 1장으로 정리합니다. ② 활동마다 숫자 근거 1개를 반드시 넣습니다. "
        "③ 5회 개정하며 담당 선생님 검토 2회를 받습니다. 완료 기준: 활동 정리 6장 + 개정 이력 5개 버전."
    ),
    "deliverable": "면접용 활동 정리 6장(각 숫자 근거 1개 포함) + 개정 이력 5개 버전 + 교사 검토 2회",
}

# 고3 학년이 없는 템플릿에 추가할 마무리 학년
FINAL_YEAR = {
    "tpl-admission-yonsei-med-001": {
        "gradeId": "high3",
        "gradeLabel": "고3 — 수능·면접·창직 마무리",
        "goals": [
            "11월 수능 국·수·영·과탐 1등급 확보 (주 6일 하루 5시간 고정 학습)",
            "8월까지 생기부 연계 면접 자료 6건 정리 + MMI 모의면접 8회 완료",
            "6월까지 AI 의료정보 오류 검증 20건 + 봉사 누적 100시간 달성",
        ],
        "items": [
            {
                "type": "activity", "title": "수능 국·수·영·과탐 1등급 (3~11월, 주 6일 하루 5시간)",
                "months": [3, 4, 5, 6, 7, 8, 9, 10, 11], "difficulty": 5, "organizer": "자체·인강",
                "description": "의학과는 수능 최저·정시 비중이 모두 높습니다. ① 3월부터 과목별 고정 시간표(국 1h·수 2h·영 1h·과탐 1h)를 지킵니다. ② 매월 학평·모평을 실전 시간으로 응시하고 틀린 문항 유형만 5문항씩 더 풉니다. ③ 9월 모평 후 미달 과목에 주 3시간을 추가 배분합니다. 완료 기준: 11월 수능 4개 영역 1등급.",
                "categoryTags": ["activity"], "activitySubtype": "general", "priority": "must",
                "deliverable": "월별 모의고사 성적표 8회 + 과목별 오답노트 4권", "cost": "무료~월 15만원", "goalIndex": 0,
            },
            {
                "type": "activity", "title": "생기부 연계 면접 자료 6건 + MMI 모의면접 8회 (5~8월)",
                "months": [5, 6, 7, 8], "difficulty": 4, "organizer": "자체·학교",
                "description": "의대 MMI는 '무엇을 했는가'보다 '그때 어떻게 판단했는가'를 묻습니다. ① 봉사·R&E·인터뷰 등 활동 6건을 각 1장으로 정리하고 숫자 근거를 답니다. ② 윤리 딜레마 문항 20개를 만들어 답변을 씁니다. ③ 모의면접 8회를 녹화해 말버릇 3개를 지웁니다. 완료 기준: 활동 정리 6장 + 윤리 답변 20개 + 모의면접 8회 녹화.",
                "categoryTags": ["activity"], "activitySubtype": "general", "priority": "must",
                "deliverable": "면접용 활동 정리 6장 + 윤리 딜레마 답변 20개 + 모의면접 녹화 8편", "cost": "무료", "goalIndex": 1,
            },
            {
                "type": "portfolio", "title": "AI 의료정보 오류 검증 20건 + 봉사 누적 100시간 (3~6월)",
                "months": [3, 4, 5, 6], "difficulty": 3, "organizer": "자체",
                "description": "AI가 알려주는 건강 정보의 오류를 잡아내는 능력은 예비 의료인의 기본기입니다. ① 흔한 건강 질문 20개를 AI에 물어 답을 저장합니다. ② 질병관리청·대한의학회 자료로 검증해 맞음·애매·틀림으로 분류합니다. ③ 봉사 현장에서 실제로 들은 잘못된 건강 상식 5건을 함께 기록합니다. 완료 기준: 검증표 20행 + 현장 오해 사례 5건 + 봉사 누적 100시간.",
                "categoryTags": ["paper", "project", "volunteer"], "activitySubtype": "research",
                "projectTrack": True, "priority": "boost",
                "aiTools": ["ChatGPT", "Elicit", "Consensus"],
                "deliverable": "AI 의료정보 검증표 20행 + 현장 오해 사례 5건 + 봉사 확인서(누적 100시간)",
                "cost": "무료", "goalIndex": 2,
            },
        ],
    },
    "tpl-admission-korea-biz-001": {
        "gradeId": "high3",
        "gradeLabel": "고3 — 수능·면접·창직 마무리",
        "goals": [
            "11월 수능 국·수·영·사탐 2등급 이내 확보 (주 6일 하루 5시간 고정 학습)",
            "8월까지 생기부 연계 면접 자료 6건 정리 + 모의면접 5회 완료",
            "6월까지 고객 검증 누적 50명 + 사업계획서 최종본 1편(손익 목표 포함) 완성",
        ],
        "items": [
            {
                "type": "activity", "title": "수능 국·수·영·사탐 2등급 이내 (3~11월, 주 6일 하루 5시간)",
                "months": [3, 4, 5, 6, 7, 8, 9, 10, 11], "difficulty": 4, "organizer": "자체·인강",
                "description": "경영학과 학종도 수능 최저를 요구하는 전형이 많습니다. ① 과목별 고정 시간표를 3월에 확정합니다. ② 매월 모의고사를 실전으로 응시하고 오답 유형만 추가 학습합니다. ③ 9월 이후에는 취약 1개 과목에 주 3시간을 더 씁니다. 완료 기준: 11월 수능 4개 영역 2등급 이내.",
                "categoryTags": ["activity"], "activitySubtype": "general", "priority": "must",
                "deliverable": "월별 모의고사 성적표 8회 + 과목별 오답노트 4권", "cost": "무료~월 15만원", "goalIndex": 0,
            },
            {
                "type": "activity", "title": "생기부 연계 면접 자료 6건 + 모의면접 5회 (5~8월)",
                "months": [5, 6, 7, 8], "difficulty": 3, "organizer": "자체·학교",
                "description": "창업·투자 활동은 숫자로 말해야 설득됩니다. ① 활동 6건을 각 1장으로 정리하되 매출·고객 수·검증 인원 같은 숫자를 반드시 넣습니다. ② '왜 그 가격이었나' 같은 후속 질문 20개를 만들어 답을 씁니다. ③ 모의면접 5회를 녹화합니다. 완료 기준: 활동 정리 6장 + 후속 질문 20개 답변 + 모의면접 5회.",
                "categoryTags": ["activity"], "activitySubtype": "general", "priority": "must",
                "deliverable": "면접용 활동 정리 6장(숫자 근거 포함) + 후속 질문 20개 답변 + 모의면접 녹화 5편",
                "cost": "무료", "goalIndex": 1,
            },
            {
                "type": "portfolio", "title": "창직 마무리 — 고객 검증 누적 50명 + 사업계획서 최종본 (3~6월)",
                "months": [3, 4, 5, 6], "difficulty": 4, "organizer": "자체",
                "description": "고2 프로토타입을 '팔릴 수 있는 형태'까지 밀어붙입니다. ① 추가 고객 20명을 인터뷰해 누적 50명을 채웁니다. ② 가격·원가·손익분기점을 계산해 사업계획서에 넣습니다. ③ 3분 소개 영상 1편으로 정리해 면접 소재로 씁니다. 완료 기준: 고객 검증 누적 50명 · 사업계획서 최종본 1편 · 소개 영상 1편.",
                "categoryTags": ["project"], "activitySubtype": "project", "projectTrack": True, "priority": "boost",
                "aiTools": ["ChatGPT", "Google Sheets", "Figma", "CapCut"],
                "deliverable": "고객 검증 기록 50명 + 손익 포함 사업계획서 1편 + 3분 소개 영상 1편",
                "cost": "실비 3~10만원", "goalIndex": 2,
            },
        ],
    },
    "tpl-admission-snu-law-001": {
        "gradeId": "high3",
        "gradeLabel": "고3 — 수능·면접·창직 마무리",
        "goals": [
            "11월 수능 국·수·영·사탐 1등급 확보 (주 6일 하루 5시간 고정 학습)",
            "8월까지 생기부 연계 면접 자료 6건 정리 + 모의면접 5회 완료",
            "7월까지 AI 법 쟁점 콘텐츠 12편 공개 + 팩트체크 노트 누적 12편 달성",
        ],
        "items": [
            {
                "type": "activity", "title": "수능 국·수·영·사탐 1등급 (3~11월, 주 6일 하루 5시간)",
                "months": [3, 4, 5, 6, 7, 8, 9, 10, 11], "difficulty": 5, "organizer": "자체·인강",
                "description": "법학 계열은 국어 비중이 결정적입니다. ① 국어 2h·수학 1.5h·영어 1h·사탐 0.5h로 고정합니다. ② 비문학 지문은 매일 3개씩 시간 재고 풉니다. ③ 매월 모의고사 후 틀린 유형만 5문항 추가 학습합니다. 완료 기준: 11월 수능 4개 영역 1등급.",
                "categoryTags": ["activity"], "activitySubtype": "general", "priority": "must",
                "deliverable": "월별 모의고사 성적표 8회 + 비문학 오답노트 1권 + 과목별 오답노트 3권",
                "cost": "무료~월 15만원", "goalIndex": 0,
            },
            {
                "type": "activity", "title": "생기부 연계 면접 자료 6건 + 모의면접 5회 (5~8월)",
                "months": [5, 6, 7, 8], "difficulty": 4, "organizer": "자체·학교",
                "description": "법학 면접은 논리의 일관성을 봅니다. ① 모의재판·에세이·MUN 등 활동 6건을 각 1장으로 정리합니다. ② 각 활동에 대해 '반대편이라면 어떻게 반박할까'를 함께 씁니다. ③ 모의면접 5회를 녹화해 근거 없는 단정 표현을 지웁니다. 완료 기준: 활동 정리 6장 + 반론 6편 + 모의면접 5회.",
                "categoryTags": ["activity"], "activitySubtype": "general", "priority": "must",
                "deliverable": "면접용 활동 정리 6장 + 활동별 반론 6편 + 모의면접 녹화 5편", "cost": "무료", "goalIndex": 1,
            },
            {
                "type": "portfolio", "title": "창직 트랙 — 'AI 법 쟁점' 콘텐츠 12편 공개 (3~7월)",
                "months": [3, 4, 5, 6, 7], "difficulty": 3, "organizer": "자체",
                "description": "AI 규제는 매달 바뀝니다. 그 변화를 쉬운 말로 옮기는 사람이 필요합니다. ① 생성형 AI 저작권·개인정보·자동화 책임 중 주제를 골라 주 1편씩 카드뉴스 또는 3분 영상으로 만듭니다. ② 편마다 법령·판례 출처를 최소 2건 명시합니다. ③ AI가 만든 초안의 오류를 잡은 사례를 편마다 1줄 기록합니다. 완료 기준: 콘텐츠 12편 · 출처 24건 · AI 오류 정정 기록 12건.",
                "categoryTags": ["project"], "activitySubtype": "project", "projectTrack": True, "priority": "boost",
                "aiTools": ["Claude", "국가법령정보센터", "Canva", "CapCut"],
                "deliverable": "AI 법 쟁점 콘텐츠 12편 + 출처 24건 목록 + AI 오류 정정 기록 12건",
                "cost": "무료", "goalIndex": 2,
            },
        ],
    },
}

# 기존 템플릿(고3 보유)에 추가할 창직 항목
EXTRA = {
    "tpl-admission-snu-cse-001": (4, "9월까지 서비스 운영 매뉴얼 1부 + 인수인계 1회 + 3분 소개 영상 1편 완성",
        {
            "type": "portfolio", "title": "창직 마무리 — 혼자 굴리는 서비스 운영 체계 만들기 (7~9월)",
            "months": [7, 8, 9], "difficulty": 3, "organizer": "자체",
            "description": "서비스를 '만든 것'에서 '운영되는 것'으로 넘기는 단계입니다. ① 배포·모니터링·문의 대응·비용 정산을 주 단위 체크리스트로 정리해 매뉴얼 A4 2장을 만듭니다. ② 후배 1명에게 매뉴얼만 보고 1주간 운영하게 해 막힌 지점을 반영합니다. ③ 서버·API 비용과 투입 시간을 정산해 '이 서비스의 원가'를 계산합니다. 완료 기준: 매뉴얼 A4 2장 · 인수인계 1회 · 원가 정산표 1장 · 3분 소개 영상 1편.",
            "categoryTags": ["project"], "activitySubtype": "project", "projectTrack": True, "priority": "boost",
            "aiTools": ["ChatGPT", "Notion", "CapCut"],
            "deliverable": "운영 매뉴얼 A4 2장 + 인수인계 기록 1건 + 원가 정산표 1장 + 3분 소개 영상 1편",
            "cost": "서버·API 실비 월 1~3만원",
        }),
    "tpl-admission-kaist-ee-001": (4, "8월까지 제작·포팅 원가 정산표 1장 + 기술 소개 영상 2편(각 3분) 완성",
        {
            "type": "portfolio", "title": "창직 마무리 — '설계부터 유지보수까지' 1인 기술 기록 (6~8월)",
            "months": [6, 7, 8], "difficulty": 3, "organizer": "자체",
            "description": "하드웨어는 만든 뒤가 더 깁니다. ① 4년간 만든 보드 중 2개를 골라 부품비·제작 시간·수리 횟수를 정산합니다. ② '남에게 만들어 준다면 얼마인가'를 계산해 견적서 1장을 씁니다. ③ 각 장치의 원리와 한계를 3분 영상 2편으로 정리합니다. 완료 기준: 원가 정산표 1장 · 견적서 1장 · 기술 소개 영상 2편.",
            "categoryTags": ["project"], "activitySubtype": "project", "projectTrack": True, "priority": "boost",
            "aiTools": ["ChatGPT", "KiCad", "CapCut"],
            "deliverable": "제작·포팅 원가 정산표 1장 + 견적서 1장 + 3분 기술 소개 영상 2편",
            "cost": "무료 (기존 제작물 활용)",
        }),
}


def replace_self_intro(template):
    """대입 자기소개서 항목을 생기부 연계 면접 준비로 교체."""
    for year in template.get("years", []):
        for item in year.get("items", []):
            title = item.get("title", "")
            if "자기소개서" not in title:
                continue
            item["title"] = SELF_INTRO_REPLACEMENT["title"]
            item["description"] = SELF_INTRO_REPLACEMENT["description"]
            item["deliverable"] = SELF_INTRO_REPLACEMENT["deliverable"]
        year["goals"] = [
            g.replace("자기소개서 최종본 확정 + 수정 이력 5개 버전", "생기부 연계 면접 자료 6건 정리 + 개정 이력 5개 버전")
             .replace("자기소개서", "생기부 연계 면접 자료")
            for g in year.get("goals", [])
        ]


def main():
    data = load(FILE)
    for t in data:
        tid = t["id"]
        replace_self_intro(t)
        if tid in FINAL_YEAR:
            t["years"].append(FINAL_YEAR[tid])
        stages = [y.get("gradeLabel") or y["gradeId"] for y in t["years"]]
        stages = [s.split(" —")[0] for s in stages]
        t["northStar"] = NORTH_STAR[tid]
        t["competencyGrowth"] = build_growth(
            stages, GROWTH[tid],
            note="중2→고3 동안 쌓인 결과물 개수로 5개 역량을 점수화했습니다.",
        )
        t["aiOrchestra"] = {
            "note": "단계별로 AI 에이전트를 어디에 맡기고 어디를 직접 했는지.",
            "agents": [{"stage": s, "tools": list(tools), "use": use} for s, tools, use in ORCHESTRA[tid]],
        }
        assign_goal_index(t)
        if tid in EXTRA:
            year_idx, goal, item = EXTRA[tid]
            year = t["years"][year_idx]
            year["goals"].append(goal)
            item = dict(item)
            item["goalIndex"] = len(year["goals"]) - 1
            year["items"].append(item)
        t["totalItems"] = sum(len(y["items"]) for y in t["years"])
    save(FILE, data)
    for t in data:
        print(t["id"], [y["gradeId"] for y in t["years"]], t["totalItems"])


if __name__ == "__main__":
    main()
