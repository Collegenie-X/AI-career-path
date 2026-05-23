#!/usr/bin/env python3
"""Update meister.json with verified canonical school URLs (Google-verified, not 학교알리미)."""
import json
from pathlib import Path

PATH = Path("/Users/kimjongphil/Documents/GitHub/AI-career-path/frontend/data/high-school/meister.json")

VERIFIED = {
    "hyundai_meister":              "http://hit.hs.kr/",
    "suwon_electric_meister":       "https://sudo.sen.hs.kr/",
    "pohang_steel_meister":         "http://school.gyo6.net/pocheoltechhs",
    "busan_automation_meister":     "http://www.automotive.hs.kr/",
    "daegu_software_meister":       "http://www.dgsw.hs.kr/",
    "daeil_meister":                "http://dgmeister.dge.hs.kr/",
    "gwangju_automation_meister":   "http://gat.gen.hs.kr/",
    "incheon_electronics_meister":  "https://intec.icehs.kr/",
    "busan_maritime_meister":       "http://maritime.hs.kr/",
    "jeonnam_energy_meister":       "https://energy.gwe.hs.kr/",
}

with PATH.open(encoding="utf-8") as f:
    data = json.load(f)

rows = []
for school in data["schools"]:
    sid = school["id"]
    name = school["name"]
    before_w = school.get("websiteUrl", "")
    before_h = school.get("middleSchoolGuide", {}).get("homepageUrl", "")
    new_url = VERIFIED[sid]
    school["websiteUrl"] = new_url
    if "middleSchoolGuide" in school:
        school["middleSchoolGuide"]["homepageUrl"] = new_url
    rows.append((name, before_w, before_h, new_url))

with PATH.open("w", encoding="utf-8") as f:
    f.write(json.dumps(data, ensure_ascii=False, indent=2))

print(f"{'School':<28} {'Before websiteUrl':<42} {'Before homepageUrl':<42} {'After (both)':<35}  Chg")
print("-" * 160)
for name, bw, bh, new in rows:
    cw = "W" if bw != new else "-"
    ch = "H" if bh != new else "-"
    print(f"{name:<28} {bw:<42} {bh:<42} {new:<35}  [{cw}{ch}]")

print("\nBackup at meister.json.backup-url-verify")
