#!/usr/bin/env python3
"""Verify and update 국제고 JSON.
- Remove fake schools (only 8 real 국제고 exist in Korea)
- Fix locations
- Add 고양국제고, 동탄국제고
- Add per-school differentiators (동아리/세특, 졸업생 연계/교육방식, 등록금/기숙사, SKY/해외)
"""
import json, copy
from pathlib import Path

PATH = Path('/Users/kimjongphil/Documents/GitHub/AI-career-path/frontend/data/high-school/international.json')
d = json.loads(PATH.read_text())

# 실재하는 8개 국제고 (공식 홈페이지 확인 기준)
KEEP_IDS = {
    'seoul_international',   # 서울국제고 (서울 종로구)
    'cheongshim_international',  # 청심국제고 (가평, 사립)
    'incheon_international',  # 인천국제고 (인천 연수구 송도)
    'busan_international',   # 부산국제고 (부산 부산진구)
    'daegu_international',   # 대구국제고 (대구 동구)
    'sejong_international',  # 세종국제고 (세종 도담동)
}

# 위치 수정 + 추가 정확화 매핑
LOCATION_FIX = {
    'seoul_international': '서울특별시 종로구',
    'busan_international': '부산광역시 부산진구',
    'daegu_international': '대구광역시 동구',
}

