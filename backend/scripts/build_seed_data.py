#!/usr/bin/env python3
"""
Build backend/data/seed/*.json from frontend sources.
Run from repo root: python backend/scripts/build_seed_data.py
"""
from __future__ import annotations

import json
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FRONT = ROOT / "frontend" / "data"
OUT = ROOT / "backend" / "data" / "seed"

# job-career-routes category id -> kingdom id (JobCategory PK)
ROUTE_CATEGORY_TO_KINGDOM = {
    "engineering-tech": "tech",
    "business-finance": "order",
    "medical-legal": "explore",
    "public-government": "connect",
    "creative-media": "create",
}

# Extra jobs only in frontend jobs.json (flat) — already have kingdomId
FRONT_KINGDOM = None  # use field from each job


def salary_to_str(sr: dict | str | None) -> str:
    if sr is None:
        return ""
    if isinstance(sr, str):
        return sr
    mn = sr.get("min")
    mx = sr.get("max")
    unit = sr.get("unit", "만원/년")
    if mn is not None and mx is not None:
        return f"{mn:,}~{mx:,}{unit}"
    return ""


def front_job_to_row(job: dict, kingdom_id: str) -> dict:
    l2 = job.get("l2") or {}
    sr = l2.get("salaryRange")
    return {
        "id": job["id"],
        "name": job["name"],
        "name_en": job.get("nameEn") or job.get("name_en") or "",
        "emoji": "💼",
        "kingdom_id": kingdom_id,
        "rarity": job.get("rarity", "common"),
        "riasec_profile": job.get("riasecProfile") or job.get("riasec_profile") or {},
        "description": job.get("description", ""),
        "short_description": job.get("shortDescription") or job.get("short_description") or "",
        "company": "",
        "salary_range": salary_to_str(sr),
        "difficulty": 3,
        "future_outlook": l2.get("outlookDescription") or l2.get("outlook_description") or "",
        "outlook_score": int(l2.get("outlook", 3)),
        "is_active": True,
    }


def make_extra_route_detail(
    jid: str,
    name: str,
    emoji: str,
    company: str,
    salary_range: str,
    difficulty: int,
    outlook: str,
    *,
    mid_tasks: list[str] | None = None,
    high_tasks: list[str] | None = None,
    uni_tasks: list[str] | None = None,
    work_tasks: list[str] | None = None,
) -> dict:
    return {
        "id": jid,
        "name": name,
        "emoji": emoji,
        "company": company,
        "salaryRange": salary_range,
        "difficulty": difficulty,
        "recommendedHighSchool": ["general-high", "autonomous-private-high"],
        "recommendedHighSchoolNames": ["일반고", "자사고"],
        "recommendedUniversities": [
            {"name": "수도권 주요 대학", "admissionType": "학종·수능", "difficulty": 4},
            {"name": "지역 국립대", "admissionType": "교과·정시", "difficulty": 3},
        ],
        "careerPath": [
            {
                "stage": "중학교",
                "period": "중1~중3",
                "tasks": mid_tasks
                or ["기초 학습 습관", "독서·탐구 활동", "진로 관심 분야 찾기"],
                "icon": "🏫",
            },
            {
                "stage": "고등학교",
                "period": "고1~고3",
                "tasks": high_tasks
                or ["내신·수능 전략", "동아리·세특 정리", "관심 분야 심화"],
                "icon": "🔬",
            },
            {
                "stage": "대학교",
                "period": "대1~대4",
                "tasks": uni_tasks
                or ["전공 이수", "인턴·현장 경험", "자격·어학 준비"],
                "icon": "🎓",
            },
            {
                "stage": "취업",
                "period": "대4~",
                "tasks": work_tasks or ["공채·수시채용 지원", "포트폴리오 정리", "면접 준비"],
                "icon": "💼",
            },
        ],
        "keyPreparation": ["전공 기초", "실무 프로젝트", "협업 경험", "외국어·자격"],
        "futureOutlook": outlook,
    }


