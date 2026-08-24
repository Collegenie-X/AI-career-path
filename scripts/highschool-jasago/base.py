# -*- coding: utf-8 -*-
"""신규 학교 기본 서술 생성 (검증 축에서만 유도)."""
from sections import SRC_PORTAL, SRC_SCHOOLINFO
from facts import convert_src

COLORS = ['#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#38bdf8', '#fb923c']


def color_for(sid):
    return COLORS[sum(ord(c) for c in sid) % len(COLORS)]


def unit_label(f):
    if f['status'] == 'converted':
        return f'{f["sido"]} 소재 · {f["convertedYear"]}학년도 일반고 전환'
    return '전국 단위 자율형사립고' if f['unit'] == '전국' else f'{f["sido"]} 광역 단위 자율형사립고'


def description(f):
    loc = f'{f["sido"]} {f["sigungu"]}'
    if f['status'] == 'converted':
        return (f'{loc} 소재. ==옛 자율형사립고로 {f["convertedYear"]}학년도부터 일반고로 전환==된 학교입니다. '
                f'수업료가 무상교육 대상이 되면서 학비 부담은 사라졌고, 자사고 시절의 교사진·시설·진학지도 인프라는 '
                f'상당 부분 유지됩니다. 현재 신입생은 자사고 전형이 아니라 ==후기 일반고 배정 절차==로 입학합니다.')
    if f['unit'] == '전국':
        return (f'{loc} 소재 ==전국 단위 자율형사립고==. 거주지 제한 없이 전국에서 지원할 수 있고 '
                f'==기숙 생활이 사실상 전제==입니다. 자율 편성 교육과정 + 장기 탐구(R&E) + 진학지도가 결합된 구조로, '
                f'전체 재학생 {f["students"]}명 규모입니다.')
    return (f'{loc} 소재 =={f["sido"]} 광역 단위 자율형사립고==. 해당 시·도 거주 학생만 지원할 수 있으며, '
            f'{"기숙사를 병설 운영합니다" if f["dorm"] else "통학이 기본이라 학원 병행이 가능합니다"}. '
            f'전체 재학생 {f["students"]}명 · 2026학년도 1학년 {f["grade1Classes"]}학급 규모입니다.')


def list_tags(f, cost_tag):
    tags = []
    if f['status'] == 'converted':
        tags.append(f'🔄 {f["convertedYear"]} 일반고 전환')
    elif f['unit'] == '전국':
        tags.append('🌏 전국 단위 모집')
    elif f['sido'] == '서울특별시':
        tags.append('🗼 서울 광역 모집')
    else:
        tags.append('📍 시·도 광역 모집')
    tags.append(cost_tag)
    tags.append('🛏️ 기숙형' if f['dorm'] else '🚌 통학형')
    if f['coed'] == '남고':
        tags.append('👦 남고')
    elif f['coed'] == '여고':
        tags.append('👧 여고')
    return tags


def school_info_card(f, total):
    q = f['quota'] or f['quotaEstimate']
    cap = f'연 {q}명' + ('' if f['quota'] else ' (추정)') + f' · 총 {f["students"]}명'
    if f['status'] == 'converted':
        return {
            'regionScope': f'{f["sido"]} 후기 일반고 배정 · 통학',
            'capacity': cap,
            'genderRatio': f['coed'],
            'dormitoryType': '기숙사 없음(통학)',
            'costPerYear': '수업료 0원 (고교 무상교육) · 수익자부담경비 연 60만~150만원 안팎',
            'scholarship': '교육급여·교육비 지원 신청 가능 (주소지 교육지원청)',
            'lowIncomeAdvice': '일반고 전환으로 수업료가 0원입니다. 급식·방과후 비용은 교육비 지원 대상이 될 수 있어요.',
        }
    return {
        'regionScope': ('전국 단위 선발 · 기숙' if f['unit'] == '전국'
                        else f'{f["sido"]} 광역 단위 선발 · ' + ('기숙 병설' if f['dorm'] else '통학')),
        'capacity': cap,
        'genderRatio': f['coed'],
        'dormitoryType': ('기숙사 운영 (전국 단위 학생 사실상 의무)' if (f['unit'] == '전국')
                          else ('기숙사 운영' if f['dorm'] else '기숙사 없음(통학)')),
        'costPerYear': total,
        'scholarship': '사회통합전형 20% 내외 의무 선발 · 국가장학금 신청 가능 · 교내 장학 학교별 확인',
        'lowIncomeAdvice': '사회통합전형은 상시 미달 경향이라 실질 경쟁률이 낮습니다. 학비 감면 폭도 커서 먼저 확인할 가치가 있어요.',
    }


