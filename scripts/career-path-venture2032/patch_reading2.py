# -*- coding: utf-8 -*-
"""future/highschool/admission 14종에 ReadingClue식 1주제 3권 병렬 독서 항목 추가."""
import json
BASE='/Users/kimjongphil/Documents/GitHub/AI-career-path/frontend/data/path-templates/'

def R(title, months, desc, deliverable, ai, organizer='자체 (ReadingClue식 병렬 독서)'):
    return {'type':'activity','title':title,'months':months,'difficulty':2,'organizer':organizer,
            'description':desc,'deliverable':deliverable,'cost':'무료 (도서관 대출)',
            'categoryTags':['reading','paper'],'activitySubtype':'research','priority':'must','aiTools':ai}

COMMON_TAIL=('③ 세 권이 어긋나는 지점 3곳에서 문제 카드 5칸(배경·주장·반론·근거·확인 방법)을 채웁니다. '
             '④ 카드마다 "내가 직접 확인할 방법"을 한 줄 적고, 못 적는 카드는 버립니다.')

PLAN=[]
def add(f,tid,yidx,goal,it): PLAN.append((f,tid,yidx,goal,it))

FU='career-path-templates-future.json'
add(FU,'tpl-future-ai-core-engineer-2028',0,
 '12월까지 1주제 3권 병렬 독서 3세트(9권) + 문제 카드 9장 작성',
 R('1주제 3권 병렬 독서 3세트 — 만들 것을 책 3권으로 먼저 좁히기',[3,4,5,9,10,11,12],
   '주 1회 1시간, 세트당 8주. ① "AI가 편하게 한 것 / 오히려 불편하게 한 것 / 만드는 법" 3갈래로 주제를 잡습니다. '
   '② 각 세트마다 입장이 다른 책 3권을 나란히 읽습니다. '+COMMON_TAIL+' '
   '완료 기준: 12월까지 9권 완독 + 문제 카드 9장 + 다음 해 만들 것 후보 3개.',
   '문제 카드 9장 + 독서 기록 9권 + 만들 것 후보 3개',['NotebookLM(3권 대조)','Claude(아이디어 검토)']))
add(FU,'tpl-future-physical-ai-robotics-2028',0,
 '12월까지 로봇·자동화 3권 병렬 독서 3세트(9권) + 문제 카드 9장 작성',
 R('1주제 3권 병렬 독서 3세트 — "무엇을 자동화하면 안 되는가"까지 읽기',[3,4,5,9,10,11,12],
   '주 1회 1시간, 세트당 8주. ① "로봇 기술 / 일자리와 사회 / 안전과 사고 사례" 3갈래로 주제를 잡습니다. '
   '② 각 세트 3권을 병렬로 읽습니다. '+COMMON_TAIL+' '
   '완료 기준: 12월까지 9권 완독 + 문제 카드 9장 + 만들 장치 후보 3개(안전 고려 포함).',
   '문제 카드 9장 + 독서 기록 9권 + 장치 후보 3개 + 안전 고려 메모 3건',['NotebookLM','Claude(안전 관점 검토)']))
add(FU,'tpl-future-ai-bio-health-2028',0,
 '12월까지 건강·의료 3권 병렬 독서 3세트(9권) + 문제 카드 9장 작성',
 R('1주제 3권 병렬 독서 3세트 — 건강 정보의 근거를 책으로 먼저 확인하기',[3,4,5,9,10,11,12],
   '주 1회 1시간, 세트당 8주. ① "몸의 작동 원리 / 의료 현장 기록 / 건강 정보의 함정" 3갈래로 주제를 잡습니다. '
   '② 각 세트 3권을 병렬로 읽습니다. '+COMMON_TAIL+' '
   '완료 기준: 12월까지 9권 완독 + 문제 카드 9장 + 검증해 볼 건강 정보 3건.',
   '문제 카드 9장 + 독서 기록 9권 + 검증 대상 건강 정보 3건',['NotebookLM','Claude(근거 확인 관점)']))
add(FU,'tpl-future-ai-governance-2028',0,
 '12월까지 1주제 3권 병렬 독서 3세트(9권) + 쟁점 카드 9장 작성',
 R('1주제 3권 병렬 독서 3세트 — 시사 독서를 찬반·현장 3권으로 겹쳐 읽기',[3,4,5,9,10,11,12],
   '주 1회 1시간, 세트당 8주. ① 쟁점 1개를 고르고 찬성 1권·반대 1권·현장 기록 1권을 병렬로 읽습니다. '
   '② 요약본·서평만 읽으면 반박이 불가능하니 본문을 읽습니다. '+COMMON_TAIL+' '
   '완료 기준: 12월까지 9권 완독 + 쟁점 카드 9장 + 설문·인터뷰로 확인할 항목 3개.',
   '쟁점 카드 9장 + 독서 기록 9권 + 확인 항목 3개',['NotebookLM','Claude(반대 논거 정리)']))