# Hand-authored expansion: (job_id, name, emoji, kingdom, company, salary, diff, desc, **route_kw)
BUILTIN_EXTRA_JOBS: tuple[tuple, ...] = (
    (
        "data-scientist",
        "데이터 사이언티스트",
        "📊",
        "explore",
        "네이버·쿠팡·은행",
        "6,000만~1.2억 (경력)",
        4,
        "데이터로 문제를 정의하고 모델을 설계해 의사결정을 돕는 직무입니다.",
    ),
    (
        "clinical-psychologist",
        "임상심리사",
        "🧠",
        "explore",
        "병원·심리상담센터",
        "4,000만~7,000만",
        4,
        "심리평가와 치료를 통해 회복을 돕는 전문 직종입니다.",
    ),
    (
        "interior-designer",
        "인테리어 디자이너",
        "🏠",
        "create",
        "건축·리빙 스튜디오",
        "3,500만~8,000만",
        3,
        "공간과 조명·재료를 설계해 삶의 질을 높입니다.",
    ),
    (
        "film-director",
        "영화 감독",
        "🎬",
        "create",
        "제작사·OTT",
        "변동 큼 (프로젝트)",
        5,
        "스토리텔링과 촬영·편집을 총괄하는 창작 직군입니다.",
    ),
    (
        "devops-engineer",
        "DevOps 엔지니어",
        "⚙️",
        "tech",
        "네이버·AWS·스타트업",
        "7,000만~1.3억",
        4,
        "배포·모니터링·인프라 자동화로 서비스 안정성을 책임집니다.",
    ),
    (
        "security-engineer",
        "정보보안 엔지니어",
        "🔐",
        "tech",
        "안랩·금융권",
        "6,000만~1.1억",
        4,
        "침해사고 대응·취약점 분석으로 시스템을 보호합니다.",
    ),
    (
        "forester",
        "산림·환경 기술자",
        "🌲",
        "nature",
        "산림청·환경공단",
        "4,000만~6,500만",
        3,
        "산림 보전·조성과 환경 모니터링을 수행합니다.",
    ),
    (
        "environmental-engineer",
        "환경공학기술자",
        "♻️",
        "nature",
        "EPC·대기업 환경팀",
        "4,500만~8,000만",
        3,
        "수질·대기·폐기물 처리 시설을 설계·운영합니다.",
    ),
    (
        "social-worker",
        "사회복지사",
        "🤝",
        "connect",
        "지자체·복지관",
        "3,200만~5,500만",
        3,
        "취약계층을 지원하고 복지 서비스를 연결합니다.",
    ),
    (
        "hr-specialist",
        "HRD·채용 담당자",
        "👔",
        "connect",
        "대기업·스타트업",
        "4,000만~9,000만",
        3,
        "채용·교육·평가 제도를 설계하고 조직 문화를 돕습니다.",
    ),
    (
        "accountant",
        "회계사",
        "📒",
        "order",
        "회계법인·대기업",
        "5,500만~1.2억",
        4,
        "재무제표·세무·감사로 기업의 신뢰를 지킵니다.",
    ),
    (
        "patent-attorney",
        "변리사",
        "📜",
        "order",
        "특허법인",
        "6,000만~1.5억",
        5,
        "특허 출원·분쟁을 다루는 기술·법률 복합 직종입니다.",
    ),
    (
        "pr-specialist",
        "PR·브랜드 커뮤니케이터",
        "📣",
        "communicate",
        "대행사·대기업",
        "4,000만~9,000만",
        3,
        "메시지와 미디어를 설계해 브랜드 신뢰를 쌓습니다.",
    ),
    (
        "podcaster",
        "팟캐스터·오디오 PD",
        "🎙️",
        "communicate",
        "1인 미디어·플랫폼",
        "변동 (광고·후원)",
        3,
        "기획·녹음·편집으로 스토리를 오디오로 전달합니다.",
    ),
    (
        "product-manager",
        "프로덕트 매니저",
        "🚀",
        "challenge",
        "IT·핀테크",
        "7,000만~1.5억",
        4,
        "문제 정의·우선순위·지표로 제품 성장을 이끕니다.",
    ),
    (
        "franchise-consultant",
        "프랜차이즈 창업 컨설턴트",
        "🏪",
        "challenge",
        "컨설팅·브랜드본부",
        "4,500만~9,000만",
        3,
        "매장 운영·원가·마케팅을 설계해 창업을 돕습니다.",
    ),
    (
        "nurse",
        "간호사",
        "💉",
        "explore",
        "상급병원·요양",
        "4,200만~7,500만",
        3,
        "환자 돌봄과 의료진 협진의 핵심 직무입니다.",
    ),
    (
        "civil-engineer",
        "토목·건설 기술자",
        "🏗️",
        "tech",
        "건설·시공사",
        "4,500만~9,000만",
        3,
        "도로·교량·플랜트 등 인프라를 설계·시공합니다.",
    ),
    (
        "chef",
        "셰프",
        "👨‍🍳",
        "create",
        "호텔·레스토랑",
        "3,500만~8,000만",
        3,
        "레시피·운영·팀 리더십으로 식음 경험을 만듭니다.",
    ),
    (
        "journalist",
        "기자",
        "📰",
        "communicate",
        "언론사·매체",
        "3,800만~8,500만",
        4,
        "취재·검증·취재 윤리로 공론장을 만듭니다.",
    ),
    (
        "marketer",
        "퍼포먼스 마케터",
        "📈",
        "challenge",
        "이커머스·게임",
        "4,200만~1억",
        3,
        "성과 지표 기반으로 캠페인을 설계·최적화합니다.",
    ),
    (
        "electric-vehicle-engineer",
        "전기차 시스템 엔지니어",
        "🔋",
        "tech",
        "현대차·배터리",
        "6,000만~1.1억",
        4,
        "배터리·모터·제어 SW로 모빌리티를 구현합니다.",
    ),
    (
        "urban-planner",
        "도시계획가",
        "🗺️",
        "connect",
        "지자체·설계사",
        "4,200만~7,000만",
        4,
        "토지 이용·교통·주거 정책을 설계합니다.",
    ),
    (
        "curator",
        "큐레이터",
        "🖼️",
        "create",
        "미술관·전시",
        "3,500만~6,500만",
        3,
        "전시 기획과 해설로 예술·문화를 연결합니다.",
    ),
    (
        "sports-trainer",
        "스포츠 트레이너",
        "🏃",
        "nature",
        "구단·피트니스",
        "3,200만~6,000만",
        3,
        "운동 처방·부상 예방으로 선수·일반인의 몸을 돕습니다.",
    ),
)


