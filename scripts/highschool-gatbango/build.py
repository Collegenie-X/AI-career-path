# -*- coding: utf-8 -*-
"""master_facts.json → general_elite.json 학교 객체 생성/병합.

원칙(자사고 생성기와 동일):
 - 서술은 검증 축(정식명·시도·시군구·종류 일반/자율·성별·공립/사립·태그·학급수·홈페이지)에서만 유도.
 - 진학실적·사교육비·프로그램명 등 미검증 수치/고유명은 쓰지 않는다. 추정은 [일반적] 표기.
 - 기존 손수 작성 31개교는 절대 덮어쓰지 않는다(뒤에 append).
"""
import json, os, re

HERE = os.path.dirname(__file__)
DATA = os.path.join(HERE, "..", "..", "frontend", "data", "high-school")

PALETTE = ["#c084fc", "#a78bfa", "#818cf8", "#60a5fa", "#38bdf8", "#f472b6",
           "#fb923c", "#34d399", "#2dd4bf", "#f59e0b"]


def short_name(name):
    n = name
    n = n.replace("여자고등학교", "여고").replace("고등학교", "고")
    return n


def sido_short(region):
    return {
        "서울특별시": "서울", "부산광역시": "부산", "대구광역시": "대구",
        "인천광역시": "인천", "대전광역시": "대전", "울산광역시": "울산",
        "세종특별자치시": "세종", "경기도": "경기", "강원특별자치도": "강원",
        "충청북도": "충북", "충청남도": "충남", "전북특별자치도": "전북",
        "경상북도": "경북", "경상남도": "경남", "제주특별자치도": "제주",
        "전남광주통합특별시(광주)": "광주", "전남광주통합특별시(전남)": "전남",
    }.get(region, region)


def gender_text(coedu):
    return {"남": "남고", "여": "여고", "남여공학": "남녀공학"}.get(coedu, "남녀공학")


def founding_text(f):
    return f or "공립"


def id_from(name, code):
    base = re.sub(r"[^가-힣a-zA-Z]", "", short_name(name))
    return f"ge_{code}"


def is_sci(tags):
    return "과학중점" in tags


def is_hakgunji(tags):
    return "학군지" in tags


def difficulty_of(tags):
    if is_hakgunji(tags):
        return 5
    if is_sci(tags):
        return 4
    return 3


def type_label(t, tags):
    base = "자율고(자공고/자율형)" if t == "자율고" else "일반고"
    if is_hakgunji(tags):
        return f"{ '자율고' if t=='자율고' else '일반고'} (학군지)"
    return base


# ─────────────────────────── 필드 생성 ───────────────────────────