HS='career-path-templates-highschool.json'
add(HS,'tpl-hs-admission-business-001',0,
 '12월까지 경영·소비 3권 병렬 독서 3세트(9권) + 문제 카드 9장 작성',
 R('1주제 3권 병렬 독서 3세트 — 팔린다는 것의 원리를 세 관점으로 읽기',[3,4,5,9,10,11,12],
   '주 1회 1시간, 세트당 8주. ① "마케팅·경영 / 소비자 심리 / 과잉소비 비판" 3갈래로 주제를 잡습니다. '
   '② 각 세트 3권을 병렬로 읽습니다. '+COMMON_TAIL+' '
   '완료 기준: 12월까지 9권 완독 + 문제 카드 9장 + 직접 조사할 항목 3개.',
   '문제 카드 9장 + 독서 기록 9권 + 조사 항목 3개',['NotebookLM','Claude(반대 관점)']))
add(HS,'tpl-hs-admission-meister-specialized-001',0,
 '12월까지 기술·직업 3권 병렬 독서 3세트(9권) + 문제 카드 9장 작성',
 R('1주제 3권 병렬 독서 3세트 — 현장 기술을 기록·비판까지 읽기',[3,4,5,9,10,11,12],
   '주 1회 1시간, 세트당 8주. ① "기술 원리 / 현장 노동 기록 / 자동화 비판" 3갈래로 주제를 잡습니다. '
   '② 각 세트 3권을 병렬로 읽습니다. '+COMMON_TAIL+' '
   '완료 기준: 12월까지 9권 완독 + 문제 카드 9장 + 실습으로 확인할 항목 3개.',
   '문제 카드 9장 + 독서 기록 9권 + 실습 확인 항목 3개',['NotebookLM','Claude(현장 관점 정리)']))
add(HS,'tpl-hs-admission-science-gifted-001',0,
 '12월까지 과학 3권 병렬 독서 3세트(9권) + 탐구 질문 카드 9장 작성',
 R('1주제 3권 병렬 독서 3세트 — 교과서 밖 설명 3개를 겹쳐 읽기',[3,4,5,9,10,11,12],
   '주 1회 1시간, 세트당 8주. ① 단원 중 납득이 안 되는 개념 1개를 고릅니다. '
   '② 과학사 1권·심화 해설 1권·대중 교양 1권을 병렬로 읽습니다. '+COMMON_TAIL+' '
   '완료 기준: 12월까지 9권 완독 + 질문 카드 9장 + 실험·계산으로 확인할 항목 3개.',
   '탐구 질문 카드 9장 + 독서 기록 9권 + 확인 실험 후보 3개',['NotebookLM','Claude(개념 되묻기)']))
add(HS,'tpl-hs-admission-foreign-language-001',0,
 '12월까지 3개국 관점 병렬 독서 3세트 + 관점 카드 9장 작성',
 R('3개국 관점 병렬 독서 3세트 — 같은 주제를 세 언어권 자료로 읽기',[3,4,5,9,10,11,12],
   '주 1회 1시간, 세트당 8주. ① 주제 1개를 정하고 한국어 책 1권 + 영어 원문 1편 + 제2외국어권 자료 1편을 병렬로 읽습니다. '
   '② 번역 도구는 초벌용으로만 쓰고 핵심 문장은 원문으로 확인합니다. '+COMMON_TAIL+' '
   '완료 기준: 12월까지 3세트 완료 + 관점 카드 9장 + 번역 뉘앙스 기록 9건.',
   '관점 카드 9장 + 3개국 자료 독서 기록 9건 + 번역 뉘앙스 기록 9건',['DeepL','NotebookLM','Claude(원문 대조)']))
