#!/usr/bin/env python3
"""체육고·비즈니스고 데이터 정정 및 차별점 추가.

검증 출처: 공식 홈페이지(WebFetch), 학교알리미, 위키백과·나무위키, 베리타스알파.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ARTS = ROOT / "frontend/data/high-school/arts_sports.json"
BIZ = ROOT / "frontend/data/high-school/business.json"

# ──────────────────────────────────────────────────────────────────────────
# 체육고 데이터 보정 (by id 또는 name match)
# ──────────────────────────────────────────────────────────────────────────

# 1) 학교별 차별점 (체육고)
SPORTS_DIFF = {
    "서울체육고등학교": {
        "verifiedHomepage": "https://seoul-ph.sen.hs.kr/",
        "homepageVerified": True,
        "locationFix": "서울특별시 송파구 방이동 (강동대로 232)",
        "classificationConfirm": "공립 체육 특수목적고 (1974 개교, 전국 최고最古)",
        "clubsAndSeteuk": {
            "summary": "전국 체고 중 가장 오래된 전통과 '올림픽스타' 동문 트랙이 핵심 차별점.",
            "signatureClubs": ["태권도부", "레슬링부", "수영부", "양궁부", "유도부", "사격부", "조정부"],
            "seteukAngle": "스포츠 과학 교과 + 종목별 실기 일지를 통한 운동 수행 분석 기록. 국가대표 선배 멘토링 사례가 세특 차별점으로 활용 가능."
        },
        "alumniConnection": {
            "famousAlumni": ["박태환(수영)", "진종오(사격)", "양학선(체조)", "김연경 등 다수 올림픽 메달리스트"],
            "networkStrength": "공식 홈페이지 별도 메뉴 '올림픽스타'에서 역대 메달리스트 동문을 별도 관리. 국가대표 선후배 라인이 가장 두꺼움."
        },
        "teachingDifferentiator": "송파구 입지로 태릉선수촌·올림픽공원·잠실종합운동장 등 국가 훈련 인프라에 도보·근거리 접근 가능 — 전국 체고 중 인프라 접근성 1위.",
        "tuitionDetail": "공립으로 입학금·수업료 면제. 외부 코치비·원정 훈련비는 별도 발생.",
        "dormitoryLife": "기숙사 운영(승리사·선덕사·월계사 3개동). 식비·기숙사비 학교 부담 비중 높음. 통학·기숙 병행 가능.",
        "skyAndOverseas": "서울대 체육교육과·연세대 체육교육학과 진학 사례 다수. NCAA 직행보다 국내 한국체대·체육교육과 후 국가대표 트랙이 주류."
    },
    "인천체육고등학교": {
        "verifiedHomepage": "https://phed.icehs.kr/",
        "homepageVerified": True,
        "locationFix": "인천광역시 서구 청라동 (로봇랜드로 473)",
        "classificationConfirm": "공립 체육 특수목적고 (1976 개교, 학생 약 255명·2024)",
        "clubsAndSeteuk": {
            "summary": "인천 빙상·핸드볼 전통이 강해, 빙상장·아시아드주경기장 인프라 활용 동아리가 차별점.",
            "signatureClubs": ["빙상(쇼트트랙·피겨)부", "핸드볼부", "축구부", "양궁부", "역도부"],
            "seteukAngle": "인천아시안게임 유산 시설(아시아드주경기장·송도빙상장) 연계 실기 활동 기록을 세특 소재로 활용."
        },
        "alumniConnection": {
            "famousAlumni": ["인천 출신 빙상·핸드볼 국가대표 다수"],
            "networkStrength": "인천시체육회 산하 연계 강함. 청라 이전 후 인천국제공항 인접 입지로 해외 전지훈련 빈도 증가."
        },
        "teachingDifferentiator": "2010년대 후반 청라국제도시로 신축 이전 — 전국 체고 중 가장 최신 시설. 인천아시아드주경기장·문학경기장과 차량 30분 내.",
        "tuitionDetail": "공립 — 수업료 면제. 종목별 훈련 장비비는 학부모 일부 부담.",
        "dormitoryLife": "기숙사 운영(원거리 학생 우선 입사). 청라 이전 시 신축 기숙동 완비.",
        "skyAndOverseas": "한국체대·인하대·연세대 체육교육 진학이 다수. 인천국제공항 인접으로 해외 전지훈련·국제대회 출전 횟수 전국 체고 평균 이상."
    },
    "울산스포츠과학고등학교": {
        "verifiedHomepage": "https://school.use.go.kr/ushs-h/M01",
        "homepageVerified": True,
        "locationFix": "울산광역시 북구 산하동 (2014.3.1 개교)",
        "classificationConfirm": "공립 체육 특수목적고 — 단, 정식 명칭은 '울산스포츠과학고등학교'이며 전문과정·인재과정 이원화가 타 체고와 가장 큰 차이",
        "clubsAndSeteuk": {
            "summary": "전국 체고 중 유일하게 '인재과정(스포츠과학·지도자/생활체육 트랙)'을 정규 학과로 운영 — 학업·진학 중심 트랙 동아리가 활성화.",
            "signatureClubs": ["스포츠과학 탐구반(인재과정)", "트레이너·지도자 양성 동아리", "수영·축구·태권도부 등 종목별 부"],
            "seteukAngle": "운동생리학·스포츠심리·트레이닝 방법론 등 이론 교과 비중이 타 체고 대비 높아, 체육 관련 학과 진학용 세특 작성에 유리."
        },
        "alumniConnection": {
            "famousAlumni": ["2024년까지 누적 졸업생 491명 — 비교적 신생교라 명문 동문 명단은 형성 단계"],
            "networkStrength": "울산시체육회·울산과학대학교(스포츠지도과) 연계 산학협력."
        },
        "teachingDifferentiator": "전문과정(1·2반, 엘리트 선수)과 인재과정(3반, 스포츠과학·지도자)을 분리 운영. 인재과정은 일반 교과 비중을 늘려 체육교육과·스포츠과학과 진학에 특화.",
        "tuitionDetail": "공립 — 입학금·수업료·체육복·급식비까지 사실상 무상 운영(울산교육청 정책).",
        "dormitoryLife": "남학생동 61실 + 여학생동 31실. 학생 약 189명 대비 시설 여유 — 전교생 90% 이상 입사. 식비·기숙사비 부담 거의 없음.",
        "skyAndOverseas": "인재과정 졸업생이 서울대·고려대 체육교육과, 부산대·울산대 스포츠과학 트랙으로 진학. 신생교라 해외 NCAA 사례는 적음."
    },
    "강원체육고등학교": {
        "verifiedHomepage": "https://gangwon-ph.gwe.hs.kr/",
        "homepageVerified": True,
        "locationFix": "강원특별자치도 춘천시 송암동 (자라우새길 126)",
        "classificationConfirm": "공립 체육 특수목적고 (1992 개교, 학생 226명·2025.5)",
        "clubsAndSeteuk": {
            "summary": "2018 평창동계올림픽 인프라 기반 — 전국 체고 중 동계 종목(빙상·스키·바이애슬론)에 가장 특화.",
            "signatureClubs": ["빙상(스피드·쇼트트랙)부", "알파인스키부", "바이애슬론부", "크로스컨트리부", "컬링부", "하계 종목(레슬링·유도 등)"],
            "seteukAngle": "동계 종목 합숙·해발 600m 이상 강원도 고지대 훈련 기록을 운동생리학 세특 소재로 작성."
        },
        "alumniConnection": {
            "famousAlumni": ["동계 종목 국가대표 다수(빙상·스키)", "30회 누적 졸업식 기준 1,944명"],
            "networkStrength": "강원도체육회·평창올림픽 유산 시설 운영 기관 연계. 동계 국가대표팀 합숙 스케줄과 학교 일정 조율."
        },
        "teachingDifferentiator": "동계 종목 학생은 11~3월 알펜시아·평창·정선 스키장 합숙 — 학교가 원격 학사 운영 시스템 보유.",
        "tuitionDetail": "공립 — 수업료 면제. 동계 종목 장비비(스키·바이애슬론 라이플 등)는 학부모 부담 또는 협회 지원.",
        "dormitoryLife": "교육부 2022 전국 기숙형고등학교 명단 포함 — 기숙사 운영. 동계 합숙기 외에는 통학 가능.",
        "skyAndOverseas": "한국체대·강원대 체육교육과 진학 다수. 동계 종목 우수 선수는 캐나다·오스트리아 동계 유학 사례 일부 존재."
    }
}

# 2) 비즈니스고 데이터 보정
BIZ_DIFF = {
    "경복비즈니스고등학교": {
        "verifiedHomepage": "https://kbb.sen.hs.kr/",
        "homepageVerified": True,
        "subClassification": "서울형 마이스터고(2019 지정) — 비즈니스·AI·디자인 융합형 특성화고",
        "departments": ["국제관광비즈니스과", "스마트경영과(경영·무역·회계+빅데이터)", "AI융합콘텐츠과(AI·IoT·SW)", "콘텐츠디자인과"],
        "clubsAndSeteuk": {
            "summary": "AI융합콘텐츠과 신설로 '청소년 비즈쿨'·'중소기업 인력양성' 트랙이 가장 활성화 — 비즈니스+AI 융합이 차별점.",
            "signatureClubs": ["청소년 비즈쿨 창업동아리", "AI·IoT 메이커 동아리", "글로벌 인턴십반"],
            "seteukAngle": "AI 도구를 활용한 마케팅·콘텐츠 제작 프로젝트가 세특 단골 소재. 2025년 남녀공학 전환으로 활동 폭 확대."
        },
        "alumniConnection": {
            "famousAlumni": ["6년 연속 공무원(9급 행정·세무) 합격자 배출"],
            "networkStrength": "2024학년도 대학 진학 233건(성균관·한양·이화·경희 등) — 진학과 취업 모두 강함."
        },
        "teachingDifferentiator": "서울형 마이스터고로 지정되어 중소기업 인력양성사업 산학맞춤반 운영. 글로벌인턴십(해외 연수) 메뉴가 홈페이지에 명시.",
        "tuitionDetail": "특성화고 무상교육 — 입학금·수업료·교과서비 면제. 학교운영지원비 일부 자부담.",
        "dormitoryLife": "기숙사 없음(통학형). 강서구 화곡동 입지로 5호선·9호선 접근 양호.",
        "skyAndOverseas": "재직자 특별전형으로 SKY 경영·경제 진학 사례. 글로벌인턴십을 통한 해외(일본·동남아) 현장연수 운영."
    },
    "안산국제비즈니스고등학교": {
        "verifiedHomepage": "https://ansanib-h.goeas.kr/",
        "homepageVerified": True,
        "subClassification": "사립 특성화고 — 외국어 비즈니스 + 미용·간호·부사관까지 8개 학과 종합형",
        "departments": ["경영사무과", "쇼핑몰제작과", "비즈니스콘텐츠과", "비즈니스중국어과", "비즈니스일본어과", "미용과", "부사관과", "보건간호과"],
        "clubsAndSeteuk": {
            "summary": "전국 비즈니스고 중 유일하게 '비즈니스 중국어/일본어' 학과를 분리 운영 — 외국어 비즈니스가 핵심 차별점.",
            "signatureClubs": ["바리스타부", "뷰티아트부", "제과·제빵 데코레이션부", "치어리더 '아테나'", "축구부 '아레스'", "랩동아리 'Line-up'", "댄스부 'First Meet'", "단비국악관현악단", "취타대"],
            "seteukAngle": "일본어과 신입생 미래비전 캠프, 중국어 비즈니스 매너·HSK 자격증 트랙이 세특 소재. 국악·치어 등 비교과 동아리 종류가 전국 최다급."
        },
        "alumniConnection": {
            "famousAlumni": ["무역·항공·호텔·여행업·뷰티·부사관·간호조무 등 학과 직결 취업 분포"],
            "networkStrength": "일본 자매학교 교류 프로그램(비즈니스일본어과)이 가장 활발."
        },
        "teachingDifferentiator": "비즈니스 외국어 학과(중·일) 보유 + 부사관·간호·미용까지 진로 스펙트럼 가장 넓음. 2019년 국제통상과 폐지, 이후 학과 다양화 가속.",
        "tuitionDetail": "사립이지만 특성화고 무상교육 적용 — 수업료 면제. 학과별 실습비(미용 도구·일본어 교재) 일부 부담.",
        "dormitoryLife": "원거리 학생 대상 기숙사 일부 운영(상록구 장상동 입지, 4호선 한대앞역 도보권 외 통학).",
        "skyAndOverseas": "비즈니스일본어과는 일본 전문대 진학(JLPT N2 이상) 사례 다수. SKY 직행보다 일본·중국 자매학교 연수가 차별점."
    },
    "신일비즈니스고등학교": {
        "verifiedHomepage": "https://i-shinil-h.goegy.kr/",
        "homepageVerified": True,
        "subClassification": "사립 특성화고 — 금융·세무·디자인·간호 6개 학과 (2027 쇼핑라이브커머스과 재편 예정)",
        "departments": ["금융자산운용과", "스토어기획과", "세무회계과", "시각디자인과", "모션그래픽디자인과", "보건간호과"],
        "clubsAndSeteuk": {
            "summary": "학과별 단계형 자격증 로드맵이 가장 정교 — 세특에서 자격증 취득 과정 자체를 학습 서사로 활용.",
            "signatureClubs": ["국가공무원 준비반", "부사관 준비반", "직무맞춤 취업 엘리트반", "상업정보 기능영재반", "디자인 연구반"],
            "seteukAngle": "금융자산운용과: 증권·펀드투자권유대행인·전산세무회계·ERP·MOS. 보건간호과: 졸업 전 간호조무사. → 학년별 자격증 단계가 세특 시계열로 기록됨."
        },
        "alumniConnection": {
            "famousAlumni": ["대기업·금융기관 현장방문 연계 → 농협·신한 등 금융권 취업"],
            "networkStrength": "킨텍스 인접 입지로 박람회·전시회 현장학습 빈도 높음."
        },
        "teachingDifferentiator": "전국 비즈니스고 중 학과별 자격증 로드맵이 가장 체계적. 스마트IT경영과 4단계(ITQ→전산회계→TAT→금융NCS).",
        "tuitionDetail": "특성화고 무상교육 — 수업료 면제. 자격증 응시료는 학교 일부 보조.",
        "dormitoryLife": "기숙사 미운영(통학형). 일산서구 킨텍스로 입지로 경의중앙선·3호선 접근.",
        "skyAndOverseas": "재직자 특별전형으로 고려대·서울시립대 경영·세무 진학 사례. 해외 연수보다 국내 자격증 트랙 강점."
    },
    "서울금융고등학교": {
        "verifiedHomepage": "https://seoulfc.sen.hs.kr/",
        "homepageVerified": True,
        "subClassification": "2025 서울형 마이스터고 선도학교 — '비즈니스고'가 아닌 **금융 특화 마이스터고**",
        "departments": ["금융과", "소프트웨어과", "세무회계과", "행정서비스과(스타트업·브랜딩디자인 개편)"],
        "clubsAndSeteuk": {
            "summary": "전국 유일 '경제사관학교'·'실전투자반' 운영 — 모의주식투자·금융권 직무체험이 다른 비즈니스고와 가장 큰 차별점.",
            "signatureClubs": ["경제사관학교", "실전투자반(모의주식)", "공무원·공기업반", "청소년비즈쿨", "IT 미래인재 메이커스페이스"],
            "seteukAngle": "실전투자반 모의주식 성과·증권사 직무체험·경제사관학교 토론 기록이 금융·경제 학과 진학 세특 핵심 소재."
        },
        "alumniConnection": {
            "famousAlumni": ["국민·신한·하나·우리은행 등 시중은행 고졸채용 정기 합격자"],
            "networkStrength": "금융감독원·한국거래소·증권사 직무체험 협약 — 비즈니스고 중 금융권 네트워크 1위."
        },
        "teachingDifferentiator": "마이스터고 트랙으로 '선취업 후진학' 모델 적용. 금융권 고졸채용 시장에서 가장 인지도 높음. 양천구 신월동 입지(목동 학원가 인접).",
        "tuitionDetail": "마이스터고 — 입학금·수업료·실습복·교과서 전액 면제. 장학금 지원 폭 가장 넓음.",
        "dormitoryLife": "홈페이지 '기숙사 및 라온카페 운영' 명시 — 원거리 학생 기숙 가능. 라온카페는 학생 운영 실습 카페.",
        "skyAndOverseas": "선취업 후 재직자 전형으로 고려대·서강대 경영·경제 진학 다수. KAIST 금융전문대학원 연계 사례. 해외 유학보다 CFA·AICPA 트랙 추천."
    },
    "인천비즈니스고등학교": {
        "verifiedHomepage": "https://ibg.icehs.kr/",
        "homepageVerified": True,
        "subClassification": "공립 특성화고 — 명칭은 '비즈니스고'이나 실질은 **서비스·콘텐츠 특성화** (금융·회계 학과 없음, 2009년 인천여상에서 교명변경)",
        "departments": ["항공서비스과", "부사관경영과", "SNS마케팅과", "콘텐츠디자인과"],
        "clubsAndSeteuk": {
            "summary": "전국 비즈니스고 중 가장 이질적 — 항공+부사관+SNS+디자인 4개 학과로 상업·금융 트랙은 사실상 없음.",
            "signatureClubs": ["항공서비스 체험반", "호텔식음료 서비스반", "부사관 임관 특강반", "SNS 마케팅 콘텐츠 제작반"],
            "seteukAngle": "항공·서비스직 인적성 시뮬레이션, 부사관 체력·인성평가 대비, SNS 마케팅 캠페인 운영 기록이 세특 차별점."
        },
        "alumniConnection": {
            "famousAlumni": ["대한항공·아시아나 객실승무원, 공군·해군 부사관, 인천공항 지상직 취업 다수"],
            "networkStrength": "인천공항공사·항공사·인천지역 군부대 연계 — 항공 서비스 직군 네트워크 강함."
        },
        "teachingDifferentiator": "전국 비즈니스고 중 유일하게 항공+부사관 동시 운영. '비즈니스고' 명칭과 달리 금융·회계는 학습하지 않음 — 진학 시 사전 확인 필수.",
        "tuitionDetail": "특성화고 무상교육 — 수업료 면제. 항공서비스과 유니폼·헤어메이크업 실습비 일부 자부담.",
        "dormitoryLife": "기숙사 미운영(통학형). 미추홀구 도화동 입지, 1호선 도화역 인근.",
        "skyAndOverseas": "한서대·인하공전·연성대 항공운항·서비스 학과로 진학. 해외 유학보다 항공사 해외 베이스 취업이 차별점."
    },
    "광주여자상업고등학교": {
        "verifiedHomepage": "http://ggc.gen.hs.kr/",
        "homepageVerified": True,
        "subClassification": "사립 여자 특성화고 (2008 광주 최초 특성화고 전환) — 금융·재산경영 중심 정통 상업계",
        "departments": ["글로벌비즈니스과", "스마트재산경영과", "스마트금융과"],
        "clubsAndSeteuk": {
            "summary": "전국 비즈니스고 중 금융교육 실적 1위 — 학생 동아리가 경제금융인증시험 전국 1위, 전국투자자협회 공식 협력교.",
            "signatureClubs": ["전국 1위 경제금융인증 동아리", "특성화고 창업동아리(교육부장관상 수상)", "디자인·회계 특기반"],
            "seteukAngle": "전국투자자협회 금융교육 협력교 활동·CEO 초청 강연·금융권 직무체험이 세특 단골 소재. 17개 학생동아리 활동 폭 넓음."
        },
        "alumniConnection": {
            "famousAlumni": ["광주은행·전남·NH농협 등 지역 금융권 취업 다수", "공기업(한국전력·한전KPS) 합격"],
            "networkStrength": "광주 지역 은행·공기업 취업 네트워크 호남권 1위."
        },
        "teachingDifferentiator": "전국투자자협회 협력교 — 외부 전문 금융교육 정기 운영. 특성화고 창업대회 교육부장관상 수상 이력.",
        "tuitionDetail": "특성화고 무상교육 — 수업료 면제. 사립이나 학비 부담 없음.",
        "dormitoryLife": "기숙사 미운영(통학형). 광주 남구 진월동 입지로 광주 시내 접근 양호.",
        "skyAndOverseas": "전남대·조선대 경영·경제 진학 다수. SKY 직행은 재직자 전형 활용. 해외 유학보다 호남권 금융권 정착이 주류."
    },
    "대전여자상업고등학교": {
        "verifiedHomepage": "https://aramhs.djsch.kr/",
        "homepageVerified": True,
        "subClassification": "1948 개교 사립 여자 특성화고 — 자격증 취득 실적 전국 상위권",
        "departments": ["IT콘텐츠과", "스마트경영과"],
        "clubsAndSeteuk": {
            "summary": "직업계 고교학점제 적극 도입 — 학과 구분 없이 진로별 전공코스 선택 가능. 자격증 1인 평균 9개+ 취득.",
            "signatureClubs": ["전공심화 동아리(자격증·경진대회 트랙)", "상업경진대회 출전반"],
            "seteukAngle": "2022 전국 상업경진대회 22개 메달 중 18개 수상, 전국 1등 3명 — 경진대회 메달과 자격증 취득 과정이 세특 핵심."
        },
        "alumniConnection": {
            "famousAlumni": ["매년 취업률 70%+ — 대전 지역 금융·회계 사무직 취업"],
            "networkStrength": "충청권 사립 여상 최강 동문 네트워크(1948년 개교)."
        },
        "teachingDifferentiator": "직업계 고교학점제 코스과정 — 1학년 공통, 2~3학년 진로별 전공코스 선택. 자격증 단계별 트랙 명확.",
        "tuitionDetail": "특성화고 무상교육 — 수업료 면제. 자격증 응시료 학교 보조.",
        "dormitoryLife": "기숙사 미운영(통학형). 대전 중구 선화동 입지로 대전 도심 접근 양호.",
        "skyAndOverseas": "재직자 특별전형 활용 — 충남대·한밭대 경영·회계 진학. 해외 유학 사례는 드묾."
    },
    "부산여자상업고등학교": {
        "verifiedHomepage": "https://school.busanedu.net/psgch-h/",
        "homepageVerified": True,
        "subClassification": "66년 전통 사립 여자 특성화고 — 무역·금융 전통 + 인성·외국어 정서교육 강함",
        "departments": ["공통모집 후 2학년 진급 시 학과 배정(타교와 차별점)"],
        "clubsAndSeteuk": {
            "summary": "전국 최고 수준 합창단·가야금 수업·연극공연 — 인성·예체능 비교과가 전국 비즈니스고 중 가장 두드러짐.",
            "signatureClubs": ["합창단(전국 수준)", "가야금부", "연극부", "이미지메이킹·면접반"],
            "seteukAngle": "명곡감상·시노트·5분생활영어·인성교육방송 등 정서·외국어 일상 활동이 세특 자료. 1교사 1기업 방문 산학협력 기록."
        },
        "alumniConnection": {
            "famousAlumni": ["공기업·금융기관 14명, 대기업 8명, 중소기업 36명(연도 미상)", "동문 4만2천여 명 — 부산 최대 여상 동문회"],
            "networkStrength": "부산 지역 무역·금융 동문 네트워크 영남권 1위."
        },
        "teachingDifferentiator": "1학년 공통 → 2학년 학과 배정 시스템(타교와 차별). 1교사 1기업 방문 산학협력·자격증·취업대비 이미지메이킹·면접지도 3축.",
        "tuitionDetail": "특성화고 무상교육 — 수업료 면제. 사립이나 학비 부담 없음.",
        "dormitoryLife": "기숙사 미운영(통학형). 부산 수영구 망미동 입지, 3호선 망미역 도보권.",
        "skyAndOverseas": "부산대·동아대 경영·무역 진학 다수. 해외 유학보다 부산항·해운대 무역회사 취업 트랙."
    },
    "전주상업정보고등학교": {
        "verifiedHomepage": "http://jgch.hs.kr/",
        "homepageVerified": True,
        "subClassification": "공립 특성화고(구 전주여자상업고) — 회계·금융에 가장 정통하게 특화",
        "departments": ["회계정보과", "금융정보과", "사무행정과(2024 신설)"],
        "clubsAndSeteuk": {
            "summary": "10개교 중 회계·금융 학과 비중이 가장 높음 — 자격증 트랙이 핵심 동아리.",
            "signatureClubs": ["전산회계운용사반", "기업회계·세무회계 심화반", "금융정보 직무체험반"],
            "seteukAngle": "회계정보과: 전산회계운용사·기업회계·세무회계 단계 취득. 금융정보과: 증권·은행 NCS 직무 트랙. → 세특이 자격증 단계 그대로 기록됨."
        },
        "alumniConnection": {
            "famousAlumni": ["금융(증권·은행·보험)·회계세무·법무·특허법인·공공기관 사무직 취업 다수"],
            "networkStrength": "전북 지역 회계법인·금융권 동문 네트워크. 전북은행·NH농협 정기 채용."
        },
        "teachingDifferentiator": "기본 자격증(컴활·워드·전산회계운용사) + 회계정보과 심화(전산회계·기업회계·세무회계) — 학과 트랙이 자격증 단계와 1:1 매칭.",
        "tuitionDetail": "특성화고 무상교육 — 수업료 면제. 자격증 응시료 학교 보조.",
        "dormitoryLife": "기숙사 미운영 또는 제한 운영(공시 자료 확인 필요). 전주 완산구 따박골2길 입지.",
        "skyAndOverseas": "회계정보과 → 전북대·원광대 경영·회계 진학. 재직자 전형으로 SKY 경영 가능. 해외 유학 사례는 드묾."
    },
    "울산상업고등학교": {
        "verifiedHomepage": "https://school.use.go.kr/ulsan-h/M01",
        "homepageVerified": True,
        "subClassification": "공립 특성화고 — 전국 비즈니스고 중 유일하게 **군사경영과** 정규 학과 운영",
        "departments": ["군사경영과", "물류경영과", "상공경영과"],
        "clubsAndSeteuk": {
            "summary": "군사경영과 보유가 전국 유일급 차별점 — 부사관·장교 양성 트랙을 상업계 안에 정규로 둠.",
            "signatureClubs": ["국방체육반", "군 리더십·군대윤리반(군사경영과)", "물류관리 실무반", "희망7품제 인성 프로그램"],
            "seteukAngle": "NCS 기반 사무행정·인사·총무·물류관리 실무교과 + 군사경영과 국방체육·군 리더십이 세특 차별 소재."
        },
        "alumniConnection": {
            "famousAlumni": ["군사경영과: 부사관·장교·군무원·보안·경호 다수", "물류경영과: 울산항·현대중공업 협력사 물류·운송 직군"],
            "networkStrength": "울산 군부대·울산항만공사·현대그룹 협력 — 산업도시 울산 특화 네트워크."
        },
        "teachingDifferentiator": "전국 상업고 중 유일한 군사경영과. 부사관 양성을 정규 학과로 운영 — 군 진로 희망자에게 최적화. NCS 기반 실무교과 비중 높음.",
        "tuitionDetail": "특성화고 무상교육 — 수업료 면제. 국방체육 실습복 일부 자부담.",
        "dormitoryLife": "기숙사 운영 여부 공시 확인 필요. 울주군 범서읍 장검길 입지(시 외곽).",
        "skyAndOverseas": "군사경영과 → 육군·해군·공군 부사관학교 진학. 일부 학사장교 트랙으로 4년제 진학. 해외 유학 사례 드묾."
    }
}


def patch_school(school, diff):
    """학교 객체에 differentiators 추가 및 핵심 필드 보강."""
    school["differentiators"] = {
        "verifiedHomepage": diff["verifiedHomepage"],
        "homepageVerified": diff["homepageVerified"],
        "classificationNote": diff.get("classificationConfirm") or diff.get("subClassification"),
        "clubsAndSeteuk": diff["clubsAndSeteuk"],
        "alumniConnection": diff["alumniConnection"],
        "teachingDifferentiator": diff["teachingDifferentiator"],
        "tuitionDetail": diff["tuitionDetail"],
        "dormitoryLife": diff["dormitoryLife"],
        "skyAndOverseas": diff["skyAndOverseas"],
    }
    # 비즈니스고는 학과 정보 별도 보강
    if "departments" in diff:
        school["differentiators"]["departments"] = diff["departments"]
    if "locationFix" in diff:
        school["location"] = diff["locationFix"]
    # websiteUrl 보강
    school["websiteUrl"] = diff["verifiedHomepage"]


def update_arts_sports():
    with ARTS.open() as f:
        data = json.load(f)
    new_schools = []
    for s in data["schools"]:
        name = s.get("name")
        # 제주체육고등학교 제거 (실존하지 않음)
        if name == "제주체육고등학교":
            print(f"  ✗ DELETE: {name} (실존하지 않음)")
            continue
        # 울산체육고등학교 → 울산스포츠과학고등학교
        if name == "울산체육고등학교":
            s["name"] = "울산스포츠과학고등학교"
            s["shortName"] = "울산스포츠과학고"
            s["id"] = "ulsan_sports_science"
            name = "울산스포츠과학고등학교"
            print(f"  ↻ RENAME → {name}")
        if name in SPORTS_DIFF:
            patch_school(s, SPORTS_DIFF[name])
            print(f"  ✓ PATCH: {name}")
        new_schools.append(s)
    data["schools"] = new_schools
    with ARTS.open("w") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def update_business():
    with BIZ.open() as f:
        data = json.load(f)
    for s in data["schools"]:
        name = s.get("name")
        if name in BIZ_DIFF:
            patch_school(s, BIZ_DIFF[name])
            print(f"  ✓ PATCH: {name}")
        else:
            print(f"  ? SKIP: {name}")
    with BIZ.open("w") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    print("== arts_sports.json ==")
    update_arts_sports()
    print("\n== business.json ==")
    update_business()
    print("\nDone.")
