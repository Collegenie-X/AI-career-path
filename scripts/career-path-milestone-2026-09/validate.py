#!/usr/bin/env python3
"""out/<id>.json 규격 검사. 사용: python3 validate.py <templateId> [...] | --all"""
import json, os, re, sys, glob

S = os.path.dirname(os.path.abspath(__file__))
FROZEN = ['id', 'category', 'starId', 'starName', 'starEmoji', 'starColor', 'jobId', 'jobName',
          'jobEmoji', 'authorName', 'authorEmoji', 'authorType', 'likes', 'uses', 'isAiGenerated',
          'aiGeneratedNote', 'schoolType', 'universityId', 'departmentId']
ALLOWED_URLS = [
    'adiga.kr', 'hifive.go.kr', 'career.go.kr', '1365.go.kr', 'neis.go.kr', 'ebsi.co.kr',
    'suneung.re.kr', 'koi.or.kr', 'kmo.or.kr', 'q-net.or.kr', 'dataq.or.kr', 'license.korcham.net',
    'kocw.net', 'kmooc.kr', 'work24.go.kr', 'k-startup.go.kr', 'data.go.kr', 'kosis.kr',
    'law.go.kr', 'hometax.go.kr', 'admission.kaist.ac.kr', 'admission.snu.ac.kr',
    'admission.yonsei.ac.kr', 'oku.korea.ac.kr',
]
FORMS = {'interview', 'report', 'paper', 'book', 'volunteer', 'project', 'campaign'}
TYPES = {'activity', 'award', 'portfolio', 'certification'}
TAGS = {'project', 'award', 'paper', 'intern', 'volunteer', 'camp', 'reading', 'campaign', 'activity'}
SUBS = {'project', 'intern', 'volunteer', 'camp', 'research', 'general'}
FEED = {f'tpl-{f}-0{i}' for f in FORMS for i in range(1, 6)}
ITEM_KEYS = {'type', 'title', 'months', 'difficulty', 'cost', 'organizer', 'description', 'deliverable',
             'categoryTags', 'activitySubtype', 'goalIndex', 'priority', 'links', 'executionRef'}


