# -*- coding: utf-8 -*-
"""기존 14종 competencyGrowth에 '질문력(독서 기반)' 축 추가."""
import json
BASE='/Users/kimjongphil/Documents/GitHub/AI-career-path/frontend/data/path-templates/'

Q={
 'tpl-future-ai-core-engineer-2028':[(40,'3권 병렬 독서 3세트 + 문제 카드 9장'),(68,'사용자 인터뷰로 카드의 가정 검증'),(86,'"안 만들 기능"의 이유를 근거로 설명')],
 'tpl-future-physical-ai-robotics-2028':[(38,'3권 병렬 독서 3세트 + 안전 고려 메모 3건'),(66,'실패한 장치의 원인을 문헌과 대조'),(85,'"자동화하면 안 되는 지점"을 근거로 서술')],
 'tpl-future-ai-bio-health-2028':[(40,'3권 병렬 독서 3세트 + 검증 대상 건강 정보 3건'),(70,'잘못된 건강 정보를 원문 근거로 반박 3건'),(88,'내 결론의 한계와 확인 못 한 것 명시')],
 'tpl-future-ai-governance-2028':[(45,'3권 병렬 독서 3세트 + 쟁점 카드 9장'),(72,'찬반 논거 대조 + 또래 설문으로 검증'),(90,'내 주장에 대한 반대 논거를 직접 서술')],
 'tpl-hs-admission-business-001':[(38,'3권 병렬 독서 3세트 + 문제 카드 9장'),(66,'소비자 조사로 책의 주장 검증'),(85,'가격·판매 판단의 근거를 문서로 설명')],
 'tpl-hs-admission-meister-specialized-001':[(36,'3권 병렬 독서 3세트 + 실습 확인 항목 3개'),(64,'현장 실습과 문헌 설명의 차이 기록'),(84,'내 기술 선택의 이유를 근거로 설명')],
 'tpl-hs-admission-science-gifted-001':[(42,'3권 병렬 독서 3세트 + 탐구 질문 카드 9장'),(70,'실험·계산으로 책의 설명 검증'),(88,'실패한 탐구의 원인을 근거로 서술')],
 'tpl-hs-admission-foreign-language-001':[(42,'3개국 관점 병렬 독서 3세트 + 관점 카드 9장'),(70,'번역이 놓친 뉘앙스 9건 기록'),(88,'같은 사건의 나라별 서술 차이를 설명')],
 'tpl-hs-admission-international-001':[(44,'국제 이슈 3권 병렬 독서 3세트 + 쟁점 카드 9장'),(72,'통계 원 출처 확인 + 논거 9건 정리'),(90,'당사국 시선에서의 반론을 직접 서술')],
 'tpl-admission-snu-cse-001':[(42,'3권 병렬 독서 4세트 + 문제 카드 12장'),(70,'사용자·데이터로 가정 검증'),(88,'기술 선택과 포기의 근거를 문서화')],
 'tpl-admission-kaist-ee-001':[(42,'3권 병렬 독서 4세트 + 문제 카드 12장'),(72,'실험 결과와 문헌 설명 대조'),(88,'측정 한계와 오차를 근거로 서술')],
 'tpl-admission-yonsei-med-001':[(45,'3권 병렬 독서 4세트 + 문제 카드 12장'),(74,'논문 원문 확인 + 윤리 쟁점 정리'),(90,'환자·윤리 관점의 반론을 직접 서술')],
 'tpl-admission-korea-biz-001':[(42,'3권 병렬 독서 4세트 + 문제 카드 12장'),(70,'현장 조사로 이론 검증'),(88,'시장 비판 관점의 반론을 함께 서술')],
 'tpl-admission-snu-law-001':[(46,'3권 병렬 독서 4세트 + 문제 카드 12장'),(75,'조문·판례 원문 확인 20건'),(92,'반대 논거를 조문 근거와 함께 서술')],
}

files=['career-path-templates-future.json','career-path-templates-highschool.json','career-path-templates-admission.json']
n=0
for f in files:
    d=json.load(open(BASE+f,encoding='utf-8'))
    for t in d:
        q=Q.get(t['id']); cg=t.get('competencyGrowth')
        if not q or not cg: continue
        if any(a['key']=='question' for a in cg['axes']): continue
        stages=[lv['stage'] for lv in cg['axes'][0]['levels']]
        cg['axes'].append({'key':'question','icon':'📚','name':'질문력 (독서 기반)',
            'levels':[{'stage':stages[i],'score':q[i][0],'evidence':q[i][1]} for i in range(min(3,len(stages)))]})
        n+=1
    json.dump(d,open(BASE+f,'w',encoding='utf-8'),ensure_ascii=False,indent=2)
print('question axis added:',n)
