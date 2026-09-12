# -*- coding: utf-8 -*-
"""수도권(서울·인천·경기) 대안학교 핀 → metro-school-map.json categories.alternative (멱등 덮어쓰기).
주소·홈페이지는 NEIS(master_facts.json), NEIS 미수록 등록 대안교육기관은 공식 홈페이지 주소."""
import json, os

HERE = os.path.dirname(os.path.abspath(__file__))
MAP = os.path.join(HERE, "..", "..", "frontend", "data", "high-school", "metro-school-map.json")
ALT = os.path.join(HERE, "..", "..", "frontend", "data", "high-school", "alternative.json")
SIDO = {"서울특별시": "seoul", "인천광역시": "incheon", "경기도": "gyeonggi"}


def main():
    facts = json.load(open(os.path.join(HERE, "master_facts.json"), encoding="utf-8"))
    alt = json.load(open(ALT, encoding="utf-8"))
    ids = {s["id"] for s in alt["schools"]}
    pins = [
        {"name": "넥스트챌린지스쿨", "shortName": "넥스트챌린지스쿨", "sido": "seoul", "district": "서대문구",
         "address": "서울특별시 서대문구 이화여대길 59, 2층", "homepage": "https://www.ncschool.ai",
         "source": "공식 홈페이지", "schoolType": "등록 대안교육기관(학력 미인정)", "schoolId": "next_challenge_school"},
        {"name": "거꾸로캠퍼스", "shortName": "거꾸로캠퍼스", "sido": "seoul", "district": "성북구",
         "address": "서울특별시 성북구 성북로 39, 2층", "homepage": "https://xn--v69a75dvtk24kj6oj1g.kr/",
         "source": "공식 홈페이지", "schoolType": "등록 대안교육기관(학력 미인정)", "schoolId": "ggukkuro_campus"},
    ]
    for code, f in facts.items():
        sido = SIDO.get(f["region"])
        if not sido:
            continue
        parts = (f["address"] or "").split()
        sid = "odyssey_school" if f["axis"] == "transition" else f"alt_{code}"
        pins.append({
            "name": f["name"].replace("(고)", ""),
            "shortName": f["name"].replace("(고)", "").replace("고등학교", "고"),
            "sido": sido, "district": parts[1] if len(parts) > 1 else "",
            "address": f["address"], "homepage": f["homepage"], "tel": f.get("tel"), "source": "NEIS",
            "schoolType": {"special": "대안교육 특성화고", "public": "공립 대안학교(각종학교)",
                           "private": "사립 대안학교(각종학교)", "transition": "공립 대안학교(1년 전환학년)"}[f["axis"]],
            "founding": f.get("founding"), "coedu": f.get("coedu"),
            "firstYearClassCount": f.get("firstYearClassCount"), "neisVerified": True,
            "schoolId": sid if sid in ids else None,
        })
    m = json.load(open(MAP, encoding="utf-8"))
    m["categories"]["alternative"] = {"pins": pins}
    with open(MAP, "w", encoding="utf-8") as fp:
        json.dump(m, fp, ensure_ascii=False, indent=2)
    print(f"alternative pins: {len(pins)} (linked {sum(1 for p in pins if p['schoolId'])})")
    for p in pins:
        print(" ", p["sido"], p["district"], p["shortName"])


if __name__ == "__main__":
    main()
