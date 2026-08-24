# -*- coding: utf-8 -*-
"""학교별 렌더 섹션(비용·모집·지역연계) 생성."""
from facts import SRC_ADM, convert_src

SRC_SCHOOLINFO = {'label': '학교알리미 (학교회계·1인당 교육비 공시)', 'url': 'https://www.schoolinfo.go.kr/'}
SRC_FREE = {'label': '고교 무상교육 안내(정책브리핑)',
            'url': 'https://www.korea.kr/special/policyCurationView.do?newsId=148900332'}
def SRC_PORTAL(idx):
    return {'label': '고입정보포털 학교 상세', 'url': f'https://www.hischool.go.kr/school/view.do?idx={idx}'}


# ────────────────────────── 비용 ──────────────────────────
def cost_band(f):
    """(총액 문구, 학비 태그 이모지+라벨)"""
    if f['status'] == 'converted':
        return '수업료 0원 (고교 무상교육 적용) · 수익자부담경비 별도', '🟢 무상교육 적용'
    if f['dorm']:
        return '연 학부모부담금 약 900~1,200만원대 (기숙사 포함)', '🟠 연 900~1,300만원대'
    return '연 학부모부담금 약 800~1,000만원대 (2024 보도 평균치)', '🟡 연 800~1,000만원대'


