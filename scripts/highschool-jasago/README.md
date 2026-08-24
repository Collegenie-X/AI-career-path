# 자사고(autonomous_private.json) 재생성 스크립트

`frontend/data/high-school/autonomous_private.json` 을 **백업본에서 항상 다시 만들어내는** 멱등 생성기.

## 실행

```bash
cd scripts/highschool-jasago
python3 build.py            # → out.json 생성
cp out.json ../../frontend/data/high-school/autonomous_private.json
```

`build.py` 는 `frontend/data/high-school/autonomous_private.json.backup-2026-08-25-preexpand`
(없으면 현재 파일을 백업으로 만들고 그것)을 **입력**으로 읽는다. 따라서 몇 번 돌려도 결과가 같다.

## 파일

| 파일 | 역할 |
|---|---|
| `scrape.py` | 고입정보포털(`hischool.go.kr`) 학교 상세 파서 → `portal.json` / `converted_portal.json` |
| `neis.py` | NEIS 오픈 API 호출 (인증키 없이 동작, 응답 5행 제한 주의) |
| `master.py` | 포털 + NEIS 병합 → `master.json` (주소·홈페이지·재학생수·1학년 학급수) |
| `facts.py` | **검증 사실표.** 로스터(45개교) · 선발단위 · 현행/전환 지위 · 2026 모집·경쟁률 · 홈페이지 교정 |
| `packs.py` | 하이라이트·로드맵·리얼톡·일과·생존팁 생성 (검증 축에서만 유도) |
| `sections.py` | 비용 3층 / 모집 팩트 / 지역 연계 섹션 생성 |
| `base.py` | 신규·skeleton 학교의 기본 서술 생성 |
| `category.py` | 카테고리 단위 섹션(그룹 트리 6축 · 비용 비교표 · 모집 비교표) 생성 |
| `build.py` | 병합 + 마커 정리(`sanitize`) + `verificationStatus` 작성 |

## 원칙

- 학교별 서술은 **검증 축**(선발 단위 · 기숙 여부 · 현행/전환 지위 · 성별 · 시·도)에서만 유도한다.
- 재단·기업명은 `facts.ROSTER` 에 확인된 것만 적는다. 없으면 비워 둔다.
- 손으로 쓴 기존 서술(13개 학교)은 덮어쓰지 않는다 — `is_skeleton()` 이 판별한다.
- 하이라이트 마커는 `==텍스트==` 만 유효하다. `===` 3연속과 마커 내부 `=` 는 `sanitize()` 가 정리한다.
- HL 파서를 안 타는 필드(`costStructure.asOf`, `admissionFacts.categoryAverage`,
  `realTalk[].title`, `dailySchedule[].activity`)에는 마커를 넣지 않는다.

## 출처

- 고입정보포털 자사고 목록: `search.do?type=HSA03&detailtype=HSB04`
- NEIS: `open.neis.go.kr/hub/schoolInfo`, `.../classInfo?AY=2026&GRADE=1`
- 2026 경쟁률: 베리타스알파 589980(전국) · 587835(서울 광역) · 교육을비추다 2932(비서울 광역)
- 일반고 전환: 메트로서울 20250824500010(서울 12개교) · 교육플러스 6740(대구 대건고)