def admission_qualifications(f):
    if f['status'] == 'converted':
        return {
            'mandatory': [f'{f["sido"]} 소재 중학교 졸업(예정)자',
                          '후기 일반고 지망 순위 작성',
                          '==자사고 전형(내신·자소서·면접)은 운영하지 않습니다=='],
            'recommended': ['고1 국어·수학·영어 선행', '관심 분야 독서·탐구 기록'],
            'interviewFormat': '면접 없음 — 일반고 배정 절차',
            'competitionRate': '해당 없음 (배정)',
            'aiTip': '입학 후 세특에서 갈립니다. AI는 검토자로만 쓰고 1차 사고는 직접 하는 습관을 지금부터 들이세요.',
        }
    scope = ('전국 (거주지 제한 없음)' if f['unit'] == '전국' else f'{f["sido"]} 거주(재학)')
    return {
        'mandatory': [f'지원 자격: {scope} 중학교 졸업(예정)자',
                      '전 과목 내신 A 수준 — 자사고 공통 기준',
                      '자기주도 학습 능력을 사례로 증명'],
        'recommended': ['리더십 경험 (학생회·동아리 대표)',
                        '관심 분야 장기 탐구 1~2개',
                        'AI 도구를 학습 코치로 쓴 구체적 경험'],
        'interviewFormat': '1단계 서류(내신·자기소개서) → 2단계 면접 (학교별 상이, 매년 모집요강 확인)',
        'competitionRate': (f'2026학년도 {f["rate"]}' if f['rate'] else '2026학년도 미공개 — 학교 설명회에서 확인'),
        'aiTip': "면접에서 'AI를 어디까지 쓰고 어디서 멈추는가'를 묻는 추세입니다. 사용 원칙을 문장으로 정리해 두세요.",
    }


def famous_programs(f):
    if f['status'] == 'converted':
        names = ['일반고 선택 교육과정', '방과후학교·심화강좌', '자율 동아리', '진학 상담·컨설팅']
        details = [
            {'name': '일반고 선택 교육과정', 'emoji': '📚',
             'description': '2015/2022 개정 교육과정 기준 선택과목 편성 — 자사고 시절보다 자율 편성 폭은 좁습니다',
             'benefit': '무상교육 + 학교 선택과목으로 학종 세특 확보'},
            {'name': '방과후학교·심화강좌', 'emoji': '🎯',
             'description': '학교 개설 방과후 프로그램 — 학교별 개설 과목은 홈페이지 공지 확인',
             'benefit': '사교육 대체 + 교내 활동 기록'},
            {'name': '자율 동아리', 'emoji': '🎭',
             'description': '학생 주도 동아리 — 자사고 시절 축적된 동아리 문화가 남아 있는 경우가 많음',
             'benefit': '진로 일관성 + 리더십 입증'},
            {'name': '진학 상담·컨설팅', 'emoji': '🧭',
             'description': '전담 진학지도 — 자사고 시절 노하우가 남아 있는지가 학교별 관전 포인트',
             'benefit': '수시·정시 전략 수립'},
        ]
        return names, details
    names = ['자율 편성 심화 교육과정', 'R&E·소논문 장기 탐구', '진로별 자율 동아리', '수시·정시 통합 진학지도']
    details = [
        {'name': '자율 편성 심화 교육과정', 'emoji': '📚',
         'description': '자사고는 ==교육과정 자율 편성권==을 가져 심화·선택과목을 학교가 직접 설계합니다',
         'benefit': '학종 교과 정성평가 + 수능 선택과목 대비 동시 확보'},
        {'name': 'R&E·소논문 장기 탐구', 'emoji': '🔬',
         'description': '1년 단위 연구 프로젝트 — 주제 선정부터 결론 수정까지 과정을 기록',
         'benefit': '==AI가 대신 못 하는 "직접 한 흔적"==이 남는 활동'},
        {'name': '진로별 자율 동아리', 'emoji': '🎭',
         'description': '의예·법정·경영·공학·인문 등 진로별 학생 주도 동아리',
         'benefit': '학종 비교과 진로 일관성 + 리더십 입증'},
        {'name': '수시·정시 통합 진학지도', 'emoji': '🧭',
         'description': '전담 진학교사 배치 — 학종·논술·정시를 함께 설계',
         'benefit': '2028 개편 대비 다중 트랙 전략'},
    ]
    return names, details