add(HS,'tpl-hs-admission-international-001',0,
 '12월까지 국제 이슈 3권 병렬 독서 3세트(9권) + 쟁점 카드 9장 작성',
 R('1주제 3권 병렬 독서 3세트 — 국제 이슈를 당사국 시선까지 읽기',[3,4,5,9,10,11,12],
   '주 1회 1시간, 세트당 8주. ① 국제 이슈 1개를 고르고 국제기구·서방 관점 1권, 당사국·현지 기록 1권, 비판적 시각 1권을 병렬로 읽습니다. '
   '② 통계는 원 출처를 확인합니다. '+COMMON_TAIL+' '
   '완료 기준: 12월까지 9권 완독 + 쟁점 카드 9장 + 모의UN·토론에 쓸 논거 9건.',
   '쟁점 카드 9장 + 독서 기록 9권 + 토론 논거 9건',['NotebookLM','Claude(다국 관점 정리)','DeepL']))

AD='career-path-templates-admission.json'
def admission_reading(tid, topic_line, sets, deliver_extra, ai):
    return R(f'1주제 3권 병렬 독서 4세트 — {topic_line}',[3,4,5,6,9,10,11],
      '주 2회 1시간, 세트당 6~8주. ① 관심 주제 1개를 고정합니다. '
      f'② {sets} 3권을 병렬로 읽습니다. '+COMMON_TAIL+' '
      '④ 12장 중 "고등학생이 직접 확인할 수 있는 것" 3개만 남겨 탐구·소논문 주제로 잇습니다. '
      '완료 기준: 12월까지 12권 완독 + 문제 카드 12장 + 실행 가능한 탐구 주제 3개.',
      f'문제 카드 12장 + 독서 기록 12권 + {deliver_extra}', ai)

add(AD,'tpl-admission-snu-cse-001',2,
 '12월까지 1주제 3권 병렬 독서 4세트(12권) + 문제 카드 12장 작성',
 admission_reading('tpl-admission-snu-cse-001','컴퓨팅이 바꾼 것과 망친 것을 같이 읽기',
  '컴퓨터과학 이론 1권·기술 사회 비판 1권·개발 현장 기록','만들 것/탐구할 것 후보 3개',
  ['NotebookLM','Claude(설계 반론)']))
add(AD,'tpl-admission-kaist-ee-001',2,
 '12월까지 1주제 3권 병렬 독서 4세트(12권) + 문제 카드 12장 작성',
 admission_reading('tpl-admission-kaist-ee-001','전자·에너지 기술을 원리·산업·비판으로 읽기',
  '물리·전자 원리 1권·산업 현장 기록 1권·기술 비판','실험·탐구 후보 3개',
  ['NotebookLM','Claude(원리 되묻기)']))
add(AD,'tpl-admission-yonsei-med-001',2,
 '12월까지 1주제 3권 병렬 독서 4세트(12권) + 문제 카드 12장 작성',
 admission_reading('tpl-admission-yonsei-med-001','의학을 과학·환자·윤리 세 시선으로 읽기',
  '의학·생명과학 1권·환자와 현장 기록 1권·의료 윤리 비판','탐구·봉사 연계 주제 3개',
  ['NotebookLM','PubMed','Claude(윤리 관점)']))
add(AD,'tpl-admission-korea-biz-001',2,
 '12월까지 1주제 3권 병렬 독서 4세트(12권) + 문제 카드 12장 작성',
 admission_reading('tpl-admission-korea-biz-001','기업과 시장을 경영·소비자·비판으로 읽기',
  '경영·전략 1권·소비자와 노동 현장 기록 1권·시장 비판','직접 조사할 주제 3개',
  ['NotebookLM','Claude(반대 관점)']))
add(AD,'tpl-admission-snu-law-001',2,
 '12월까지 1주제 3권 병렬 독서 4세트(12권) + 문제 카드 12장 작성',
 admission_reading('tpl-admission-snu-law-001','법을 조문·판례·현장 세 층위로 읽기',
  '법 이론 1권·판례 해설 1권·현장 르포','판례·조문으로 확인할 쟁점 3개',
  ['NotebookLM','국가법령정보센터','Claude(반대 논거)']))

def main():
    byfile={}
    for f,tid,yidx,goal,it in PLAN: byfile.setdefault(f,[]).append((tid,yidx,goal,it))
    for f,rows in byfile.items():
        data=json.load(open(BASE+f,encoding='utf-8'))
        byid={t['id']:t for t in data}
        for tid,yidx,goal,it in rows:
            t=byid[tid]; y=t['years'][yidx]
            y.setdefault('goals',[]).append(goal)
            it=dict(it); it['goalIndex']=len(y['goals'])-1
            y['items'].append(it)
            t['totalItems']=sum(len(yy['items']) for yy in t['years'])
        json.dump(data,open(BASE+f,'w',encoding='utf-8'),ensure_ascii=False,indent=2)
        print(f,'+',len(rows))
main()