def check(tid):
    errs, warns = [], []
    src = json.load(open(f'{S}/in/{tid}.json'))
    p = f'{S}/out/{tid}.json'
    if not os.path.exists(p):
        return [f'out 파일 없음: {p}'], []
    try:
        t = json.load(open(p))
    except Exception as e:
        return [f'JSON 파싱 실패: {e}'], []
    minor = src['category'] != 'job'
    venture = tid.startswith('tpl-venture2032')

    for k in src:
        if k not in t:
            errs.append(f'최상위 키 누락: {k}')
    for k in FROZEN:
        if k in src and src[k] != t.get(k):
            errs.append(f'고정 필드 변경됨: {k}')
    gid = lambda y: y.get('gradeId') or y.get('grade')
    if [gid(y) for y in src['years']] != [gid(y) for y in t.get('years', [])]:
        errs.append('years의 gradeId/grade 순서·개수 불일치')

    n_items = n_d = 0
    for yi, y in enumerate(t.get('years', [])):
        tag = f'year[{yi}] {y.get("gradeLabel")}'
        if not y.get('gradeLabel'):
            errs.append(f'{tag}: gradeLabel 없음')
        goals, items = y.get('goals', []), y.get('items', [])
        if not 3 <= len(goals) <= 4:
            errs.append(f'{tag}: goals {len(goals)}개 (3~4)')
        for g in goals:
            if len(g) > 70:
                warns.append(f'{tag}: goal 길이 {len(g)} > 70 — {g[:30]}…')
        if not 3 <= len(items) <= 6:
            errs.append(f'{tag}: items {len(items)}개 (4~5 권장, 3~6 허용)')
        used = set()
        dcount = 0
        musts = 0
        for ii, it in enumerate(items):
            itag = f'{tag} item[{ii}] {it.get("title", "")[:24]}'
            extra = set(it) - ITEM_KEYS
            if extra:
                errs.append(f'{itag}: 허용되지 않은 필드 {sorted(extra)}')
            for k in ['type', 'title', 'months', 'difficulty', 'cost', 'organizer', 'description',
                      'deliverable', 'categoryTags', 'goalIndex']:
                if k not in it or it[k] in ('', None):
                    errs.append(f'{itag}: {k} 없음')
            if it.get('type') not in TYPES:
                errs.append(f'{itag}: type {it.get("type")}')
            ms = it.get('months') or []
            if not ms or any((not isinstance(m, int)) or m < 1 or m > 12 for m in ms):
                errs.append(f'{itag}: months 오류 {ms}')
            if not isinstance(it.get('goalIndex'), int) or not 0 <= it.get('goalIndex', -1) < len(goals):
                errs.append(f'{itag}: goalIndex 범위 밖')
            else:
                used.add(it['goalIndex'])
            if len(it.get('title', '')) > 50:
                errs.append(f'{itag}: title {len(it["title"])}자 > 50')
            d = it.get('description', '')
            if not 100 <= len(d) <= 300:
                errs.append(f'{itag}: description {len(d)}자 (120~260 권장, 100~300 허용)')
            if re.search(r'[①②③④⑤]', d):
                errs.append(f'{itag}: description에 번호 절차(①②③)')
            if re.search(r'주\s*\d+\s*회|매주\s|하루\s*\d+\s*(분|시간)|\d+주차', d + it.get('title', '')):
                warns.append(f'{itag}: 주차·횟수 표현 — 실행 수준 서술인지 확인')
            if not set(it.get('categoryTags') or []) <= TAGS or not it.get('categoryTags'):
                errs.append(f'{itag}: categoryTags {it.get("categoryTags")}')
            if 'activitySubtype' in it and it['activitySubtype'] not in SUBS:
                errs.append(f'{itag}: activitySubtype {it["activitySubtype"]}')
            if it.get('priority') not in (None, 'must', 'boost'):
                errs.append(f'{itag}: priority {it.get("priority")}')
            if it.get('priority') == 'must':
                musts += 1
            for l in it.get('links') or []:
                if not any(a in l.get('url', '') for a in ALLOWED_URLS):
                    errs.append(f'{itag}: 허용 목록 밖 URL {l.get("url")}')
            er = it.get('executionRef')
            if er:
                dcount += 1
                if er.get('form') not in FORMS:
                    errs.append(f'{itag}: executionRef.form {er.get("form")}')
                if not er.get('label') or len(er['label']) > 45:
                    errs.append(f'{itag}: executionRef.label 없음/45자 초과')
                if er.get('feedId') and er['feedId'] not in FEED:
                    errs.append(f'{itag}: executionRef.feedId {er["feedId"]}')
                if set(er) - {'form', 'label', 'feedId'}:
                    errs.append(f'{itag}: executionRef 필드 초과')
                if '커리어 실행' not in d:
                    errs.append(f'{itag}: D 항목 description에 "커리어 실행" 안내 문장 없음')
            txt = json.dumps(it, ensure_ascii=False)
            if minor and re.search(r'Claude|클로드', txt):
                errs.append(f'{itag}: 미성년 템플릿에 Claude')
            if src['category'] in ('admission', 'university') and '소논문' in txt:
                errs.append(f'{itag}: 대입 템플릿에 "소논문" 표현')
        if dcount > (2 if venture else 1):
            errs.append(f'{tag}: 대표 활동(executionRef) {dcount}개 초과')
        if musts > 2:
            errs.append(f'{tag}: priority must {musts}개 (최대 2)')
        miss = set(range(len(goals))) - used
        if miss:
            errs.append(f'{tag}: item 없는 goal 인덱스 {sorted(miss)}')
        n_items += len(items)
        n_d += dcount
    if n_items and n_d / n_items > (0.42 if venture else 0.31):
        errs.append(f'대표 활동 비중 {n_d}/{n_items} 초과')
    if n_d == 0:
        errs.append('executionRef 항목이 하나도 없음 (커리어 실행 연결 최소 1건)')
    if t.get('totalItems') != n_items:
        errs.append(f'totalItems {t.get("totalItems")} != {n_items}')

    ny = len(t.get('years', []))
    axes = (t.get('competencyGrowth') or {}).get('axes', [])
    if [a['key'] for a in axes] != [a['key'] for a in src['competencyGrowth']['axes']]:
        errs.append('competencyGrowth axes key 변경됨')
    for a in axes:
        if len(a.get('levels', [])) != ny:
            errs.append(f'competencyGrowth {a["key"]} levels {len(a.get("levels", []))} != {ny}')
    ns = t.get('northStar') or {}
    for k in ['goal', 'proof', 'byWhen']:
        if not ns.get(k):
            errs.append(f'northStar.{k} 없음')
    ao = json.dumps(t.get('aiOrchestra'), ensure_ascii=False)
    if minor and re.search(r'Claude|클로드', ao):
        errs.append('미성년 템플릿 aiOrchestra에 Claude')
    if len((t.get('aiOrchestra') or {}).get('agents', [])) < 3:
        errs.append('aiOrchestra.agents 3개 미만')
    whole = json.dumps(t, ensure_ascii=False)
    if minor and re.search(r'Claude|클로드', whole):
        warns.append('템플릿 어딘가에 Claude 언급 남음 (description/successStories 등)')
    for m in re.findall(r'https?://[^\s"\\]+', whole):
        if not any(a in m for a in ALLOWED_URLS):
            warns.append(f'허용 목록 밖 URL(최상위 필드): {m}')
    if src['category'] in ('admission', 'university') and '소논문' in whole:
        warns.append('"소논문" 표현이 최상위 필드에 남음')
    if re.search(r'입학사정관', whole) and src['category'] == 'highschool':
        warns.append('고입 템플릿에 "입학사정관"')
    return errs, warns


if __name__ == '__main__':
    ids = sys.argv[1:]
    if ids == ['--all']:
        ids = sorted(os.path.basename(p)[:-5] for p in glob.glob(f'{S}/in/*.json'))
    bad = 0
    for tid in ids:
        e, w = check(tid)
        print(f'== {tid}: {"FAIL" if e else "OK"} (오류 {len(e)}, 경고 {len(w)})')
        for x in e:
            print('  [오류]', x)
        for x in w:
            print('  [경고]', x)
        bad += bool(e)
    sys.exit(1 if bad else 0)
