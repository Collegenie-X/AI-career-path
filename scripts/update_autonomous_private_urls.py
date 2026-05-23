import json

PATH = '/Users/kimjongphil/Documents/GitHub/AI-career-path/frontend/data/high-school/autonomous_private.json'

fixes = {
    "인천하늘고등학교": "https://haneul.icehs.kr/",
    "김천고등학교": "https://gimcheon.hs.kr/",
    "광양제철고등학교": "https://gwangcheol.hs.jne.kr/",
    "포항제철고등학교": "https://pocheol.hs.kr/",
    "북일고등학교": "https://www.bugil.hs.kr/",
    "신일고등학교": "https://www.shin-il.hs.kr/",
    "배재고등학교": "https://paichai.hs.kr/",
    "선덕고등학교": "https://sunduck.sen.hs.kr/",
    "세화여자고등학교": "https://sehwags.sen.hs.kr/",
    "이화여자대학교사범대학부속이화·금란고등학교": "https://edaebugo.sen.hs.kr/",
    "중동고등학교": "https://www.joongdong.hs.kr/",
    "중앙고등학교": "https://choongang.sen.hs.kr/",
    "한양대학교사범대학부속고등학교": "http://hanyang-u.hs.kr/",
    "경희고등학교": "https://www.kyungheeboy.hs.kr/",
    "해운대고등학교": "http://haeundae.hs.kr/",
    "계성고등학교": "https://keisung.dge.hs.kr/",
    "대건고등학교": "https://daegun.dge.hs.kr/",
    "대성고등학교(대전)": "https://daeseong.hs.kr/",
    "대신고등학교(대전)": "https://www.dshs.kr/",
    "인천포스코고등학교": "https://icpa.icehs.kr/",
    "안산동산고등학교": "http://www.dsgo.kr/",
    "충남삼성고등학교": "https://www.cnsa.hs.kr/",
}


def walk_replace(node, old_url, new_url):
    count = 0
    if isinstance(node, dict):
        for k, v in list(node.items()):
            if k == "homepageUrl" and isinstance(v, str) and v == old_url:
                node[k] = new_url
                count += 1
            else:
                count += walk_replace(v, old_url, new_url)
    elif isinstance(node, list):
        for item in node:
            count += walk_replace(item, old_url, new_url)
    return count


with open(PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

results = []
for school in data['schools']:
    name = school['name']
    old = school.get('websiteUrl', '')
    if name in fixes:
        new = fixes[name]
        if old == new:
            results.append((name, old, new, 'same', 0))
            continue
        school['websiteUrl'] = new
        nested = walk_replace(school, old, new)
        results.append((name, old, new, 'fixed', nested))
    else:
        results.append((name, old, old, 'same', 0))

with open(PATH, 'w', encoding='utf-8') as f:
    f.write(json.dumps(data, ensure_ascii=False, indent=2))

print(f"{'school':45} | {'old':45} | {'new':45} | status | nested")
print('-' * 165)
fixed_count = 0
for name, old, new, status, nested in results:
    if status == 'fixed':
        fixed_count += 1
    print(f"{name[:45]:45} | {old[:45]:45} | {new[:45]:45} | {status:6} | {nested}")

print(f"\nTotal fixed: {fixed_count} / {len(results)}")
