# -*- coding: utf-8 -*-
"""신규 수도권 갓반고를 metro-school-map.json 의 general_elite 핀으로 병합.

핀은 schoolId(=general_elite 학교 id)로 상세 모달과 연결된다.
기존 핀(원본 24)은 보존하고, schoolId 기준으로 신규만 추가한다.
"""
import json, os

HERE = os.path.dirname(__file__)
DATA = os.path.join(HERE, "..", "..", "frontend", "data", "high-school")
SIDO = {"서울특별시": "seoul", "경기도": "gyeonggi", "인천광역시": "incheon"}


def main():
    facts = json.load(open(os.path.join(HERE, "master_facts.json"), encoding="utf-8"))
    ge = json.load(open(os.path.join(DATA, "general_elite.json"), encoding="utf-8"))
    meta = {s["name"]: s for s in ge["schools"]}
    new_names = {s["name"] for s in ge["schools"][31:]}

    mpath = os.path.join(DATA, "metro-school-map.json")
    metro = json.load(open(mpath, encoding="utf-8"))
    cat = metro["categories"].setdefault("general_elite", {"pins": []})
    have_ids = {p.get("schoolId") for p in cat["pins"]}
    have_addr = {(p.get("name"), p.get("address")) for p in cat["pins"]}

    added = 0
    for f in facts.values():
        if f["name"] not in new_names or f["region"] not in SIDO:
            continue
        sch = meta.get(f["name"])
        if not sch:
            continue
        sid = sch["id"]
        if sid in have_ids or (f["name"], f["address"]) in have_addr:
            continue
        hp = f.get("homepage") or ""
        if hp and not hp.startswith("http"):
            hp = "http://" + hp
        cat["pins"].append({
            "name": f["name"],
            "shortName": sch.get("shortName") or f["name"].replace("고등학교", "고"),
            "sido": SIDO[f["region"]],
            "district": f["signgu"],
            "address": f["address"],
            "homepage": hp or None,
            "source": "NEIS",
            "schoolId": sid,
        })
        added += 1

    # 정렬(시도→구→이름) — 지도 렌더 순서 안정화
    order = {"seoul": 0, "gyeonggi": 1, "incheon": 2}
    cat["pins"].sort(key=lambda p: (order.get(p["sido"], 9), p.get("district", ""), p.get("name", "")))

    json.dump(metro, open(mpath, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"general_elite 핀: 신규 {added}개 추가 → 총 {len(cat['pins'])}개")
    # 검증: 구 이름이 지도 경계/별칭에 있는지
    alias = metro.get("districtAlias", {})
    regions = metro["regions"]
    miss = []
    for p in cat["pins"]:
        dnames = {d["name"] for d in regions[p["sido"]]["districts"]}
        key = alias.get(p["district"], p["district"])
        if key not in dnames:
            miss.append((p["name"], p["sido"], p["district"]))
    print("경계 미매칭:", miss or "없음")


if __name__ == "__main__":
    main()
