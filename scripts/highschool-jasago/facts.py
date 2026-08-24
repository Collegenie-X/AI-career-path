# -*- coding: utf-8 -*-
"""자사고 45개교 검증 사실표.
- portal/NEIS 값은 master.json(고입정보포털 + NEIS 오픈API)에서 자동 병합.
- unit/status/재단/2026 모집·경쟁률은 아래 표에 출처와 함께 수기 기입(언론 검증).
"""
import json, os
BASE = os.path.dirname(os.path.abspath(__file__))
MASTER = json.load(open(os.path.join(BASE, 'master.json'), encoding='utf-8'))

# id -> (portal idx, 선발단위, 상태, 전환연도, 재단/설립주체 표기(검증된 것만), 별칭)
ROSTER = [
    # ── 전국 단위 자사고 10 ──
    ('hana_high',            '1630', '전국', 'active', None, '하나금융그룹(학교법인 하나학원)'),
    ('minjok_high',          '41',   '전국', 'active', None, None),
    ('sangsan_high',         '2060', '전국', 'active', None, None),
    ('hyundai_chungwon',     '1727', '전국', 'active', None, '현대중공업(울산공업학원)'),
    ('oedaebu_high',         '438',  '전국', 'active', None, '한국외국어대학교 부설'),
    ('incheon_haneul',       '1835', '전국', 'active', None, '인천국제공항공사'),
    ('kimcheon_high',        '834',  '전국', 'active', None, '송설재단'),
    ('pohang_jecheol',       '956',  '전국', 'active', None, '포스코교육재단'),
    ('gwangyang_jecheol',    '1869', '전국', 'active', None, '포스코교육재단'),
    ('bukil_high',           '2220', '전국', 'active', None, '한화그룹'),
    # ── 서울 광역 14 ──
    ('whimoon_high',         '1659', '광역', 'active', None, None),
    ('hyundai_seoul_high',   '1646', '광역', 'active', None, '현대그룹(울산공업학원)'),
    ('jungdong_high',        '1611', '광역', 'active', None, None),
    ('baejae_high',          '1453', '광역', 'active', None, None),
    ('shinil_high',          '1546', '광역', 'active', None, None),
    ('seondeok_high',        '1502', '광역', 'active', None, None),
    ('gyunghee_seoul_high',  '1364', '광역', 'active', None, '경희대학교 계열'),
    ('sehwa_high',           '1526', '광역', 'active', None, None),
    ('sehwa_girls_high',     '1527', '광역', 'active', None, None),
    ('hanyang_busok_high',   '1641', '광역', 'active', None, '한양대학교 사범대학 부속'),
    ('boin_high',            '1458', '광역', 'active', None, None),
    ('yangjeong_high',       '1552', '광역', 'active', None, None),
    ('jungang_high',         '1613', '광역', 'active', None, None),
    ('ewha_girls_high',      '1590', '광역', 'active', None, None),
    # ── 비서울 광역 8 ──
    ('haewundae_high',       '1335', '광역', 'active', None, None),
    ('buil_high',            '1294', '광역', 'active', None, None),
    ('gyesung_daegu_high',   '1062', '광역', 'active', None, None),
    ('incheon_posco_high',   '1834', '광역', 'active', None, '포스코교육재단'),
    ('daesung_daejeon_high', '1141', '광역', 'active', None, None),
    ('daeshin_daejeon_high', '1152', '광역', 'active', None, None),
    ('ansan_dongsan_high',   '389',  '광역', 'active', None, None),
    ('chungnam_samsung_high','2274', '광역', 'active', None, '삼성(충남삼성학원)'),
    # ── 일반고 전환 13 (자사고 이력 보존용) ──
    ('daegwang_high',        '1396', '광역', 'converted', 2026, None),
    ('ewha_busok_high',      '1592', '광역', 'converted', 2025, '이화여자대학교 사범대학 부속'),
    ('janghoon_high',        '1605', '광역', 'converted', 2023, None),
    ('daegun_daegu_high',    '1070', '광역', 'converted', 2023, None),
    ('dongsung_high',        '1425', '광역', 'converted', 2022, None),
    ('soongmoon_high',       '1537', '광역', 'converted', 2022, None),
    ('hangaram_high',        '1631', '광역', 'converted', 2022, None),
    ('kyungmoon_high',       '1356', '광역', 'converted', 2020, None),
    ('daesung_seoul_high',   '1398', '광역', 'converted', 2019, None),
    ('mirim_girls_high',     '1446', '광역', 'converted', 2016, None),
    ('wooshin_high',         '1582', '광역', 'converted', 2016, None),
    ('yongmoon_high',        '1578', '광역', 'converted', 2013, None),
    ('dongyang_high',        '1426', '광역', 'converted', 2012, None),
]

