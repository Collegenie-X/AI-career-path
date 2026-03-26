"""
적성 검사 저장 시 스펙트럼·추천 직업군·추천 직업 TOP5 를 백엔드에서 계산합니다.

데이터 소스: `apps/quiz/data/kingdoms.json`, `apps/quiz/data/jobs.json`
(프론트 `frontend/data/` 와 동기화 유지 권장 — 추후 공용 패키지·단일 시드로 옮길 수 있음)
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List

RIASEC_KEYS = ['R', 'I', 'A', 'S', 'E', 'C']


def _data_dir() -> Path:
    return Path(__file__).resolve().parent.parent / 'data'


def _load_json(filename: str) -> Any:
    path = _data_dir() / filename
    if not path.is_file():
        return None
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def cosine_similarity(
    a: Dict[str, float],
    b: Dict[str, float],
) -> float:
    dot = 0.0
    mag_a = 0.0
    mag_b = 0.0
    for k in RIASEC_KEYS:
        va = float(a.get(k, 0))
        vb = float(b.get(k, 0))
        dot += va * vb
        mag_a += va * va
        mag_b += vb * vb
    mag = (mag_a ** 0.5) * (mag_b ** 0.5)
    if mag == 0:
        return 0.0
    return dot / mag


def build_spectrum_snapshot(riasec_scores: Dict[str, int]) -> Dict[str, Any]:
    scores = {k: int(riasec_scores.get(k, 0)) for k in RIASEC_KEYS}
    total = sum(scores.values()) or 1
    sorted_types = sorted(scores.keys(), key=lambda k: scores[k], reverse=True)
    percent_by_type = {k: round(scores[k] / total * 100) for k in RIASEC_KEYS}
    return {
        'scores': scores,
        'sorted_types': sorted_types,
        'percent_by_type': percent_by_type,
    }


def build_recommended_kingdom_snapshot(top_type: str) -> Dict[str, Any]:
    data = _load_json('kingdoms.json')
    if not isinstance(data, list):
        return {}
    for row in data:
        types = row.get('riasecTypes') or []
        if top_type in types:
            return {
                'id': row['id'],
                'name': row['name'],
                'color': row['color'],
                'description': row['description'],
                'riasec_types': list(types),
            }
    return {}


def _user_scores_float(riasec_scores: Dict[str, int]) -> Dict[str, float]:
    return {k: float(riasec_scores.get(k, 0)) for k in RIASEC_KEYS}


def build_recommended_jobs_snapshot(
    riasec_scores: Dict[str, int],
    *,
    limit: int = 5,
) -> List[Dict[str, Any]]:
    """
    프론트 `getRecommendedJobs` 와 동일한 가중치이되,
    서버에는 스와이프/즐겨찾기 이력이 없으므로 행동 보너스는 0 으로 둡니다.
    """
    jobs_raw = _load_json('jobs.json')
    kingdoms_raw = _load_json('kingdoms.json')
    if not isinstance(jobs_raw, list):
        return []
    kingdom_name_by_id: Dict[str, str] = {}
    if isinstance(kingdoms_raw, list):
        for k in kingdoms_raw:
            kid = k.get('id')
            if kid:
                kingdom_name_by_id[str(kid)] = str(k.get('name', ''))

    user_scores = _user_scores_float(riasec_scores)
    scored: List[Dict[str, Any]] = []

    for job in jobs_raw:
        profile = job.get('riasecProfile') or job.get('riasec_profile')
        if not isinstance(profile, dict) or not profile:
            continue
        prof = {x: float(profile.get(x, 0)) for x in RIASEC_KEYS}
        riasec_score = cosine_similarity(user_scores, prof)
        behavior_bonus = 0.0
        favorite_bonus = 0.0
        diversity_penalty = 0.0
        total_score = min(
            1.0,
            riasec_score * 0.6 + behavior_bonus + favorite_bonus - diversity_penalty,
        )
        reason = '당신의 적성과 잘 맞아요!'
        if total_score > 0.85:
            reason = '최고의 매칭! 꼭 살펴보세요'
        elif total_score < 0.5:
            reason = '새로운 분야를 탐험해보세요'

        kid = str(job.get('kingdomId') or job.get('kingdom_id') or '')
        scored.append(
            {
                '_sort': total_score,
                'job_id': str(job.get('id', '')),
                'job_name': str(job.get('name', '')),
                'kingdom_id': kid,
                'kingdom_name': kingdom_name_by_id.get(kid, ''),
                'match_score': round(total_score * 100),
                'reason': reason,
            }
        )

    scored.sort(key=lambda x: x['_sort'], reverse=True)
    out: List[Dict[str, Any]] = []
    for row in scored[:limit]:
        row = {k: v for k, v in row.items() if k != '_sort'}
        out.append(row)
    return out


def build_all_snapshots(
    riasec_scores: Dict[str, int],
    top_type: str,
) -> Dict[str, Any]:
    return {
        'spectrum_snapshot': build_spectrum_snapshot(riasec_scores),
        'recommended_kingdom_snapshot': build_recommended_kingdom_snapshot(top_type),
        'recommended_jobs_snapshot': build_recommended_jobs_snapshot(riasec_scores),
    }
