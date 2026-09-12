# -*- coding: utf-8 -*-
"""master_facts.json (+features.json) + manual.py → frontend/data/high-school/alternative.json

원칙 (갓반고·자사고 생성기와 동일)
 - 학교 서술은 검증 축(NEIS: 정식명·시도·주소·학교종류·설립·공학·개교일·홈페이지·2026 1학년 학급수)과
   출처 URL이 있는 특색(features.json)에서만 유도한다.
 - 모집 인원·경쟁률·진학 실적·학비 금액은 출처가 없으면 쓰지 않는다. 일반론은 [일반적] 표기.
 - 멱등: 항상 master_facts.json 에서 새로 만든다.
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from category import build_category, MOE_PDF, GOE_PDF, ALTER_EDU, NCS_URL, GGU_URL, ODY_URL  # noqa: E402
from manual import next_challenge_school, ggukkuro_campus, ODYSSEY_OVERRIDE  # noqa: E402

OUT = os.path.join(HERE, "..", "..", "frontend", "data", "high-school", "alternative.json")
PALETTE = ["#a3e635", "#84cc16", "#4ade80", "#2dd4bf", "#38bdf8", "#facc15", "#fb923c", "#f472b6", "#c084fc"]

SIDO = {
    "서울특별시": "서울", "부산광역시": "부산", "대구광역시": "대구", "인천광역시": "인천",
    "대전광역시": "대전", "울산광역시": "울산", "세종특별자치시": "세종", "경기도": "경기",
    "강원특별자치도": "강원", "충청북도": "충북", "충청남도": "충남", "전북특별자치도": "전북",
    "경상북도": "경북", "경상남도": "경남", "제주특별자치도": "제주",
    "전남광주통합특별시(광주)": "광주", "전남광주통합특별시(전남)": "전남",
}
ZONE = {"서울": "수도권", "인천": "수도권", "경기": "수도권", "강원": "강원·충청", "충북": "강원·충청",
        "충남": "강원·충청", "대전": "강원·충청", "세종": "강원·충청", "전북": "호남", "전남": "호남",
        "광주": "호남", "대구": "영남", "경북": "영남", "경남": "영남", "부산": "영남", "울산": "영남"}

THEMES = {
    "arts": ("🎭", "예술·미디어 특화"),
    "restart": ("🤝", "다문화·북한이탈·재도전 지원"),
    "global": ("🌏", "글로벌·국제형"),
    "community": ("🌱", "공동체·생태·진로"),
}


def short_name(name):
    n = re.sub(r"\((고|중)\)$", "", name)
    return n.replace("고등학교", "고").replace("중고등학교", "중고")


def load_features():
    p = os.path.join(HERE, "features.json")
    if not os.path.exists(p):
        return {}
    raw = json.load(open(p, encoding="utf-8"))
    return raw


def feature_for(features, f):
    """features.json 키는 약칭(예: '달구벌고')이라 NEIS 정식명과 느슨하게 매칭."""
    name = f["name"]
    sn = short_name(name)
    cands = [sn, name, f.get("query", ""), sn.replace("학교", ""), name.replace("(고)", "")]
    norm = {k.replace(" ", ""): v for k, v in features.items()}
    for k in cands:
        if k and k.replace(" ", "") in norm:
            return norm[k.replace(" ", "")]
    return {}


def theme_of(name, feat_text):
    """교명(검증값) 또는 출처 있는 특색 문장으로만 분류."""
    f = feat_text or ""
    if re.search(r"연극|영화|음악|예술", name) or re.search(r"연극|영화|음악예술|실용음악|예술중점|음악중점|문화예술|음악 연주|뮤지컬", f):
        return "arts"
    if re.search(r"북한이탈|탈북|다문화|중도입국|학업\s*곤란|부적응|위기|위탁형|치유", f):
        return "restart"
    if re.search(r"글로벌|국제|영어", f):
        return "global"
    return "community"


def legal_of(f):
    if f["kind"] == "고등학교":
        return "special"
    return "public" if f["founding"] == "공립" else "private"


LEGAL_LABEL = {
    "special": "대안교육 특성화고",
    "public": "공립 대안학교(각종학교)",
    "private": "사립 대안학교(각종학교)",
}


def jo(word, with_final, without_final):
    """한글 조사: 받침 있으면 with_final, 없으면 without_final."""
    ch = word.strip()[-1:] if word else ""
    if ch and "가" <= ch <= "힣":
        return with_final if (ord(ch) - 0xAC00) % 28 else without_final
    return without_final


def fy(date):
    return f"{date[:4]}년" if date and len(date) >= 4 else ""


def build_school(code, f, feat, idx):
    name = f["name"]
    sn = short_name(name)
    sido = SIDO.get(f["region"], f["region"])
    signgu = f.get("signgu") or ""
    loc = f"{f['region'].split('(')[0]} {signgu}".strip()
    legal = legal_of(f)
    public = f["founding"] == "공립"
    found = f["founding"] or ""
    coedu = {"남": "남학교", "여": "여학교", "남여공학": "남녀공학"}.get(f.get("coedu"), "남녀공학")
    cc = f.get("firstYearClassCount")
    hp = f.get("homepage") or ""
    year = fy(f.get("foundDate"))
    color = PALETTE[idx % len(PALETTE)]

    feature = (feat or {}).get("feature")
    boarding = (feat or {}).get("boarding")
    quota = (feat or {}).get("quota")
    method = (feat or {}).get("admissionMethod")
    tnote = (feat or {}).get("tuitionNote")
    src_url = (feat or {}).get("sourceUrl")
    src_label = (feat or {}).get("sourceLabel")
    theme = theme_of(name, feature or "")
    temoji, tlabel = THEMES[theme]

    legal_label = LEGAL_LABEL[legal]
    type_label = f"{legal_label.replace('(각종학교)', '')} · {found}" + (" · 각종학교" if legal != "special" else "")
    moe_fact = ("교육부 대안교육 특성화고 현황(2024.03) 수록" if legal == "special"
                else "교육부 대안학교(각종학교) 현황(2024.03) 수록")
    if f["name"] in ("옥길새길고등학교", "결마루미래학교"):
        moe_fact = f"{year} 개교 신설교 (NEIS)"

    legal_full = legal_label if legal != "special" else f"{found} {legal_label}"
    cert = f"=={legal_full}== ({moe_fact})"
    if feature:
        cert += f" — {feature}"

    if public:
        tuition = "==공립 — 고교 무상교육 대상(수업료 면제)==. 기숙사비·급식비 등 실비는 학교 안내 확인."
    elif legal == "special":
        tuition = "사립 대안교육 특성화고 — 수업료·공동체 운영비·기숙사비 구조는 ==학교 입학요강·학교알리미 교육비 공시==로 확인하세요."
    else:
        tuition = "사립 각종학교 — 학교가 정하는 수업료·기숙사비가 있을 수 있어요. ==입학요강·학교알리미 교육비 공시==로 확인하세요."
    if tnote:
        tuition += f" (학교 안내: {tnote})"

    dorm = boarding in ("기숙형", "혼합형")
    dorm_text = {"기숙형": "기숙형 (전원 기숙)", "혼합형": "혼합형 (기숙·통학 병행)", "통학형": "통학형"}.get(boarding, "기숙 여부는 학교 홈페이지 확인")

    if legal == "special":
        adm = [
            {"step": 1, "title": "모집 요강 확인", "icon": "📋",
             "detail": f"대안교육 특성화고는 대부분 ==전기 모집==이에요. {sido} 고입 기본계획과 학교 입학요강에서 모집 단위(광역·전국)와 일정을 확인하세요."},
            {"step": 2, "title": "서류 · 면접", "icon": "🎤",
             "detail": (method if method else "자기소개서 등 서류와 면접이 일반적이에요. 학교에 따라 캠프·학부모 면접이 있어요 [학교 요강 확인].")},
            {"step": 3, "title": "합격 · 등록", "icon": "✅", "detail": "전기고 합격 시 후기 일반고 지원이 제한돼요. 일정은 매년 학교 공지 확인."},
        ]
    elif feature and "위탁형" in feature:
        adm = [
            {"step": 1, "title": "재적 학교 상담", "icon": "🗣️",
             "detail": "==입학형이 아닌 위탁형==이에요. 다니던 학교에 학적을 둔 채 상담·추천을 거쳐 위탁 교육을 받아요."},
            {"step": 2, "title": "위탁 교육", "icon": "🤝", "detail": "기간·대상은 교육청·학교 안내 확인."},
            {"step": 3, "title": "원적교 복귀·졸업", "icon": "✅", "detail": "학력은 재적 학교에서 인정돼요 (교육부 구분표: 대안교육 위탁교육기관)."},
        ]
    elif theme == "restart":
        adm = [
            {"step": 1, "title": "대상 확인", "icon": "📋",
             "detail": "학교가 정한 지원 대상(학업 중단 위기·전환 교육 대상 등)에 해당하는지 먼저 확인하세요 [학교 요강 확인]."},
            {"step": 2, "title": "상담 · 지원", "icon": "🗣️",
             "detail": (method if method else "재학 중인 학교·교육청 상담을 거쳐 지원하는 경우가 많아요. 전형 방법은 학교 공지 확인.")},
            {"step": 3, "title": "입학 · 적응", "icon": "✅", "detail": "소규모 학급에서 개별 맞춤 지원을 받아요 [일반적]."},
        ]
    else:
        adm = [
            {"step": 1, "title": "모집 요강 확인", "icon": "📋",
             "detail": f"각종학교는 학교가 자체 요강으로 뽑아요. {sn} 홈페이지 입학 공지에서 일정·대상을 확인하세요."},
            {"step": 2, "title": "서류 · 면접 · 실기", "icon": "🎤",
             "detail": (method if method else ("전공 실기·오디션이 포함될 수 있어요 [학교 요강 확인]." if theme == "arts"
                                              else "서류·면접이 일반적이에요 [학교 요강 확인]."))},
            {"step": 3, "title": "합격 · 등록", "icon": "✅", "detail": "등록금·기숙사비 납부 여부를 함께 확인하세요."},
        ]

    consign = bool(feature and "위탁형" in feature)
    edu_line = ("==위탁형==이라 학력은 ==다니던 학교(재적교)에서 인정==돼요 (교육부 구분표: 대안교육 위탁교육기관)." if consign
                else f"=={legal_label}==라 졸업하면 ==고등학교 졸업 학력이 인정==돼요. 등록 대안교육기관과 다른 점이에요.")
    listtags = [f"{temoji} {tlabel}", ("📜 재적교 학력 인정" if consign else "📜 학력 인정"), ("🏫 공립 무상" if public else "🏛️ 사립")]
    if boarding:
        listtags.append(f"🏠 {boarding}")

    theme_word = {"arts": "전공 실기·공연·작품", "restart": "개별 맞춤 지원·회복", "global": "외국어·국제 교류",
                  "community": "공동체·프로젝트·노작"}[theme]
    theme_route = {"arts": "예술대 실기·포트폴리오 전형", "restart": "진로 맞춤 진학·취업",
                   "global": "국내 학종·해외 대학", "community": "학생부종합전형(프로젝트 세특)"}[theme]

    desc = (f"{sn}{jo(sn, "은", "는")} {loc}의 =={legal_full}=={f'로 {year} 개교했어요' if year else '예요'}. "
            + ("==위탁형 교육기관==으로 학력은 재적교에서 인정되고, " if consign else "==고등학교 졸업 학력이 인정==되는 학교이고, ")
            + "" 
            + (f"학교 특색: {feature}. " if feature else f"{theme_word} 중심 교육을 하는 {tlabel} 성격의 학교예요 [일반적]. ")
            + f"(NEIS 학교정보{' · ' + src_label if feature and src_label else ''} 기준)")

    stat_value = f"{cc}학급" if cc else "공시 확인"
    hs = [
        {"label": "법적 지위", "value": "특성화고" if legal == "special" else "각종학교", "emoji": "📜", "color": color},
        {"label": "설립", "value": f"{found} {year}".strip(), "emoji": "🏫", "color": "#a78bfa"},
        {"label": "1학년", "value": stat_value, "emoji": "👥", "color": "#38bdf8"},
        {"label": "생활", "value": boarding or "홈페이지 확인", "emoji": "🏠", "color": "#f59e0b"},
    ]

    realtalk = [
        {"emoji": "📜", "title": "학력은?", "content": f"{sn}{jo(sn, "은", "는")} " + edu_line},
        {"emoji": temoji, "title": f"{sn}의 색깔",
         "content": (f"{feature} ({src_label or '출처 확인'})" if feature else f"{tlabel} 성격의 학교예요. 구체적인 교육과정은 ==학교 홈페이지 교육과정 편성표==로 확인하세요.")},
        {"emoji": "👥", "title": "학교 규모",
         "content": (f"2026학년도 1학년이 =={cc}학급==이에요(NEIS). 소규모라 교사와 가깝지만, 내신 1등급 인원도 적어요." if cc
                     else "소규모 학교예요. 학급 수는 학교알리미 공시로 확인하세요.")},
        {"emoji": "💰", "title": "비용", "content": tuition},
        {"emoji": "🏠", "title": "생활", "content": (f"=={dorm_text}==로 운영돼요 ({src_label})." if boarding and src_label
                                                   else "기숙 여부와 비용은 학교 홈페이지에서 확인하세요.")},
        {"emoji": "🎓", "title": "졸업 후", "content": f"[일반적] {theme_route} 중심. 졸업생 진로는 ==학교알리미 졸업생 진로 현황==으로 확인하세요."},
    ]

    note = (feat or {}).get("note") or ""
    m = re.match(r"\[(변동|명칭 확인|전환)\]\s*(.+)", note)
    if m:
        realtalk.insert(0, {"emoji": "📢", "title": "최근 변동 사항", "content": f"{m.group(2)} — 지원 전 학교에 꼭 확인하세요."})

    school = {
        "id": f"alt_{code}",
        "name": name.replace("(고)", ""),
        "shortName": sn,
        "location": loc,
        "type": type_label,
        "legalStatus": legal,
        "emoji": temoji,
        "color": color,
        "difficulty": 2,
        "annualAdmission": None,
        "annualAdmissionNote": (f"학교 안내: {quota}" if quota else "학교 입학요강·학교알리미 공시 확인"),
        "tuition": tuition,
        "dormitory": dorm,
        "ibCertified": False,
        "specialCertification": cert,
        "operatorFact": f"{found} ({coedu}). 개교 {f.get('foundDate') or '-'} (NEIS).",
        "teachingMethod": (f"{feature} — 세부 교육과정은 학교 홈페이지 확인." if feature
                           else f"[일반적] 교과 수업 + {theme_word} 중심의 대안교육 과정. 세부 편성은 학교 홈페이지 확인."),
        "famousPrograms": ([feature] if feature else []) + [
            f"[일반적] {theme_word} 중심 대안교육 과정",
            "[일반적] 소규모 학급·담임 밀착 지도",
            "세부 프로그램은 학교 홈페이지 교육과정 확인",
        ],
        "famousProgramDetails": [
            {"name": tlabel, "emoji": temoji,
             "description": (f"{feature} ({src_label})" if feature else f"[일반적] {theme_word} 중심 교육 — 세부 운영은 학교 확인"),
             "benefit": f"=={theme_route}==과 연결되는 경험"},
            {"name": "소규모 공동체", "emoji": "👥",
             "description": (f"2026학년도 1학년 {cc}학급 (NEIS)" if cc else "소규모 학급 (학교알리미 확인)"),
             "benefit": "교사와 ==1:1에 가까운 소통=="},
        ],
        "studentLevel": "[일반적] 성적보다 학교 철학과의 적합성을 보고 선발하는 경우가 많아요.",
        "admissionProcess": adm,
        "careerPath": {"middle1": "관심 분야 탐색 + 기록 습관", "middle2": "프로젝트·체험 경험",
                       "middle3": "설명회·요강 확인 → 서류·면접 준비"},
        "careerPathDetails": [
            {"grade": "중학교 1~2학년", "icon": "🌱",
             "tasks": ["학교 설명회·캠프 참가해 보기", "관심 분야 프로젝트 1개 완주", "교과 기본기(국·영·수) 놓지 않기"],
             "keyPoint": "대안학교도 ==학력 인정교는 내신이 대입에 쓰여요==. 기본기를 유지하세요."},
            {"grade": "중학교 3학년", "icon": "🌳",
             "tasks": [f"{sn} 입학요강·모집 시기 확인", "'왜 이 학교인가' 자기소개서", "기숙사비·연간 비용 가족 확인"],
             "keyPoint": ("대안교육 특성화고는 ==전기 모집==이 많아 다른 전기고와 동시 지원이 제한돼요." if legal == "special"
                          else "각종학교는 ==학교마다 요강이 달라요==. 공지를 놓치지 마세요.")},
        ],
        "highlightStats": hs,
        "realTalk": realtalk,
        "survivalTips": [
            {"emoji": "🗂️", "tip": "프로젝트·활동을 학기마다 ==포트폴리오==로 정리하세요. 학종 세특의 재료가 돼요."},
            {"emoji": "📊", "tip": "수능이 필요하면 ==별도 공부 루틴==을 만드세요. 대안학교는 수능 대비 수업이 적어요 [일반적]."},
            {"emoji": "🤝", "tip": "소규모 공동체에서는 ==갈등을 대화로 푸는 힘==이 가장 큰 자산이에요."},
        ],
        "competitionLevel": "학교 입학요강·공시 확인 (경쟁률 공개 학교 한정)",
        "socialLife": ("기숙 공동체 생활" if dorm else "통학 중심") + " — 소규모라 선후배·교사 관계가 가까워요 [일반적]",
        "mentalHealthNote": "정해진 경쟁이 적은 대신 ==스스로 방향을 잡는 힘==이 필요해요. 진로 고민은 담임·진로교사와 자주 나누세요.",
        "pros": [
            ("재적교 학적 유지 (위탁형)" if consign else "==고졸 학력 인정=="),
            ("==공립 무상교육==" if public else "학교 고유의 교육 철학"),
            f"{temoji} {tlabel}",
            (f"1학년 {cc}학급 소규모 (NEIS 2026)" if cc else "소규모 학급"),
        ] + ([f"{dorm_text}"] if boarding else []),
        "cons": [
            "소규모라 ==내신 1등급 인원이 적음==",
            "수능 대비는 스스로 준비 [일반적]",
            ("비용 구조 확인 필요" if not public else "지원 대상·모집 단위 확인 필요"),
        ],
        "admissionTip": (f"{sn}{jo(sn, "은", "는")} 성적보다 ==학교 철학과 내 목표가 맞는지==를 봐요. 설명회에 가서 재학생 이야기를 듣고, "
                         f"자기소개서에 '왜 이 학교인가'를 구체적으로 쓰세요."),
        "targetUniversities": [f"[일반적] {theme_route}", "* 졸업생 진학 실적은 학교알리미 공시 확인"],
        "alumniCareers": ["* 학교알리미 졸업생 진로 현황 확인"],
        "faq": [
            {"category": "학력", "question": f"{sn}{jo(sn, "을", "를")} 졸업하면 고졸 학력이 인정되나요?",
             "answer": ("위탁형이라 학력은 재적 학교에서 인정돼요 (교육부 구분표)." if consign else f"==네==. {sn}{jo(sn, "은", "는")} {legal_label}라 학력이 인정돼요 (교육부 구분표).")},
            {"category": "입시", "question": "어떻게 지원하나요?",
             "answer": ("대안교육 특성화고는 대부분 전기 모집이에요. 학교 입학요강과 시·도 고입 기본계획을 함께 확인하세요." if legal == "special"
                        else "각종학교는 학교 자체 요강으로 뽑아요. 학교 홈페이지 입학 공지를 확인하세요.")},
            {"category": "비용", "question": "학비가 있나요?", "answer": tuition},
        ],
        "websiteUrl": hp,
        "description": desc,
        "schoolInfoCard": {
            "regionScope": f"{loc} 소재 — 모집 단위는 학교 요강 확인",
            "capacity": (f"1학년 {cc}학급 (NEIS 2026학년도 학급정보)" if cc else "학교알리미 공시 확인"),
            "genderRatio": f"{coedu} ({found})",
            "dormitoryType": dorm_text,
            "costPerYear": ("수업료 면제 (고교 무상교육) · 실비 별도" if public else "학교 입학요강·학교알리미 교육비 공시 확인"),
            "scholarship": "교육청·학교 장학 (학교 문의)",
            "lowIncomeAdvice": "공립 대안학교는 수업료가 없어요. 사립은 감면·장학 제도를 입학 상담에서 꼭 물어보세요.",
        },
        "admissionQualifications": {
            "mandatory": ["중학교 졸업(예정)자 또는 동등 학력", "학교 요강의 지원 자격 충족"],
            "recommended": ["학교 철학에 대한 이해", "프로젝트·활동 기록"],
            "interviewFormat": method or "학교 요강 확인",
            "competitionRate": "학교 공시 확인",
            "aiTip": "AI로 자기소개서를 대신 쓰지 말고, ==내 경험을 정리하는 질문 도우미==로 쓰세요.",
        },
        "studyStyleDetail": f"교과 수업에 {theme_word} 활동이 더해져요. 결과물·발표·성찰 기록이 평가에서 큰 비중을 차지해요 [일반적].",
        "update2028AI": {
            "policy2028": "학력 인정교라 ==학생부종합전형==을 쓸 수 있어요. 2028 세특·면접 확대는 프로젝트 경험에 유리하지만, 소규모 내신과 수능 대비는 스스로 챙겨야 해요.",
            "aiEra": "AI가 지식 전달을 대신할수록 ==공동체 경험·문제 해결·자기 기록==이 차별점이 돼요.",
            "cautionPoints": ["프로젝트를 ==결과물·기록==으로 남기기", "수능이 필요하면 ==고2부터 별도 계획==", "소규모 내신 리스크 인지"],
        },
        "middleSchoolGuide": {
            "oneLineAbout": f"{loc}의 {legal_full}예요. " + ("위탁형이라 학적은 다니던 학교에 두고, " if consign else "학력이 인정되고, ") + f"{tlabel} 성격이 있어요.",
            "goodFor": ["시험보다 ==프로젝트·경험==으로 배우고 싶은 친구", f"=={tlabel}== 분야에 관심 있는 친구", "소규모 공동체가 편한 친구"],
            "notForYouIf": ["==의약학·정시 최상위==가 1순위인 경우", "정해진 진도와 시험이 더 편한 경우"],
            "whatToDoNow": ["학교 설명회 참가", "관심 분야 프로젝트 1개 완주", "가족과 기숙·비용 확인"],
            "admissionTimeline": ("전기 모집(대개 10~12월) — 학교 요강 확인" if legal == "special" else "학교 자체 모집 일정 — 홈페이지 공지 확인"),
            "competitionRate": "학교 공시 확인",
            "whatTheyCheck": ["지원 동기와 학교 철학의 적합성", "자기소개서·면접", "학교별 추가 전형(캠프·실기 등)"],
            "aiTipForMiddleSchooler": "AI에게 '내가 이 학교에 맞는 이유를 반박해 줘'라고 시켜 보세요. 면접 준비가 돼요.",
            "homepageMustCheck": f"{sn} 홈페이지에서 ① 입학요강 ② 교육과정 편성 ③ 기숙·비용 안내를 확인하세요.",
            "homepageUrl": hp,
        },
        "listTags": listtags,
        "theme": theme,
        "verifiedNote": f"NEIS 학교기본정보로 실재·주소·설립·학교종류·홈페이지 확인 ({hp})",
        "firstYearClassCount": cc,
        "firstYearClassCountSource": "NEIS 학급정보 — 2026학년도 1학년",
        "factCheck": {
            "verificationStatus": "verified" if feature else "partial",
            "lastFactCheckedAt": "2026-09-12",
            "sources": ([{"label": src_label or "특색 출처", "url": src_url, "accessedAt": "2026-09-12"}] if src_url else [])
                       + [{"label": "교육부 대안학교·대안교육 특성화학교 현황 (2024.03)", "url": MOE_PDF, "accessedAt": "2026-09-12"}],
            "factCheckerNote": "NEIS 기본정보·학급정보와 교육부 현황표로 실재·유형 확인." + ("" if feature else " 학교별 특색은 공식 출처 미확인이라 일반 서술."),
        },
    }
    return school


def region_of(s):
    return s["location"].split()[0] if s.get("location") else ""


def build_group_tree(schools):
    legal_groups = [
        ("registered", "🧪", "등록 대안교육기관 (학력 미인정)", "교육청 등록 기관 — 고졸 학력은 검정고시로 취득"),
        ("transition", "⛵", "1년 전환학년 (공립)", "고1 1년을 보내고 원적교로 복귀"),
        ("special", "🌱", "대안교육 특성화고 (학력 인정)", "정규 고등학교 — 대부분 전기 모집"),
        ("public", "🏫", "공립 대안학교 · 각종학교 (학력 인정)", "수업료 무상 — 예술 특화·재도전 지원형 다수"),
        ("private", "🏛️", "사립 대안학교 · 각종학교 (학력 인정)", "학교별 수업료 — 글로벌·예술·종교계 등 다양"),
    ]
    ax1 = {"id": "legal", "emoji": "📜", "label": "법적 지위로 가르기",
           "description": "학력 인정 여부와 비용이 여기서 결정돼요.", "groups": []}
    for key, em, label, note in legal_groups:
        items = [s for s in schools if s.get("legalStatus") == key]
        if items:
            ax1["groups"].append({"label": f"{label} · {len(items)}곳", "emoji": em, "note": note,
                                  "schools": [{"name": s["shortName"], "region": SIDO_SHORT(s), "tag": s["type"].split("·")[-1].strip()} for s in items]})
    ax2 = {"id": "zone", "emoji": "🗺️", "label": "권역으로 가르기",
           "description": "기숙형이 많아 먼 지역도 지원할 수 있지만, 통학형은 거리를 먼저 보세요.", "groups": []}
    for z, em in (("수도권", "🏙️"), ("강원·충청", "⛰️"), ("호남", "🌾"), ("영남", "🌊")):
        items = [s for s in schools if ZONE.get(SIDO_SHORT(s)) == z]
        if items:
            ax2["groups"].append({"label": f"{z} · {len(items)}곳", "emoji": em,
                                  "schools": [{"name": s["shortName"], "region": SIDO_SHORT(s)} for s in items]})
    ax3 = {"id": "theme", "emoji": "🎨", "label": "특화 분야로 가르기",
           "description": "공식 출처로 확인된 특색 기준. 미확인 학교는 '공동체·생태·진로'로 묶었어요.", "groups": []}
    for key, (em, label) in THEMES.items():
        items = [s for s in schools if s.get("theme") == key]
        if items:
            ax3["groups"].append({"label": f"{label} · {len(items)}곳", "emoji": em,
                                  "schools": [{"name": s["shortName"], "region": SIDO_SHORT(s)} for s in items]})
    return {
        "coreSentence": "==학력 인정 여부 → 권역(기숙/통학) → 특화 분야== 순서로 좁히면 나에게 맞는 대안학교가 보여요.",
        "scopeNote": "NEIS 교육행정정보시스템에서 실재·고등과정이 확인되고 공식 홈페이지가 열리는 학교만 수록했어요 (2026-09-12).",
        "axes": [ax1, ax2, ax3],
        "pickGuide": [
            "① 고졸 학력이 자동으로 필요하면 ==특성화고·각종학교==, 검정고시를 감수하면 ==등록 대안교육기관==까지",
            "② 집에서 멀면 ==기숙형== 학교인지 확인",
            "③ 공립(무상)인지 사립(학비)인지 확인",
            "④ 설명회·캠프에서 재학생 이야기를 직접 듣기",
        ],
        "nationalStatus": {
            "asOf": "2024.03 (교육부)",
            "total": "대안교육 특성화고 25교 · 대안학교(각종학교) 52교",
            "headline": "대안교육 특성화고는 전국 25교(공립 5 · 사립 20)예요.",
            "rows": [
                {"sido": "경기", "count": 4, "detail": "두레자연·경기대명·이우·한겨레"},
                {"sido": "전북", "count": 4, "detail": "세인·푸른꿈·지평선·고산"},
                {"sido": "경남", "count": 4, "detail": "간디·합천평화·지리산·태봉"},
                {"sido": "강원", "count": 3, "detail": "전인·팔렬·현천"},
                {"sido": "전남", "count": 3, "detail": "영산성지·한빛·한울"},
                {"sido": "충남", "count": 2, "detail": "한마음·공동체비전 (NEIS 미수록)"},
                {"sido": "대구", "count": 1, "detail": "달구벌"},
                {"sido": "인천", "count": 1, "detail": "산마을"},
                {"sido": "광주", "count": 1, "detail": "동명"},
                {"sido": "충북", "count": 1, "detail": "양업"},
                {"sido": "경북", "count": 1, "detail": "경주화랑"},
            ],
            "note": "2025년 내손고(의왕)·2026년 옥길새길고(부천)가 공립 대안교육 특성화고로 새로 개교했어요 (NEIS 개교일). 충남 2교는 NEIS 미수록이라 상세 카드에서 제외했어요.",
        },
    }


def SIDO_SHORT(s):
    return SIDO.get(s.get("_region", ""), s.get("_sido", "")) or s.get("_sido", "")


def build_feature_focus(schools):
    def pick(theme=None, legal=None, not_legal=None, limit=60):
        out = []
        for s in schools:
            if theme and s.get("theme") != theme:
                continue
            if legal and s.get("legalStatus") != legal:
                continue
            if not_legal and s.get("legalStatus") in not_legal:
                continue
            fact = s.get("_fact") or s["specialCertification"].replace("==", "")
            out.append({"name": s["shortName"], "region": SIDO_SHORT(s), "fact": fact[:120], "inDataset": True})
        return out[:limit]

    axes = [
        {"id": "future", "emoji": "🚀", "label": "AI·창업 혁신형 (등록 대안교육기관)",
         "what": "창업·AI·질문 중심 프로젝트를 정규 수업으로 운영하는 도시형 기관. 넥스트챌린지스쿨이 대표 사례예요.",
         "howToEnter": "설명회·상담 → 지원서·자기소개서 → 선발 캠프(넥스트챌린지스쿨). 고입 전형과 별개로 연중 모집해요.",
         "admissionNote": "==학력 미인정== — 국내 대학은 검정고시 후 정시·검정고시 전형, 또는 해외 대학 경로.",
         "scale": "서울 2곳 수록",
         "schools": pick(legal="registered"),
         "sources": [{"label": "넥스트챌린지스쿨 입학 안내", "url": NCS_URL},
                     {"label": "거꾸로캠퍼스 공식 홈페이지", "url": GGU_URL},
                     {"label": "대안교육기관 정보 — 넥스트챌린지스쿨", "url": ALTER_EDU}]},
        {"id": "transition", "emoji": "⛵", "label": "1년 전환학년",
         "what": "고1 1년을 성찰·체험으로 보내고 원적교로 복귀하는 과정.",
         "howToEnter": "서울 일반고 진학 예정 중3이 자기소개서·면접으로 지원.",
         "admissionNote": "복귀 후 일반 대입 경로 그대로 — 전환학년 경험을 학종 소재로 활용.",
         "schools": pick(legal="transition"),
         "sources": [{"label": "오디세이학교", "url": ODY_URL}]},
        {"id": "community", "emoji": "🌱", "label": "공동체·생태·진로형 대안교육 특성화고",
         "what": "노작·공동체 생활·체험 중심의 정규 고등학교. 기숙형이 많아요.",
         "howToEnter": "대부분 전기 모집 — 서류·면접(학교별 캠프·학부모 면접).",
         "admissionNote": "학력 인정 → 학종 활용 가능. 소규모 내신·수능 대비는 스스로.",
         "schools": pick(theme="community", legal="special") + [
             {"name": "내손고", "region": "경기", "fact": "2025 개교 공립 대안교육 특성화고(통학형)·IB 후보학교 — 상세는 IB 유형에서 확인", "inDataset": False},
             {"name": "지평선고", "region": "전북", "fact": "사립 대안교육 특성화고·IB DP 월드스쿨 인증(공식 홈페이지) — 상세는 IB 유형에서 확인", "inDataset": False}],
         "sources": [{"label": "교육부 현황 (2024.03)", "url": MOE_PDF}, {"label": "경기도교육청 현황 (2025)", "url": GOE_PDF}]},
        {"id": "community_misc", "emoji": "🏫", "label": "공동체·진로형 대안학교 (각종학교)",
         "what": "교육감 인가를 받은 각종학교 중 공동체·체험·진로 교육을 앞세운 학교. 중·고 통합형이 많아요.",
         "howToEnter": "학교 자체 요강 — 서류·면접이 일반적이에요.",
         "admissionNote": "학력 인정 → 학종 활용 가능. 공립은 무상, 사립은 학비 확인.",
         "schools": pick(theme="community", not_legal=("special",)),
         "sources": [{"label": "교육부 현황 (2024.03)", "url": MOE_PDF}, {"label": "경기도교육청 현황 (2025)", "url": GOE_PDF}]},
        {"id": "arts", "emoji": "🎭", "label": "예술·미디어 특화",
         "what": "연극·영화·음악 등 전공 실기를 정규로 하는 대안학교. 공립은 무상이에요.",
         "howToEnter": "학교 자체 요강 — 실기·면접이 포함될 수 있어요.",
         "admissionNote": "예술대 실기·포트폴리오 전형과 연결.",
         "schools": pick(theme="arts"),
         "sources": [{"label": "교육부 현황 (2024.03)", "url": MOE_PDF}]},
        {"id": "global", "emoji": "🌏", "label": "글로벌·국제형",
         "what": "외국어·국제 교류를 앞세운 각종학교(주로 사립).",
         "howToEnter": "학교 자체 요강 — 서류·면접, 영어 평가가 있을 수 있어요.",
         "admissionNote": "국내 학종과 해외 대학 병행. 비용이 큰 편이니 사전 확인.",
         "schools": pick(theme="global"),
         "sources": [{"label": "교육부 현황 (2024.03)", "url": MOE_PDF}]},
        {"id": "restart", "emoji": "🤝", "label": "다문화·북한이탈·재도전 지원형",
         "what": "학업 중단 위기, 다문화·북한이탈 청소년 등 새 출발이 필요한 학생을 돕는 학교.",
         "howToEnter": "학교가 정한 대상 확인 → 상담·지원.",
         "admissionNote": "진로 맞춤 진학·취업. 소규모 개별 지원이 강점.",
         "schools": pick(theme="restart"),
         "sources": [{"label": "교육부 현황 (2024.03)", "url": MOE_PDF}, {"label": "경기도교육청 현황 (2025)", "url": GOE_PDF}]},
    ]
    axes = [a for a in axes if a["schools"]]
    return {
        "headline": "🧭 대안학교, 무엇으로 갈리나 — 7개 축",
        "asOf": "2026-09-12",
        "intro": "넥스트챌린지스쿨 같은 ==AI·창업형==부터 ==공립 예술 특화==, ==1년 전환학년==까지 성격이 크게 달라요. 학교 이름을 누르면 상세 카드가 열려요.",
        "axes": axes,
        "pickGuide": ["학력 인정이 꼭 필요한가?", "기숙 생활이 가능한가?", "학비를 감당할 수 있는가?", "3년 뒤 대학·일 경로를 그릴 수 있는가?"],
        "verifySources": [{"label": "교육부 대안학교 현황 (2024.03)", "url": MOE_PDF, "what": "전국 명단·학력 인정 구분"},
                          {"label": "대안교육기관 정보", "url": "https://www.alter-edu.re.kr/", "what": "등록 대안교육기관 과정·운영형태"}],
        "verifyNote": "특색은 교육청 자료·학교 홈페이지·보도로 확인된 것만 적었어요.",
    }


def main():
    facts = json.load(open(os.path.join(HERE, "master_facts.json"), encoding="utf-8"))
    features = load_features()
    schools = []

    ncs = next_challenge_school(); ncs["_sido"] = "서울"; ncs["theme"] = "future"
    ggu = ggukkuro_campus(); ggu["_sido"] = "서울"; ggu["theme"] = "future"
    schools += [ncs, ggu]

    order = {"transition": 0, "special": 1, "public": 2, "private": 3}
    items = sorted(facts.items(), key=lambda kv: (order.get(kv[1]["axis"], 9), kv[1]["region"], kv[1]["name"]))
    for idx, (code, f) in enumerate(items):
        feat = feature_for(features, f)
        s = build_school(code, f, feat, idx)
        s["_region"] = f["region"]
        if f["axis"] == "transition":
            s.update(ODYSSEY_OVERRIDE)
            s["theme"] = "transition"
        if feat.get("feature"):
            s["_fact"] = feat["feature"] + (f" ({feat.get('sourceLabel')})" if feat.get("sourceLabel") else "")
        schools.append(s)

    group_tree = build_group_tree(schools)
    feature_focus = build_feature_focus(schools)
    for s in schools:
        for k in [k for k in s if k.startswith("_")]:
            s.pop(k)
    cat = build_category(schools, group_tree, feature_focus)
    with open(OUT, "w", encoding="utf-8") as fp:
        json.dump(cat, fp, ensure_ascii=False, indent=1)
    featured = sum(1 for s in schools if s.get("factCheck", {}).get("verificationStatus") == "verified")
    print(f"wrote {OUT}: {len(schools)} schools, verified-feature {featured}")


if __name__ == "__main__":
    main()