def extra_row_to_job(row: tuple) -> dict:
    jid, name, emoji, kingdom, company, salary, diff, desc = row
    return {
        "id": jid,
        "name": name,
        "name_en": "",
        "emoji": emoji,
        "kingdom_id": kingdom,
        "rarity": "rare" if diff >= 4 else "common",
        "riasec_profile": {},
        "description": desc,
        "short_description": f"{name}로 성장하는 경로",
        "company": company,
        "salary_range": salary,
        "difficulty": diff,
        "future_outlook": desc,
        "outlook_score": min(5, max(1, diff)),
        "is_active": True,
    }


def route_job_to_row(rj: dict, kingdom_id: str) -> dict:
    return {
        "id": rj["id"],
        "name": rj["name"],
        "name_en": "",
        "emoji": rj.get("emoji", "💼"),
        "kingdom_id": kingdom_id,
        "rarity": "rare" if rj.get("difficulty", 3) >= 4 else "common",
        "riasec_profile": {},
        "description": rj.get("futureOutlook", "")[:500],
        "short_description": f"{rj['name']} 진로 요약",
        "company": rj.get("company", ""),
        "salary_range": rj.get("salaryRange", ""),
        "difficulty": int(rj.get("difficulty", 3)),
        "future_outlook": rj.get("futureOutlook", ""),
        "outlook_score": min(5, max(1, int(rj.get("difficulty", 3)))),
        "is_active": True,
    }


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)

    kingdoms_src = json.loads((FRONT / "kingdoms.json").read_text(encoding="utf-8"))
    kingdoms_wrapped = {
        "kingdoms": [
            {
                "id": k["id"],
                "name": k["name"],
                "emoji": "🌟",
                "color": k["color"],
                "description": k.get("description", ""),
            }
            for k in kingdoms_src
        ]
    }
    (OUT / "kingdoms.json").write_text(
        json.dumps(kingdoms_wrapped, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    by_kingdom: dict[str, dict] = defaultdict(dict)

    front_jobs = json.loads((FRONT / "jobs.json").read_text(encoding="utf-8"))
    for job in front_jobs:
        kid = job.get("kingdomId") or job.get("kingdom_id")
        if not kid:
            continue
        by_kingdom[kid][job["id"]] = front_job_to_row(job, kid)

    routes = json.loads((FRONT / "job-career-routes.json").read_text(encoding="utf-8"))
    for cat in routes.get("categories", []):
        cid = cat.get("id")
        kingdom = ROUTE_CATEGORY_TO_KINGDOM.get(cid)
        if not kingdom:
            continue
        for rj in cat.get("jobs", []):
            jid = rj["id"]
            if jid not in by_kingdom[kingdom]:
                by_kingdom[kingdom][jid] = route_job_to_row(rj, kingdom)

    extra_route_jobs: list[dict] = []
    for row in BUILTIN_EXTRA_JOBS:
        job_dict = extra_row_to_job(row)
        kid = job_dict["kingdom_id"]
        jid = job_dict["id"]
        if jid not in by_kingdom[kid]:
            by_kingdom[kid][jid] = job_dict
        extra_route_jobs.append(
            make_extra_route_detail(
                jid,
                row[1],
                row[2],
                row[4],
                row[5],
                row[6],
                row[7],
            )
        )

    routes.setdefault("categories", []).append(
        {
            "id": "seed-builtin-extra",
            "name": "시드 확장 직업",
            "emoji": "✨",
            "color": "#868e96",
            "jobs": extra_route_jobs,
        }
    )

    categories_jobs = [
        {"id": kid, "jobs": list(jobs.values())}
        for kid, jobs in sorted(by_kingdom.items(), key=lambda x: x[0])
    ]
    (OUT / "jobs.json").write_text(
        json.dumps({"categories": categories_jobs}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    (OUT / "job_career_routes.json").write_text(
        json.dumps(routes, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    total = sum(len(c["jobs"]) for c in categories_jobs)
    print(f"Wrote {OUT}/kingdoms.json ({len(kingdoms_wrapped['kingdoms'])} kingdoms)")
    print(f"Wrote {OUT}/jobs.json ({total} jobs in {len(categories_jobs)} categories)")
    print(f"Wrote {OUT}/job_career_routes.json (detail routes)")


if __name__ == "__main__":
    main()