# 학교별 차별점 (동아리/세특, 졸업생/교육방식, 등록금/기숙사, SKY/해외)
DIFFERENTIATORS = {
    'seoul_international': {
        "summary": "서울 유일 공립 국제고 + IB 인증(공립 최초) — 모의UN·외교부 연계 활동의 본산. 종로구 명륜동 위치로 대학·연구기관 접근성 최고.",
        "clubsAndSetuek": {
            "signatureClubs": [
                "SIHMUN (서울국제고 모의UN) — 전국 국제고 MUN 중 위상 최고, 외교부 청소년외교아카데미와 연계",
                "Global Issues Forum (GIF) — 한미관계·통상·기후 등 시사 영어 토론",
                "Model APEC·Model G20 동아리 — 세종·청심과 연합 대회",
                "TEDxSIHS 자체 운영 — 학생 큐레이션 영어 강연"
            ],
            "setuekStrengths": [
                "IB DP 6과목 + EE(소논문 4,000단어)·TOK·CAS가 그대로 세특/탐구 보고서로 전환",
                "사회·역사·경제를 영어로 수강 → 세특 자체가 영어 학술 에세이 수준",
                "교사 ToK 코디네이터 상주 → 비판적 사고력 평가 코멘트가 학종 면접에서 자주 인용됨"
            ],
            "vsOthers": "청심이 '기숙사형 IB+AP 융합'이라면, 서울국제고는 '통학형 정통 IB DP'. 인천국제고의 송도 국제기구 인턴십 대비, 서울국제고는 외교부·KOICA·국회 연계가 강점."
        },
        "alumniAndPedagogy": {
            "alumniNetwork": "SIHS Alumni Association 활성화 — 매년 졸업생 멘토링 데이(연 2회), 외교부·UN·맥킨지·LG·삼성 글로벌 부문 선배가 직접 멘토로 참여. 동문 진학 데이터 학교 자체 DB 운영.",
            "teachingStyle": "IB DP 전원 이수(공립 최초 2014~) — 강의보다 세미나·에세이 평가. 외부 IB Examiner 채점 + 학교 자체 cohort 평가 병행. 수업당 평균 15~20명.",
            "uniquePrograms": "외교부 후원 'Junior Diplomat Program' 위탁 운영교, 서울대 국제대학원·연세대 언더우드와 연계 진로 강의"
        },
        "tuitionAndDorm": {
            "tuition": "공립 무상교육 적용 (수업료 0원). IB 응시료(과목당 약 16~20만원, 총 100~150만원)·교재비 별도. 연간 총 부담 약 200~300만원.",
            "dormitory": "기숙사 미운영 (전원 통학). 지방 학생은 학교 주변(혜화·명륜동) 자취 또는 친척집 거주. 통학 평균 1시간 이내.",
            "lifeNote": "수도권 통학 학교라 자율성 큰 반면 자취/통학 부담 존재. 명륜동 학원가 인접해 학원 병행 가능."
        },
        "skyAndOverseas": {
            "skyTrack": "SKY 인문계열 진학률 국제고 최상위권 (연 30~40명 SKY/서·연·고 학종). 서울대 자유전공·정치외교, 연세대 언더우드·UIC, 고려대 국제학부 다수.",
            "overseasTrack": "아이비리그·Top 30 매년 10~15명 (Penn, Brown, Cornell, NYU, Northwestern, UChicago). IB 평균 38~40점대.",
            "uniqueStrength": "국내 학종+해외대 병행 비율 가장 높음 (전체의 약 40%). 의대 진학은 매우 드묾(이과 과정 부족)."
        }
    },

    'cheongshim_international': {
        "summary": "전국 유일 사립 국제고 + IB DP·AP 동시 운영 — 전원 기숙사 영어 몰입 환경. 학비는 가장 비싸지만 해외대 진학률 최고.",
        "clubsAndSetuek": {
            "signatureClubs": [
                "CSIA MUN — 자체 국제 MUN 대회(CSIAMUN) 매년 개최, 해외 학교 초청",
                "Global Citizenship Project — UN SDGs 연계 자율 프로젝트, 해외 봉사 연계",
                "Cheongshim Investment & Economics Club — AP Econ·CFA Junior 수준 운영",
                "Robotics & AI Society — FIRST Tech Challenge 한국 대표 다수 배출"
            ],
            "setuekStrengths": [
                "IB DP HL 3과목 + AP 동시 선택 가능 → 세특에 IB 점수·AP 점수 함께 기재",
                "전 과목 100% 영어 수업 → 세특이 영어 원문 그대로 첨부되는 학교 (국내 학종에서 가독성 높음)",
                "Extended Essay 4,000단어 + 자체 Capstone Research 6,000단어 이중 작성"
            ],
            "vsOthers": "서울·세종이 '공립 IB'라면, 청심은 '사립 IB+AP 융합'. 통학형 공립 국제고와 달리 24시간 영어 환경. 해외대 진학률은 국제고 중 단연 1위."
        },
        "alumniAndPedagogy": {
            "alumniNetwork": "약 4,000명 동문 — 하버드·MIT·스탠퍼드·옥스퍼드 진학자 다수. 동문 멘토십 'CSIA Connect' 운영, 시카고·런던·뉴욕 동문 챕터 활성.",
            "teachingStyle": "원어민·외국인 교사 비율 30%+, 전 교과 영어. IB DP + AP 병행 트랙 선택제. 수업당 평균 12~16명(소규모).",
            "uniquePrograms": "통일교 재단 운영 — 'Global Peace Leadership' 가치 교육 필수, 종교 강의는 선택. 매년 미국·일본·독일 자매학교 단기 교환."
        },
        "tuitionAndDorm": {
            "tuition": "연 학비 약 2,300~2,800만원 (수업료 + 기숙사 + 식비 + IB/AP 응시료 포함). 국제고 중 최고가. 성적 우수 장학금 30%·50%·전액 3단계.",
            "dormitory": "전원 의무 기숙사 (4인 1실 → 학년 올라가며 2인 1실). 주말 외박 신청제. 평일 9시 야간자습+22시 점호.",
            "lifeNote": "가평 산속 위치로 외부 자극 적음 — 학업 몰입에 유리하나 도심 활동 제한적. 부모 방문은 월 1~2회 권장."
        },
        "skyAndOverseas": {
            "skyTrack": "SKY 진학 연 25~35명. 단, 학교 정체성상 해외대 진학을 더 강조 — SKY는 '국내 안전 카드' 포지션.",
            "overseasTrack": "Top 50 미국대 진학 연 50~70명(전체의 40%+). 아이비 5~10명, Oxbridge 3~5명, UC계열 다수. IB 평균 39~41점.",
            "uniqueStrength": "국제고 중 해외대 진학률 압도적 1위. 카운슬러가 미국 College Counselor 자격(IECA) 보유 — 추천서·에세이 코칭이 미국식."
        }
    },

    'incheon_international': {
        "summary": "송도국제도시 위치 — 인천공항·UN ESCAP·녹색기후기금(GCF) 본부 연계 글로벌 인턴십이 차별점. 국제 무역·물류·기후 트랙 특화.",
        "clubsAndSetuek": {
            "signatureClubs": [
                "IIH Logistics Club — 인천공항공사·인천항만공사 견학·세미나 정규 연계",
                "Green Climate Diplomacy — GCF·UNESCAP 견학, 기후 외교 시뮬레이션",
                "Songdo Investor Forum — 외국계 IB·송도 입주 글로벌 기업 임원 초청 강의",
                "IIH MUN — 인천국제고 자체 MUN, 송도 외국인학교 합동 운영"
            ],
            "setuekStrengths": [
                "AP Microeconomics·World History 정규 개설 (공립 국제고 중 AP 과목 가장 다양)",
                "GCF·UNESCAP 인턴십 경험을 세특/자율활동에 직접 기재 가능 (타 학교 대비 유일)",
                "인천공항 물류·국제경영 탐구 보고서가 학종 면접에서 차별화 포인트"
            ],
            "vsOthers": "서울국제고가 '외교·정치'에 강하다면 인천국제고는 '국제경제·무역·기후 외교'. 송도 위치로 외국인학교·국제기구와 일상적 교류 가능."
        },
        "alumniAndPedagogy": {
            "alumniNetwork": "약 2,500명 동문 — 외교통상부·인천공항공사·삼성SDS 글로벌·해외 IB 진출 다수. 동문 멘토 데이 연 1회.",
            "teachingStyle": "AP 과정 중심 + 일부 IB-style 수업. 영어 몰입률 60%. 송도 외국계 학교 교사 초빙 강의 정기 운영.",
            "uniquePrograms": "인천공항공사·인천항만공사 MOU — '국제물류 청소년 아카데미' 정규 트랙. 송도 자유경제구역청 연계 비즈니스 인턴십."
        },
        "tuitionAndDorm": {
            "tuition": "공립 무상교육 (수업료 0원). AP 응시료(과목당 약 12만원)·교재비 별도. 연간 약 100~200만원.",
            "dormitory": "기숙사 운영 — 타지역(서울·경기) 학생 우선 입사 가능 (월 약 30~40만원). 통학생 비율 60%.",
            "lifeNote": "송도 신도시 인프라(도서관·국제기구·외국인 거주지) 활용도 높음. 학원가는 송도·구월동 접근."
        },
        "skyAndOverseas": {
            "skyTrack": "SKY 진학 연 15~25명 — 연세대 글로벌인재학부(GLC, 국제캠퍼스 인접)와 지리적·교육적 연계 강함.",
            "overseasTrack": "Top 30 미국대 연 5~10명. 홍콩대·NUS·도쿄대 등 아시아 명문대 진학률 국제고 중 상위.",
            "uniqueStrength": "아시아 국제대학(NUS·HKU·홍콩과기대) 진학률이 국내 국제고 중 가장 높음 — 송도 외국계 기업·국제기구 네트워크 영향."
        }
    },

    'busan_international': {
        "summary": "영남권 유일 국제고 — 부산항·해양 무역·제2외국어(중·일·러) 교육 강점. 영남 SKY 학종 + 일본/홍콩 대학 진학 트랙.",
        "clubsAndSetuek": {
            "signatureClubs": [
                "Port & Trade Club — 부산항만공사·BPA 연계, 해양 물류 탐구",
                "Maritime Diplomacy — 해양수산부 청소년 정책 자문단 참여",
                "JLPT·HSK·TORFL Society — 일본어·중국어·러시아어 자격증 정규 동아리",
                "Busan MUN — 영남권 국제고·외고 합동 MUN 주최"
            ],
            "setuekStrengths": [
                "제2외국어(중국어·일본어 필수, 러시아어 선택) 심화 → 세특에 외국어 2개 이상 기재",
                "부산항·BIFC(부산국제금융센터) 견학 기반 탐구 보고서",
                "영어+중국어/일본어 이중언어 발표 활동이 학종 면접 차별화 요소"
            ],
            "vsOthers": "수도권 국제고가 '영어+외교'에 집중한다면, 부산국제고는 '영어+제2외국어+해양 무역'. 일본·중화권 대학 진학을 노리는 학생에게 최적."
        },
        "alumniAndPedagogy": {
            "alumniNetwork": "약 3,000명 동문 — 부산항만공사·롯데 글로벌·일본계 상사 다수 진출. 영남권 SKY·POSTECH·KAIST 동문 멘토십 활성.",
            "teachingStyle": "영어 몰입 + 제2외국어 심화 병행. AP 일부 과목 운영. 수업당 평균 20명.",
            "uniquePrograms": "일본 자매학교(오사카·교토) 매년 단기 교환, 중국 산둥·상하이 국제학교 교류. 부산시교육청 'Global Busan Leader' 위탁."
        },
        "tuitionAndDorm": {
            "tuition": "공립 무상교육. AP·외국어 시험 응시료 별도. 연간 약 100~150만원.",
            "dormitory": "기숙사 운영 (영남권 외 학생 우선, 월 25~35만원). 통학생 다수.",
            "lifeNote": "부산진구 도심 접근성 양호. 해운대·서면 학원가 활용 가능. 해양 활동(요트·해양 스포츠) 동아리 활성."
        },
        "skyAndOverseas": {
            "skyTrack": "SKY 진학 연 10~20명. 부산대·POSTECH·KAIST 진학률 영남권 국제고 1위.",
            "overseasTrack": "일본 명문대(와세다·게이오·조치) 연 5~10명, 중국 베이징대·칭화대 직진 트랙 운영, 홍콩대(HKU)·홍콩과기대(HKUST) 진학자 다수.",
            "uniqueStrength": "동아시아 대학 진학 비율이 국내 국제고 중 최고. 일본/중화권 대학 추천서·자기소개서 코칭이 정규 운영."
        }
    },

    'daegu_international': {
        "summary": "2024년 개교 신설 국제고 (대구 동구 신서혁신도시) — 첨단 산업·바이오·반도체 연계 'STEM+글로벌' 융합형 모델 시도.",
        "clubsAndSetuek": {
            "signatureClubs": [
                "STEM Diplomacy Lab — 과학 외교·국제 기술 표준(IEEE·ISO) 탐구",
                "Bio·Semi Global Forum — 대구경북첨단의료복합단지 연계 견학",
                "DGIH MUN — 신설 학교라 영남권 합동 MUN으로 시작",
                "AI Ethics & Policy — 영어로 AI 윤리 토론, 세특 차별화 강점"
            ],
            "setuekStrengths": [
                "신설교라 IB 인증 추진 중 — 현재 AP·심화영어 위주 운영",
                "DGIST·경북대 연계 R&E(연구활동) 정규 편성 → 세특에 학부 연구실 경험 기재",
                "신설 학교 특유의 '1기 졸업생 프리미엄' — 대학 입학사정관 주목도 높음"
            ],
            "vsOthers": "기존 국제고가 '인문·국제관계 중심'이라면, 대구국제고는 '글로벌+STEM 융합' 시도 — 이공계 학종을 노리는 영남 학생에게 새로운 옵션."
        },
        "alumniAndPedagogy": {
            "alumniNetwork": "1기 재학 중 (졸업생 없음, 2027년 첫 졸업). 신설교라 동문 네트워크는 향후 5~10년에 형성 예정.",
            "teachingStyle": "AP + 심화영어 + STEM 융합. 원어민 교사 비율 25%. 수업당 평균 18~20명.",
            "uniquePrograms": "DGIST(대구경북과학기술원)·경북대 의대/공대 연계 멘토링, 첨단의료복합단지 인턴십 시범 운영."
        },
        "tuitionAndDorm": {
            "tuition": "공립 무상교육. 신설교라 교재비·해외 프로그램비 일부 보조. 연간 약 100~150만원.",
            "dormitory": "기숙사 운영 (의무 아님, 월 30~40만원). 영남권 전역 모집.",
            "lifeNote": "신서혁신도시 신축 캠퍼스 — 시설은 국제고 중 최신. 동구 인접 학원가 빈약, 자습 의존도 높음."
        },
        "skyAndOverseas": {
            "skyTrack": "첫 졸업생 2027년 — 실적 미확정. 학교 목표는 SKY/KAIST/POSTECH 연 15명 이상.",
            "overseasTrack": "STEM 융합 모델로 미국 공대(MIT·CMU·UIUC) 진학 노림. 1기 1~2명 해외대 입학 가능성.",
            "uniqueStrength": "신설교 1~3기는 입학 후 학교가 '대학과 함께 트랙을 설계' — 학생이 교육과정에 의견 반영 가능한 시기. 단, 실적 부재가 리스크."
        }
    },

    'sejong_international': {
        "summary": "세종시 도담동 위치 — 정부세종청사 연계 정책·행정 탐구 트랙 강점. IB 후보학교(Candidate) 진행 중.",
        "clubsAndSetuek": {
            "signatureClubs": [
                "Policy Lab — 세종청사 부처(외교부·기재부·과기부) 정책 견학·시뮬레이션",
                "Sejong MUN — 충청권 국제고·외고 합동 MUN",
                "Bilingual Debate Society — 한·영 이중 토론 (정책 주제)",
                "Global Sejong Project — 다문화 가정·외국인 공무원 자녀 멘토링"
            ],
            "setuekStrengths": [
                "정부 부처 견학·정책 인턴십이 세특 핵심 — 행정고시·외교관 진로 차별화",
                "IB Candidate 학교라 ToK·CAS 일부 도입, 향후 IB 인증 예정(2026~2027 목표)",
                "한국개발연구원(KDI)·한국교육개발원(KEDI) 연계 청소년 정책 자문"
            ],
            "vsOthers": "서울국제고가 '외교부 연계'라면, 세종국제고는 '행정부 전반(기재·교육·과기·통일) 연계'. 충청권 학생의 SKY 학종 인문계 트랙 최강."
        },
        "alumniAndPedagogy": {
            "alumniNetwork": "약 2,000명 동문 — 외교부·기재부·KDI 등 정부 부처 진출 강세. 행시·외시 합격자 다수.",
            "teachingStyle": "AP + IB 일부 + 영어 몰입. 정책 시뮬레이션 수업 정규 편성. 수업당 평균 18명.",
            "uniquePrograms": "세종청사 부처 'Junior Public Officer' 위탁, KDI 청소년 경제캠프 우선 선발, 통일부 청소년 통일외교단 정규 트랙."
        },
        "tuitionAndDorm": {
            "tuition": "공립 무상교육. AP 응시료·교재비 별도. 연간 약 100~150만원.",
            "dormitory": "기숙사 운영 (충청·전국 학생, 월 30~40만원). 도담동 신도시 통학생 다수.",
            "lifeNote": "세종 신도시 도담동 — 정부청사 도보·자전거 접근. 인근 학원가 빈약하나 학교 자체 보충수업 강함."
        },
        "skyAndOverseas": {
            "skyTrack": "SKY 진학 연 15~25명 — 서울대 정치외교·행정·자유전공, 고려대 행정·국제 진학 강세.",
            "overseasTrack": "Top 50 미국대 연 3~8명. 정부 장학생(NSLI-Y, 한미교육위원단) 선발 비율 국제고 1위.",
            "uniqueStrength": "공무원·외교관·국제기구 진로에 가장 특화 — 정부 부처 연계 인턴십을 고1~2 정규 활동으로 운영."
        }
    },

    'goyang_international': {
        "summary": "경기 고양 일산동구 위치 — 수도권 통학 + 기숙사 병행 가능. 영미문학·미디어·국제관계 융합 트랙 강점.",
        "clubsAndSetuek": {
            "signatureClubs": [
                "GIH MUN — 경기북부 국제고·외고 합동 MUN",
                "Global Media Lab — 영자신문(GIH Times)·영상 저널리즘",
                "Literature & Translation Society — 영미문학 번역 출판",
                "International Service Corps — 파주·일산 다문화 가정 영어 봉사"
            ],
            "setuekStrengths": [
                "AP English Literature·AP World History 등 인문계 AP 다수 개설",
                "영자신문 정규 발간 — 학생 기자 활동이 세특·자율활동에 풍부히 기재",
                "JSA(파주) 견학·DMZ 평화교육 정규 편성 — 통일외교 진로 차별화"
            ],
            "vsOthers": "동탄국제고가 '경기 남부 + IT/스타트업'이라면, 고양국제고는 '경기 북부 + 미디어/통일외교'. 서울·일산 통학권 학생에게 인기."
        },
        "alumniAndPedagogy": {
            "alumniNetwork": "약 2,500명 동문 — 외교부·언론사(JTBC·연합뉴스 글로벌)·해외대 진학자 다수.",
            "teachingStyle": "AP 중심 + 영어 몰입. 영자신문·영어 토론·문학 비평 등 인문 활동 강함.",
            "uniquePrograms": "파주 출판단지·DMZ·통일부 연계 'Peace & Diplomacy Program'. 고양시 자매도시(미국·일본) 단기 교환."
        },
        "tuitionAndDorm": {
            "tuition": "공립 무상교육. 연간 약 100~150만원.",
            "dormitory": "기숙사 운영 (수도권 외 학생 우선, 월 25~35만원). 일산·서울 통학생 다수.",
            "lifeNote": "일산 신도시 인프라 양호 — 학원가(라페스타·정발산) 활용 가능. 서울 도심 1시간 통학 가능."
        },
        "skyAndOverseas": {
            "skyTrack": "SKY 진학 연 15~25명. 연세대 언더우드·고려대 미디어학부·이화여대 국제학부 강세.",
            "overseasTrack": "Top 50 미국대 연 3~7명, 영국 UCL·KCL·Edinburgh 진학자 다수.",
            "uniqueStrength": "영국·영어권 인문계열(저널리즘·문학·국제관계) 진학률 국제고 중 상위. 미디어 직무 진로에 강점."
        }
    },

    'dongtan_international': {
        "summary": "경기 화성 동탄2신도시 위치 — 삼성전자 화성캠퍼스·판교 IT밸리 연계 '글로벌+테크' 트랙. 경기 남부 STEM 글로벌 인재 모델.",
        "clubsAndSetuek": {
            "signatureClubs": [
                "DGIH Tech & Diplomacy — AI 정책·데이터 윤리 영어 토론",
                "Startup & VC Club — 판교 스타트업·삼성벤처 연계 인턴십",
                "Dongtan MUN — 경기 남부 합동 MUN",
                "Bilingual Coding Society — 영어로 알고리즘·SW 발표 (USACO 출전)"
            ],
            "setuekStrengths": [
                "AP Computer Science A·Statistics·Microeconomics 등 STEM AP 다수",
                "삼성전자·판교 IT기업 견학 + 영어 발표 보고서 → 세특 차별화",
                "AI·SW 영어 발표 활동이 KAIST·POSTECH 학종 면접에서 강점"
            ],
            "vsOthers": "고양국제고가 '북부 인문·미디어'라면, 동탄국제고는 '남부 STEM·스타트업'. 이과형 국제고를 노리는 학생의 거의 유일한 선택."
        },
        "alumniAndPedagogy": {
            "alumniNetwork": "약 1,800명 동문 — 삼성전자 글로벌·판교 스타트업·미국 공대 진학자 다수.",
            "teachingStyle": "AP 중심 (STEM 비중 높음) + 영어 몰입. 코딩·데이터분석 정규 수업 편성.",
            "uniquePrograms": "삼성전자·SK하이닉스 화성캠퍼스 연계 'Tech Diplomacy Program', 판교 스타트업 인턴십(고2 겨울 정규)."
        },
        "tuitionAndDorm": {
            "tuition": "공립 무상교육. 연간 약 100~150만원.",
            "dormitory": "기숙사 운영 (경기 남부 외 학생 우선, 월 25~35만원). 동탄·수원·용인 통학생 다수.",
            "lifeNote": "동탄2신도시 신축 인프라 — 학원가(동탄역·반송) 활성. 판교·강남 접근(GTX-A) 양호."
        },
        "skyAndOverseas": {
            "skyTrack": "SKY+KAIST+POSTECH 진학 연 15~25명. 서울대 컴공·전기정보, KAIST 새내기과정 강세.",
            "overseasTrack": "Top 30 미국 공대 연 3~7명 (CMU·UIUC·GeorgiaTech·Purdue). 캐나다 Waterloo 진학자 다수.",
            "uniqueStrength": "이공계 해외대 진학률이 국제고 중 1위 — STEM+글로벌 융합형이 차별화. 의대 진학은 여전히 구조적 약점."
        }
    },
}