def cost_structure(f, total=None):
    total = total or cost_band(f)[0]
    idx = f['idx']
    if f['status'] == 'converted':
        return {
            'asOf': f'2026학년도 기준 · 일반고 전환({f["convertedYear"]}학년도)으로 고교 무상교육 적용 · 학교 기본정보는 2026-08-25 고입정보포털 확인',
            'headline': f'{f["short"]}는 {f["convertedYear"]}학년도부터 일반고로 운영되어 '
                        f'==입학금·수업료·학교운영지원비·교과서비가 모두 0원==입니다. '
                        f'자사고 시절 연 수백만~1,000만원대이던 1층 비용이 사라진 구조예요.',
            'totalPerYear': '수업료 0원 + 수익자부담경비',
            'totalNote': '고교 무상교육은 입학금·수업료·학교운영지원비·교과서비 4개 항목을 지원합니다.',
            'actualPayNote': '실제로 내는 돈은 급식비·교복·현장체험·방과후 등 ==수익자부담경비==뿐입니다.',
            'quickTiles': [
                {'emoji': '🟢', 'label': '안 내는 돈', 'value': '입학금·수업료·학교운영지원비·교과서비',
                 'sub': '고교 무상교육 4개 항목', 'tone': 'free'},
                {'emoji': '🟡', 'label': '실제로 내는 돈', 'value': '연 60만~150만원 안팎',
                 'sub': '급식·교복·현장체험·방과후 (학교별 상이)', 'tone': 'pay'},
                {'emoji': '🔵', 'label': '자사고였다면', 'value': '연 800만~1,000만원대',
                 'sub': f'{f["convertedYear"]}학년도 전환 전 기준 추정', 'tone': 'get'},
            ],
            'periodTable': {
                'title': '월 / 연 / 3년으로 보면',
                'rows': [
                    {'label': '학비 (입학금·수업료·학교운영지원비·교과서비)', 'monthly': '0원', 'yearly': '0원',
                     'threeYear': '0원', 'tone': 'free', 'note': '고교 무상교육 4개 항목 — 일반고 전환의 가장 큰 실익'},
                    {'label': '기숙사비', 'monthly': '0원', 'yearly': '0원', 'threeYear': '0원',
                     'tone': 'free', 'note': '통학형'},
                    {'label': '급식·교복·현장체험·방과후', 'monthly': '약 5만~13만원', 'yearly': '약 60만~150만원',
                     'threeYear': '약 180만~450만원', 'tone': 'pay',
                     'note': '==추정 범위입니다.== 학교·학년별 편차가 큽니다'},
                    {'label': '교육급여·교육비 지원 (저소득 가정)', 'monthly': '—', 'yearly': '대상자',
                     'threeYear': '대상자', 'tone': 'get', 'note': '주소지 교육지원청에서 신청'},
                    {'label': '자사고였다면 냈을 등록금', 'monthly': '약 65만~85만원', 'yearly': '약 800만~1,000만원',
                     'threeYear': '약 2,400만~3,000만원', 'tone': 'free',
                     'note': '==전환으로 사라진 부담== · 전환 전 유형 평균 추정'},
                ],
                'note': '정확한 금액은 학교알리미 「학부모부담경비」 공시에서 확인하세요. 위 수치는 유형 평균 추정입니다.',
            },
            'programTracks': [
                {'track': '등록금 (1층)', 'emoji': '🟢', 'tuition': '0원',
                 'extra': '입학금·수업료·학교운영지원비·교과서비 전액 지원',
                 'yearTotal': '0원', 'note': '==일반고 전환의 가장 큰 실익=='},
                {'track': '수익자부담경비 (2층)', 'emoji': '🟡', 'tuition': '실비',
                 'extra': '급식·교복·현장체험·방과후',
                 'yearTotal': '연 약 60만~150만원', 'note': '학교별·학년별 편차'},
                {'track': '장학·지원 (3층)', 'emoji': '🔵', 'tuition': '교육급여·교육비 지원',
                 'extra': '저소득 가정 급식·방과후 지원',
                 'yearTotal': '실납부를 더 낮추는 층', 'note': '주소지 교육지원청에서 신청'},
            ],
            'notes': [
                f'{f["convertedYear"]}학년도 전환 ==이전에 입학한 재학생==은 졸업까지 자사고 교육과정을 적용받습니다.',
                '무상교육은 수업료 계열 4개 항목만 지원합니다. 급식·교복은 별도예요.',
                '==자사고 시절 학비 자료를 지금 비용으로 오해하지 마세요.== 지금은 일반고 기준입니다.',
            ],
            'sources': [SRC_FREE, SRC_SCHOOLINFO, SRC_PORTAL(idx), {'label': convert_src(f['id'])[0], 'url': convert_src(f['id'])[1]}],
        }

    dorm = f['dorm']
    return {
        'asOf': '2026학년도 기준 · 고교 무상교육 미적용 · 학교 기본정보는 2026-08-25 고입정보포털 확인',
        'headline': f'이 학교의 연간 비용은 =={total}== 수준입니다. '
                    f'자사고는 무상교육 대상이 아니라 ==등록금을 학교에 직접 납부==합니다.',
        'totalPerYear': total.split(' (')[0],
        'totalNote': '공시 학비 기준. 실제 납부액은 방과후·기숙 여부에 따라 달라집니다.',
        'actualPayNote': ('기숙사비·급식비(3식)가 등록금 위에 그대로 얹힙니다.' if dorm
                          else '통학형이라 기숙사비가 없습니다. 총액이 기숙형보다 크게 낮습니다.'),
        'quickTiles': [
            {'emoji': '🔴', 'label': '내는 돈 · 등록금', 'value': '연 500만~1,500만원대',
             'sub': '입학금·수업료·학교운영지원비·교과서비', 'tone': 'pay'},
            ({'emoji': '🛏️', 'label': '내는 돈 · 기숙사', 'value': '연 300만~500만원',
              'sub': '기숙사비 + 급식 3식', 'tone': 'pay'} if dorm else
             {'emoji': '🚌', 'label': '기숙사비', 'value': '0원',
              'sub': '통학형 — 2층 비용 없음', 'tone': 'free'}),
            {'emoji': '🔵', 'label': '받는 돈 · 지원', 'value': '사회통합전형 학비 감면',
             'sub': '정원 20% 내외 · 교내 장학금 별도', 'tone': 'get'},
        ],
        'periodTable': {
            'title': '월 / 연 / 3년으로 보면',
            'rows': [
                {'label': '등록금 (입학금·수업료·학교운영지원비·교과서비)',
                 'monthly': '약 50만~85만원', 'yearly': '약 600만~1,000만원',
                 'threeYear': '약 1,800만~3,000만원', 'tone': 'pay',
                 'note': '==자공고·일반고는 이 항목이 0원== · 재단 지원이 큰 학교는 크게 낮아집니다'},
                ({'label': '기숙사비 + 급식(3식)', 'monthly': '약 25만~40만원', 'yearly': '약 300만~500만원',
                  'threeYear': '약 900만~1,500만원', 'tone': 'pay',
                  'note': '==추정 범위입니다.== 전국 단위 자사고는 사실상 필수'} if dorm else
                 {'label': '기숙사비', 'monthly': '0원', 'yearly': '0원', 'threeYear': '0원',
                  'tone': 'free', 'note': '통학형 — 기숙사비가 없어 총액이 크게 낮습니다'}),
                {'label': '교복·교재·활동비', 'monthly': '—', 'yearly': '수십만원대',
                 'threeYear': '수백만원대', 'tone': 'pay', 'note': '학교·학년별 편차'},
                {'label': '사회통합전형 학비 감면', 'monthly': '—', 'yearly': '대상자',
                 'threeYear': '대상자', 'tone': 'get',
                 'note': '==정원 20% 내외 의무 선발== · 상시 미달 경향이라 실질 경쟁률이 낮습니다'},
                {'label': '재단 전입금 (공시 학비와 1인당 교육비의 차액)', 'monthly': '—', 'yearly': '학교별',
                 'threeYear': '학교별', 'tone': 'get',
                 'note': '학교알리미 1인당 교육비와 비교하면 재단이 실제로 넣는 돈이 보입니다'},
                {'label': '일반고(무상) 대비 3년 순증분', 'monthly': '—', 'yearly': '—',
                 'threeYear': ('약 2,700만~4,500만원' if dorm else '약 1,800만~3,000만원'),
                 'tone': 'pay', 'note': '==사교육비는 여기에 포함되지 않았습니다.=='},
            ],
            'note': '학교별 정확치는 학교알리미 「학교회계 예·결산서」 PDF에서 확인하세요. 위 수치는 유형 평균 추정입니다.',
        },
        'programTracks': [
            {'track': '등록금 (1층)', 'emoji': '🔴', 'tuition': '유상',
             'extra': '입학금·수업료·학교운영지원비·교과서비', 'yearTotal': total.split(' (')[0],
             'note': '==자공고·일반고는 이 항목이 0원=='},
            ({'track': '기숙사·급식 (2층)', 'emoji': '🛏️', 'tuition': '별도 부담',
              'extra': '기숙사비 + 급식 3식 + 교재·활동비',
              'yearTotal': '연 300만~500만원 추가', 'note': '전국 단위 자사고는 사실상 필수'} if dorm else
             {'track': '통학 (2층 없음)', 'emoji': '🚌', 'tuition': '별도 없음',
              'extra': '급식·교재·활동비', 'yearTotal': '기숙사비 없음', 'note': '총액이 기숙형보다 낮은 구조'}),
            {'track': '재단 지원·장학금 (3층)', 'emoji': '🔵', 'tuition': '학교 재단·교내 장학금',
             'extra': '사회통합전형 학비 지원 대상 여부 확인', 'yearTotal': '실납부를 낮추는 층',
             'note': "학교알리미 '1인당 교육비'와 비교해 보세요"},
        ],
        'notes': [
            ('전국 단위 기숙형은 등록금 위에 기숙사비가 얹혀 총액이 커집니다.' if dorm
             else '통학형이라 기숙사비가 없습니다.'),
            "==공시 학비만 보지 말고 학교알리미 '1인당 교육비'를 함께 확인==하세요. 차액이 재단 지원분입니다.",
            '사회통합전형 대상이라면 학비 감면 폭이 큽니다 — 학교 모집요강에서 자격을 확인하세요.',
        ],
        'sources': [SRC_SCHOOLINFO, SRC_FREE, SRC_PORTAL(idx)],
    }


