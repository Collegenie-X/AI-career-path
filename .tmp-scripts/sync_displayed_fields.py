#!/usr/bin/env python3
"""Sync visible UI fields (description, studentLevel, schoolInfoCard, realTalk, etc.)
with the differentiators content per school. Frontend currently displays these,
not the `differentiators` field."""
import json
from pathlib import Path

P = Path('/Users/kimjongphil/Documents/GitHub/AI-career-path/frontend/data/high-school/international.json')
d = json.loads(P.read_text())

UPDATES = {
    'seoul_international': {
        'description': "서울 종로구 명륜동 — 공립 최초 IB DP 인증 국제고. SIHMUN(모의UN)과 외교부 청소년외교아카데미 연계가 차별점, 통학형(기숙사 미운영) 운영으로 자율성 큰 만큼 자기관리 필수.",
        'studentLevel': "서울·수도권 영어 최상위 + IB DP 6과목 풀이수 가능한 학생, 국내 SKY 학종+해외대 병행 지망생",
        'specialCertification': "IB DP 공립 최초 인증, 외교부 Junior Diplomat Program 위탁교, 종로구 위치(대학·국회·외교부 접근성 최고)",
        'teachingMethod': "IB DP 전원 이수(2014~) · 사회/역사/경제 영어 강의 · ToK 코디네이터 상주 · 외부 IB Examiner 채점 + 학교 자체 평가 병행",
        'famousPrograms': [
            "IB Diploma Programme (공립 최초, 전원 이수)",
            "SIHMUN — 외교부 청소년외교아카데미 연계 모의UN",
            "Junior Diplomat Program (외교부 위탁)",
            "서울대 국제대학원·연세대 언더우드 연계 진로 강의"
        ],
        'schoolInfoCard': {
            "regionScope": "전국 단위 선발 (서울 종로구 소재)",
            "capacity": "연 160명 · 총 480명",
            "genderRatio": "남녀공학",
            "dormitoryType": "기숙사 미운영 (전원 통학)",
            "costPerYear": "공립 무상 + IB 응시료·교재 약 200~300만원",
            "scholarship": "기초수급·차상위 응시료 전액 지원, 소득분위별 IB 지원금",
            "lowIncomeAdvice": "IB 응시료(과목당 16~20만원) 분위별 감면 신청 가능, 종로구청 교육바우처 병행 활용"
        },
    },

    'cheongshim_international': {
        'description': "경기 가평 설악면 — 전국 유일 사립 IB DP+AP 동시 운영교. 전원 의무 기숙사·24시간 영어 환경, 학비 국제고 최고가(연 2,300~2,800만원)지만 해외대 진학률은 국내 1위.",
        'studentLevel': "전국 영어 최상위 + IB HL 3과목+AP 동시 가능, 해외 명문대(아이비·Oxbridge) 직진 의지 학생",
        'specialCertification': "사립 IB DP + AP 동시 운영(국내 유일), 통일교 재단 운영, 미국 College Counselor(IECA) 자격 카운슬러 상주",
        'teachingMethod': "전 교과 영어 수업 · 원어민/외국인 교사 30%+ · 수업당 12~16명 소규모 · EE 4,000자 + Capstone Research 6,000자 이중 작성",
        'famousPrograms': [
            "IB DP + AP 동시 운영 (국내 유일)",
            "CSIAMUN — 자체 국제 모의UN, 해외학교 초청",
            "FIRST Tech Challenge 한국 대표 다수 배출",
            "미국·일본·독일 자매학교 단기 교환"
        ],
        'schoolInfoCard': {
            "regionScope": "전국 단위 선발 (사립, 경기 가평 소재)",
            "capacity": "연 200명 · 총 600명",
            "genderRatio": "남녀공학",
            "dormitoryType": "전원 의무 기숙사 (4인→2인실)",
            "costPerYear": "연 2,300~2,800만원 (수업료+기숙사+식비+IB/AP 응시료 포함)",
            "scholarship": "성적 우수 장학금 30%/50%/전액 3단계 운영",
            "lowIncomeAdvice": "장학금 경쟁 치열 — 입학 성적+IB 예측 점수 상위권만 전액. 저소득 가구는 신중한 재정 검토 필요"
        },
    },

    'incheon_international': {
        'description': "인천 중구 영종도(운서동) — 인천공항·자유무역지역 인접의 유일한 국제고. 항공·물류·관광 외교 트랙 특화, 다국적 환경의 일상 영어 실전 노출이 차별점.",
        'studentLevel': "인천·수도권 영어 상위권 + 항공/물류/관광/국제경영 진로 관심 학생, 아시아권 대학 지망생",
        'specialCertification': "인천공항공사·인천관광공사 MOU, 자유무역지역 인접, 영종도 다국적 거주 환경",
        'teachingMethod': "AP 과정 중심(Micro·Macro Econ·World History 등) · 영어 몰입 60%+ · 외국인 게스트 강의 정규 운영",
        'famousPrograms': [
            "글로벌 항공물류 청소년 아카데미 (인천공항공사 MOU)",
            "Global Tourism Diplomacy (한국관광공사 청소년 자문)",
            "Free Economic Zone Forum",
            "IIH MUN (인천·경기북부 합동)"
        ],
        'schoolInfoCard': {
            "regionScope": "인천·전국 일부 (광역 선발)",
            "capacity": "연 160명 · 총 480명",
            "genderRatio": "남녀공학",
            "dormitoryType": "기숙사 운영 (영종도 외 학생 우선)",
            "costPerYear": "공립 무상 + AP 응시료·기숙사비 약 100~250만원 (기숙사 월 30~40만원)",
            "scholarship": "인천시 국제 교육 장학금, 기숙사비 분위별 지원",
            "lowIncomeAdvice": "인천교육청 + 인천공항공사 사회공헌 장학금 병행 신청 가능"
        },
    },

    'busan_international': {
        'description': "부산 부산진구 백양관문로 — 영남권 유일 국제고. 영어+제2외국어(중·일·러) 심화, 부산항·해양·일본/중화권 대학 진학 트랙이 차별점.",
        'studentLevel': "영남권 영어 상위 + 제2외국어 학습 의지 + 일본/중국/홍콩 대학 또는 SKY 인문 지망생",
        'specialCertification': "영남권 유일 국제고, 부산항만공사·일본 자매학교 정기 교환, 부산시 'Global Busan Leader' 위탁",
        'teachingMethod': "영어 몰입 + 제2외국어(중국어·일본어 필수, 러시아어 선택) 심화 · 일부 AP · 이중언어 발표 정규 편성",
        'famousPrograms': [
            "Port & Trade Club (부산항만공사 연계)",
            "JLPT·HSK·TORFL 자격증 정규 동아리",
            "일본 오사카·교토 자매학교 매년 교환",
            "부산 MUN (영남권 합동 주최)"
        ],
        'schoolInfoCard': {
            "regionScope": "부산광역시·영남권 광역 선발",
            "capacity": "연 100명 · 총 300명",
            "genderRatio": "남녀공학",
            "dormitoryType": "기숙사 운영 (영남권 외 우선)",
            "costPerYear": "공립 무상 + 응시료·기숙사비 약 100~200만원",
            "scholarship": "부산시 글로벌인재 장학금, 일본어/중국어 자격 응시료 지원",
            "lowIncomeAdvice": "부산교육청 저소득 분위별 지원 + JLPT/HSK 응시료 학교 일부 보조"
        },
    },

    'daegu_international': {
        'description': "대구 북구 도남길 — 2021년 개교 신설 공립 국제고. 경북대 인접, 영남권에서 수도권 이주 없이 국제고 교육을 받을 수 있는 핵심 옵션. 1기 졸업(2024) 이후 진학 실적 형성 중.",
        'studentLevel': "영남권(대구·경북·울산) 영어 상위 + 신설교 1~3기 프리미엄을 노리는 학종 지망 학생",
        'specialCertification': "2021년 개교(영남 신설 국제고), 경북대 사회과학대·정외과 R&E 정규 트랙, IB 인증 검토 중",
        'teachingMethod': "AP + 심화영어 + 영어 몰입 · 원어민 25% · 수업당 18~20명 · 경북대 학부 연구실 연계 활동",
        'famousPrograms': [
            "경북대 사회과학대 연계 R&E",
            "DGIH MUN (영남권 합동)",
            "AI Ethics & Policy in English",
            "대구시 자매도시(밀워키·민스크·항저우) 교류"
        ],
        'schoolInfoCard': {
            "regionScope": "대구·영남권 광역 선발",
            "capacity": "연 100명 · 총 300명 (신설교)",
            "genderRatio": "남녀공학",
            "dormitoryType": "기숙사 운영 (의무 아님)",
            "costPerYear": "공립 무상 + 응시료·기숙사비 약 100~200만원",
            "scholarship": "대구시 글로벌인재·신설교 정착 장학금",
            "lowIncomeAdvice": "신설교라 초기 기수에 장학금 풀 여유 — 적극 신청 권장"
        },
    },

    'sejong_international': {
        'description': "세종 도담동 — 정부세종청사 도보권 위치, 부처(외교·기재·과기·통일) 연계 정책·행정 탐구가 차별점. IB Candidate 진행 중(2026~2027 인증 목표).",
        'studentLevel': "충청권 영어 상위 + 행정·외교·정책·국제기구 진로 관심 학생, 행시·외시 장기 목표 학생",
        'specialCertification': "정부세종청사 부처 'Junior Public Officer' 위탁, KDI 청소년 경제캠프 우선 선발, IB Candidate(인증 추진 중)",
        'teachingMethod': "AP + IB 일부 + 영어 몰입 · 정책 시뮬레이션 정규 편성 · 한·영 이중 토론",
        'famousPrograms': [
            "Policy Lab (세종청사 부처 견학·시뮬레이션)",
            "KDI 청소년 경제캠프 (우선 선발)",
            "통일부 청소년 통일외교단",
            "Sejong MUN (충청권 합동)"
        ],
        'schoolInfoCard': {
            "regionScope": "세종·전국 단위 (광역 선발)",
            "capacity": "연 100명 · 총 300명",
            "genderRatio": "남녀공학",
            "dormitoryType": "기숙사 운영 (충청·전국 학생 우선)",
            "costPerYear": "공립 무상 + 응시료·기숙사비 약 100~250만원",
            "scholarship": "세종시 글로벌인재 장학금, NSLI-Y·한미교육위 정부 장학생 선발 비율 1위",
            "lowIncomeAdvice": "정부 장학생 응시 적극 권장 — 미국 단기 연수 비용 전액 지원 트랙"
        },
    },

    'goyang_international': {
        'description': "경기 고양 일산동구 — 경기 북부 거점 국제고. 영자신문·영미문학·미디어 활동과 파주·DMZ 평화교육 연계가 차별점, 서울/일산 통학권에 강점.",
        'studentLevel': "수도권·경기 북부 영어 상위 + 인문·언론·미디어·통일외교 진로 관심 학생",
        'specialCertification': "AP 과정 + 영자신문 정규 발간, 파주 출판단지·통일부 'Peace & Diplomacy Program'",
        'teachingMethod': "AP 중심 + 영어 몰입 · 영자신문/문학 비평/영어 토론 등 인문 활동 강함",
        'famousPrograms': [
            "GIH Times (영자신문 정규 발간)",
            "Literature & Translation Society",
            "DMZ 평화교육·통일외교 트랙",
            "고양시 자매도시 단기 교환"
        ],
        'schoolInfoCard': {
            "regionScope": "경기·수도권 광역 선발",
            "capacity": "연 100명 · 총 300명",
            "genderRatio": "남녀공학",
            "dormitoryType": "기숙사 운영 (수도권 외 우선)",
            "costPerYear": "공립 무상 + 응시료·기숙사비 약 100~200만원",
            "scholarship": "경기도 글로벌인재 장학금, 고양시 청소년 국제교류 지원",
            "lowIncomeAdvice": "경기교육청 + 고양시청 분위별 지원 병행, 일산 통학 시 기숙사비 부담 없음"
        },
    },

    'dongtan_international': {
        'description': "경기 화성 동탄나루로 27 — 경기 남부 STEM+글로벌 융합 국제고. 삼성전자 화성캠퍼스·판교 IT밸리 인접, 이공계 해외대 진학률 국제고 1위가 차별점.",
        'studentLevel': "수도권·경기 남부 영어 상위 + SW/AI/이공계 진로 관심 + KAIST·POSTECH·해외 공대 지망생",
        'specialCertification': "AP STEM(Computer Science A·Statistics·Microeconomics) 다수 개설, 삼성·판교 'Tech Diplomacy Program'",
        'teachingMethod': "AP 중심(STEM 비중 높음) + 영어 몰입 · 영어 코딩·데이터 분석 정규 수업",
        'famousPrograms': [
            "삼성전자·SK하이닉스 화성캠퍼스 인턴십",
            "판교 스타트업 인턴십 (고2 겨울)",
            "USACO 영어 알고리즘 트랙",
            "Dongtan MUN (경기 남부 합동)"
        ],
        'schoolInfoCard': {
            "regionScope": "경기·수도권 광역 선발",
            "capacity": "연 100명 · 총 300명",
            "genderRatio": "남녀공학",
            "dormitoryType": "기숙사 운영 (경기 남부 외 우선)",
            "costPerYear": "공립 무상 + 응시료·기숙사비 약 100~200만원",
            "scholarship": "경기도 글로벌인재·삼성 사회공헌 STEM 장학금",
            "lowIncomeAdvice": "삼성·SK 사회공헌 STEM 장학금 응시 권장 — AP 응시료 별도 지원"
        },
    },
}