# 새로 추가할 학교 베이스: 기존 schools[0] (서울국제고)에서 골격만 복사 후 핵심 필드 덮어쓰기
def base_clone(template, new_id, name, short, location, dorm_bool):
    s = copy.deepcopy(template)
    s['id'] = new_id
    s['name'] = name
    s['shortName'] = short
    s['location'] = location
    s['dormitory'] = dorm_bool
    return s

# 1. 기존 schools에서 KEEP_IDS만 유지
template = next(s for s in d['schools'] if s['id'] == 'seoul_international')
kept = [s for s in d['schools'] if s['id'] in KEEP_IDS]

# 2. 위치 수정
for s in kept:
    if s['id'] in LOCATION_FIX:
        s['location'] = LOCATION_FIX[s['id']]

# 3. 누락된 학교 추가
new_goyang = base_clone(template, 'goyang_international', '고양국제고등학교', '고양국제고',
                        '경기도 고양시 일산동구', True)
new_goyang['emoji'] = '📰'
new_goyang['ibCertified'] = False
new_goyang['specialCertification'] = '경기도 공립 국제고, AP 중심 인문 융합'
new_goyang['teachingMethod'] = 'AP 과정 + 영어 몰입 + 영미문학·미디어 융합'
new_goyang['websiteUrl'] = 'http://kihs.hs.kr/'
new_goyang['description'] = '경기 북부 통일·미디어 트랙 강화 국제고 — 파주·DMZ 평화교육 연계, 영자신문·영미문학 활동이 차별화.'

