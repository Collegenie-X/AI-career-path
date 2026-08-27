"""커리어 패스 템플릿 2032 창직·AI 역량 개편 공통 유틸.

- northStar / competencyGrowth / aiOrchestra 필드 주입
- items 에 goalIndex 부여 (목표별로 활동이 나뉘어 렌더되도록)
- 새 활동(창직·캠페인 영상·AI 에이전트) 추가
- 대입 템플릿의 폐지된 '자소서' 표현 정리
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "frontend" / "data" / "path-templates"

AXIS_META = [
    ("ai", "🤖", "AI 활용력"),
    ("plan", "🧭", "기획력"),
    ("fusion", "🔗", "융합력"),
    ("venture", "🚀", "창직력"),
    ("deliver", "🎤", "전달력"),
]


def load(name):
    return json.loads((DATA / name).read_text(encoding="utf-8"))


def save(name, data):
    (DATA / name).write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )


def build_growth(stages, table, note=None):
    """table: {axis_key: [(score, evidence), ...]} — stages 순서와 길이 일치."""
    axes = []
    for key, icon, name in AXIS_META:
        rows = table.get(key)
        if not rows:
            continue
        axes.append(
            {
                "key": key,
                "icon": icon,
                "name": name,
                "levels": [
                    {"stage": stages[i], "score": rows[i][0], "evidence": rows[i][1]}
                    for i in range(len(stages))
                ],
            }
        )
    out = {"axes": axes}
    if note:
        out["note"] = note
    return out


def assign_goal_index(template):
    """활동을 목표에 1:1로 붙인다. 개수가 다르면 앞에서부터 채우고 나머지는 마지막 목표로."""
    for year in template.get("years", []):
        goals = year.get("goals") or []
        items = year.get("items") or []
        if not goals:
            continue
        for i, item in enumerate(items):
            if "goalIndex" in item:
                continue
            item["goalIndex"] = min(i, len(goals) - 1)


ADMISSION_SELF_INTRO_FIXES = [
    (r"자소서 3문항 완성본 1부", "면접용 활동 정리서 3편(활동·배운점·연결 진로)"),
    (r"자소서 최종본 1편\(1000자[^)]*\)", "면접용 활동 정리서 1부(활동 6건 요약)"),
    (r"자소서 최종본 1편", "면접용 활동 정리서 1부"),
    (r"자소서 3문항", "면접용 활동 정리서 3편"),
    (r"자소서 1편", "면접용 활동 정리서 1부"),
    (r"자소서 v3", "면접용 활동 정리서 v3"),
    (r"자소서 완성", "면접용 활동 정리서 완성"),
    (r"자소서·면접", "생기부·면접"),
    (r"자소서", "면접용 활동 정리서"),
]


def fix_admission_self_intro(template):
    """2024 대입 개편으로 폐지된 자소서 표현을 생기부·면접 기준으로 정리."""

    def fix(text):
        if not isinstance(text, str) or "자소서" not in text:
            return text
        for pat, rep in ADMISSION_SELF_INTRO_FIXES:
            text = re.sub(pat, rep, text)
        return text

    def walk(node):
        if isinstance(node, dict):
            return {k: (fix(v) if isinstance(v, str) else walk(v)) for k, v in node.items()}
        if isinstance(node, list):
            return [fix(v) if isinstance(v, str) else walk(v) for v in node]
        return node

    return walk(template)
