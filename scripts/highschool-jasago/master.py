import json,sys,time,re
from neis import api

portal=json.load(open('portal.json'))
conv=json.load(open('converted_portal.json'))
allp=dict(portal)
for k,v in conv.items():
    for d in v: allp[d['idx']]=d

SIDO={'서울특별시교육청':'서울특별시','부산광역시교육청':'부산광역시','대구광역시교육청':'대구광역시',
 '인천광역시교육청':'인천광역시','대전광역시교육청':'대전광역시','울산광역시교육청':'울산광역시',
 '광주광역시교육청':'광주광역시','세종특별자치시교육청':'세종특별자치시','경기도교육청':'경기도',
 '강원특별자치도교육청':'강원특별자치도','충청북도교육청':'충청북도','충청남도교육청':'충청남도',
 '전북특별자치도교육청':'전북특별자치도','전라남도교육청':'전라남도','경상북도교육청':'경상북도',
 '경상남도교육청':'경상남도','제주특별자치도교육청':'제주특별자치도'}

out={}
for idx,d in allp.items():
    sido=SIDO.get(d['office'].strip(),'')
    nm=d['name']
    rows,tot=api('schoolInfo',SCHUL_NM=nm,LCTN_SC_NM=sido) if sido else (None,None)
    pick=None
    if rows:
        for r in rows:
            if r['ORG_RDNMA'].split(' ')[0:3]==d['address'].split(' ')[0:3] or r['SCHUL_NM']==nm:
                pick=r; break
        pick=pick or rows[0]
    rec=dict(d, sido=sido)
    if pick:
        rec.update(dict(neisName=pick['SCHUL_NM'],atpt=pick['ATPT_OFCDC_SC_CODE'],code=pick['SD_SCHUL_CODE'],
            hsType=pick['HS_SC_NM'],coeduNeis=pick['COEDU_SC_NM'],homepageNeis=pick['HMPG_ADRES'],
            found=pick['FOND_YMD'],rdnma=pick['ORG_RDNMA'],hsGnrlBusnsSc=pick.get('HS_GNRL_BUSNS_SC_NM',''),
            fondSc=pick.get('FOND_SC_NM','')))
        r2,t2=api('classInfo',ATPT_OFCDC_SC_CODE=pick['ATPT_OFCDC_SC_CODE'],SD_SCHUL_CODE=pick['SD_SCHUL_CODE'],AY='2026',GRADE='1')
        rec['grade1Classes']=t2 if isinstance(t2,int) else None
        time.sleep(0.1)
    out[idx]=rec
    print(idx,nm,rec.get('hsType'),rec.get('grade1Classes'),rec.get('homepageNeis'))
    time.sleep(0.1)
json.dump(out,open('master.json','w'),ensure_ascii=False,indent=1)