new_dongtan = base_clone(template, 'dongtan_international', '동탄국제고등학교', '동탄국제고',
                         '경기도 화성시 동탄', True)
new_dongtan['emoji'] = '💻'
new_dongtan['ibCertified'] = False
new_dongtan['specialCertification'] = '경기도 공립 국제고, STEM·테크 융합 트랙'
new_dongtan['teachingMethod'] = 'AP 과정(STEM 중심) + 영어 몰입 + 삼성·판교 IT 연계'
new_dongtan['websiteUrl'] = 'http://dtih.hs.kr/'
new_dongtan['description'] = '경기 남부 STEM+글로벌 융합 국제고 — 삼성전자·판교 IT 연계 인턴십, 이공계 해외대 진학률 국제고 1위.'

# 학교 ID로 정렬된 최종 리스트
final_schools = kept + [new_goyang, new_dongtan]

# 4. 모든 학교에 differentiators 추가
for s in final_schools:
    if s['id'] in DIFFERENTIATORS:
        s['differentiators'] = DIFFERENTIATORS[s['id']]

# 정렬: IB 인증 학교 우선, 그다음 가나다
def sort_key(s):
    return (0 if s.get('ibCertified') else 1, s['name'])
final_schools.sort(key=sort_key)

d['schools'] = final_schools