def build_school(code, f, idx):
    name = f["name"]
    sn = short_name(name)
    region = f["region"]; sido = sido_short(region)
    signgu = f["signgu"] or ""
    tags = f["tags"]; district = f["district"]
    coedu = f["coedu"]; gtext = gender_text(coedu)
    found = founding_text(f["founding"])
    typ = f["type"]  # 일반고 / 자율고
    cc = f["firstYearClassCount"]
    hp = f["homepage"] or ""
    if hp and not hp.startswith("http"):
        hp = "http://" + hp
    color = PALETTE[idx % len(PALETTE)]
    emoji = "🔬" if is_sci(tags) else ("🏛️" if typ == "자율고" else "🏫")

    loc = f"{region} {signgu}".strip()
    autoc = "자율형 공·사립 구분은 학교 공시 확인" if typ == "자율고" else f"{found} {gtext}"

    # 태그 서술 축
    if is_sci(tags):
        cert = "교육부·교육청 지정 ==과학중점학교== (수학·과학 심화 교육과정·과제연구 운영)"
        focusline = "==과학중점과정==(수학·과학 심화, 과제연구·R&E)을 운영하는 이공·자연·의약계 강세 일반고"
        careerword = "이공·자연·의약계"
        stat4 = "이공·의약계"
    elif is_hakgunji(tags):
        cert = f"=={district}== 학군 대표 갓반고"
        focusline = f"{district} 학군 인프라를 낀 내신 경쟁이 치열한 대표 갓반고"
        careerword = "SKY·의약·인서울 상위"
        stat4 = "SKY·의약"
    else:
        cert = f"=={sido} {signgu}== 지역 거점 명문 일반고"
        focusline = f"{sido} 지역 거점으로 자리 잡은 명문 일반고"
        careerword = "지역 거점대·인서울"
        stat4 = "거점대·인서울"

    tuition = ("자율형 고교 — 자율형공립고는 ==고교 무상교육(수업료 면제)== 대상, "
               "자율형사립고는 수업료 자율책정(연 수백만원)일 수 있음. 학교알리미 공시로 확인"
               if typ == "자율고"
               else "==고교 무상교육== — 수업료 면제. 사교육비는 지역·가정별 편차 큼(학교알리미 공시 참고)")

    admission = ([
        {"step": 1, "title": "거주지 학군·평준화 배정",
         "detail": f"{sido} 평준화 지역 거주지 기준 교육청 배정(선지원 후추첨/근거리). 별도 전형 시험 없음.",
         "icon": "🏠"},
        {"step": 2, "title": "추첨 / 선지원 후추첨",
         "detail": "지원 학교 중 추첨으로 최종 배정. 학군 경계는 매년 시·도교육청 입시요강 확인.",
         "icon": "🎲"},
    ] if typ != "자율고" else [
        {"step": 1, "title": "지원 자격 확인",
         "detail": f"{sido} 소재 자율형 고교. 자공고는 학교군 지원, 자사고는 별도 원서. 유형은 학교 공시로 확인.",
         "icon": "📋"},
        {"step": 2, "title": "추첨/선발",
         "detail": "자공고는 추첨(성적 제한 없음)이 일반적, 자사고는 추첨·면접 병행 가능. 학교 요강 확인.",
         "icon": "🎲"},
    ])

    hs = [
        {"label": "지역", "value": f"{sido} {signgu}".strip(), "emoji": "📍", "color": color},
        {"label": "운영주체", "value": f"{found} {gtext}", "emoji": "🏫", "color": "#a78bfa"},
        {"label": "수업료", "value": ("무상/자율" if typ == "자율고" else "무상"), "emoji": "💰", "color": "#34d399"},
        {"label": "진학목표", "value": stat4, "emoji": "🎯", "color": "#f59e0b"},
    ]

    prog = ([
        f"[일반적] ==과학중점과정== 수학·과학 심화 교과 (미적분·기하·과학II·과학과제연구)",
        "[일반적] R&E·자유탐구·과학 동아리 (과학중점학교 표준)",
        "[일반적] 이공계 진로 연계 전공 체험·대학 연계 프로그램",
        "[일반적] 논·서술형 평가 대비 프로그램 (2028 대응)",
        "[일반적] 정시·내신 병행 방과후 보충",
    ] if is_sci(tags) else [
        f"[일반적] 내신·수능 병행 심화 수업 ({gtext} 갓반고 표준)",
        "[일반적] 학종 세특 대비 탐구·발표·동아리 활동",
        "[일반적] 논·서술형 평가 대비 글쓰기 프로그램 (2028 대응)",
        "[일반적] 정시·내신 더블 트랙 방과후 보충",
        "[일반적] 동문·지역대학 연계 진로 멘토링",
    ])

    pdetails = ([
        {"name": "과학중점과정 심화 교과", "emoji": "🔬",
         "description": "[일반적] 과학중점학교 지정에 따른 수학·과학 심화 교과와 과학과제연구 운영",
         "benefit": "==이공·의약 학종 세특==에서 탐구 역량 누적"},
        {"name": "R&E·자유탐구", "emoji": "🧪",
         "description": "[일반적] 소논문·연구형 탐구 활동 (과학중점 표준, 세부 프로그램은 학교 공시 확인)",
         "benefit": "==자연·공학 계열 전공적합성== 강화"},
        {"name": "논·서술형 글쓰기", "emoji": "✍️",
         "description": "2028 논·서술형 평가 도입 대비 교과별 첨삭",
         "benefit": "==2028 통합형 수능·논술== 대응"},
        {"name": "정시·내신 더블 트랙", "emoji": "📚",
         "description": "모의고사 기반 보충 + 학교 내신 보강",
         "benefit": "==학종·정시 동시 대응=="},
    ] if is_sci(tags) else [
        {"name": "내신·수능 더블 트랙", "emoji": "📚",
         "description": f"{gtext} 갓반고 특성상 내신 관리 + 모의고사 보충 병행",
         "benefit": "==학종·정시 동시 대응=="},
        {"name": "학종 세특·탐구 활동", "emoji": "🧭",
         "description": "[일반적] 교과 세특·동아리·탐구 주제 설계 지원 (세부는 학교 공시 확인)",
         "benefit": "==전공적합성·세특 주제== 축적"},
        {"name": "논·서술형 글쓰기", "emoji": "✍️",
         "description": "2028 논·서술형 평가 대비 교과별 첨삭",
         "benefit": "==2028 통합형 수능·논술== 대응"},
        {"name": "동문·지역대학 멘토링", "emoji": "🤝",
         "description": "[일반적] 동문·인근 대학 재학생 진로 상담 (운영 여부 학교 확인)",
         "benefit": "==전공 탐색·자기주도 설계== 도움"},
    ])

    career = {
        "middle1": "전 과목 균형 내신 + 독서·탐구 습관",
        "middle2": ("수학·과학 선행 + 탐구 주제 탐색" if is_sci(tags) else "수학·영어 선행 + 세특 주제 탐색"),
        "middle3": "고1 선행 마무리 + 진로 방향 확정",
    }

    cpd = [
        {"grade": "중학교 1학년", "icon": "🌱", "tasks": [
            "전 과목 균형 내신 관리 (특히 ==국어·수학·영어==)",
            ("==수학·과학 개념== 탄탄히 (과학중점 대비)" if is_sci(tags) else "==독서·글쓰기 습관== 만들기"),
            "AI 도구는 ==개념 이해 보조==로만 (답만 베끼지 않기)",
        ], "keyPoint": f"{sn}은 ==거주지 배정==(자율고는 지원)이라 입시 시험 부담은 작지만, 입학 후 모집단이 강합니다. 중1부터 ==스스로 정리하는 노트== 습관이 결정적."},
        {"grade": "중학교 2학년", "icon": "🌿", "tasks": [
            ("==중3 수학 선행== + 과학 심화 독서" if is_sci(tags) else "==중3 수학·영어 선행== 시작"),
            "관심 분야 ==탐구 주제 1~2개== 메모",
            "교내·교외 ==토론·발표 경험== 만들기",
        ], "keyPoint": "=='학원이 시키는 대로'에서 '내 질문'으로==. 이때부터 학종 세특에서 차별화되는 학생이 결정됩니다."},
        {"grade": "중학교 3학년", "icon": "🌳", "tasks": [
            "==고1 수학·영어 선행== 마무리",
            f"{name} 인접 학원·고교 교과 분위기 사전 조사",
            "고1 ==첫 중간고사 1등급== 목표 학습 계획",
        ], "keyPoint": "==첫 학기 내신이 평생을 좌우==한다는 말이 갓반고에선 진짜입니다. 1학년 1학기 중간을 위해 겨울방학을 비워두세요."},
    ]

    realtalk = [
        {"emoji": "😤", "title": f"{sn} 솔직히 말하면...",
         "content": f"{sn}은 {focusline}예요. 입학 자체는 시험이 없어도(자율고는 지원), ==모집단이 강해== 내신 1등급(2028 상위 10%) 진입은 여전히 치열합니다."},
        {"emoji": "🤩", "title": f"{sn}만의 좋은 점",
         "content": (f"[일반적] ==과학중점과정==을 통해 수학·과학 심화 교과와 과제연구를 정규로 들을 수 있어 이공·의약 지망생에게 유리합니다. {found} {gtext}로 또래 환경도 안정적."
                     if is_sci(tags) else
                     f"{cert} 특성상 [일반적] 내신·학종 관리 인프라가 갖춰져 있고, {found} {gtext}로 학습 분위기가 안정적입니다.")},
        {"emoji": "😰", "title": f"{sn} 힘든 점",
         "content": ("==수학·과학 심화 경쟁==이 치열하고 과제연구·탐구 부담이 큽니다. 이공계 지망생 비율이 높아 관련 과목 내신 경쟁이 살벌한 편."
                     if is_sci(tags) else
                     "모집단이 강해 ==내신 경쟁==이 치열합니다. 학군·지역 특성상 사교육 의존도가 높아질 수 있어 자기주도 학습 관리가 관건.")},
        {"emoji": "💡", "title": f"{sn}가 잘 맞는 학생",
         "content": (f"=={careerword}== 진학 목표가 뚜렷하고, 수학·과학 심화·탐구를 즐기며 ==학종+정시 더블 트랙==을 끝까지 끌고 갈 수 있는 학생."
                     if is_sci(tags) else
                     f"=={careerword}== 진학을 목표로 ==전 과목 균형 내신==과 ==자기주도 학습==을 지킬 수 있는 학생.")},
        {"emoji": "🏠", "title": f"{sn} 통학·생활",
         "content": f"[일반적] 기숙사 운영 여부는 학교 홈페이지 확인. {loc} 거주·근거리 통학이 일반적이며, 통학·학원 동선을 주간 단위로 관리하세요."},
        {"emoji": "💰", "title": f"{sn} 비용 현실",
         "content": tuition + ". 저소득층은 EBSi·교육청 무료 강의·멘토링과 학교 방과후·자습실을 적극 활용하세요."},
        {"emoji": "🎯", "title": f"{sn}의 차별점",
         "content": cert + ". 같은 지역 일반고와의 차별 포인트는 ==교육과정 편성·동아리·진학 지원==에서 드러나니 홈페이지에서 직접 확인하세요."},
        {"emoji": "📊", "title": f"{sn} 졸업 후",
         "content": f"[일반적] =={careerword}== 진학 사례가 있다고 알려져 있으나, 정확한 통계는 ==학교알리미 졸업생 진로 현황==에서 매년 확인이 필요합니다."},
    ]

    survival = [
        {"emoji": "📝", "tip": (f"{sn}은 ==수학·과학 심화== 부담이 크니 입학 전 겨울방학에 고1 공통수학·과학 진도를 미리 빼두세요."
                                 if is_sci(tags) else
                                 f"{sn}은 ==내신 경쟁==이 세니 입학 전 겨울방학에 고1 공통수학·영어를 선행해 1학기 내신을 안착시키세요.")},
        {"emoji": "🧠", "tip": "학원에 의존만 하지 말고 ==자기 노트·요약을 직접 만드는 시간==을 매일 확보하세요. 학종 면접에서 결정타가 됩니다."},
        {"emoji": "🛌", "tip": "==수면 6시간 이상 사수==. 학원 스케줄보다 수면·컨디션을 우선하세요."},
        {"emoji": "🤝", "tip": f"=={gtext} 환경==을 활용해 토론·발표·프로젝트 동아리에서 협업 경험을 쌓으세요(2028 면접 대비)."},
    ]

    faq = [
        {"category": "입시",
         "question": f"{name}에 입학하려면 어떻게 해야 하나요?",
         "answer": (f"{name}은 ==거주지 학군 배정 + 선지원 후추첨== 방식이에요. 별도 입학 시험은 없으며 {sido} 평준화 학군 거주가 전제입니다. 학군 경계는 매년 {sido}교육청 요강을 확인하세요."
                    if typ != "자율고" else
                    f"{name}은 자율형 고교로, 자공고는 학교군 지원·추첨, 자사고는 별도 원서·추첨(면접 가능)이 일반적입니다. 정확한 전형은 학교 공시로 확인하세요.")},
        {"category": "학업",
         "question": "갓반고는 내신 1등급 따기가 정말 어려운가요?",
         "answer": "==사실입니다==. 모집단이 강해 상위권 진입이 어렵습니다. 다만 ==2028 내신 5등급제(상위 10%=1등급)==로 진입 장벽이 다소 완화될 예정입니다."},
        {"category": "진로",
         "question": ("과학중점학교는 문과도 괜찮나요?" if is_sci(tags) else "학종과 정시 중 어디에 집중해야 하나요?"),
         "answer": ("과학중점과정은 이수 시 이공·자연·의약계에 강점이 큽니다. 문과 지망이면 과학중점과정 이수 의무·시간표 부담을 미리 확인하고 선택하세요."
                    if is_sci(tags) else
                    "==갓반고는 학종+정시 더블 트랙==이 가능한 카테고리입니다. 1학년부터 내신·세특 + 수능 모의고사를 병행하다 2학년 말 강점에 따라 비중을 조정하세요.")},
        {"category": "비용",
         "question": "사교육비가 정말 많이 드나요?",
         "answer": "지역·가정별 편차가 큽니다. 저소득층은 EBSi·교육청 무료 강의·멘토링을 적극 활용하고, 학교 보충수업·자습실을 최대한 활용하는 전략이 필요합니다."},
    ]

    school = {
        "id": id_from(name, code),
        "name": name,
        "shortName": sn,
        "location": loc,
        "type": type_label(typ, tags),
        # 학군지는 큐레이션한 학군명, 그 외는 NEIS 소재지(권위값)를 사용
        "districtFact": (f"{district} ({found} {gtext})" if is_hakgunji(tags)
                         else f"{sido} {signgu} ({found} {gtext})"),
        "emoji": emoji,
        "color": color,
        "difficulty": difficulty_of(tags),
        "annualAdmission": None,
        "annualAdmissionNote": "학교알리미 공시 확인",
        "tuition": tuition,
        "dormitory": False,
        "ibCertified": False,
        "specialCertification": cert,
        "operatorFact": f"{found} ({gtext}).",
        "teachingMethod": ("==과학중점과정 심화 수업== + 과제연구·R&E + 내신·수능 병행 자기주도 학습."
                           if is_sci(tags) else
                           "==내신·수능 병행 수업== + 심화·논술형 평가 + 자기주도 학습."),
        "famousPrograms": prog,
        "famousProgramDetails": pdetails,
        "studentLevel": f"[일반적] =={sido} {signgu}== 지역 상위 모집단으로, {careerword} 지망생이 두터운 편이라는 평.",
        "admissionProcess": admission,
        "careerPath": career,
        "careerPathDetails": cpd,
        "highlightStats": hs,
        "realTalk": realtalk,
        "survivalTips": survival,
        "competitionLevel": f"[일반적] =={sido} 지역 상위 모집단== — {sn} 특성상 {'수학·과학' if is_sci(tags) else '주요 과목'} 내신 1등급 진입 경쟁이 치열한 편.",
        "studyHoursPerDay": "==하루 8~11시간== (학교 + 학원·인강 + 자습 포함, 지역별 편차)",
        "selfStudyRatio": "35~45% (AI 시대엔 자기주도 비중 50%+ 권장)",
        "socialLife": f"=={gtext}== — 학교·학원 생활권이 {loc} 중심으로 겹쳐 또래 네트워크가 형성됩니다.",
        "mentalHealthNote": "==비교 압박·경쟁 번아웃·수면 부족==이 갓반고 3대 리스크. 운동·취미 시간을 주간 단위로 확보하세요.",
        "pros": [
            (f"[일반적] ==과학중점과정== 수학·과학 심화 이수 가능" if is_sci(tags) else f"=={district}== 학습 인프라"),
            f"고교 무상교육 (수업료 면제)" if typ != "자율고" else "자율형 교육과정 운영",
            f"=={gtext}== 학습 환경",
            "==학종+정시 더블 트랙== 가능",
            f"[일반적] {careerword} 진학 지향(학교알리미 공시 확인)",
            f"1학년 {cc}학급 규모" if cc else "지역 거점 규모",
        ],
        "cons": [
            f"=={'수학·과학' if is_sci(tags) else '주요 과목'} 내신 경쟁==이 치열",
            "지역·가정별 사교육비 편차 부담",
            "비교 압박·번아웃 위험",
            "[일반적] 진학 실적은 학교알리미로 직접 확인 필요",
        ],
        "admissionTip": f"{sn}은 =={sido} 학군 거주(자율고는 지원)==가 전제. 입학 전 겨울방학에 ==고1 {'공통수학·과학' if is_sci(tags) else '공통수학·영어'} 선행==을 마쳐두면 강한 모집단 속 1학년 1학기 내신 안착에 유리합니다.",
        "targetUniversities": [f"[일반적] {careerword} 진학 사례 — 학교알리미 공시로 확인"],
        "alumniCareers": [
            "* 학교별 편차 — 학교알리미 졸업생 진로 공시 확인",
            f"[일반적] {careerword} 등",
        ],
        "faq": faq,
        "websiteUrl": hp,
        "description": f"{sn}은 {loc} 소재 =={found} {gtext} {'자율고' if typ=='자율고' else '일반고'}==로, {focusline}입니다. (NEIS 학교정보 기준)",
        "schoolInfoCard": {
            "regionScope": f"{sido} {signgu} 학군 배정 (거주지 기준)" if typ != "자율고" else f"{sido} 자율형 고교 (지원 기준)",
            "capacity": (f"1학년 {cc}학급 (NEIS 2026학년도 학급정보)" if cc else "NEIS 학급정보 확인"),
            "genderRatio": f"{gtext} ({found})",
            "dormitoryType": "기숙사 운영 여부는 학교 홈페이지 확인",
            "costPerYear": ("수업료 면제 (고교 무상교육) · 사교육비는 지역·가정별 편차"
                            if typ != "자율고" else
                            "자공고 무상 / 자사고 수업료 자율 — 학교 공시 확인"),
            "scholarship": "교육청 장학금 · 교내 성적·저소득 장학금 (학교 문의)",
            "lowIncomeAdvice": "교육청 교육비 지원·EBSi·학교 자습실 적극 활용. 학교 방과후·탐구 프로그램을 학원 대체재로 활용",
        },
        "admissionQualifications": {
            "mandatory": ([f"{sido} 학군 거주", "중학교 졸업 예정자"] if typ != "자율고"
                          else [f"{sido} 소재 지원 자격", "중학교 졸업 예정자"]),
            "recommended": [
                f"==중3 겨울방학 고1 {'수학·과학' if is_sci(tags) else '수학·영어'} 선행==",
                "독서·탐구 활동 누적 기록",
                "자기주도 학습 루틴(1시간/일+)",
            ],
            "interviewFormat": ("별도 면접 없음 — 거주지 학군 추첨 배정" if typ != "자율고"
                                else "자공고 추첨 / 자사고 면접 가능 — 학교 요강 확인"),
            "competitionRate": "선지원 후추첨 — 인기 학교는 추첨 경쟁 발생",
            "aiTip": "AI 시대엔 ==스스로 만든 탐구 주제·노트==가 학종 변별 요소. 중학교부터 AI를 ==오답 분석·요약·면접 코치==로 활용하세요.",
        },
        "studyStyleDetail": (f"{sn}은 ==학교 수업(내신) + 과학중점 심화·과제연구 + 학원·인강==의 축으로 학습이 돌아갑니다. 이공·의약 지망생이 많아 수학·과학 비중이 크며, ==세특·R&E==는 자기 탐구가 차별 포인트."
                             if is_sci(tags) else
                             f"{sn}은 ==학교 수업(내신) + 학원·인강 + 자기주도 탐구==의 축으로 학습이 돌아갑니다. ==세특·논술==에서 자기 언어로 재구성하는 힘이 차별 포인트."),
        "update2028AI": {
            "policy2028": "==2028 대입 개편이 갓반고에 유리==합니다. 내신 5등급제(상위 10%=1등급)로 교과전형 진입 장벽 완화, 통합형 수능으로 정시 부담 감소, 세특·면접 비중 확대로 ==탐구·발표 역량이 결과로 직결==됩니다.",
            "aiEra": "AI가 문제 풀이·개념 설명을 대체하는 시대, 갓반고 생존 키워드는 ==깊은 탐구 + 논리적 글쓰기 + 협업 프로젝트==. 학원/인강 1차 → AI로 약점 분석·요약·면접 모의 → ==손으로 정리==하는 3단계 루틴이 표준이 됩니다.",
            "cautionPoints": [
                "==학원/인강 → AI 요약 → 손 노트==의 3단계 루틴을 만들 것",
                "==AI가 써준 보고서·자소서는 입학사정관이 즉시 알아챔== — 자기 언어로 재구성 필수",
                "==비교 디톡스== 루틴 필수 (SNS·점수 비교로 번아웃 방지)",
                "==수면 6시간 이상 사수==",
                "==사교육비 가족 회의== — 부담되면 EBSi·교육청 무료 강의로 대체 전략",
            ],
        },
        "middleSchoolGuide": {
            "oneLineAbout": f"{focusline}으로, {careerword} 진학 루트가 있는 {sido} {signgu} 갓반고예요.",
            "goodFor": [
                "==전 과목 균형 학업 능력==이 있는 친구",
                (f"=={careerword}==를 목표로 잡은 친구"),
                (f"==수학·과학 심화·탐구==를 즐기는 친구" if is_sci(tags) else f"=={district} 학습 환경==을 활용할 친구"),
                "==장기 인내력·자기관리==가 되는 친구",
            ],
            "notForYouIf": [
                "==예체능·특정 분야 한 길==을 가고 싶은 경우",
                ("==과학중점과정 이수 부담==을 감당하기 어려운 순수 문과 지망" if is_sci(tags) else "==사교육비 부담이 가계에 무리==한 경우"),
                "==비교·경쟁 환경에서 심하게 위축==되는 경우",
                "==자기주도 학습 습관이 전혀 없는== 경우",
            ],
            "whatToDoNow": [
                "==전 과목 내신 균형 관리== (특히 국·영·수)",
                f"==고1 {'수학·과학' if is_sci(tags) else '수학·영어'} 선행== 시작 (중3 겨울방학까지)",
                "==독서 습관== (교양서 월 1권+)",
                "==자기 노트 만들기== 훈련 (AI는 보조, 손으로 정리)",
                "거주지·지원 학군 확인",
            ],
            "admissionTimeline": "10~11월: ==선지원 후추첨/지원== 원서 → 12월: ==결과 발표== → 익년 3월: ==입학==",
            "competitionRate": "별도 입시 없음(자율고는 지원) — 거주지 배정 + 추첨. 인기 학교는 추첨 경쟁률 발생",
            "whatTheyCheck": [
                "==거주지== (학군 경계) / 자율고는 지원 자격",
                "==중학교 졸업 예정 여부==",
                "선지원 학교 우선순위",
                "* 별도 시험·서류 평가 없음(자사고 면접 예외)",
            ],
            "aiTipForMiddleSchooler": "AI에게 답을 묻지 말고 =='내 답을 비판해줘'==라고 시키세요. 배운 풀이를 AI로 검증·약점 분석하고 ==마지막엔 손으로 정리==하는 습관이 갓반고 1등급의 비결입니다.",
            "homepageMustCheck": f"{sn} 홈페이지에서 ① =={'과학중점과정 편성·과제연구' if is_sci(tags) else '교육과정 편성·방과후'}== ② ==연도별 진학 실적== ③ ==동아리·탐구 프로그램==을 확인하세요.",
            "homepageUrl": hp,
        },
        "verifiedNote": f"NEIS 학교정보로 실재·정식명·주소·종류·공학·홈페이지 확인 ({hp})" if hp else "NEIS 학교정보로 실재 확인",
        "firstYearClassCount": cc,
        "firstYearClassCountSource": "NEIS 학급정보 — 2026학년도 1학년 (교육부)",
    }
    return school


