"""Part 1: helper functions + doctor + ai_researcher"""
import json, os

def si(id, title):
    return {"id": id, "title": title, "done": False}

def item(id, type_, title, months, difficulty, cost, organizer, subs):
    return {"id": id, "type": type_, "title": title, "months": months,
            "difficulty": difficulty, "cost": cost, "organizer": organizer, "subItems": subs}

def grp(id, goal, items):
    return {"id": id, "goal": goal, "isExpanded": True, "items": items, "ungroupedItems": []}

def sp(sid, slabel, groups):
    return {"semesterId": sid, "semesterLabel": slabel, "goalGroups": groups, "ungroupedItems": []}

def yr_split(gid, glabel, first, second):
    return {"gradeId": gid, "gradeLabel": glabel, "semester": "split",
            "goals": [], "items": [],
            "semesterPlans": [sp("first","1학기 (3~8월)",first), sp("second","2학기 (9~2월)",second)],
            "goalGroups": []}

def yr_both(gid, glabel, groups):
    return {"gradeId": gid, "gradeLabel": glabel, "semester": "both",
            "goals": [], "items": [], "semesterPlans": [], "goalGroups": groups}

# ── 의사 ──────────────────────────────────────────────────────────────────────
doctor = {
    "id": "tpl-doctor-001",
    "title": "의사 커리어 패스 — 탐구형",
    "description": "의과대학 입시를 목표로 한 체계적인 탐구 왕국 커리어 패스. 생명과학·화학 심화와 R&E 연구 경험을 중심으로 구성했습니다.",
    "authorName": "AI Career 공식", "authorEmoji": "🤖", "authorType": "official",
    "starId": "explore", "starName": "탐구 왕국", "starEmoji": "🔬", "starColor": "#4A90D9",
    "jobId": "doctor", "jobName": "의사", "jobEmoji": "🩺",
    "likes": 342, "uses": 128, "tags": ["의대","탐구","과학","생명"], "totalItems": 24,
    "years": [
        yr_split("mid2","중2",
            first=[
                grp("g-doc-m2-f1","기초 자격증 취득으로 학습 기반 다지기",[
                    item("i-doc-m2-f1-1","certification","DIAT (디지털정보활용능력)",[3],1,"1.8만원","한국정보통신진흥협회",
                         [si("s1","시험 일정 확인 및 접수"),si("s2","기출문제 3회 풀기"),si("s3","오답 노트 정리")]),
                    item("i-doc-m2-f1-2","certification","워드프로세서 자격증",[6],2,"1.9만원","대한상공회의소",
                         [si("s4","필기 시험 접수"),si("s5","실기 연습 (타자 연습 포함)")]),
                ]),
                grp("g-doc-m2-f2","과학 탐구 습관 형성 및 독서 루틴 구축",[
                    item("i-doc-m2-f2-1","activity","생명과학 도서 월 2권 독서",[3,4,5,6,7,8],1,"무료","자체",
                         [si("s6","독서 기록장 작성"),si("s7","핵심 내용 요약 정리")]),
                    item("i-doc-m2-f2-2","portfolio","과학 탐구 일지 작성 (월 1회)",[3,4,5,6,7,8],1,"무료","자체",
                         [si("s8","탐구 주제 선정"),si("s9","실험 기록 및 결과 정리")]),
                ]),
            ],
            second=[
                grp("g-doc-m2-s1","봉사활동 시작으로 의료인 소양 쌓기",[
                    item("i-doc-m2-s1-1","activity","보건실 봉사 (주 1시간)",[9,10,11,12],1,"무료","학교",
                         [si("s10","담당 선생님께 신청"),si("s11","봉사 일지 작성")]),
                    item("i-doc-m2-s1-2","activity","지역 복지관 노인 돌봄 봉사",[10,11,12],1,"무료","지역 복지관",
                         [si("s12","봉사 신청 및 오리엔테이션"),si("s13","월 2회 정기 봉사 참여")]),
                ]),
                grp("g-doc-m2-s2","교내 과학 활동으로 탐구 역량 발휘",[
                    item("i-doc-m2-s2-1","award","교내 과학 탐구 발표회 참가",[11],2,"무료","학교",
                         [si("s14","탐구 주제 선정"),si("s15","실험 설계 및 수행"),si("s16","발표 자료 제작")]),
                    item("i-doc-m2-s2-2","portfolio","생명과학 탐구 일지 학기 결산 보고서",[12],2,"무료","자체",
                         [si("s17","학기 활동 정리"),si("s18","보고서 작성 및 제출")]),
                ]),
            ]
        ),
        yr_split("mid3","중3",
            first=[
                grp("g-doc-m3-f1","생명과학 심화 학습 및 응급처치 자격 취득",[
                    item("i-doc-m3-f1-1","certification","응급처치 자격 (BLS)",[4],1,"5만원","대한적십자사",
                         [si("s1","교육 일정 확인 및 등록"),si("s2","CPR 실습 연습")]),
                    item("i-doc-m3-f1-2","activity","생명과학 심화 인강 수강 (EBS)",[3,4,5,6],2,"무료","EBS",
                         [si("s3","주차별 강의 수강"),si("s4","개념 정리 노트 작성"),si("s5","단원별 문제 풀이")]),
                ]),
                grp("g-doc-m3-f2","첫 대외활동으로 의료 진로 탐색",[
                    item("i-doc-m3-f2-1","award","교내 과학탐구대회 참가",[5],2,"무료","학교",
                         [si("s6","탐구 주제 선정"),si("s7","실험 설계 및 수행"),si("s8","보고서 작성")]),
                    item("i-doc-m3-f2-2","activity","의대 진로 체험 프로그램 참가",[6],2,"무료~5만원","각 대학병원",
                         [si("s9","체험 프로그램 신청"),si("s10","체험 소감문 작성")]),
                ]),
            ],
            second=[
                grp("g-doc-m3-s1","의료 관련 봉사 활동 본격화",[
                    item("i-doc-m3-s1-1","activity","대한적십자사 RCY 캠프",[7],2,"무료","대한적십자사",
                         [si("s11","캠프 신청서 작성"),si("s12","사전 교육 이수")]),
                    item("i-doc-m3-s1-2","activity","요양원 정기 봉사 (월 2회)",[9,10,11,12],1,"무료","지역 요양원",
                         [si("s13","봉사 신청"),si("s14","봉사 일지 작성")]),
                ]),
                grp("g-doc-m3-s2","학업 성취 및 수상 경력 쌓기",[
                    item("i-doc-m3-s2-1","award","교내 독서토론대회 참가",[10],2,"무료","학교",
                         [si("s15","지정 도서 완독"),si("s16","토론 논리 구성")]),
                    item("i-doc-m3-s2-2","portfolio","생명과학 탐구 보고서 작성",[11,12],3,"무료","자체",
                         [si("s17","연구 주제 선정"),si("s18","자료 조사 및 실험"),si("s19","보고서 완성")]),
                ]),
            ]
        ),
        yr_split("high1","고1",
            first=[
                grp("g-doc-h1-f1","KBO 예선 도전 및 컴활 2급 취득",[
                    item("i-doc-h1-f1-1","certification","컴퓨터활용능력 2급",[3],2,"1.9만원","대한상공회의소",
                         [si("s1","필기 합격 후 실기 준비"),si("s2","엑셀 함수 집중 학습")]),
                    item("i-doc-h1-f1-2","award","한국생물올림피아드 (KBO) 예선",[4],4,"무료","한국생물과학협회",
                         [si("s3","생물 심화 교재 완독"),si("s4","기출 문제 풀이"),si("s5","스터디 그룹 참여")]),
                ]),
                grp("g-doc-h1-f2","의학 탐구 역량 강화 및 논문 읽기 시작",[
                    item("i-doc-h1-f2-1","activity","KAIST 과학영재캠프 (여름)",[7],3,"무료~10만원","KAIST",
                         [si("s6","캠프 지원서 작성"),si("s7","자기소개서 준비")]),
                    item("i-doc-h1-f2-2","portfolio","생명과학 논문 읽기 월 1편",[3,4,5,6,7,8],3,"무료","PubMed",
                         [si("s8","논문 검색 방법 학습"),si("s9","요약 노트 작성")]),
                ]),
            ],
            second=[
                grp("g-doc-h1-s1","의대 체험 및 R&E 탐색",[
                    item("i-doc-h1-s1-1","activity","의대 MMI 체험 프로그램",[8],4,"5만원","주요 의대",
                         [si("s10","MMI 형식 이해 및 준비"),si("s11","모의 면접 연습")]),
                    item("i-doc-h1-s1-2","activity","대학 R&E 프로그램 탐색 및 지원 준비",[9,10],3,"무료","각 대학",
                         [si("s12","R&E 프로그램 목록 조사"),si("s13","지원 요건 확인")]),
                ]),
                grp("g-doc-h1-s2","교내 수상 및 학술 활동 강화",[
                    item("i-doc-h1-s2-1","award","교내 학술제 발표",[11],3,"무료","학교",
                         [si("s14","발표 주제 선정"),si("s15","PPT 제작"),si("s16","발표 리허설")]),
                    item("i-doc-h1-s2-2","portfolio","의학 관련 독서 보고서 (학기당 2편)",[9,10,11,12],2,"무료","자체",
                         [si("s17","의학 도서 선정"),si("s18","독서 보고서 작성")]),
                ]),
            ]
        ),
        yr_split("high2","고2",
            first=[
                grp("g-doc-h2-f1","대학 연계 R&E 참여 및 TOEFL 취득",[
                    item("i-doc-h2-f1-1","activity","대학 연계 R&E 연구",[3,4,5,6],5,"무료","각 대학·과학고",
                         [si("s1","연구 주제 선정 및 지도교수 섭외"),si("s2","선행 논문 리뷰"),si("s3","중간 보고서 작성"),si("s4","최종 보고서 및 발표 준비")]),
                    item("i-doc-h2-f1-2","certification","TOEFL iBT (100점 이상 목표)",[6],4,"30만원","ETS",
                         [si("s5","Reading/Listening 집중 학습"),si("s6","Speaking/Writing 스터디"),si("s7","모의 시험 2회 응시")]),
                ]),
                grp("g-doc-h2-f2","KBO 본선 도전 및 의대 면접 준비",[
                    item("i-doc-h2-f2-1","award","한국생물올림피아드 (KBO) 본선",[7],5,"무료","한국생물과학협회",
                         [si("s8","심화 문제 풀이 집중"),si("s9","실험 문제 대비")]),
                    item("i-doc-h2-f2-2","activity","의대 입시 면접 스터디 운영",[5,6,7,8],4,"무료","자체",
                         [si("s10","스터디 멤버 모집"),si("s11","주 1회 모의 면접 진행")]),
                ]),
            ],
            second=[
                grp("g-doc-h2-s1","학술제 발표 및 포트폴리오 완성",[
                    item("i-doc-h2-s1-1","award","학술제 연구 발표",[11],4,"무료","학교",
                         [si("s12","발표 PPT 제작"),si("s13","발표 리허설 3회")]),
                    item("i-doc-h2-s1-2","portfolio","의학 탐구 포트폴리오 완성",[9,10,11,12],4,"무료","자체",
                         [si("s14","활동 기록 정리"),si("s15","포트폴리오 디자인 및 편집")]),
                ]),
                grp("g-doc-h2-s2","수능 대비 및 자기소개서 완성",[
                    item("i-doc-h2-s2-1","activity","의대 자기소개서 초안 작성",[9,10],4,"무료","자체",
                         [si("s16","활동 목록 정리"),si("s17","초안 작성 후 첨삭")]),
                    item("i-doc-h2-s2-2","activity","수능 모의고사 집중 분석 (월 2회)",[9,10,11],5,"무료","자체",
                         [si("s18","오답 원인 분석"),si("s19","취약 단원 집중 보완")]),
                ]),
            ]
        ),
    ]
}