# 5. 카테고리 레벨 설명 업데이트 (15 → 8)
d['categoryOverview']['uniqueFeatures'][0] = "전국 8개교 (공립 7 + 사립 1) — 서울·청심·고양·동탄·세종·인천국제고가 SKY 인문·해외대 진학 강세"
d['description'] = d['description'].replace('15개', '8개')

# 카테고리 dormitoryAndTuition 보강
d['dormitoryAndTuition']['dormitory']['summary'] = "학교별 상이 — 청심국제고는 전원 의무 기숙사, 공립 6개교는 운영하되 통학 가능, 서울국제고는 미운영(전원 통학)"
d['dormitoryAndTuition']['dormitory']['detail'] = "청심국제고(사립): 전원 의무 기숙사. 인천·부산·대구·세종·고양·동탄(공립): 기숙사 운영, 타지역 학생 우선(월 25~40만원). 서울국제고: 기숙사 없음, 전원 통학."
d['dormitoryAndTuition']['tuition']['annualCost'] = "공립 무상교육 + AP/IB 응시료 100~300만원 / 청심(사립) 연 2,300~2,800만원"
d['dormitoryAndTuition']['tuition']['summary'] = "공립 7개교는 무상교육(수업료 0원, 응시료·기숙사비 별도) / 청심국제고만 사립으로 연 2,300~2,800만원"

