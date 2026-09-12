# 대안·혁신학교(alternative) 재생성기

고입 탭의 `frontend/data/high-school/alternative.json`을 만든다. 넥스트챌린지스쿨 같은 등록 대안교육기관부터
대안교육 특성화고, 공립·사립 대안학교(각종학교), 1년 전환학년까지 한 유형으로 묶는다.

| 단계 | 파일 | 하는 일 |
|---|---|---|
| 1 | `roster.py` | 교육부 현황(2024.03)·경기도교육청 현황(2025) 기반 후보 명단 |
| 2 | `resolve.py` | NEIS 학교기본정보·학급정보 + 홈페이지 HTTP 검증 → `master_facts.json` |
| 3 | `features.json` | 학교별 특색·기숙·모집 인원·전형 (교육청 자료·입학전형요강·보도, 출처 URL 포함) |
| 4 | `manual.py` | NEIS 미수록 등록 대안교육기관(넥스트챌린지스쿨·거꾸로캠퍼스) + 오디세이학교 상세 |
| 5 | `build.py` | `category.py` 서술과 합쳐 `alternative.json` 생성 (멱등) |
| 6 | `metro_pins.py` | 수도권 21곳을 `metro-school-map.json`의 `categories.alternative`에 기록 |

```bash
python3 resolve.py && python3 build.py && python3 metro_pins.py
```

원칙
- NEIS에 고등과정이 없거나 공식 홈페이지가 열리지 않는 학교는 넣지 않는다.
- 모집 인원·학비는 출처가 있을 때만 쓴다. 일반론은 `[일반적]`으로 표기한다.
- 내손고·지평선고는 `ib.json`에 상세 카드가 있어 특색 축에서 링크 안내만 한다.

제외 (2026-09-12)
- NEIS 미수록: 한마음고(천안), 공동체비전고(서천, 요강상 '비전고'), 드림학교(천안), 성요셉상호문화고(강진, 2024 폐교), 인천해밀학교(2025 결마루미래학교로 전환)
- NEIS에 초·중 과정만 등록: 군서미래국제학교(시흥), 이음학교(광양)
- 공식 홈페이지 없음: 꿈틀리인생학교(강화, 블로그만 운영)
