# 갓반고 확장 + 수도권 지도 갱신 스크립트

`general_elite.json`(갓반고) 확장과 `metro-school-map.json` 핀 갱신을 **NEIS 오픈API 검증**으로
수행하는 스크립트 모음. 인증키는 각 파일 상단 `KEY` 상수.

## 실행 순서

```bash
cd scripts/highschool-gatbango
python3 resolve.py          # 로스터 → NEIS 검증 → master_facts.json
python3 build.py            # 검증 사실 → 학교 카드 생성 → out.json
cp out.json ../../frontend/data/high-school/general_elite.json
python3 metro_pins.py       # 신규 수도권 갓반고 → general_elite 지도 핀(schoolId 연결)
python3 verify_pins.py      # ib·meister·specialized·business 기존 핀 NEIS 재검증
python3 enrich_info_pins.py # 상세 카드 없는 정보용 핀 → NEIS 사실(운영주체·공학·학급수) 보강
```

## 파일

| 파일 | 역할 |
|---|---|
| `roster.py` | 후보 명단(과학중점 전국 + 학군지 + 지방명문) · 지역 · 태그 |
| `resolve.py` | NEIS `schoolInfo`·`classInfo` → 정식명·주소·종류·공학·설립·홈페이지·학급수 확정, 특목/타카테고리 제외 → `master_facts.json` |
| `build.py` | 검증 축에서만 서술 유도(환각 금지). 백업본에서 항상 재생성(멱등). featureFocus science axis 확장 포함 |
| `metro_pins.py` | 신규 수도권 91교를 `metro-school-map.json`의 `general_elite.pins`에 병합(schoolId=`ge_{code}`). 멱등 |
| `verify_pins.py` | 4개 직업/IB 카테고리 기존 핀을 NEIS로 재검증·주소/홈페이지 교정. 미발견 리포트(외국인학교는 NEIS 미수록=정상) |
| `enrich_info_pins.py` | 상세 카드 없는 정보용 핀(특성화·비즈니스)을 NEIS 사실로 보강 → 지도 팝업이 검증 정보 카드가 됨 |

## 원칙

- 서술은 **검증 축**(종류·성별·설립·지역·태그·학급수·학과·계열)에서만 유도.
- 진학실적·사교육비·지원율·취업률·동아리명 등 학교별 미검증 수치/고유명은 **생성하지 않는다**.
  정보용 핀은 카드를 억지로 만들지 않고 **NEIS 검증 사실만** 팝업에 표시.
- 2026 행정 개편: NEIS 광주=`전남광주통합특별시(광주)`, 전남=`전남광주통합특별시(전남)`.
  인천 검단구·서해구→서구는 `metro-school-map.json.districtAlias`.

## 백업

- `general_elite.json.backup-2026-09-05-preexpand`
- `metro-school-map.json.backup-2026-09-05-preexpand`
