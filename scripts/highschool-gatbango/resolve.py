# -*- coding: utf-8 -*-
"""NEIS 오픈API로 후보 로스터를 검증/해석 → master_facts.json.

검증 축(정식명·시도·시군구·학교종류·공학·홈페이지·1학년 학급수)만 확정한다.
실존하지 않거나 특목고/과학고이면 드롭(환각 제거 원칙).
"""
import json, time, urllib.parse, urllib.request, sys, os
from roster import ALL, EXISTING

KEY = "5d4ef4d5555448668f46915fde389471"
BASE = "https://open.neis.go.kr/hub"
ALLOWED_TYPES = {"일반고", "자율고"}  # 특목고/과학고 등은 갓반고 아님 → 드롭


def _get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.load(r)


def school_info(name):
    q = urllib.parse.quote(name)
    url = f"{BASE}/schoolInfo?KEY={KEY}&Type=json&pIndex=1&pSize=100&SCHUL_NM={q}"
    try:
        d = _get(url)
    except Exception as e:
        return []
    if "schoolInfo" not in d:
        return []
    try:
        return d["schoolInfo"][1]["row"]
    except Exception:
        return []


def class_count(office, code, ay="2026", grade="1"):
    url = (f"{BASE}/classInfo?KEY={KEY}&Type=json&pIndex=1&pSize=100"
           f"&ATPT_OFCDC_SC_CODE={office}&SD_SCHUL_CODE={code}&AY={ay}&GRADE={grade}")
    try:
        d = _get(url)
        rows = d["classInfo"][1]["row"]
        # 학과가 여러 개면 학급 합산(일반고는 보통 계열 1개)
        cls = set()
        for r in rows:
            cls.add((r.get("DDDEP_NM"), r.get("CLASS_NM")))
        return len(rows)
    except Exception:
        return None


def pick(rows, query, region):
    stem = query[:-1] if query.endswith("고") else query
    exact = stem + "고등학교"
    cands = [r for r in rows
             if r.get("LCTN_SC_NM") == region
             and r.get("HS_SC_NM") in ALLOWED_TYPES
             and r.get("SCHUL_NM", "").endswith("고등학교")]
    # 1) 정확히 일치
    for r in cands:
        if r.get("SCHUL_NM") == exact:
            return r
    # 2) stem 으로 시작 + 가장 짧은 이름
    starts = [r for r in cands if r.get("SCHUL_NM", "").startswith(stem)]
    if starts:
        return sorted(starts, key=lambda r: len(r["SCHUL_NM"]))[0]
    return None


def main():
    out = {}
    dropped = []
    seen_codes = set()
    for query, region, tags, district in ALL:
        rows = school_info(query)
        r = pick(rows, query, region)
        time.sleep(0.12)
        if not r:
            dropped.append((query, region, "NEIS 매칭 실패/특목"))
            continue
        name = r["SCHUL_NM"]
        code = r["SD_SCHUL_CODE"]
        if name in EXISTING:
            dropped.append((query, region, "기존 general_elite"))
            continue
        if code in seen_codes:
            dropped.append((query, region, "중복"))
            continue
        seen_codes.add(code)
        office = r["ATPT_OFCDC_SC_CODE"]
        cc = class_count(office, code)
        time.sleep(0.12)
        out[code] = {
            "name": name,
            "region": r.get("LCTN_SC_NM"),
            "address": r.get("ORG_RDNMA"),
            "signgu": None,
            "type": r.get("HS_SC_NM"),
            "coedu": r.get("COEDU_SC_NM"),
            "homepage": (r.get("HMPG_ADRES") or "").strip(),
            "founding": r.get("FOND_SC_NM"),   # 공립/사립
            "dayNight": r.get("DGHT_SC_NM"),
            "estType": r.get("ENG_SCHUL_NM"),
            "tags": tags,
            "district": district,
            "firstYearClassCount": cc,
            "neisCode": code,
            "office": office,
        }
        # 시군구 추출
        addr = out[code]["address"] or ""
        parts = addr.split()
        if len(parts) >= 2:
            out[code]["signgu"] = parts[1]
        print(f"OK  {name} | {out[code]['type']} | {out[code]['coedu']} | "
              f"{out[code]['founding']} | 1학년 {cc}학급 | {out[code]['homepage'][:40]}")
    here = os.path.dirname(__file__)
    with open(os.path.join(here, "master_facts.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print("\n===== 요약 =====")
    print(f"확정: {len(out)}개교")
    print(f"드롭: {len(dropped)}개")
    for q, rg, why in dropped:
        print(f"  - {q} ({rg}): {why}")


if __name__ == "__main__":
    main()