def admission_process(f):
    if f['status'] == 'converted':
        return [
            {'step': 1, 'title': '1단계: 후기 일반고 지원', 'detail': f'{f["sido"]} 고입 전형 기본계획에 따라 지망 순위 작성', 'icon': '📋'},
            {'step': 2, 'title': '2단계: 배정 발표', 'detail': '지망 순위·거주지 기준 배정 (학교장 선발 없음)', 'icon': '🎯'},
        ]
    return [
        {'step': 1, 'title': '1단계: 서류 평가', 'detail': '중학교 내신 + 자기소개서 종합 평가', 'icon': '📋'},
        {'step': 2, 'title': '2단계: 면접', 'detail': '자기주도 학습 경험 + 지원 동기 심층 면접', 'icon': '🎤'},
    ]


def career_path(f):
    if f['status'] == 'converted':
        return {'middle1': '전 과목 내신 A 유지 + 독서 습관',
                'middle2': '수학 선행(고1 과정) + 관심 분야 좁히기',
                'middle3': '후기 일반고 지망 순위 작성 + 고1 선행 마무리'}
    return {'middle1': '전 과목 내신 A등급 + 수학 선행 시작',
            'middle2': '자기주도 학습 포트폴리오 + 입학설명회 참석',
            'middle3': '자기소개서 완성 + 2단계 면접 대비'}


def pros_cons(f):
    if f['status'] == 'converted':
        return (['==수업료 0원== — 고교 무상교육 적용',
                 '자사고 시절 교사진·시설·동아리 문화가 상당 부분 유지',
                 '내신 경쟁 강도가 자사고 때보다 완화'],
                ['==교육과정 자율 편성권 축소== — 심화·선택과목 폭이 좁아짐',
                 '학교장 선발이 없어 학생 구성이 예전과 달라짐',
                 '전환 이후 진학 실적 데이터가 아직 적음'])
    if f['unit'] == '전국':
        return (['==전국 단위 모집== — 거주지 제한 없음',
                 '기숙 생활로 학습 시간 밀도가 높음',
                 '자율 편성 교육과정 + 장기 탐구 프로그램'],
                ['==연 900만~1,200만원대== 비용 (무상교육 미적용)',
                 '내신 경쟁이 매우 치열 — 상위권 밀집',
                 '기숙 생활 부적응 시 회복 공간이 없음'])
    return ([f'=={f["sido"]} 안에서 통학== — 가정과 분리되지 않음' if not f['dorm'] else '기숙사 병설로 통학 거리 부담 완화',
             '자사고 교육과정 + 진학지도를 받으며 학원 병행 가능',
             '사회통합전형 20% 의무 선발 — 실질 경쟁률 낮음'],
            ['==거주지 제한== — 해당 시·도 학생만 지원 가능',
             '무상교육 미적용 — 연 800만~1,000만원대 부담',
             '학원 의존이 깊어지면 자기주도 학습이 약해짐'])


