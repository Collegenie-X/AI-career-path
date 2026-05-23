#!/usr/bin/env python3
"""3개 학교의 남은 보일러플레이트 필드(studyHoursPerDay/selfStudyRatio/mentalHealthNote) 차별화."""
import json
from pathlib import Path

PATH = Path("/Users/kimjongphil/Documents/GitHub/AI-career-path/frontend/data/high-school/general_elite.json")
data = json.loads(PATH.read_text(encoding="utf-8"))

PATCHES = {
    "neungin_high": {
        "studyHoursPerDay": "[일반적] 평일 학교 + 수성 학원 + 자습 9~12시간 — 의대 준비반은 12~14시간까지 보고됨",
        "selfStudyRatio": "[일반적] 학원 50~60% : 자기주도 40~50% — 대구 수성 의대 트랙 특성상 학원 의존도 높음",
        "mentalHealthNote": "==대구 수성 의대 트랙 압박==과 ==장기 N수 부담==이 능인고 특유의 리스크. 의대 외 진로도 열어두는 가족 대화가 중요합니다.",
    },
    "gyeongsin_high": {
        "selfStudyRatio": "[일반적] 학원 55~65% : 자기주도 35~45% — 사립 남고 특성상 의대 N제·학원 의존도 매우 높음",
    },
    "korea_sahmyook_high": {
        "studyHoursPerDay": "[일반적] 평일 학교 + 기숙사 자율학습 9~12시간 — ==토요일은 안식일(휴식)==, 일요일 학습 가능",
        "selfStudyRatio": "[일반적] 학교·R&E 60~70% : 자기주도 30~40% — 기숙형이라 학원 의존도 낮고 교내·자습 비중 높음",
        "mentalHealthNote": "==기숙 공동체 생활 적응==과 ==신앙·학업 균형==이 삼육고 특유의 리스크. 채플·기도회 일정과 학습 리듬을 잘 맞추는 게 핵심.",
    },
}

updated = []
for s in data["schools"]:
    sid = s.get("id")
    if sid in PATCHES:
        for k, v in PATCHES[sid].items():
            s[k] = v
        updated.append(sid)

PATH.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Patched: {updated}")
