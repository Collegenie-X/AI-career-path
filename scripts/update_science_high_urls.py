"""Verify and update school websiteUrl/homepageUrl in science_high.json.

URLs verified via Google WebSearch (skipping aggregators like namu.wiki,
schoolinfo, weseb, iamservice, hischool, kakao map, blog).
"""
import json

path = '/Users/kimjongphil/Documents/GitHub/AI-career-path/frontend/data/high-school/science_high.json'
with open(path, 'r', encoding='utf-8') as f:
    data = json.load(f)

# Canonical URLs based on WebSearch (Google) verification
canonical = {
    "한국과학영재학교": "https://ksa.hs.kr/",
    "서울과학고등학교": "https://sshs.sen.hs.kr/",
    "경기과학고등학교": "https://gs-h.goesw.kr/",
    "대전과학고등학교": "https://djshs.djsch.kr/",
    "부산과학고등학교": "http://bss.hs.kr/",
    "광주과학고등학교": "http://gsa.gen.hs.kr/",
    "대구과학고등학교": "http://ts.hs.kr/",
    "인천과학고등학교": "https://i-science.icehs.kr/",
    "울산과학고등학교": "http://ushs.hs.kr/",
    "전북과학고등학교": "https://school.jbedu.kr/ejbs",
    "세종과학예술영재학교": "https://sasa.sjeduhs.kr/",
    "강원과학고등학교": "https://kangwon-sh.gwe.hs.kr/",
    "제주과학고등학교": "https://school.jje.go.kr/jeju-s/main.do",
    "충남과학고등학교": "http://www.cnsh.cnehs.kr/",
    "충북과학고등학교": "https://school.cbe.go.kr/cbs-h/M01",
    "경남과학고등학교": "http://gshs-h.gne.go.kr/",
}

schools = data.get('schools') or data.get('data') or []


def find_homepage(obj):
    if isinstance(obj, dict):
        if 'homepageUrl' in obj:
            return obj
        for v in obj.values():
            r = find_homepage(v)
            if r:
                return r
    elif isinstance(obj, list):
        for v in obj:
            r = find_homepage(v)
            if r:
                return r
    return None


changes = []
print(f"{'School':<25} {'Before websiteUrl':<45} {'After':<45} {'Changed'}")
print("-" * 130)
for s in schools:
    name = s.get('name')
    if name not in canonical:
        continue
    new_url = canonical[name]
    before_web = s.get('websiteUrl', '')
    nested = find_homepage(s)
    before_home = nested.get('homepageUrl') if nested else None
    changed = (before_web != new_url) or (before_home != new_url)
    if changed:
        s['websiteUrl'] = new_url
        if nested:
            nested['homepageUrl'] = new_url
        changes.append(name)
    print(f"{name:<25} {before_web:<45} {new_url:<45} {'YES' if changed else 'no'}")

with open(path, 'w', encoding='utf-8') as f:
    f.write(json.dumps(data, ensure_ascii=False, indent=2))

print()
print(f"Total changes: {len(changes)}")
print(f"Changed: {changes}")