def faq(f):
    n = f['short']
    if f['status'] == 'converted':
        return [
            {'category': '입시', 'question': f'{n}는 아직 자사고인가요?',
             'answer': f'아닙니다. =={f["convertedYear"]}학년도부터 일반고로 전환==됐습니다. '
                       f'전환 전에 입학한 재학생은 졸업까지 자사고 교육과정을 적용받지만, 신입생은 후기 일반고 배정 절차를 따릅니다.'},
            {'category': '비용', 'question': '학비는 얼마인가요?',
             'answer': '==입학금·수업료·학교운영지원비·교과서비가 0원==입니다(고교 무상교육). '
                       '급식·교복·방과후 등 수익자부담경비만 연 60만~150만원 안팎 부담합니다.'},
            {'category': '학습', 'question': '자사고 때 프로그램은 남아 있나요?',
             'answer': '교사진·시설·동아리 문화는 상당 부분 유지되지만 ==교육과정 자율 편성권이 줄어== 심화·선택과목 폭은 좁아집니다. '
                       '학교 홈페이지의 최신 교육과정 편성표로 직접 확인하세요.'},
        ]
    scope = '전국 어디서나 지원 가능합니다' if f['unit'] == '전국' else f'{f["sido"]} 거주(재학) 학생만 지원할 수 있습니다'
    return [
        {'category': '입시', 'question': '어느 지역에서 지원할 수 있나요?',
         'answer': f'{scope}. 정확한 자격은 매년 학교 홈페이지의 모집요강을 확인하세요.'},
        {'category': '비용', 'question': '자사고 학비가 부담됩니다.',
         'answer': '자사고는 무상교육 대상이 아니라 수업료를 직접 냅니다. 다만 ==사회통합전형(정원 20% 내외)==은 '
                   '학비 감면 폭이 크고 상시 미달 경향이라, 자격이 된다면 먼저 확인할 가치가 있습니다.'},
        {'category': '학습', 'question': '내신이 불리하지 않나요?',
         'answer': '상위권이 모이므로 내신은 불리해집니다. 다만 ==2028 대입부터 내신 5등급제==가 적용되어 '
                   '등급 압박이 일부 완화됩니다. 학종·논술·정시 중 주 무기를 정해 3년을 설계하세요.'},
        {'category': '생활', 'question': '기숙사 생활은 어떤가요?' if f['dorm'] else '통학 시간이 걱정입니다.',
         'answer': ('전원 또는 대부분이 기숙 생활을 합니다. 이동 시간이 사라지는 대신 회복 공간도 사라져요. '
                    '외박·귀가 규정을 설명회에서 꼭 확인하세요.') if f['dorm'] else
                   ('기숙사가 없어 매일 통학합니다. 편도 1시간이 넘으면 3년간 500시간 이상이 이동에 쓰입니다. '
                    '그 시간의 용도를 미리 정해 두세요.')},
    ]


def university_outcomes(f):
    if f['status'] == 'converted':
        return {
            'headline': f'{f["short"]}는 {f["convertedYear"]}학년도에 일반고로 전환됐습니다. '
                        f'==자사고 시절 실적과 전환 이후 실적을 섞어 보면 안 됩니다.==',
            'seoulAreaNote': '전환 이후 졸업생의 진학 실적은 ==학교 홈페이지 진학 실적 공지==와 '
                             '학교알리미 「졸업생의 진로 현황」 공시에서 확인하세요.',
            'dataConfidence': '언론 집계(서울대 톱30 등)에는 대체로 포함되지 않는 학교입니다. '
                              '전환 직후 3년간의 추이를 보는 것이 실체에 가장 가깝습니다.',
            'sources': [SRC_SCHOOLINFO, {'label': convert_src(f['id'])[0], 'url': convert_src(f['id'])[1]}],
        }
    return {
        'headline': '* 이 학교의 서울대 합격자 수는 ==언론 톱30 표에 포함되지 않았습니다==. '
                    '합격자가 없다는 뜻이 아니라 ==집계 기준(톱30)에 들지 않았다==는 뜻입니다.',
        'seoulAreaNote': 'SKY·서울권 전체 수치는 ==학교가 공식 발표하는 진학 실적 공지==에서 확인하세요. '
                         '언론 집계는 상위 학교의 서울대 실적만 다룹니다.',
        'dataConfidence': '학교알리미 「졸업생의 진로 현황」이 1차 출처입니다. '
                          '재수생 포함 여부에 따라 학교 발표와 언론 집계가 달라질 수 있습니다.',
        'sources': [SRC_SCHOOLINFO,
                    {'label': '베리타스알파 — 2026 서울대 합격(최종) 톱30',
                     'url': 'https://www.veritas-a.com/news/articleView.html?idxno=599166'}],
    }


def update_2028_ai(f):
    if f['status'] == 'converted':
        policy = (f'{f["short"]}는 {f["convertedYear"]}학년도에 일반고로 전환됐어요. '
                  f'2028 대입 개편(내신 5등급·통합사탐/통합과탐)은 일반고 기준으로 적용됩니다. '
                  f'내신 5등급제는 ==일반고 상위권에게 유리한 구조==라 전환이 오히려 기회가 될 수 있어요.')
        cautions = [f'현재 지위는 ==일반고==입니다. 자사고 전형은 없습니다.',
                    '자사고 시절 자료(학비·모집요강·경쟁률)를 지금 기준으로 오해하지 마세요.',
                    '교육과정 편성표를 확인해 심화·선택과목 폭을 직접 비교하세요.',
                    '전환 이후 진학 실적 추이를 3년 단위로 보세요.']
    else:
        policy = ('자사고는 2024년 시행령 개정으로 ==존치==가 결정됐지만, 학교별 자발적 일반고 전환은 계속 발생하고 있어요. '
                  '2028 대입에서는 ==내신 5등급제==가 적용돼 자사고의 내신 불리가 일부 완화됩니다. '
                  '대신 수능·세특의 변별력이 커져요.')
        cautions = ['입학 직전 ==해당 학교의 자사고 지위==를 다시 확인하세요 (전환 사례가 계속 나옵니다)',
                    '무상교육 미적용 — 3년 총비용을 가족과 먼저 합의하세요',
                    '내신 불리를 감수하고 얻는 것이 무엇인지 문장으로 답할 수 있어야 합니다',
                    '면접은 ==AI 활용 원칙==을 함께 묻는 추세입니다']
    return {
        'policy2028': policy,
        'aiEra': 'AI가 요약·번역·초안을 대신하면서 ==정리형 스펙의 값이 떨어졌습니다.== '
                 '남는 건 스스로 질문을 세우고 실패를 기록하고 결론을 고친 흔적이에요. '
                 '학교가 주는 장기 탐구·동아리 판을 실제로 쓰는 학생만 차이를 만듭니다.',
        'cautionPoints': cautions,
    }


