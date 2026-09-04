# -*- coding: utf-8 -*-
"""상세 카드가 없는 '정보용 핀'을 NEIS 검증 사실로 보강.

추가 필드(핀): founding(공립/사립), coedu(남녀공학/남/여), firstYearClassCount, neisVerified.
허구 서술은 만들지 않는다 — 렌더는 검증 사실만 표시.
대상: business, specialized 의 schoolId 미연결 핀.
"""
import json, os, time, urllib.parse, urllib.request

HERE = os.path.dirname(__file__)
DATA = os.path.join(HERE, "..", "..", "frontend", "data", "high-school")
KEY = "5d4ef4d5555448668f46915fde389471"
BASE = "https://open.neis.go.kr/hub"
SIDO_NEIS = {"seoul": "서울특별시", "gyeonggi": "경기도", "incheon": "인천광역시"}


def _get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.load(r)


def neis_row(name, region):
    q = urllib.parse.quote(name)
    url = f"{BASE}/schoolInfo?KEY={KEY}&Type=json&pIndex=1&pSize=100&SCHUL_NM={q}"
    try:
        rows = _get(url)["schoolInfo"][1]["row"]
    except Exception:
        return None
    cands = [r for r in rows if r.get("LCTN_SC_NM") == region] or rows
    exact = [r for r in cands if r.get("SCHUL_NM") == name]
    return (exact or sorted(cands, key=lambda r: len(r.get("SCHUL_NM", ""))))[0] if cands else None


def class_count(office, code):
    url = (f"{BASE}/classInfo?KEY={KEY}&Type=json&pIndex=1&pSize=100"
           f"&ATPT_OFCDC_SC_CODE={office}&SD_SCHUL_CODE={code}&AY=2026&GRADE=1")
    try:
        return len(_get(url)["classInfo"][1]["row"])
    except Exception:
        return None


def main():
    mpath = os.path.join(DATA, "metro-school-map.json")
    metro = json.load(open(mpath, encoding="utf-8"))
    linked = {}
    for cat in ["business", "specialized"]:
        d = json.load(open(os.path.join(DATA, cat + ".json"), encoding="utf-8"))
        linked[cat] = {s["id"] for s in d["schools"]}

    cache = {}
    enriched = 0
    for cat in ["business", "specialized"]:
        for p in metro["categories"][cat]["pins"]:
            if p.get("schoolId") in linked[cat]:
                continue  # 이미 상세 카드 있음
            key = p["name"]
            if key not in cache:
                r = neis_row(key, SIDO_NEIS.get(p.get("sido")))
                time.sleep(0.1)
                if r:
                    cc = class_count(r["ATPT_OFCDC_SC_CODE"], r["SD_SCHUL_CODE"])
                    time.sleep(0.1)
                    cache[key] = {
                        "founding": r.get("FOND_SC_NM"),
                        "coedu": r.get("COEDU_SC_NM"),
                        "firstYearClassCount": cc,
                        "tel": r.get("ORG_TELNO"),
                        "address": r.get("ORG_RDNMA") or p.get("address"),
                        "homepage": (r.get("HMPG_ADRES") or p.get("homepage") or "").strip(),
                    }
                else:
                    cache[key] = None
            info = cache[key]
            if not info:
                p["neisVerified"] = False
                continue
            p["founding"] = info["founding"]
            p["coedu"] = info["coedu"]
            if info["firstYearClassCount"]:
                p["firstYearClassCount"] = info["firstYearClassCount"]
            if info["tel"] and not p.get("tel"):
                p["tel"] = info["tel"]
            if info["address"]:
                p["address"] = info["address"]
            hp = info["homepage"]
            if hp:
                p["homepage"] = hp if hp.startswith("http") else "http://" + hp
            p["neisVerified"] = True
            enriched += 1

    json.dump(metro, open(mpath, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"정보용 핀 보강: {enriched}개 (고유 {len(cache)}교, NEIS 실패 {sum(1 for v in cache.values() if not v)}교)")


if __name__ == "__main__":
    main()
