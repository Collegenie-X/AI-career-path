# -*- coding: utf-8 -*-
"""NEIS 오픈API로 대안학교 로스터 검증 → master_facts.json.

확정 축: 정식명·시도·주소·학교종류(각종학교/고등학교)·설립(공/사립)·공학·개교일·홈페이지·전화·2026 1학년 학급수.
+ 홈페이지 HTTP 응답(curl) 검증. NEIS 미수록/홈페이지 불통 학교는 드롭(환각 제거 원칙).
"""
import json, os, subprocess, time, urllib.parse, urllib.request
from roster import ROSTER

KEY = "5d4ef4d5555448668f46915fde389471"
BASE = "https://open.neis.go.kr/hub"
HERE = os.path.dirname(os.path.abspath(__file__))
OK_KINDS = {"고등학교", "각종학교(고)", "각종학교(대안학교)", "특수학교"}


def _get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.load(r)


def school_rows(name):
    url = f"{BASE}/schoolInfo?KEY={KEY}&Type=json&pIndex=1&pSize=100&SCHUL_NM={urllib.parse.quote(name)}"
    try:
        d = _get(url)
        return d["schoolInfo"][1]["row"]
    except Exception:
        return []


def class_count(office, code, grade="1"):
    url = (f"{BASE}/classInfo?KEY={KEY}&Type=json&pIndex=1&pSize=100"
           f"&ATPT_OFCDC_SC_CODE={office}&SD_SCHUL_CODE={code}&AY=2026&GRADE={grade}")
    try:
        d = _get(url)
        return d["classInfo"][0]["head"][0]["list_total_count"]
    except Exception:
        return None


def http_ok(url):
    if not url:
        return None
    u = url.strip()
    if not u.startswith("http"):
        u = "http://" + u
    for cand in (u, u.replace("http://", "https://", 1)):
        try:
            code = subprocess.run(
                ["curl", "-s", "-o", "/dev/null", "-L", "-k", "--max-time", "15", "-A", "Mozilla/5.0",
                 "-w", "%{http_code}", cand], capture_output=True, text=True, timeout=25).stdout.strip()
        except Exception:
            code = "000"
        if code.startswith("2") or code.startswith("3"):
            return cand, code
    return None, code


def pick(rows, query, region, exact):
    cands = [r for r in rows if r.get("LCTN_SC_NM") == region and r.get("SCHUL_KND_SC_NM") in OK_KINDS]
    if exact:
        for r in cands:
            if r["SCHUL_NM"] == exact:
                return r
        return None
    for r in cands:
        if r["SCHUL_NM"] == query:
            return r
    starts = [r for r in cands if r["SCHUL_NM"].startswith(query)]
    return sorted(starts, key=lambda r: len(r["SCHUL_NM"]))[0] if starts else None


def main():
    out, dropped = {}, []
    for query, region, axis, exact in ROSTER:
        r = pick(school_rows(query), query, region, exact)
        time.sleep(0.1)
        if not r:
            dropped.append((query, region, "NEIS 매칭 실패"))
            continue
        code, office = r["SD_SCHUL_CODE"], r["ATPT_OFCDC_SC_CODE"]
        hp_raw = (r.get("HMPG_ADRES") or "").strip()
        hp, http = http_ok(hp_raw) if hp_raw and hp_raw not in ("http://", "https://") else (None, "none")
        cc = class_count(office, code)
        time.sleep(0.1)
        addr = r.get("ORG_RDNMA") or ""
        parts = addr.split()
        out[code] = {
            "name": r["SCHUL_NM"], "query": query, "axis": axis,
            "region": r["LCTN_SC_NM"], "address": addr,
            "signgu": parts[1] if len(parts) >= 2 else "",
            "kind": r.get("SCHUL_KND_SC_NM"), "hsType": r.get("HS_SC_NM"),
            "founding": r.get("FOND_SC_NM"), "coedu": r.get("COEDU_SC_NM"),
            "foundDate": r.get("FOND_YMD"), "tel": r.get("ORG_TELNO"),
            "homepageRaw": hp_raw, "homepage": hp, "httpCode": http,
            "firstYearClassCount": cc, "neisCode": code, "office": office,
        }
        flag = "OK " if hp else "NOHP"
        print(f"{flag} {r['SCHUL_NM']} | {axis} | {r.get('SCHUL_KND_SC_NM')} | {r.get('FOND_SC_NM')} | "
              f"개교 {r.get('FOND_YMD')} | 1학년 {cc}학급 | {hp or hp_raw} ({http})")
    with open(os.path.join(HERE, "master_facts.json"), "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)
    print(f"\n확정 {len(out)} / 드롭 {len(dropped)}")
    for d in dropped:
        print("DROP", d)


if __name__ == "__main__":
    main()