def middle_school_guide(f, url):
    n = f['short']
    if f['status'] == 'converted':
        return {
            'oneLineAbout': f'==옛 자사고==였다가 =={f["convertedYear"]}학년도부터 일반고==가 된 학교예요. 학비 부담 없이 다닐 수 있어요.',
            'goodFor': [f'==={f["sido"]}=== 거주 + 통학 가능한 친구',
                        '==자사고 분위기는 좋지만 학비가 부담==이던 친구',
                        '내신을 안정적으로 챙기며 학종을 준비하고 싶은 친구'],
            'notForYouIf': ['==자사고 전형(학교장 선발)==으로 입학하고 싶은 경우 — 지금은 없습니다',
                            '==교육과정 자율 편성 폭==이 넓은 학교를 원하는 경우',
                            '기숙 생활을 원하는 경우'],
            'whatToDoNow': ['중1~중3 ==전 과목 A등급 유지==',
                            f'==={f["sido"]} 후기 일반고 배정 방식=== 확인 (지망 순위 작성법)',
                            '관심 분야 책 ==30권+== 독서 노트',
                            f'==={n} 홈페이지 교육과정 편성표=== 확인',
                            'AI는 ==검토자로만== 쓰는 습관 들이기'],
            'admissionTimeline': '12월: 후기 일반고 원서(지망 순위) → 1월~2월: ==배정 발표==',
            'competitionRate': '해당 없음 — 일반고 배정',
            'whatTheyCheck': ['별도 선발 전형 없음 (배정)', '입학 후에는 내신·세특이 전부'],
            'aiTipForMiddleSchooler': '고등학교는 어디를 가든 세특이 결과를 가릅니다. AI에 초안을 맡기는 습관은 지금 끊으세요.',
            'homepageMustCheck': '홈페이지에서 ① 교육과정 편성표 ② 방과후 개설 과목 ③ 최근 진학 실적 ④ 수익자부담경비를 확인하세요.',
            'homepageUrl': url,
        }
    scope = '전국 어디서나' if f['unit'] == '전국' else f'{f["sido"]} 거주'
    return {
        'oneLineAbout': f'=={unit_label(f)}==로 ==자기주도 학습 + 학생부 비교과== 강화에 적합해요.',
        'goodFor': [f'==={scope}=== 지원 가능한 친구',
                    '==스스로 계획하고 실행하는== 자기주도형',
                    '내신 불리를 감수하고 ==깊은 탐구==를 하고 싶은 친구'],
        'notForYouIf': ['==학비 부담==이 가족에 큰 경우',
                        '==내신 1등급을 안전하게== 확보하는 게 최우선인 경우',
                        ('==기숙 생활==이 맞지 않는 경우' if f['dorm'] else '==매일 통학==이 어려운 경우')],
        'whatToDoNow': ['중1~중3 ==전 과목 A등급 유지== + ==수학 선행==',
                        '관심 분야 책 ==30권+== 독서 노트 작성',
                        '자기 탐구 주제 ==1~2개로 미니 프로젝트==',
                        f'==={n} 입학설명회·홈페이지=== 정독',
                        'AI 도구는 ==학습 코치·검토자로만== 쓰는 습관'],
        'admissionTimeline': ('11월~12월: 원서 접수 → 12월: ==1단계 서류== → 12월말: ==2단계 면접== → 1월: ==합격 발표=='
                              if f['unit'] == '전국' else
                              '12월: 원서 접수 → 12월: ==1단계 서류== → 12월말~1월: ==2단계 면접== → 1월: ==합격 발표=='),
        'competitionRate': (f'2026학년도 {f["rate"]}' if f['rate'] else '2026학년도 미공개 — 학교 설명회에서 확인'),
        'whatTheyCheck': ['전 과목 내신 A등급',
                          '자기소개서: 자기주도 학습 + 지원 동기',
                          '면접: 학습 동기·탐구 과정·AI 활용 인식',
                          '비교과: 동아리·독서·봉사의 진로 일관성'],
        'aiTipForMiddleSchooler': "면접에서 'AI를 어떻게 쓰고 어디서 멈추는가'를 묻습니다. 1차 풀이는 직접 하세요.",
        'homepageMustCheck': '홈페이지에서 ① 모집요강 ② 최근 진학 실적 ③ 특화 프로그램 ④ 학비를 꼭 확인하세요.',
        'homepageUrl': url,
    }


