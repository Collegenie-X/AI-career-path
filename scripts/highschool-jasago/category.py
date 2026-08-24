# -*- coding: utf-8 -*-
import re, json
from facts import FACTS, ROSTER, SRC_ADM

SIDO_EMOJI = {'서울특별시': '🗼', '경기도': '🏙️', '인천광역시': '⚓', '부산광역시': '🌊', '대구광역시': '🍎',
              '대전광역시': '🔬', '울산광역시': '🏭', '강원특별자치도': '⛰️', '충청남도': '🌾',
              '전북특별자치도': '🌱', '전라남도': '🌿', '경상북도': '🏔️'}


def snu_count(entry):
    h = (entry.get('universityOutcomes') or {}).get('headline', '')
    m = re.search(r'서울대 최종 합격 ==(\d+)명==', h)
    return int(m.group(1)) if m else None


def cost_tag(entry):
    return next((t for t in entry.get('listTags', []) if '만원' in t or '무상' in t), '🟡 확인 필요')


def build(data):
    schools = {s['id']: s for s in data['schools']}
    order = [sid for sid, *_ in ROSTER]
    active = [sid for sid in order if FACTS[sid]['status'] == 'active']
    conv = [sid for sid in order if FACTS[sid]['status'] == 'converted']

    def row(sid, region_key='sido'):
        f, e = FACTS[sid], schools[sid]
        return {'name': f['short'], 'region': f['sido'] if region_key == 'sido' else f"{f['sido']} {f['sigungu']}",
                'tag': cost_tag(e)}

    # ── 축 1 · 시도 ──
    by_sido = {}
    for sid in active:
        by_sido.setdefault(FACTS[sid]['sido'], []).append(sid)
    sido_groups = []
    for sido, ids in sorted(by_sido.items(), key=lambda kv: -len(kv[1])):
        sido_groups.append({
            'label': f'{sido} · {len(ids)}개교', 'emoji': SIDO_EMOJI.get(sido, '📍'),
            'schools': [{'name': FACTS[i]['short'], 'region': FACTS[i]['sigungu'],
                         'tag': '전국 단위' if FACTS[i]['unit'] == '전국' else '광역'} for i in ids],
            'note': ('현행 자사고의 약 절반 — ==서울 거주 학생만 지원== 가능한 광역 단위 + 전국 단위 하나고'
                     if sido == '서울특별시' else ''),
        })
    sido_groups.append({
        'label': f'🔄 일반고 전환 · {len(conv)}개교', 'emoji': '🔄',
        'schools': [{'name': FACTS[i]['short'], 'region': f"{FACTS[i]['sido']} {FACTS[i]['sigungu']}",
                     'tag': f"{FACTS[i]['convertedYear']} 전환"} for i in conv],
        'note': '==지금은 자사고가 아닙니다.== 자사고였던 이력이 있어 참고용으로 함께 수록했습니다.',
    })

    # ── 축 2 · 선발 단위 ──
    nat = [i for i in active if FACTS[i]['unit'] == '전국']
    seoul = [i for i in active if FACTS[i]['unit'] == '광역' and FACTS[i]['sido'] == '서울특별시']
    local = [i for i in active if FACTS[i]['unit'] == '광역' and FACTS[i]['sido'] != '서울특별시']
    scope_groups = [
        {'label': f'🌏 전국 단위 모집 · {len(nat)}개교', 'emoji': '🌏',
         'note': '거주지 무관 지원. ==기숙이 사실상 전제==이고 경쟁률·학비가 모두 높습니다. 2026 평균 ==1.63:1==',
         'schools': [row(i) for i in nat]},
        {'label': f'🗼 서울 광역 모집 · {len(seoul)}개교', 'emoji': '🗼',
         'note': '서울 거주 학생 대상. ==통학형이라 총비용이 전국 단위보다 낮습니다.== 2026 평균 ==1.06:1==',
         'schools': [row(i, 'full') for i in seoul]},
        {'label': f'📍 시·도 광역 모집 · {len(local)}개교', 'emoji': '📍',
         'note': '해당 시·도 거주 학생 대상. ==학교별 경쟁률 편차가 가장 큰 그룹==입니다 (2026: 0.78:1 ~ 2.39:1)',
         'schools': [row(i, 'full') for i in local]},
        {'label': f'🔄 선발 없음 (일반고 전환) · {len(conv)}개교', 'emoji': '🔄',
         'note': '학교장 선발을 하지 않습니다. ==후기 일반고 배정==으로 입학합니다.',
         'schools': [{'name': FACTS[i]['short'], 'region': f"{FACTS[i]['sido']} {FACTS[i]['sigungu']}",
                      'tag': '🟢 무상교육 적용'} for i in conv]},
    ]

    # ── 축 3 · 학비대 ──
    tiers = {}
    for sid in order:
        tiers.setdefault(cost_tag(schools[sid]), []).append(sid)
    TIER_ORDER = ['🟢 무상교육 적용', '🟢 연 500~700만원대', '🟡 연 800~1,000만원대',
                  '🟠 연 900~1,300만원대', '💎 연 1,500만원 이상']
    TIER_NOTE = {
        '🟢 무상교육 적용': '==일반고 전환 학교==. 수업료 0원 + 수익자부담경비만 냅니다.',
        '🟢 연 500~700만원대': '==대기업 재단이 차액을 부담==하는 학교들 — 자사고 중 가성비 그룹',
        '🟡 연 800~1,000만원대': '광역 자사고의 일반적인 구간 (2024년 보도 평균치 기준)',
        '🟠 연 900~1,300만원대': '기숙사·급식 포함 구간',
        '💎 연 1,500만원 이상': '==3년이면 5,000만원 이상==. 사교육비는 별도입니다.',
    }
    tier_groups = []
    for t in TIER_ORDER + [k for k in tiers if k not in TIER_ORDER]:
        if t not in tiers:
            continue
        tier_groups.append({'label': f'{t} · {len(tiers[t])}개교', 'emoji': t.split(' ')[0],
                            'note': TIER_NOTE.get(t, ''),
                            'schools': [{'name': FACTS[i]['short'], 'region': FACTS[i]['sido'],
                                         'tag': '🛏️ 기숙' if FACTS[i]['dorm'] else '🚌 통학'} for i in tiers[t]]})

    # ── 축 4 · 기숙 ──
    dorm = [i for i in order if FACTS[i]['dorm']]
    commute = [i for i in order if not FACTS[i]['dorm']]
    dorm_groups = [
        {'label': f'🛏️ 기숙형 · {len(dorm)}개교', 'emoji': '🛏️',
         'note': '기숙사비가 등록금 위에 얹힙니다. 생활 리듬과 가계 부담을 함께 고려하세요.',
         'schools': [row(i) for i in dorm]},
        {'label': f'🚌 통학형 · {len(commute)}개교', 'emoji': '🚌',
         'note': '기숙사비가 없어 총액이 낮습니다. 대신 통학 시간이 학습 시간을 잠식할 수 있습니다.',
         'schools': [row(i) for i in commute]},
    ]

    # ── 축 5 · 서울대 실적 ──
    buckets = {'30+': [], '20-29': [], '10-19': [], 'none': []}
    for sid in order:
        c = snu_count(schools[sid])
        if c is None:
            buckets['none'].append(sid)
        elif c >= 30:
            buckets['30+'].append(sid)
        elif c >= 20:
            buckets['20-29'].append(sid)
        else:
            buckets['10-19'].append(sid)
    SNU_META = [
        ('30+', '🥇 서울대 30명 이상 (2026)', '🥇', '전국 최상위 그룹. ==정시 비중이 매우 높은 학교와 수시 강세 학교가 섞여 있습니다.=='),
        ('20-29', '🥈 서울대 20~29명 (2026)', '🥈', '==같은 구간이라도 수시/정시 비중이 정반대==인 학교들이 섞여 있습니다.'),
        ('10-19', '🥉 서울대 톱30 진입 (10~19명)', '🥉', '==재단 지원으로 학비 대비 실적이 좋은 구간==입니다.'),
        ('none', '📄 언론 톱30 밖 · 공시 확인 필요', '📄',
         '==합격자가 없다는 뜻이 아닙니다.== 언론 집계표(톱30)에 이름이 오르지 않았을 뿐이며, '
         '학교알리미 「졸업생의 진로 현황」에서 직접 확인해야 합니다.'),
    ]
    snu_groups = []
    for key, label, emoji, note in SNU_META:
        ids = buckets[key]
        if not ids:
            continue
        snu_groups.append({'label': f'{label} · {len(ids)}개교', 'emoji': emoji, 'note': note,
                           'schools': [{'name': FACTS[i]['short'], 'region': FACTS[i]['sido'],
                                        'tag': (f"{snu_count(schools[i])}명" if snu_count(schools[i]) else '공시 확인')}
                                       for i in ids]})

    # ── 축 6 · 지위 ──
    status_groups = [
        {'label': f'✅ 현행 자사고 · {len(active)}개교', 'emoji': '✅',
         'note': '2026-08-25 고입정보포털 자사고 목록 기준. ==대광고는 2026학년도 전환이 확정돼 전환 그룹으로 분류==했습니다.',
         'schools': [{'name': FACTS[i]['short'], 'region': FACTS[i]['sido'],
                      'tag': '전국 단위' if FACTS[i]['unit'] == '전국' else '광역'} for i in active]},
        {'label': f'🔄 일반고 전환 · {len(conv)}개교', 'emoji': '🔄',
         'note': '자사고 지정을 반납했거나 취소된 학교들. ==전환 이전 입학생은 졸업까지 자사고 교육과정==을 적용받습니다.',
         'schools': [{'name': FACTS[i]['short'], 'region': FACTS[i]['sido'],
                      'tag': f"{FACTS[i]['convertedYear']}학년도"} for i in conv]},
    ]

    tree = {
        'coreSentence': "자사고는 =='어느 자사고냐'에 따라 학비가 3배, 서울대 실적이 수십 명 차이==납니다. "
                        "==지위(현행/전환) · 시·도(지원 자격) · 선발 단위 · 학비대 · 기숙 여부 · 서울대 실적== "
                        "여섯 축으로 갈라 보세요.",
        'scopeNote': f"이 앱에는 ==현행 자사고 {len(active)}개교 + 일반고로 전환한 옛 자사고 {len(conv)}개교, 총 {len(order)}개교==를 수록했습니다. "
                     f"전국 단위 {len(nat)}개교를 제외한 나머지는 ==해당 시·도 거주자만 지원== 가능하므로, "
                     f"지위와 시·도가 사실상 첫 두 개 필터입니다.",
        'axes': [
            {'id': 'status', 'emoji': '🔍', 'label': '축 1 · 지위 — 지금도 자사고인가',
             'description': '==자사고 지정을 반납하는 학교가 계속 나옵니다.== 옛날 자료를 보고 지원했다가 헛걸음하는 일이 가장 흔한 실수예요.',
             'groups': status_groups},
            {'id': 'sido', 'emoji': '🗺️', 'label': '축 2 · 시도별 — 지원 자격이 되는가',
             'description': '광역 자사고는 ==해당 시·도 거주자만 지원==할 수 있습니다. 여기서 먼저 걸러집니다.',
             'groups': sido_groups},
            {'id': 'scope', 'emoji': '🎯', 'label': '축 3 · 선발 단위 — 어디까지 지원할 수 있나',
             'description': '전국 단위인지 광역인지가 ==경쟁률·학비·기숙 여부를 한꺼번에 결정==합니다.',
             'groups': scope_groups},
            {'id': 'tier', 'emoji': '💰', 'label': '축 4 · 학비대 — 3년 총액이 얼마인가',
             'description': "==연 0원(전환교)과 연 1,900만원(민사고)이 한 목록 안에== 있습니다. 3년 총액으로 환산해 보세요.",
             'groups': tier_groups},
            {'id': 'dorm', 'emoji': '🛏️', 'label': '축 5 · 기숙 여부 — 생활 형태와 추가 비용',
             'description': '기숙형은 연 300만~500만원이 추가됩니다.', 'groups': dorm_groups},
            {'id': 'snu', 'emoji': '🎓', 'label': '축 6 · 서울대 실적 — 2026 합격자 수',
             'description': '베리타스알파 2026 서울대 합격(최종) 톱30 집계 기준. '
                            '==연·고대를 포함한 SKY 전체 수치는 언론 집계에 없습니다.==',
             'groups': snu_groups},
        ],
        'pickGuide': data.get('schoolGroupTree', {}).get('pickGuide'),
    }
    if not tree['pickGuide']:
        tree.pop('pickGuide')

    # ── 비용 비교표 ──
    cost_rows = []
    for sid in order:
        f, e = FACTS[sid], schools[sid]
        cost_rows.append({
            'school': f['short'],
            'type': ('🔄 일반고 전환' if f['status'] == 'converted'
                     else '전국 단위' if f['unit'] == '전국'
                     else '서울 광역' if f['sido'] == '서울특별시' else '시·도 광역'),
            'tuition': '무상교육 적용' if f['status'] == 'converted' else '사립 (무상교육 미적용)',
            'beneficiary': ('급식·교복 등 수익자부담경비만' if f['status'] == 'converted'
                            else '기숙사·급식 별도' if f['dorm'] else '통학 — 기숙사비 없음'),
            'total': (e.get('costStructure') or {}).get('totalPerYear', ''),
            'program': f['foundation'] or '',
        })
    cost_comparison = {
        'title': f'자사고 {len(order)}개교 · 연간 비용 비교',
        'asOf': '2026학년도 기준 (공시·보도 자료 종합, 2026-08-25 갱신)',
        'keyInsight': "==같은 목록 안에 연 0원(일반고 전환교)과 연 1,900만원(민사고)이 공존==합니다. "
                      "전국 단위·기숙 필수 학교가 비싸고, 대기업 재단이 뒤에 있는 학교가 쌉니다. "
                      "==자사고를 포기하고 일반고로 전환한 학교는 수업료가 0원==이 됩니다.",
        'rows': cost_rows,
        'note': '금액은 대부분 언론 보도·유형 평균 기반 ==추정치==입니다. '
                '학교별 정확치는 학교알리미 「학교회계 예·결산서」에서 확인하세요.',
    }

    # ── 모집·경쟁률 비교표 ──
    adm_rows = []
    for sid in order:
        f = FACTS[sid]
        adm_rows.append({
            'school': f['short'],
            'capacity': f['quota'] or f['quotaEstimate'] or 0,
            'applicants': f['applicants'],
            'rate': ('일반고 배정' if f['status'] == 'converted' else (f['rate'] or '미공개')),
            'prev': (f"{f['convertedYear']}학년도 전환" if f['status'] == 'converted'
                     else f"1학년 {f['grade1Classes']}학급"),
            'trend': ('🔄 자사고 아님' if f['status'] == 'converted'
                      else '🌏 전국 단위' if f['unit'] == '전국'
                      else '🗼 서울 광역' if f['sido'] == '서울특별시' else '📍 시·도 광역'),
        })
    adm_comparison = {
        'title': '학교별 2026학년도 모집인원 · 경쟁률 비교',
        'summary': "2026학년도 ==전국 단위 10개교 평균 1.63:1==, ==서울 광역 14개교 평균 1.06:1==로 "
                   "두 그룹 모두 전년보다 하락했습니다. 비서울 광역은 인천포스코고 2.39:1부터 안산동산고 0.78:1까지 "
                   "==편차가 가장 큽니다.== 경쟁률이 공개되지 않은 학교의 모집인원은 "
                   "==NEIS 2026학년도 1학년 학급 수와 전체 재학생 수 기준 환산 추정치==입니다.",
        'rows': adm_rows,
        'insights': [
            '==경쟁률 1.0 미만(정원 미달) 학교가 늘고 있습니다.== 휘문고 0.50:1, 경희고 0.77:1, 안산동산고 0.78:1 등 — '
            '학비는 그대로인데 상위권 밀도는 예전 같지 않을 수 있으니 진학 실적 추이를 함께 보세요.',
            '==사회통합전형(정원 20% 내외)은 상시 미달 경향==입니다. 자격이 된다면 실질 경쟁률이 크게 낮아집니다.',
            '전국 단위 자사고는 광역보다 원서 접수가 빠릅니다. ==중복 지원 제한==을 미리 확인하세요.',
        ],
        'sources': [{'label': SRC_ADM['national'][0], 'url': SRC_ADM['national'][1]},
                    {'label': SRC_ADM['seoul'][0], 'url': SRC_ADM['seoul'][1]},
                    {'label': SRC_ADM['local'][0], 'url': SRC_ADM['local'][1]},
                    {'label': '고입정보포털 — 자율형사립고 학교 목록', 'url': 'https://www.hischool.go.kr/entrance/search.do?type=HSA03&detailtype=HSB04'},
                    {'label': 'NEIS 오픈 API — 학교기본정보/학급정보', 'url': 'https://open.neis.go.kr/'}],
    }
    return tree, cost_comparison, adm_comparison, active, conv, nat, seoul, local
