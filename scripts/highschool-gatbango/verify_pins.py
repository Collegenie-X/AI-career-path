# -*- coding: utf-8 -*-
"""metro-school-map.json 의 카테고리 핀을 NEIS로 재검증·교정.

 - 존재 확인(실재), 도로명주소·홈페이지·전화번호 최신화
 - 못 찾으면 폐교/개명 의심으로 리포트(자동 삭제하지 않음)
대상: ib, meister, specialized, business (원하면 확장)
"""
import json, os, time, urllib.parse, urllib.request

HERE = os.path.dirname(__file__)
DATA = os.path.join(HERE, "..", "..", "frontend", "data", "high-school")
KEY = "5d4ef4d5555448668f46915fde389471"
BASE = "https://open.neis.go.kr/hub"
SIDO_NEIS = {"seoul": "서울특별시", "gyeonggi": "경기도", "incheon": "인천광역시"}
CATS = ["ib", "meister", "specialized", "business"]


def _get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=20) as r:
        return json.load(r)


def neis(name):
    q = urllib.parse.quote(name)
    url = f"{BASE}/schoolInfo?KEY={KEY}&Type=json&pIndex=1&pSize=100&SCHUL_NM={q}"
    try:
        d = _get(url)
        return d["schoolInfo"][1]["row"]
    except Exception:
        return []


def clean_name(nm):
    # ib.json 등 "( … )" 접미사 제거, 공백 정리
    import re
    return re.sub(r"\s*\(.*?\)\s*", "", nm).strip()


def pick(rows, region):
    cands = [r for r in rows if r.get("LCTN_SC_NM") == region]
    if not cands:
        cands = rows  # 지역 불명 시 전체에서
    # 정확 일치 우선, 아니면 가장 짧은 이름
    return sorted(cands, key=lambda r: len(r.get("SCHUL_NM", "")))[0] if cands else None


def norm_url(u):
    u = (u or "").strip()
    if u and not u.startswith("http"):
        u = "http://" + u
    return u


def main():
    mpath = os.path.join(DATA, "metro-school-map.json")
    metro = json.load(open(mpath, encoding="utf-8"))
    report = {"verified": 0, "addr_fixed": 0, "hp_fixed": 0, "tel_added": 0, "notfound": []}
    for cat in CATS:
        pins = metro["categories"].get(cat, {}).get("pins", [])
        for p in pins:
            region = SIDO_NEIS.get(p.get("sido"))
            nm = clean_name(p["name"])
            rows = neis(nm)
            time.sleep(0.1)
            r = pick(rows, region) if rows else None
            if not r:
                p["neisVerified"] = False
                report["notfound"].append((cat, p["name"], p.get("sido")))
                continue
            report["verified"] += 1
            p["neisVerified"] = True
            addr = r.get("ORG_RDNMA")
            if addr and addr != p.get("address"):
                p["address"] = addr
                report["addr_fixed"] += 1
            hp = norm_url(r.get("HMPG_ADRES"))
            if hp and hp != norm_url(p.get("homepage") or ""):
                p["homepage"] = hp
                report["hp_fixed"] += 1
            tel = r.get("ORG_TELNO")
            if tel and not p.get("tel"):
                p["tel"] = tel
                report["tel_added"] += 1
            # 지도 구 경계와 맞추기 위해 시군구도 최신 주소에서 갱신
            parts = (addr or "").split()
            if len(parts) >= 2 and p.get("district") and parts[1] != p["district"]:
                # 개편으로 구가 바뀐 경우만 후보 — 별칭 처리되는 값은 두고 리포트
                p.setdefault("_neisDistrict", parts[1])
    json.dump(metro, open(mpath, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"검증 성공 {report['verified']} · 주소교정 {report['addr_fixed']} · "
          f"홈페이지교정 {report['hp_fixed']} · 전화추가 {report['tel_added']}")
    print(f"NEIS 미발견(폐교/개명 의심) {len(report['notfound'])}건:")
    for c, n, s in report["notfound"]:
        print(f"  - [{c}] {n} ({s})")


if __name__ == "__main__":
    main()
