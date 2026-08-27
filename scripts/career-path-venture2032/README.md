# career-path-venture2032

2026-08-27 "2032 창직·AI 시대" 커리어 패스 개편 2차 작업 스크립트.

| 파일 | 역할 |
|------|------|
| `common.py` | 템플릿/아이템/역량축 빌더 헬퍼 |
| `t_tech.py` ~ `t_order.py` | 8개 별 영역 창직 템플릿 원고(파이썬 dict) |
| `patch_reading.py` | career-path-templates.json 20종에 ReadingClue식 병렬 독서·캠페인 항목 추가 |
| `patch_reading2.py` | future/highschool/admission 14종에 병렬 독서 항목 추가 |
| `patch_aiera_a/b/c.py` | 고입 7 / 대입 8 / 취업 5종에 northStar·competencyGrowth·aiOrchestra 추가 |
| `patch_qaxis.py` | 기존 14종 competencyGrowth에 '질문력(독서 기반)' 축 추가 |

8개 템플릿 JSON 생성:

```bash
python3 - <<'PY'
import json
from t_tech import TECH; from t_create import CREATE; from t_explore import EXPLORE
from t_challenge import CHALLENGE; from t_communicate import COMMUNICATE; from t_connect import CONNECT
from t_nature import NATURE; from t_order import ORDER
json.dump([TECH,CREATE,EXPLORE,CHALLENGE,COMMUNICATE,CONNECT,NATURE,ORDER],
  open('../../frontend/data/path-templates/career-path-templates-venture2032.json','w'),
  ensure_ascii=False, indent=2)
PY
```

패치 스크립트는 **1회성**(다시 돌리면 항목이 중복 추가됨).