# realTalk를 학교별로 재작성 (5개 항목 핵심만)
REALTALK = {
    'seoul_international': [
        ("🤩","이런 점은 진짜 좋아요","공립 최초 IB DP 인증. 외교부·국회·서울대 도보권이라 시사 인터뷰·인턴 기회가 일상이에요."),
        ("😤","솔직히 말하면","기숙사 없어요. 지방 학생은 자취/친척집 필수. 명륜동 자취비가 만만치 않음."),
        ("😰","힘든 점","IB DP 전원 이수라 못 따라가면 위험. 학원·외부 IB 튜터 병행하는 친구들 많아요."),
        ("💡","이런 학생에게 딱","서울 통학 가능 + IB로 SKY 학종+해외대 병행 노리는 학생."),
        ("💰","비용 현실","공립이라 학비는 0원이지만 IB 응시료·교재로 연 200~300만원. 학원 비용은 별도."),
    ],
    'cheongshim_international': [
        ("🤩","이런 점","사립이라 IB+AP 동시 운영. 미국 IECA 카운슬러 상주 — 아이비·Oxbridge 진학 시스템이 학교 자체에 내장."),
        ("😤","솔직히 말하면","국제고 중 최고가(연 2,300~2,800만원). 통일교 재단이라 가치교육 필수 — 종교 강의는 선택."),
        ("😰","힘든 점","가평 산속 위치 + 전원 기숙사. 외부 자극 적고 부모 방문 월 1~2회. 외로움 호소 많음."),
        ("💡","이런 학생에게 딱","해외대(미국 Top 50, Oxbridge) 진학을 1순위로 정한 학생. SKY는 안전카드 포지션."),
        ("💰","비용 현실","장학금 30%/50%/전액 3단계. 입학 성적+IB 예측 점수 상위만 전액. 저소득은 신중하게."),
    ],
    'incheon_international': [
        ("🤩","이런 점","영종도 인천공항 인접. 외국인 게스트·자유무역지역 환경에서 영어 실전 노출이 일상."),
        ("😤","솔직히 말하면","서울·청심 대비 인지도는 낮음. 하지만 항공·물류·관광 진로엔 국내 유일한 환경."),
        ("😰","힘든 점","영종도 입지라 학원가 멀어요(청라·송도 이동). 자기주도 학습 비중 큼."),
        ("💡","이런 학생에게 딱","항공·물류·관광·아시아권 대학(NUS·HKU) 진학을 꿈꾸는 인천·경기 서부 학생."),
        ("💰","비용 현실","공립 무상 + 기숙사 월 30~40만원. 인천교육청+인천공항공사 사회공헌 장학금 병행 가능."),
    ],
    'busan_international': [
        ("🤩","이런 점","영남권 유일 국제고 + 제2외국어(중·일·러) 심화. 일본 자매학교 교환이 정규."),
        ("😤","솔직히 말하면","수도권 국제고 대비 SKY 진학 네트워크는 약함. 대신 일본/홍콩 대학 진학률은 국내 1위."),
        ("😰","힘든 점","제2외국어 1개+영어 동시 학습 부담. 자격증(JLPT/HSK) 시험 일정 빡빡."),
        ("💡","이런 학생에게 딱","와세다·게이오·HKU·베이징대를 노리는 영남권 학생, 무역·해양 진로 학생."),
        ("💰","비용 현실","공립 무상 + 응시료·기숙사 월 25~35만원. 외국어 자격 응시료 학교 일부 보조."),
    ],
    'daegu_international': [
        ("🤩","이런 점","2021 개교 신축 캠퍼스 시설 최신. 경북대 학부 연구실 R&E가 정규 트랙."),
        ("😤","솔직히 말하면","신설교라 1~3기는 진학 데이터 형성 단계. 실적 부재가 리스크지만 신설 프리미엄도 있어요."),
        ("😰","힘든 점","북구 도남지구 학원가 빈약 → 자습 의존도 높음. 칠곡지구 이동 필요."),
        ("💡","이런 학생에게 딱","영남권에서 수도권 이주 없이 국제고를 다니고 싶은 학생, 학교와 함께 트랙을 만들 의지 있는 학생."),
        ("💰","비용 현실","공립 무상. 신설교라 초기 기수에 장학금·학교 지원 여유. 적극 신청 권장."),
    ],
    'sejong_international': [
        ("🤩","이런 점","정부세종청사 도보권 — 외교부·기재부·과기부 부처 견학이 정규 동아리 활동."),
        ("😤","솔직히 말하면","행정·외교·공무원 진로엔 최강이지만, 이공계·의대엔 구조적 약점."),
        ("😰","힘든 점","세종 신도시라 인근 학원가 빈약. 학교 보충수업 의존도 큼."),
        ("💡","이런 학생에게 딱","외교관·행시·국제기구·KDI 진로를 일찍 잡은 충청권 학생."),
        ("💰","비용 현실","공립 무상. 정부 장학생(NSLI-Y, 한미교육위) 선발 비율 1위 — 미국 단기 연수 전액 지원 가능."),
    ],
    'goyang_international': [
        ("🤩","이런 점","경기 북부 거점. 영자신문 정규 발간 + 파주·DMZ 평화교육이 차별화."),
        ("😤","솔직히 말하면","STEM·이공계 트랙은 약함. 인문·미디어·언론 진로에 최적화."),
        ("😰","힘든 점","서울 통학생 비율 높아 기숙사 분위기는 차분한 편. 자기관리 중요."),
        ("💡","이런 학생에게 딱","서울/일산권 + 언론·미디어·영문학·통일외교 진로 학생, 영국 인문계 대학 지망생."),
        ("💰","비용 현실","공립 무상. 일산 통학 가능하면 기숙사비 부담 없음."),
    ],
    'dongtan_international': [
        ("🤩","이런 점","경기 남부 신축 캠퍼스 + 삼성·판교 IT 인턴십 정규. STEM+글로벌 융합이 국내 거의 유일."),
        ("😤","솔직히 말하면","'국제고인데 이공계?'라는 정체성 혼란 있음. 인문 비교과 자원은 다른 국제고보다 적음."),
        ("😰","힘든 점","STEM AP+영어 몰입 병행 부담 큼. 영어로 알고리즘·통계 발표가 일상."),
        ("💡","이런 학생에게 딱","KAIST·POSTECH·CMU·UIUC·Waterloo 등 이공계 해외/특수대를 노리는 경기 남부 학생."),
        ("💰","비용 현실","공립 무상. 삼성·SK 사회공헌 STEM 장학금 응시 적극 권장."),
    ],
}

for s in d['schools']:
    upd = UPDATES.get(s['id'])
    if upd:
        for k, v in upd.items():
            s[k] = v
    rt = REALTALK.get(s['id'])
    if rt:
        s['realTalk'] = [{"emoji": e, "title": t, "content": c} for (e,t,c) in rt]

P.write_text(json.dumps(d, ensure_ascii=False, indent=2))
print('Synced displayed fields for', len(UPDATES), 'schools')
for s in d['schools']:
    print(f"  {s['name']}: {s['description'][:70]}...")