# ────────────────────────── 모집 팩트 ──────────────────────────
def admission_facts(f):
    idx = f['idx']
    if f['status'] == 'converted':
        return {
            'year': '2026학년도',
            'capacityTotal': f['quotaEstimate'] or 0,
            'applicantsTotal': None,
            'overallRate': '해당 없음 (일반고 배정)',
            'tracks': [
                {'name': '후기 일반고 배정', 'capacity': f['quotaEstimate'], 'applicants': None,
                 'rate': '자기 선택 + 추첨 배정',
                 'note': f'{f["convertedYear"]}학년도부터 ==학교장 선발(자사고 전형)을 하지 않습니다.=='},
            ],
            'note': f'모집인원은 ==NEIS 2026학년도 1학년 {f["grade1Classes"]}학급== 기준 환산 추정치입니다. '
                    f'실제 배정 인원은 시·도 교육청 고입 전형 기본계획을 따릅니다.',
            'sources': [SRC_PORTAL(idx), {'label': convert_src(f['id'])[0], 'url': convert_src(f['id'])[1]}],
        }
    q, a, r = f['quota'], f['applicants'], f['rate']
    src = SRC_ADM.get(f['admSrcKey'])
    if r:
        cap = q or f['quotaEstimate']
        tracks = [
            {'name': '일반전형', 'capacity': (int(cap * 0.8) if cap else None), 'applicants': None,
             'rate': r, 'note': '정원의 약 80% — 학교별 편성 비율은 모집요강 확인'},
            {'name': '사회통합전형', 'capacity': (int(cap * 0.2) if cap else None), 'applicants': None,
             'rate': '상시 미달 경향', 'note': '==정원 20% 내외 의무 선발== · 미달 시 일반전형 이월(학교별 비율 상이)'},
        ]
        avg = {'national': '전국 단위 자사고 10개교 평균 ==1.63:1== (2026)',
               'seoul': '서울 광역 자사고 14개교 평균 ==1.06:1== (2026)',
               'local': '비서울 광역 자사고 평균 — 학교별 편차가 매우 큼 (2026)'}[f['admSrcKey']]
        note = (f'2026학년도 정원내 {q}명 모집에 {a}명이 지원했습니다.' if (q and a)
                else '2026학년도 언론 보도 경쟁률입니다. 정확한 모집·지원 인원은 학교 발표를 확인하세요.')
        return {'year': '2026학년도', 'capacityTotal': cap or 0, 'applicantsTotal': a,
                'overallRate': r, 'trend': '학령인구 감소·2028 개편 영향으로 자사고 전반 경쟁률 하락 추세',
                'tracks': tracks, 'note': note, 'categoryAverage': avg,
                'sources': [{'label': src[0], 'url': src[1]}, SRC_PORTAL(idx)]}
    cap = f['quotaEstimate']
    return {
        'year': '2026학년도',
        'capacityTotal': cap or 0, 'applicantsTotal': None,
        'overallRate': '미공개',
        'trend': '언론 집계 표에 포함되지 않은 학교',
        'tracks': [
            {'name': '일반전형', 'capacity': (int(cap * 0.8) if cap else None), 'applicants': None,
             'rate': '학교 발표 확인', 'note': '정원의 약 80%'},
            {'name': '사회통합전형', 'capacity': (int(cap * 0.2) if cap else None), 'applicants': None,
             'rate': '학교 발표 확인', 'note': '==정원 20% 내외 의무 선발=='},
        ],
        'note': f'모집인원은 ==NEIS 2026학년도 1학년 {f["grade1Classes"]}학급 · 전체 재학생 {f["students"]}명== 기준 환산 추정치입니다. '
                f'확정 인원과 경쟁률은 학교 입학전형 요강을 확인하세요.',
        'sources': [SRC_PORTAL(idx)],
    }


