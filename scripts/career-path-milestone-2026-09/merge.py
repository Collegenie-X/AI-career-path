#!/usr/bin/env python3
"""out/<id>.json → frontend/data/path-templates/*.json 병합. validate 통과한 것만."""
import json, glob, os, shutil, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from validate import check
from overrides import OVERRIDES

S = os.path.dirname(os.path.abspath(__file__))
D = '/Users/kimjongphil/Documents/GitHub/AI-career-path/frontend/data/path-templates'
STAMP = '2026-09-28-path-milestone'
done = skipped = 0
for f in sorted(glob.glob(f'{D}/career-path-templates*.json')):
    arr = json.load(open(f))
    changed = False
    for i, t in enumerate(arr):
        tid = t['id']
        errs, _ = check(tid)
        if errs:
            print('SKIP', tid, errs[:2]); skipped += 1
            continue
        new = json.load(open(f'{S}/out/{tid}.json'))
        # 입력 키 순서 유지 + 새 키는 뒤에
        merged = {k: new[k] for k in t if k in new}
        merged.update({k: v for k, v in new.items() if k not in merged})
        merged.update(OVERRIDES.get(tid, {}))
        arr[i] = merged
        changed = True; done += 1
    if changed:
        bak = f'{f}.backup-{STAMP}'
        if not os.path.exists(bak):
            shutil.copy(f, bak)
        json.dump(arr, open(f, 'w'), ensure_ascii=False, indent=2)
        open(f, 'a').write('\n')
print('merged', done, 'skipped', skipped)