# 2026학년도 모집인원 / 지원자 / 경쟁률 (언론 검증)
#   전국단위: 베리타스알파 [2026전국자사고경쟁률] idxno=571199
#   서울광역: 베리타스알파 [2026서울광역자사고경쟁률] idxno=587835
#   비서울광역: 교육을비추다 2026 비서울 광역자사고 idxno=2932
ADM2026 = {
    'hana_high':           (200, 524, '2.62:1', 'national'),
    'oedaebu_high':        (350, 807, '2.31:1', 'national'),
    'hyundai_chungwon':    (180, 322, '1.79:1', 'national'),
    'minjok_high':         (160, 276, '1.73:1', 'national'),
    'sangsan_high':        (336, 553, '1.65:1', 'national'),
    'incheon_haneul':      (225, 365, '1.62:1', 'national'),
    'pohang_jecheol':      (300, 418, '1.39:1', 'national'),
    'kimcheon_high':       (240, 331, '1.38:1', 'national'),
    'gwangyang_jecheol':   (240, 258, '1.08:1', 'national'),
    'bukil_high':          (360, 360, '1.00:1', 'national'),

    'ewha_girls_high':     (420, 608, '1.45:1', 'seoul'),
    'shinil_high':         (269, 409, '1.34:1', 'seoul'),
    'baejae_high':         (418, 542, '1.30:1', 'seoul'),
    'hyundai_seoul_high':  (420, 506, '1.20:1', 'seoul'),
    'jungdong_high':       (414, 484, '1.17:1', 'seoul'),
    'seondeok_high':       (385, 446, '1.16:1', 'seoul'),
    'jungang_high':        (330, 382, '1.16:1', 'seoul'),
    'hanyang_busok_high':  (385, 431, '1.12:1', 'seoul'),
    'boin_high':           (416, 432, '1.04:1', 'seoul'),
    'sehwa_high':          (420, 418, '1.00:1', 'seoul'),
    'yangjeong_high':      (402, 345, '0.86:1', 'seoul'),
    'sehwa_girls_high':    (415, 352, '0.85:1', 'seoul'),
    'gyunghee_seoul_high': (274, 210, '0.77:1', 'seoul'),
    'whimoon_high':        (470, 235, '0.50:1', 'seoul'),

    'incheon_posco_high':  (None, None, '2.39:1', 'local'),
    'chungnam_samsung_high':(None, None, '2.06:1', 'local'),
    'daeshin_daejeon_high':(None, None, '1.40:1', 'local'),
    'haewundae_high':      (None, None, '1.12:1', 'local'),
    'daesung_daejeon_high':(None, None, '0.90:1', 'local'),
    'ansan_dongsan_high':  (None, None, '0.78:1', 'local'),
}

SRC_ADM = {
    'national': ('베리타스알파 — [2026전국자사고경쟁률] 10개교 1.63대1',
                 'https://www.veritas-a.com/news/articleView.html?idxno=589980'),
    'seoul':    ('베리타스알파 — [2026광역자사고경쟁률] 서울 14개교 1.06대1',
                 'http://www.veritas-a.com/news/articleView.html?idxno=587835'),
    'local':    ('교육을 비추다 — 2026 비서울 광역 자사고 경쟁률',
                 'https://www.kyobit.com/news/articleView.html?idxno=2932'),
}

CONVERT_SRC = ('메트로서울 — 서울 자사고→일반고 전환 12개교 목록 (2012~2026)',
               'https://www.metroseoul.co.kr/article/20250824500010')

# 서울 외 전환교는 별도 근거 기사를 쓴다
CONVERT_SRC_BY_SCHOOL = {
    'daegun_daegu_high': ('교육플러스 — 대구 대건고 자사고 지위 포기, 2023학년도 일반고 전환',
                          'https://www.edpl.co.kr/news/articleView.html?idxno=6740'),
}


def convert_src(sid):
    return CONVERT_SRC_BY_SCHOOL.get(sid, CONVERT_SRC)

SHORT = {
    'hana_high':'하나고','minjok_high':'민사고','sangsan_high':'상산고','hyundai_chungwon':'현대청운고',
    'oedaebu_high':'외대부고','incheon_haneul':'인천하늘고','kimcheon_high':'김천고','pohang_jecheol':'포항제철고',
    'gwangyang_jecheol':'광양제철고','bukil_high':'북일고','whimoon_high':'휘문고','hyundai_seoul_high':'현대고',
    'jungdong_high':'중동고','baejae_high':'배재고','shinil_high':'신일고','seondeok_high':'선덕고',
    'gyunghee_seoul_high':'경희고','sehwa_high':'세화고','sehwa_girls_high':'세화여고','hanyang_busok_high':'한대부고',
    'boin_high':'보인고','yangjeong_high':'양정고','jungang_high':'중앙고','ewha_girls_high':'이화여고',
    'haewundae_high':'해운대고','buil_high':'부일고','gyesung_daegu_high':'계성고(대구)',
    'incheon_posco_high':'인천포스코고','daesung_daejeon_high':'대전대성고','daeshin_daejeon_high':'대전대신고',
    'ansan_dongsan_high':'안산동산고','chungnam_samsung_high':'충남삼성고','daegwang_high':'대광고',
    'ewha_busok_high':'이대부고','janghoon_high':'장훈고','daegun_daegu_high':'대건고(대구)','dongsung_high':'동성고',
    'soongmoon_high':'숭문고','hangaram_high':'한가람고','kyungmoon_high':'경문고','daesung_seoul_high':'대성고(서울)',
    'mirim_girls_high':'미림여고','wooshin_high':'우신고','yongmoon_high':'용문고','dongyang_high':'동양고',
}