# ────────────────────────── 지역 연계 ──────────────────────────
def regional_linkage(f):
    idx = f['idx']
    if f['status'] == 'converted':
        return {
            'selectionScope': f'==일반고 배정== — {f["sido"]} {f["sigungu"]} 학교군 기준',
            'regionTrack': f'{f["convertedYear"]}학년도부터 자사고 전형(학교장 선발)을 운영하지 않습니다.',
            'localTie': f'{f["sido"]} 후기 일반고 배정 절차를 따릅니다. 지망 순위 작성 방식은 시·도 교육청 고입 기본계획을 확인하세요.',
            'commute': f'주소: {f["address"]} · 통학 기준',
            'sources': [SRC_PORTAL(idx), {'label': convert_src(f['id'])[0], 'url': convert_src(f['id'])[1]}],
        }
    if f['unit'] == '전국':
        return {
            'selectionScope': '==전국 단위 모집== — 거주지 제한 없음',
            'regionTrack': '전국에서 지원 가능하며, 학교별로 ==해당 시·도 학생 우선 선발 비율==을 두는 경우가 있습니다. 모집요강에서 확인하세요.',
            'localTie': f'{f["sido"]} 소재 · 전국 단위 자사고는 ==기숙사 입사가 사실상 전제==입니다.',
            'commute': f'주소: {f["address"]} · 기숙 생활 기준',
            'sources': [SRC_PORTAL(idx)],
        }
    return {
        'selectionScope': f'=={f["sido"]} 광역 단위 모집== — 해당 시·도 거주(재학) 학생만 지원 가능',
        'regionTrack': f'{f["sido"]} 소재 중학교 졸업(예정)자가 대상입니다. 타 시·도 거주자는 지원할 수 없습니다.',
        'localTie': ('기숙사를 병설 운영해 통학 거리가 먼 학생도 지원 가능합니다.' if f['dorm']
                     else '기숙사가 없어 ==매일 통학 가능한 거리==인지가 첫 번째 현실 조건입니다.'),
        'commute': f'주소: {f["address"]}',
        'sources': [SRC_PORTAL(idx)],
    }
