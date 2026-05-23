#!/usr/bin/env python3
"""URL·교명 정정 (2026-05-23 검증).

확인사항:
- 울산스포츠과학고: school.use.go.kr/ussmh-h/M01 (ussmh — 중고통합)
- 부산여자상업고 → 해연여자고등학교(2026.3.1 교명변경, 특성화고 유지)
  학과: 무역금융과 / IT사무행정과 / 웹툰디자인과(마케팅크리에이터과)
- 전주상업정보고 → 전주여자상업고등학교
  학과: 회계정보과 / 금융정보과 / e-비지니스과 / 사무행정과
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
ARTS = ROOT / "frontend/data/high-school/arts_sports.json"
BIZ = ROOT / "frontend/data/high-school/business.json"


def update_arts():
    with ARTS.open() as f:
        data = json.load(f)
    for s in data["schools"]:
        if s.get("name") == "울산스포츠과학고등학교":
            new_url = "https://school.use.go.kr/ussmh-h/M01"
            s["websiteUrl"] = new_url
            s.setdefault("differentiators", {})["verifiedHomepage"] = new_url
            # middleSchoolGuide.homepageUrl도 있으면 동기화
            if "middleSchoolGuide" in s and "homepageUrl" in s["middleSchoolGuide"]:
                s["middleSchoolGuide"]["homepageUrl"] = new_url
            print(f"  ✓ 울산스포츠과학고 URL → {new_url}")
    with ARTS.open("w") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def update_biz():
    with BIZ.open() as f:
        data = json.load(f)
    for s in data["schools"]:
        name = s.get("name")

        # 부산여자상업고 → 해연여자고등학교 (2026.3.1)
        if name == "부산여자상업고등학교":
            s["name"] = "해연여자고등학교"
            s["shortName"] = "해연여고"
            s["id"] = "haeyeon_girls"
            d = s.setdefault("differentiators", {})
            d["classificationNote"] = "공립 여자 특성화고 — 2026.3.1 부산여자상업고에서 교명 변경(현판식 개최). 무역금융·IT사무행정·웹툰디자인 3개 학과로 재편."
            d["departments"] = ["무역금융과", "IT사무행정과", "웹툰디자인과(마케팅크리에이터과)"]
            d["clubsAndSeteuk"] = {
                "summary": "2026 교명변경과 함께 학과 재편 — 무역금융 + IT사무행정 + 웹툰디자인의 3축으로 차별화.",
                "signatureClubs": [
                    "무역금융 자격증 트랙(컴활·전산회계·무역영어)",
                    "웹툰디자인 포트폴리오반(마케팅 크리에이터 트랙)",
                    "전통 합창단·가야금부(부산여상 시절 유산)",
                ],
                "seteukAngle": "교명변경 첫 해(2026) 신규 학과 정착 과정·웹툰 콘텐츠 제작 기록이 세특 차별 소재. 부산여상 시절 인성교육(명곡감상·5분생활영어) 자산도 유지.",
            }
            d["teachingDifferentiator"] = "2026 교명변경 + 학과 재편. 기존 무역·금융 정통 + 신설 웹툰디자인(마케팅 크리에이터) 융합형으로 전환. 1교사 1기업 방문 산학협력 전통 유지."
            print(f"  ↻ 부산여상 → 해연여자고 (교명변경)")

        # 전주상업정보고 → 전주여자상업고등학교
        elif name == "전주상업정보고등학교":
            s["name"] = "전주여자상업고등학교"
            s["shortName"] = "전주여상"
            s["id"] = "jeonju_girls_commerce"
            d = s.setdefault("differentiators", {})
            d["classificationNote"] = "공립 여자 특성화고 — '전주상업정보고'에서 '전주여자상업고등학교'로 명칭 환원. 회계·금융·e-비즈니스에 가장 정통하게 특화."
            d["departments"] = ["회계정보과", "금융정보과", "e-비지니스과", "사무행정과"]
            print(f"  ↻ 전주상업정보고 → 전주여자상업고")

        # 두 학교 모두 URL 정정
        if s.get("name") == "해연여자고등학교":
            new_url = "https://school.busanedu.net/psgch-h/main.do"
            s["websiteUrl"] = new_url
            s.setdefault("differentiators", {})["verifiedHomepage"] = new_url
        if s.get("name") == "전주여자상업고등학교":
            new_url = "https://school.jbedu.kr/jgch/"
            s["websiteUrl"] = new_url
            s.setdefault("differentiators", {})["verifiedHomepage"] = new_url

        # middleSchoolGuide.homepageUrl 동기화
        if "middleSchoolGuide" in s and "homepageUrl" in s["middleSchoolGuide"]:
            s["middleSchoolGuide"]["homepageUrl"] = s["websiteUrl"]

    with BIZ.open("w") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    print("== arts_sports.json ==")
    update_arts()
    print("\n== business.json ==")
    update_biz()
    print("\nDone.")