def data_quality(f, total):
    q = f['quota'] or f['quotaEstimate']
    fields = {
        'name': {'dataType': 'verified', 'value': f['portalName'], 'source': '고입정보포털 학교 상세'},
        'location': {'dataType': 'verified', 'value': f['address'], 'source': '고입정보포털·NEIS 학교기본정보'},
        'type': {'dataType': 'verified', 'value': unit_label(f), 'source': '고입정보포털 학교유형 필터(자사고)'},
        'typeSourceUrl': SRC_PORTAL(f['idx'])['url'],
        'students': {'dataType': 'verified', 'value': f'전체 재학생 {f["students"]}명', 'source': '고입정보포털 학교 상세'},
        'gender': {'dataType': 'verified', 'value': f['coed'], 'source': '고입정보포털·NEIS'},
        'dormitory': {'dataType': 'verified' if f['unit'] == '전국' else 'estimate',
                      'value': '기숙사 운영' if f['dorm'] else '기숙사 없음(통학)',
                      'source': '학교 일반 안내'},
        'websiteUrl': {'dataType': 'verified', 'value': f['homepage'], 'source': '고입정보포털·NEIS 공식 홈페이지'},
        'annualAdmission': ({'dataType': 'verified', 'value': f'{q}명',
                             'source': '2026학년도 언론 집계 모집인원'} if f['quota'] else
                            {'dataType': 'estimate', 'actualEstimate': f'{q}명',
                             'source': f'NEIS 2026학년도 1학년 {f["grade1Classes"]}학급 · 전체 재학생 {f["students"]}명 기준 환산',
                             'note': '확정 인원은 학교 입학전형 요강 확인'}),
        'tuition': ({'dataType': 'verified', 'value': '수업료 0원 (고교 무상교육 적용)',
                     'source': '일반고 전환 — 고교 무상교육 대상'} if f['status'] == 'converted' else
                    {'dataType': 'estimate', 'actualEstimate': total,
                     'source': '베리타스알파 2024 고입잣대·문화일보 2025 자사고 학비 보도 기반 유형 평균',
                     'note': '학교별 정확치는 학교알리미 「학교회계 예·결산서」 PDF 확인'}),
    }
    if f['status'] == 'converted':
        fields['status'] = {'dataType': 'verified',
                            'value': f'{f["convertedYear"]}학년도 일반고 전환',
                            'source': convert_src(f['id'])[0]}
    return {
        'lastVerifiedDate': '2026-08-25',
        'entryCompleteness': 'full — 식별·모집·비용 축은 공식 출처 검증, 서술 콘텐츠는 유형 공통 패턴으로 생성',
        'schoolStatusVerified': (f'{f["convertedYear"]}학년도 일반고 전환 확인' if f['status'] == 'converted'
                                 else '고입정보포털 자사고 목록(2026-08-25 조회) 등재 확인'),
        'officialDisclosureUrl': 'https://www.schoolinfo.go.kr/',
        'fields': fields,
        'speculativeFields': ['realTalk', 'dailySchedule', 'survivalTips', 'studentLevel',
                              'famousPrograms(유형 공통)', 'alumniCareers(일반화)'],
        'caveat': '학교 식별·모집·지위는 고입정보포털/NEIS/언론으로 검증했습니다. '
                  '일과·분위기·프로그램 상세는 ==자사고 유형 공통 패턴==으로 서술한 것이므로 '
                  '학교 설명회·재학생 인터뷰로 별도 확인을 권합니다.',
    }