# ── AI 연구원 ─────────────────────────────────────────────────────────────────
ai_researcher = {
    "id": "tpl-ai-researcher-001",
    "title": "AI 연구원 커리어 패스 — 기술형",
    "description": "인공지능 연구원을 목표로 한 탐구 왕국 커리어 패스. 수학·코딩 역량을 중심으로 올림피아드와 해커톤 경험을 쌓습니다.",
    "authorName": "AI Career 공식", "authorEmoji": "🤖", "authorType": "official",
    "starId": "explore", "starName": "탐구 왕국", "starEmoji": "🔬", "starColor": "#4A90D9",
    "jobId": "ai-researcher", "jobName": "AI 연구원", "jobEmoji": "🤖",
    "likes": 287, "uses": 95, "tags": ["AI","코딩","수학","연구"], "totalItems": 24,
    "years": [
        yr_both("mid2","중2",[
            grp("g-ai-m2-1","코딩 자격증 취득 및 AI 기초 학습",[
                item("i-ai-m2-1-1","certification","COS Pro 2급 (Python)",[6],2,"3만원","YBM",
                     [si("s1","Python 기초 문법 완성"),si("s2","기출문제 3회 풀기")]),
                item("i-ai-m2-1-2","activity","이솦(EBS SW) AI 과정",[3],2,"무료","EBS",
                     [si("s3","강의 수강 완료"),si("s4","실습 과제 제출")]),
            ]),
            grp("g-ai-m2-2","알고리즘 기초 다지기 및 프로젝트 시작",[
                item("i-ai-m2-2-1","activity","삼성 주니어 SW 아카데미",[7],3,"무료","삼성전자",
                     [si("s5","지원서 작성"),si("s6","알고리즘 기초 선행 학습")]),
                item("i-ai-m2-2-2","portfolio","Python 미니 프로젝트 (계산기·퀴즈 앱)",[8,9],2,"무료","자체",
                     [si("s7","기획 및 설계"),si("s8","코딩 구현"),si("s9","GitHub 업로드")]),
            ]),
        ]),
        yr_both("mid3","중3",[
            grp("g-ai-m3-1","KOI 예선 도전 및 정보처리기능사 취득",[
                item("i-ai-m3-1-1","certification","정보처리기능사",[3],2,"1.9만원","한국산업인력공단",
                     [si("s1","필기 이론 정리"),si("s2","실기 코딩 연습")]),
                item("i-ai-m3-1-2","award","한국정보올림피아드 (KOI) 예선",[6],4,"무료","과기정통부",
                     [si("s3","알고리즘 심화 (DP, 그래프)"),si("s4","백준 온라인 저지 100문제"),si("s5","모의 대회 참가")]),
            ]),
            grp("g-ai-m3-2","해외 명문 온라인 강좌 수강 및 수학 역량 강화",[
                item("i-ai-m3-2-1","activity","edX CS50 (하버드 온라인)",[1],3,"무료 청강","하버드 대학교",
                     [si("s6","Week 1~4 완료"),si("s7","Week 5~8 완료"),si("s8","Final Project 제출")]),
                item("i-ai-m3-2-2","portfolio","수학 경시 문제 풀이 노트 (월 20문제)",[3,4,5,6,7,8,9,10,11,12],2,"무료","자체",
                     [si("s9","수학 올림피아드 기출 풀기"),si("s10","오답 노트 정리")]),
            ]),
        ]),
        yr_both("high1","고1",[
            grp("g-ai-h1-1","KOI 본선 도전 및 COS Pro 1급 취득",[
                item("i-ai-h1-1-1","certification","COS Pro 1급 (Python/C)",[4],3,"3만원","YBM",
                     [si("s1","C 언어 기초 학습"),si("s2","기출 5회 풀기")]),
                item("i-ai-h1-1-2","award","한국정보올림피아드 (KOI) 본선",[7],5,"무료","과기정통부",
                     [si("s3","고급 알고리즘 (세그트리, 플로우)"),si("s4","코드포스 레이팅 1600+ 달성")]),
            ]),
            grp("g-ai-h1-2","머신러닝 학습 시작 및 AI 프로젝트 구현",[
                item("i-ai-h1-2-1","activity","Coursera ML Specialization (Andrew Ng)",[7],4,"무료 청강","스탠퍼드 대학교",
                     [si("s5","Course 1: 지도학습 완료"),si("s6","Course 2: 비지도학습 완료"),si("s7","Course 3: 실전 프로젝트 완료")]),
                item("i-ai-h1-2-2","portfolio","이미지 분류 AI 프로젝트 (MNIST)",[9,10],4,"무료","자체",
                     [si("s8","데이터셋 전처리"),si("s9","모델 학습 및 평가"),si("s10","GitHub README 작성")]),
            ]),
        ]),
        yr_both("high2","고2",[
            grp("g-ai-h2-1","Kaggle 대회 참가 및 TOEFL 취득",[
                item("i-ai-h2-1-1","award","Kaggle Competition 참가",[1],4,"무료","Google(Kaggle)",
                     [si("s1","EDA 및 데이터 전처리"),si("s2","모델 학습 및 튜닝"),si("s3","앙상블 기법 적용")]),
                item("i-ai-h2-1-2","certification","TOEFL iBT (100점 이상)",[5],4,"30만원","ETS",
                     [si("s4","Reading 집중 학습"),si("s5","Speaking 스터디 참여")]),
            ]),
            grp("g-ai-h2-2","전국 AI 해커톤 참가 및 논문 수준 프로젝트",[
                item("i-ai-h2-2-1","award","전국 AI 해커톤 참가",[9],4,"무료","과기정통부",
                     [si("s6","팀 구성 (3~4명)"),si("s7","아이디어 기획서 작성"),si("s8","프로토타입 개발")]),
                item("i-ai-h2-2-2","portfolio","AI 연구 논문 수준 프로젝트 완성",[9,10,11,12],5,"무료","자체",
                     [si("s9","연구 주제 선정"),si("s10","실험 설계 및 수행"),si("s11","논문 형식 보고서 작성")]),
                item("i-ai-h2-2-3","certification","컴퓨터활용능력 1급",[3],3,"2.2만원","대한상공회의소",
                     [si("s12","엑셀 VBA 학습"),si("s13","기출 5회 풀기")]),
            ]),
        ]),
    ]
}

out_path = os.path.join(os.path.dirname(__file__), "part1_data.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump([doctor, ai_researcher], f, ensure_ascii=False, indent=2)
print("Part1 written:", out_path)