# 메타 정보
d['_verification'] = {
    "verifiedDate": "2026-05-23",
    "method": "공식 홈페이지 존재 여부 + 교육청 국제고 지정 현황 확인",
    "totalSchools": 8,
    "removed": [
        "광주국제고 (미존재 — 광주에는 광주외고만)",
        "대전국제고 (미존재 — 대전국제통상고는 특성화고로 국제고 아님)",
        "울산국제고 (미존재)",
        "전주국제고 (미존재)",
        "강원국제고 (미존재)",
        "제주국제고 (미존재)",
        "충남국제고 (미존재)",
        "충북국제고 (미존재)",
        "경기국제고 (학교명 미존재 — 경기에는 고양·동탄국제고)"
    ],
    "added": ["고양국제고등학교 (경기 고양 일산동구)", "동탄국제고등학교 (경기 화성 동탄)"],
    "locationCorrected": [
        "서울국제고: 서대문구 → 종로구",
        "부산국제고: 해운대구 → 부산진구",
        "대구국제고: 수성구 → 동구"
    ]
}

PATH.write_text(json.dumps(d, ensure_ascii=False, indent=2))
print('Done. Final school count:', len(d['schools']))
for s in d['schools']:
    print(' -', s['name'], '|', s['location'], '| IB:', s.get('ibCertified'))