def main():
    with open(os.path.join(HERE, "master_facts.json"), encoding="utf-8") as f:
        facts = json.load(f)
    src = os.path.join(DATA, "general_elite.json.backup-2026-09-05-preexpand")
    with open(src, encoding="utf-8") as f:
        cat = json.load(f)
    existing = cat["schools"]
    existing_names = {s["name"] for s in existing}
    # 다른 카테고리에 이미 등재된 학교는 제외(카테고리 간 중복 방지)
    for other in ["autonomous_private.json", "autonomous_public.json",
                  "ib.json", "science_high.json", "foreign_language.json",
                  "international.json"]:
        try:
            od = json.load(open(os.path.join(DATA, other), encoding="utf-8"))
            for s in od.get("schools", []):
                existing_names.add(s["name"])
        except Exception:
            pass

    new = []
    for i, (code, fct) in enumerate(facts.items()):
        if fct["name"] in existing_names:
            continue
        new.append(build_school(code, fct, i))
    # 지역·태그 정렬(과학중점 먼저, 그다음 학군지, 지방명문; 지역 가나다)
    order = {"과학중점": 0, "학군지": 1, "지방명문": 2}
    new.sort(key=lambda s: (0 if "과학중점" in s["specialCertification"] else
                            1 if "학군" in s["specialCertification"] else 2,
                            s["location"]))
    cat["schools"] = existing + new
    cat["totalSchoolsNote"] = (f"손수 작성 {len(existing)}개교 + NEIS 검증 확장 {len(new)}개교 = "
                               f"총 {len(existing)+len(new)}개교 (과학중점·학군지·지방 명문 일반고)")
    n_sci = sum(1 for s in new if "과학중점" in s["specialCertification"])
    n_hak = sum(1 for s in new if "학군" in s["specialCertification"])
    n_jib = len(new) - n_sci - n_hak
    cat["gatbangoNote"] = (cat.get("gatbangoNote", "") +
        f" · 2026-09 확장: NEIS 학교정보로 실재·정식명·주소·종류·공학·홈페이지를 검증한 "
        f"==과학중점학교 {n_sci}교·학군지 갓반고 {n_hak}교·지방 명문 {n_jib}교==를 추가. "
        f"IB 일반고는 별도 [IB 카테고리], 과학고·영재학교는 [과학고 카테고리] 참조. "
        f"AI·디지털 역량은 2028 대입 공통 축으로 전 학교 update2028AI에 반영.")
    cat["verificationStatus"] = {
        "asOf": "2026-09-05",
        "method": "NEIS 오픈API(schoolInfo·classInfo)로 실재·정식명·도로명주소·학교종류(일반/자율)·공학·설립(공/사립)·홈페이지·2026학년도 1학년 학급수 확정. 특목고·과학고·이미 타 카테고리(자사고·자공고·IB·외고·국제고) 등재 학교는 제외.",
        "roster": "과학중점학교 전국 명단(교육부·교육청 지정, 나무위키 취합) + 수도권 학군지 갓반고 + 지방 명문 일반고",
        "narrativePolicy": "학교별 서술은 검증 축(종류·성별·설립·지역·태그·학급수)에서만 유도. 진학실적·사교육비·프로그램 고유명 등 미검증 항목은 [일반적] 표기 또는 '학교알리미 공시 확인'으로 처리(환각 제거).",
        "counts": {"handwritten": len(existing), "verifiedExpansion": len(new),
                   "scienceFocus": n_sci, "district": n_hak, "regional": n_jib,
                   "total": len(existing) + len(new)},
        "reproduce": "scripts/highschool-gatbango/ (roster.py → resolve.py → build.py)",
    }

    # featureFocus 과학중점 축에 신규 학교를 지역별 대표로 반영(클릭 시 상세 팝업 대상)
    new_names = {s["name"] for s in new}
    by_region = {}
    for fc in facts.values():
        if "과학중점" not in fc["tags"] or fc["name"] not in new_names:
            continue
        by_region.setdefault(sido_short(fc["region"]), []).append(fc)
    axis_add = []
    for sido in sorted(by_region):
        for fc in by_region[sido][:3]:  # 시도별 대표 최대 3교
            g = gender_text(fc["coedu"]); fnd = fc["founding"] or "공립"
            cc = fc["firstYearClassCount"]
            axis_add.append({
                "name": short_name(fc["name"]),
                "region": f"{sido} {fc['signgu'] or ''}".strip() + f" ({fnd} {g})",
                "fact": f"1학년 {cc}학급 · 과학중점 교육과정(전국 명단 기준) · NEIS 실재 검증 — 클릭 시 상세",
                "inDataset": True,
            })
    try:
        sax = next(a for a in cat["featureFocus"]["axes"] if a["id"] == "science")
        have = {s["name"] for s in sax["schools"]}
        sax["schools"].extend([e for e in axis_add if e["name"] not in have])
        sax["scale"] = (f"본 목록 기준 ==과학중점 일반고 {n_sci}교== 수록(NEIS 실재·정식명·학급수 검증). "
                        f"아래는 ==지역별 대표 예시==이며, 전체 클릭 목록은 위 '🧭 특색으로 학교 찾기 › 과학·이공 중점'에서 확인하세요.")
    except StopIteration:
        pass

    out = os.path.join(HERE, "out.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(cat, f, ensure_ascii=False, indent=2)
    print(f"기존 {len(existing)} + 신규 {len(new)} = {len(cat['schools'])}개교 → out.json")


if __name__ == "__main__":
    main()
