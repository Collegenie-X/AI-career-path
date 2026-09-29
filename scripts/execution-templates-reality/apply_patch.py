"""커리어 실행 템플릿 현실화 패치 적용 + 피드 동기화.
사용: python3 apply_patch.py <frontend 경로>
"""
import json, sys, shutil, os, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from patch_a import P as PA
from patch_b import P as PB

P = {**PA, **PB}
FE = sys.argv[1]
SRC = os.path.join(FE, 'data/execution/templates-project-fields.json')
FEED = os.path.join(FE, 'data/dreammate/seed/feedExecutionTemplates.json')
STAMP = '20260928'

for path in (SRC, FEED):
    bak = f'{path}.backup-reality-{STAMP}'
    if not os.path.exists(bak):
        shutil.copy(path, bak)

data = json.load(open(SRC, encoding='utf-8'))
templates = [t for f in data['fields'] for t in f['templates']]
ids = {t['id'] for t in templates}
assert ids == set(P), (ids - set(P), set(P) - ids)

for t in templates:
    p = P[t['id']]
    if 'desc' in p: t['description'] = p['desc']
    if 'sc' in p:
        assert len(p['sc']) == 3; t['successCriteria'] = p['sc']
    if 'ev' in p:
        assert 3 <= len(p['ev']) <= 4; t['evidence'] = p['ev']
    for idx, w in p.get('weeks', {}).items():
        wg = t['weeklyGoals'][idx]
        if 'title' in w: wg['title'] = w['title']
        if 'output' in w: wg['output'] = w['output']
        for ti, text in w.get('t', {}).items():
            assert ti < len(wg['tasks']), (t['id'], idx, ti)
            wg['tasks'][ti] = text
    assert len(p['risks']) == 3
    t['reality'] = p['reality']
    t['minimumVersion'] = p['min']
    t['risks'] = [dict(problem=a, fallback=b) for a, b in p['risks']]

# 검증: task·output 전역 고유
tasks = collections.Counter(k for t in templates for w in t['weeklyGoals'] for k in w['tasks'])
outs = collections.Counter(w['output'] for t in templates for w in t['weeklyGoals'])
dups = [k for k, v in tasks.items() if v > 1] + [k for k, v in outs.items() if v > 1]
assert not dups, dups
print('templates', len(templates), 'tasks', len(tasks), 'outputs', len(outs))

json.dump(data, open(SRC, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(SRC, 'a').write('\n')

# ── 피드 동기화 ──
feed = json.load(open(FEED, encoding='utf-8'))
assert len(feed) == len(templates)
for t, x in zip(templates, feed):
    assert x['title'].endswith(t['title']), (t['id'], x['title'])
    assert len(x['items']) == len(t['weeklyGoals'])
    r = t['reality']
    x['description'] = (
        f"{t['description']}\n\n"
        f"⏱ {r['weeklyHours']} · 💰 {r['cost']} · 👥 {r['team']}\n"
        f"📚 추천 도서 {len(t['books'])}권: " + ' · '.join(b['title'] for b in t['books'])
    )
    rec = x['milestoneResults'][0].get('recordedAt', '')
    ms = [dict(id=f"{x['id']}-ms-{i+1}", title=f"완료 기준 {i+1} — {c}", description='',
               monthWeekLabel='', recordedAt=rec) for i, c in enumerate(t['successCriteria'])]
    ms.append(dict(
        id=f"{x['id']}-ms-4", title='🧭 시작 전 현실 체크 — 시간·비용·허락·도구',
        description=(f"⏱ 시간: {r['weeklyHours']}\n💰 비용: {r['cost']}\n👥 인원: {r['team']}\n"
                     f"🗓 일정: {r['schedule']}\n\n✋ 먼저 허락·확인할 것\n"
                     + '\n'.join(f'· {s}' for s in r['permissions'])
                     + '\n\n🧰 도구\n' + '\n'.join(f'· {s}' for s in r['tools'])),
        monthWeekLabel='', recordedAt=rec))
    ms.append(dict(
        id=f"{x['id']}-ms-5", title='🛟 막힐 때 플랜 B — 흔한 걸림돌 3가지',
        description='\n\n'.join(f"Q. {k['problem']}\n→ {k['fallback']}" for k in t['risks'])
                    + f"\n\n⏳ {t['minimumVersion']}",
        monthWeekLabel='', recordedAt=rec))
    x['milestoneResults'] = ms
    x['finalResultDescription'] = '\n'.join(f'· {e}' for e in t['evidence'])
    for wg, it in zip(t['weeklyGoals'], x['items']):
        it['title'] = f"{wg['weekLabel']} · {wg['title']}"
        it['targetOutput'] = wg['output']
        assert len(it['subItems']) == len(wg['tasks'])
        for s, task in zip(it['subItems'], wg['tasks']):
            s['title'] = task

json.dump(feed, open(FEED, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(FEED, 'a').write('\n')
print('feed synced', len(feed))