# 표시용 학교명(중복 방지)
DISPLAY_NAME = {
    'gyesung_daegu_high':'계성고등학교(대구)','daegun_daegu_high':'대건고등학교(대구)',
    'daesung_daejeon_high':'대성고등학교(대전)','daeshin_daejeon_high':'대신고등학교(대전)',
    'daesung_seoul_high':'대성고등학교(서울)',
    'oedaebu_high':'한국외국어대학교부설용인외국어고등학교',
    'ewha_busok_high':'이화여자대학교사범대학부속이화·금란고등학교',
}

# 기숙사 운영(전국단위=필수 기숙, 그 외 광역=통학) — 광역 중 기숙 병설 학교
DORM = {
    'hana_high':True,'minjok_high':True,'sangsan_high':True,'hyundai_chungwon':True,'oedaebu_high':True,
    'incheon_haneul':True,'kimcheon_high':True,'pohang_jecheol':True,'gwangyang_jecheol':True,'bukil_high':True,
    'chungnam_samsung_high':True,'haewundae_high':True,'incheon_posco_high':True,'ansan_dongsan_high':True,
}

# 기존 JSON의 websiteUrl 중 실제로 죽어 있는 주소 교정 (2026-08-25 HTTP 확인)
WEBSITE_FIX = {
    # http://haeundae.hs.kr/ 은 DNS 미해결 → 고입정보포털 등재 주소로 교체
    'haewundae_high': 'http://school.busanedu.net/haeundae-h/',
    # hs.jne.kr 주소는 jge.hs.kr 로 리다이렉트된다 → 최종 주소로 교체
    'gwangyang_jecheol': 'https://gwangcheol.jge.hs.kr/',
}

def sigungu(addr, sido):
    """주소에서 시·군·구만 뽑는다 (도로명은 버림). 예) '경기도 용인시 처인구 모현읍 …' -> '용인시 처인구'"""
    parts = addr.split(' ')[1:]
    out = []
    for p in parts:
        if p.endswith(('시', '군', '구')) and not p.endswith(('로', '길')):
            out.append(p)
            if len(out) == 2:
                break
        elif out:
            break
    return ' '.join(out) if out else (parts[0] if parts else '')

def build_facts():
    out = {}
    for sid, idx, unit, status, cyear, foundation in ROSTER:
        m = MASTER[idx]
        addr = m['address'].split('(')[0].split(' , ')[0].strip().rstrip(',').strip()
        students = int(m['students'].replace(',', '')) if m['students'] else None
        g1 = m.get('grade1Classes')
        quota, applicants, rate, src = ADM2026.get(sid, (None, None, None, None))
        if quota is None and students:
            quota_est = int(round(students / 3 / 10.0) * 10)
        else:
            quota_est = None
        coed = {'남': '남고', '녀': '여고', '남녀공학': '남녀공학'}.get(m['coed'].strip(), m['coed'].strip())
        out[sid] = dict(
            id=sid, idx=idx, unit=unit, status=status, convertedYear=cyear, foundation=foundation,
            name=DISPLAY_NAME.get(sid, m['name']), portalName=m['name'], short=SHORT[sid],
            sido=m['sido'], address=addr, sigungu=sigungu(addr, m['sido']),
            homepage=(m['homepage'] or m.get('homepageNeis') or '').strip(),
            students=students, grade1Classes=g1, coed=coed,
            foundDate=m['foundDate'], foundForm=m['foundForm'], tel=m['tel'],
            dorm=DORM.get(sid, False),
            quota=quota, applicants=applicants, rate=rate, admSrcKey=src, quotaEstimate=quota_est,
        )
    return out

FACTS = build_facts()

if __name__ == '__main__':
    for k, v in FACTS.items():
        print(f"{k:24s} {v['short']:8s} {v['unit']} {v['status']:9s} {v['sido']:10s} {str(v['students']):>5s} "
              f"g1={v['grade1Classes']} quota={v['quota'] or v['quotaEstimate']} rate={v['rate']} dorm={v['dorm']} {v['homepage']}")
    print(len(FACTS))
