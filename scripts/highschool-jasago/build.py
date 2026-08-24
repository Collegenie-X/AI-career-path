# -*- coding: utf-8 -*-
import json, os, copy, re
from facts import FACTS, ROSTER, SRC_ADM, convert_src, WEBSITE_FIX
import packs, sections, base

SRC = '/Users/kimjongphil/Documents/GitHub/AI-career-path/frontend/data/high-school/autonomous_private.json'
BACKUP = SRC + '.backup-2026-08-25-preexpand'

DATA = json.load(open(BACKUP if os.path.exists(BACKUP) else SRC, encoding='utf-8'))
if not os.path.exists(BACKUP):
    json.dump(DATA, open(BACKUP, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)

OLD = {s['id']: s for s in DATA['schools']}


def is_skeleton(e):
    return e is not None and 'skeleton' in json.dumps(e, ensure_ascii=False)


def build_school(f):
    sid = f['id']
    old = OLD.get(sid)
    converted = f['status'] == 'converted'
    skel = is_skeleton(old) or old is None or converted
    total, cost_tag = sections.cost_band(f)
    # 기존 엔트리에 학교별 실측/보도 기반 학비 문구가 있으면 그대로 보존 (전환 학교 제외)
    if old and not converted:
        old_total = (old.get('costStructure') or {}).get('totalPerYear')
        if old_total:
            total = old_total
        old_tag = next((t for t in (old.get('listTags') or []) if '만원' in t or '무상' in t), None)
        if old_tag:
            cost_tag = old_tag
    url = WEBSITE_FIX.get(sid) or (old or {}).get('websiteUrl') or f['homepage']
    if converted and old and sid not in WEBSITE_FIX:
        url = f['homepage']

    names, details = base.famous_programs(f)
    prosl, consl = base.pros_cons(f)
    q = f['quota'] or f['quotaEstimate']

    e = copy.deepcopy(old) if old else {}
    e['id'] = sid
    e['name'] = f['name']
    e['shortName'] = f['short']
    e.setdefault('location', f"{f['sido']} {f['sigungu']}")
    if converted or not old:
        e['location'] = f"{f['sido']} {f['sigungu']}"
    e['type'] = '일반고(옛 자사고)' if converted else '자율형사립고'
    e.setdefault('emoji', '🏫')
    e['color'] = (old or {}).get('color') or base.color_for(sid)
    if converted:
        e['difficulty'] = 3
    else:
        e.setdefault('difficulty', 5 if f['unit'] == '전국' else 4)
    e['annualAdmission'] = q
    e['annualAdmissionNote'] = ('2026학년도 언론 집계 모집인원' if f['quota']
                               else f"NEIS 2026학년도 1학년 {f['grade1Classes']}학급 기준 환산 추정")
    if converted:
        e['tuition'] = '수업료 0원 (고교 무상교육 적용) · 수익자부담경비 별도'
    elif not old or not old.get('tuition'):
        e['tuition'] = f"사립 {'전국' if f['unit'] == '전국' else '광역'} 자사고 ({total})"
    e['dormitory'] = f['dorm']
    e['ibCertified'] = False
    e['specialCertification'] = (f"{f['convertedYear']}학년도 일반고 전환 · 옛 {f['sido']} 광역 자사고" if converted
                                 else f"{base.unit_label(f)} · {f['coed']}")
    e['designationSource'] = {
        'label': '고입정보포털 — 자율형사립고 목록/학교 상세 (2026-08-25 조회)',
        'url': sections.SRC_PORTAL(f['idx'])['url'],
    }
    e['schoolBrief'] = (
        f"{f['portalName']} · {f['address']} · 설립 {f['foundDate']} · {f['coed']} · "
        f"전체 재학생 {f['students']}명 · 2026학년도 1학년 {f['grade1Classes']}학급 · 대표번호 {f['tel']}"
    )
    if skel:
        e['description'] = base.description(f)
        e['schoolInfoCard'] = base.school_info_card(f, total)
        e['admissionQualifications'] = base.admission_qualifications(f)
        e['famousPrograms'] = names
        e['famousProgramDetails'] = details
        e['admissionProcess'] = base.admission_process(f)
        e['careerPath'] = base.career_path(f)
        e['pros'] = prosl
        e['cons'] = consl
        e['faq'] = base.faq(f)
        e['update2028AI'] = base.update_2028_ai(f)
        e['middleSchoolGuide'] = base.middle_school_guide(f, url)
        e['universityOutcomes'] = (base.university_outcomes(f) if (converted or not old)
                                   else old.get('universityOutcomes') or base.university_outcomes(f))
        e['teachingMethod'] = ('일반고 교육과정 운영 — 자사고 시절 방과후·동아리 문화 일부 유지'
                               if converted else
                               ('자율 편성 교육과정 + 기숙 야간 자율학습 체계' if f['dorm']
                                else '자율 편성 교육과정 + 방과후 심화강좌 (통학 기반)'))
        e['studyStyleDetail'] = (
            '일반고 전환 이후에는 시·도 공통 교육과정을 기준으로 운영됩니다. 방과후학교·자율동아리 등 '
            '자사고 시절의 학습 문화가 남아 있는지는 학교 홈페이지 교육과정 편성표에서 직접 확인하세요.'
            if converted else
            ('기숙 생활 기반으로 야간 자율학습까지 학교 안에서 이어집니다. 이동 시간이 사라지는 대신 '
             '자기 학습 계획을 스스로 세우고 지키는 능력이 성패를 가릅니다.' if f['dorm'] else
             f"{f['sido']} 안에서 통학하며 학교 심화강좌와 학원을 병행하는 구조입니다. "
             f"학교 수업 이해도가 세특의 원천이므로 둘의 우선순위를 학기 초에 정리해야 합니다.")
        )
        e['studentLevel'] = ('중학교 내신 중상위권 이상 (일반고 배정)' if converted
                             else '중학교 내신 상위권 · 자기주도 학습 능력 우수')
        e['competitionLevel'] = ('일반고 수준 (배정)' if converted else
                                 (f"2026학년도 {f['rate']}" if f['rate'] else '학교 발표 확인 필요'))
        e['studyHoursPerDay'] = ('8~10시간 (통학 + 자율학습)' if not f['dorm'] else '10~12시간 (기숙 자율학습 포함)')
        e['selfStudyRatio'] = '60~70%' if not f['dorm'] else '70~80%'
        e['socialLife'] = ('통학 중심 학교생활 · 지역 친구 관계 유지' if not f['dorm']
                           else '기숙 공동생활 · 또래 밀도 높음')
        e['mentalHealthNote'] = ('학비 부담이 사라진 대신 내신 경쟁은 여전합니다. 자기 페이스 관리가 핵심.'
                                 if converted else
                                 ('기숙 생활은 회복 공간이 없어 번아웃 신호를 놓치기 쉽습니다.' if f['dorm']
                                  else '통학형은 학원 병행으로 수면이 먼저 깎입니다. 수면 관리가 곧 성적 관리.'))
        e['admissionTip'] = (f"{f['short']}는 현재 일반고입니다. 자사고 전형 준비가 아니라 "
                             f"{f['sido']} 후기 일반고 배정 절차를 먼저 확인하세요."
                             if converted else
                             f"{f['short']} 입학설명회에서 ①교육과정 편성표 ②최근 진학 실적 ③사회통합전형 요건 세 가지를 "
                             f"직접 받아오세요. 자기소개서는 그 자료에 맞춰 씁니다.")
        e['targetUniversities'] = ['서울대', '연세대', '고려대', '주요 인서울 대학']
        e['alumniCareers'] = ['학교 공식 진학 실적 공지 확인 권장']

    # ── 항상 갱신/보강 ──
    e['websiteUrl'] = url
    e['listTags'] = base.list_tags(f, cost_tag)
    if converted:
        e['regionProgramSummary'] = (
            f"=={f['sido']} 후기 일반고 배정== · {f['convertedYear']}학년도 자사고 → 일반고 전환 · 수업료 0원(무상교육)")
    else:
        scope_txt = '==전국 어디서나 지원==' if f['unit'] == '전국' else f"=={f['sido']} 거주 학생만 지원=="
        rate_txt = f"2026 경쟁률 {f['rate']}" if f['rate'] else '2026 경쟁률 미공개'
        e['regionProgramSummary'] = (
            f"{scope_txt} · 연 모집 {q}명" + ('' if f['quota'] else '(추정)') + f" · {rate_txt}")

    if not e.get('highlightStats') or skel:
        e['highlightStats'] = packs.highlight_stats(f)
    if not e.get('careerPathDetails') or skel:
        e['careerPathDetails'] = packs.career_path_details(f)
    if not e.get('realTalk') or skel:
        e['realTalk'] = packs.real_talk(f)
    if not e.get('dailySchedule') or skel:
        e['dailySchedule'] = packs.daily_schedule(f)
    if not e.get('survivalTips') or skel:
        e['survivalTips'] = packs.survival_tips(f)
    e['futureOutlook'] = packs.future_outlook(f)

    e['admissionFacts'] = sections.admission_facts(f)
    e['regionalLinkage'] = sections.regional_linkage(f)

    if skel or not e.get('costStructure'):
        e['costStructure'] = sections.cost_structure(f, total)
    else:
        gen = sections.cost_structure(f, e['costStructure'].get('totalPerYear') or total)
        e['costStructure'].setdefault('quickTiles', gen['quickTiles'])
        e['costStructure'].setdefault('periodTable', gen['periodTable'])
        srcs = e['costStructure'].get('sources') or []
        if not any(s['url'].startswith('https://www.hischool') for s in srcs):
            srcs.append(sections.SRC_PORTAL(f['idx']))
        e['costStructure']['sources'] = srcs

    # 학교 정보 카드 정합성
    card = e.get('schoolInfoCard') or base.school_info_card(f, total)
    card['capacity'] = f"연 {q}명" + ('' if f['quota'] else ' (추정)') + f" · 총 {f['students']}명"
    if converted:
        card['regionScope'] = f"{f['sido']} 후기 일반고 배정 · 통학"
        card['costPerYear'] = '수업료 0원 (고교 무상교육) · 수익자부담경비 연 60만~150만원 안팎'
    e['schoolInfoCard'] = card

    # SectionShell subtitle 로 그대로 출력되는 필드(HL 파서를 안 탐) — 마커 제거
    if e.get('costStructure', {}).get('asOf'):
        e['costStructure']['asOf'] = e['costStructure']['asOf'].replace('==', '')
    if e['admissionFacts'].get('categoryAverage'):
        e['admissionFacts']['categoryAverage'] = e['admissionFacts']['categoryAverage'].replace('==', '')

    e['dataQuality'] = base.data_quality(f, total)
    e['verifiedNote'] = (
        f"2026-08-25 확인 · 고입정보포털 idx={f['idx']} ({sections.SRC_PORTAL(f['idx'])['url']}) + "
        f"NEIS 학교기본정보/학급정보(2026학년도 1학년 {f['grade1Classes']}학급)"
        + (f" · 일반고 전환: {convert_src(sid)[1]}" if converted else '')
        + (f" · 2026 경쟁률: {SRC_ADM[f['admSrcKey']][1]}" if f['rate'] else '')
    )
    e['verificationChecklist'] = [
        '학교 홈페이지 최신 모집요강(또는 배정 안내) 확인',
        '학교알리미 「학교회계 예·결산서」로 실제 학부모부담금 확인',
        '학교알리미 「졸업생의 진로 현황」으로 진학 실적 확인',
        '입학설명회에서 교육과정 편성표 원본 수령',
    ]
    return e


HL_RE = re.compile(r'={3,}')


def sanitize(node):
    """GlossaryText 파서(/==([^=]+)==/)가 깨지지 않도록 하이라이트 마커를 정리한다.
    - `===텍스트===` 처럼 3개 이상 연속된 `=`는 `==`로 접는다 (남는 `=`가 화면에 그대로 보이던 문제).
    - 하이라이트 안에 들어간 `=`는 `→`로 바꾼다 (파서가 구간을 잘못 끊는다)."""
    if isinstance(node, dict):
        return {k: sanitize(v) for k, v in node.items()}
    if isinstance(node, list):
        return [sanitize(v) for v in node]
    if not isinstance(node, str):
        return node
    t = HL_RE.sub('==', node)
    parts = t.split('==')
    if len(parts) % 2 == 1:  # 마커가 짝을 이룰 때만 내부 치환
        for i in range(1, len(parts), 2):
            parts[i] = parts[i].replace('=', '→')
        t = '=='.join(parts)
    return t


def main():
    import category
    schools = [build_school(FACTS[sid]) for sid, *_ in ROSTER]
    DATA['schools'] = schools
    tree, cost_cmp, adm_cmp, active, conv, nat, seoul, local = category.build(DATA)
    DATA['schoolGroupTree'] = tree
    DATA['costComparison'] = cost_cmp
    DATA['admissionFactsComparison'] = adm_cmp
    DATA['verificationStatus'] = {
        'lastVerifiedDate': '2026-08-25',
        'rebuildReason': (
            '2026-08-25 전면 확장. ① 고입정보포털 자사고 목록(HSA03/HSB04)과 대조해 로스터를 정정했습니다 — '
            '이미 일반고로 전환한 이대부고·대건고를 「전환」으로 재분류하고, 누락돼 있던 부일고(부산)를 추가했습니다. '
            '② 자사고에서 일반고로 전환한 13개교를 별도 그룹으로 수록해 "옛 자사고"를 찾는 경우에도 정확한 현재 지위를 보여줍니다. '
            '③ 33개교 중 20개교가 skeleton 상태였던 것을 전 학교 동일 스펙(모집 팩트·비용 3층·지역 연계·리얼톡·일과·생존팁)으로 채웠습니다.'
        ),
        'scope2026': {
            '전국단위_자사고': len(nat),
            '광역단위_자사고_서울': len(seoul),
            '광역단위_자사고_비서울': len(local),
            '현행_자사고_합계': len(active),
            '일반고_전환_수록': len(conv),
            '총_수록_학교': len(active) + len(conv),
            '비고': ('고입정보포털 자사고 목록(2026-08-25 조회)은 33개교이지만, 그중 대광고는 2026학년도부터 '
                    '일반고로 전환돼 이 앱에서는 「전환」 그룹으로 분류했습니다. 포털 반영이 늦은 케이스입니다. '
                    '교육부 2024.1 자사고 존치 결정 이후에도 학교별 자발적 일반고 전환은 계속 발생 중입니다.'),
        },
        'dataQualityNote': (
            '학교 식별 정보(학교명·주소·설립구분·남녀구분·전체 재학생수·공식 홈페이지·대표번호)는 '
            '==고입정보포털 학교 상세==와 ==NEIS 오픈 API==에서 직접 수집했습니다. '
            '2026학년도 모집인원·경쟁률은 30개교가 언론 집계로 검증됐고, 나머지는 '
            '==NEIS 2026학년도 1학년 학급 수 + 전체 재학생 수 기준 환산 추정치==로 표시했습니다. '
            '등록금 수치는 여전히 대부분 estimate 등급입니다 — 학교알리미가 JavaScript 동적 로딩이라 자동 수집이 막혀 있어, '
            '언론 보도(국회 교육위 제출자료·베리타스알파 고입잣대) 기반 총액을 기록했습니다. '
            "정확한 수치는 학교알리미 → '학교회계 예·결산서' PDF를 직접 확인하세요."
        ),
        'primarySources': [
            {'title': '고입정보포털 — 자율형사립고 학교 목록(HSA03/HSB04)',
             'url': 'https://www.hischool.go.kr/entrance/search.do?type=HSA03&detailtype=HSB04',
             'usedFor': '현행 자사고 로스터 확정 · 학교별 주소/홈페이지/재학생수/설립구분'},
            {'title': 'NEIS 오픈 API — 학교기본정보 · 학급정보(2026학년도 1학년)',
             'url': 'https://open.neis.go.kr/',
             'usedFor': '공식 홈페이지 URL 교차검증 · 1학년 학급 수 기반 모집인원 추정'},
            {'title': '베리타스알파 — [2026전국자사고경쟁률] 10개교 1.63대1',
             'url': 'https://www.veritas-a.com/news/articleView.html?idxno=589980',
             'usedFor': '전국 단위 10개교 2026 모집인원·지원자·경쟁률'},
            {'title': '베리타스알파 — [2026광역자사고경쟁률] 서울 14개교 1.06대1',
             'url': 'http://www.veritas-a.com/news/articleView.html?idxno=587835',
             'usedFor': '서울 광역 14개교 2026 모집인원·지원자·경쟁률'},
            {'title': '교육을 비추다 — 2026 비서울 광역자사고 경쟁률',
             'url': 'https://www.kyobit.com/news/articleView.html?idxno=2932',
             'usedFor': '비서울 광역 6개교 2026 경쟁률'},
            {'title': '메트로서울 — 대광고 2026 일반고 전환(서울 12번째 사례)',
             'url': 'https://www.metroseoul.co.kr/article/20250824500010',
             'usedFor': '서울 자사고 → 일반고 전환 12개교 목록·연도'},
            {'title': '교육플러스 — 대구 대건고 자사고 지위 포기, 일반고 전환',
             'url': 'https://www.edpl.co.kr/news/articleView.html?idxno=6740',
             'usedFor': '대건고(대구) 2023학년도 전환 근거'},
            {'title': '베리타스알파 — 2026 서울대 합격(최종) 톱30',
             'url': 'https://www.veritas-a.com/news/articleView.html?idxno=599166',
             'usedFor': '학교별 2026 서울대 실적'},
            {'title': '교육부 정책브리핑 — 2024.1 자사고·외고·국제고 존치 시행령 개정',
             'url': 'https://www.korea.kr/news/policyNewsView.do?newsId=148866386',
             'usedFor': '자사고 존치 결정·정책 변동 위험 근거'},
            {'title': '문화일보 2025.9.16 — 자사고 학비 평균 1000만원, 민사고 3200만원',
             'url': 'https://www.munhwa.com/article/11533969',
             'usedFor': '자사고 학비 추정 근거'},
            {'title': '학교알리미 schoolinfo.go.kr',
             'url': 'https://www.schoolinfo.go.kr/',
             'usedFor': '학교별 학교회계·졸업생 진로 현황 1차 출처'},
        ],
        'speculativeFieldsCaveats': (
            '다음 필드는 학교 단위 1차 자료가 없어 ==선발 단위·기숙 여부·현행/전환 지위·성별·시·도== 다섯 개 '
            '검증 축에서 유형 공통 패턴으로 생성한 서술입니다 — realTalk, dailySchedule, survivalTips, '
            'famousPrograms/famousProgramDetails, studentLevel, alumniCareers, faq 답변. '
            '학교 단위 정확성은 학교 설명회·재학생 인터뷰로 별도 검증을 권합니다. '
            "사실 기반 필드는 각 학교 dataQuality.fields에서 'verified'로 표시했습니다."
        ),
    }
    # ── 연혁·재지정 서술의 사실 정정 (대광고 소재지·전환 규모) ──
    ch = DATA['institutionHistory']['chronology'][6]
    ch['event'] = '이대부고·대광고 연속 자발적 일반고 전환'
    ch['detail'] = ('이대부고가 2025학년도, 서울 동대문구 대광고가 2026학년도 신입생부터 일반고로 전환. '
                    '두 학교 모두 학비 부담 대비 차별화 어려움과 학생 모집 경쟁력 약화를 이유로 자사고 지정을 자발적으로 반납했다. '
                    '서울 광역단위 16 → 14개교로 감소')
    ch['schoolCount'] = len(active)
    ch['significance'] = ('자사고 지정이 영구적이지 않음을 보여주는 사례. 5년 재지정 심사 외에도 학교법인이 스스로 반납할 수 있으며, '
                          '학령인구 감소 국면에서 이 흐름은 계속되고 있다')
    dc = DATA['institutionHistory']['reDesignationSystem']['daegwangCase']
    dc['school'] = '대광고등학교 (서울 동대문구 신설동)'
    dc['impact'] = '서울 광역단위 자사고 16 → 14개교 (2025 이대부고 + 2026 대광고 연속 전환)'
    if DATA.get('schoolGroupTree', {}).get('pickGuide'):
        DATA['schoolGroupTree']['pickGuide'][0] = (
            f'1단계 — ==거주 시·도==로 지원 가능한 학교를 먼저 추린다 (전국 단위 {len(nat)}개교는 예외).')

    clean = sanitize(DATA)
    json.dump(clean, open('out.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    print('schools:', len(schools))
    for s in schools:
        print(f"  {s['id']:24s} {s['shortName']:10s} {s['annualAdmission']:>4}명  {len(json.dumps(s, ensure_ascii=False)):>6d}b  {s['listTags']}")


if __name__ == '__main__':
    main()
