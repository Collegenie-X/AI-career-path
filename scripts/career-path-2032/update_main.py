# -*- coding: utf-8 -*-
"""career-path-templates.json (20종) — 2032 창직·AI 역량 개편"""
from common import load, save, build_growth, assign_goal_index, fix_admission_self_intro
import main_hs_data as HS
import main_univ_data as UNIV
import main_job_data as JOB

FILE = "career-path-templates.json"

YEAR_TITLES = {
    "y1": "입사 1년차",
    "y2": "입사 2년차",
    "y3": "입사 3년차 — 창직 전환 준비",
}


def build_job_years(tid):
    """직무별 변형 데이터로 입사 1~3년차 학년 3개를 만든다."""
    if tid in JOB.CAREER_YEARS:
        return JOB.CAREER_YEARS[tid]
    v = JOB.JOB_VARIANTS[tid]
    years = []
    for idx, key in enumerate(["y1", "y2", "y3"], start=5):
        (g1, d1, tools1, dlv1, g2, d2, tools2, dlv2) = v[key]
        years.append({
            "gradeId": f"step{idx}",
            "gradeLabel": YEAR_TITLES[key],
            "goals": [f"6개월 차까지 {g1}", f"12개월 차까지 {g2}"],
            "items": [
                {
                    "type": "activity", "title": f"{g1} (1~6개월)",
                    "months": [1, 2, 3, 4, 5, 6], "difficulty": 4,
                    "organizer": "회사" if key != "y3" else "자체",
                    "description": d1,
                    "categoryTags": ["project"], "activitySubtype": "project",
                    "projectTrack": True, "priority": "must",
                    "aiTools": list(tools1), "deliverable": dlv1,
                    "cost": "무료~회사 계정", "goalIndex": 0,
                },
                {
                    "type": "activity", "title": f"{g2} (7~12개월)",
                    "months": [7, 8, 9, 10, 11, 12], "difficulty": 4, "organizer": "자체",
                    "description": d2,
                    "categoryTags": ["project"], "activitySubtype": "project",
                    "projectTrack": True, "priority": "boost",
                    "aiTools": list(tools2), "deliverable": dlv2,
                    "cost": "무료", "goalIndex": 1,
                },
            ],
        })
    return years


def apply_common(t, north, growth_table, stages, orchestra, note):
    t["northStar"] = north
    t["competencyGrowth"] = build_growth(stages, growth_table, note=note)
    t["aiOrchestra"] = {
        "note": "단계마다 AI 에이전트를 어디에 맡기고 어디를 직접 했는지.",
        "agents": [{"stage": s, "tools": list(tools), "use": use} for s, tools, use in orchestra],
    }


def add_item(t, year_idx, goal, item):
    year = t["years"][year_idx]
    year["goals"].append(goal)
    item = dict(item)
    item["goalIndex"] = len(year["goals"]) - 1
    year["items"].append(item)


def stage_labels(t):
    out = []
    for y in t["years"]:
        label = y.get("gradeLabel") or y.get("gradeId") or ""
        out.append(label.split(" —")[0].strip())
    return out


def main():
    data = load(FILE)
    result = []
    for t in data:
        tid = t["id"]
        if tid in HS.NORTH_STAR:
            assign_goal_index(t)
            apply_common(t, HS.NORTH_STAR[tid], HS.GROWTH[tid], stage_labels(t), HS.ORCHESTRA[tid],
                         "중1→중3 동안 쌓인 결과물 개수로 5개 역량을 점수화했습니다.")
            add_item(t, *HS.NEW[tid])
        elif tid in UNIV.NORTH_STAR:
            t = fix_admission_self_intro(t)
            assign_goal_index(t)
            apply_common(t, UNIV.NORTH_STAR[tid], UNIV.GROWTH[tid], stage_labels(t), UNIV.ORCHESTRA[tid],
                         "학년별로 쌓인 결과물 개수로 5개 역량을 점수화했습니다.")
            add_item(t, *UNIV.NEW[tid])
        elif tid in JOB.NORTH_STAR:
            assign_goal_index(t)
            t["years"].extend(build_job_years(tid))
            apply_common(t, JOB.NORTH_STAR[tid], JOB.GROWTH[tid], JOB.STAGES, JOB.ORCHESTRA[tid],
                         "취업 준비 12개월 + 입사 3년차까지, 쌓인 성과로 5개 역량을 점수화했습니다.")
        else:
            raise SystemExit(f"미분류 템플릿: {tid}")
        t["totalItems"] = sum(len(y["items"]) for y in t["years"])
        result.append(t)
    save(FILE, result)
    for t in result:
        print(t["id"], len(t["years"]), "년차/학년,", t["totalItems"], "항목")


if __name__ == "__main__":
    main()
