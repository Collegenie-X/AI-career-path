import re, json, urllib.request, urllib.parse, time, os

UA={'User-Agent':'Mozilla/5.0'}
def get(u):
    r=urllib.request.Request(u,headers=UA)
    return urllib.request.urlopen(r,timeout=40).read().decode('utf-8','replace')

def clean(x):
    x=re.sub(r'<[^>]+>',' ',x)
    x=x.replace('&nbsp;',' ').replace('&amp;','&')
    return re.sub(r'\s+',' ',x).strip()

def detail(idx):
    h=get(f"https://www.hischool.go.kr/school/view.do?idx={idx}")
    t=clean(h)
    d={'idx':str(idx)}
    m=re.search(r'<h4 class="school-info-tit">(.*?)</h4>',h,re.S); d['name']=clean(m.group(1)) if m else ''
    m=re.search(r'<p class="address">(.*?)</p>',h,re.S); d['address']=clean(m.group(1)).replace('주 소','').strip() if m else ''
    m=re.search(r'<p class="link">(.*?)</p>',h,re.S); d['homepage']=clean(m.group(1)).replace('홈페이지','').strip() if m else ''
    for label,key in [('설 립 구 분','foundType'),('설 립 유 형','foundForm'),('설 립 일 자','foundDate'),
                      ('관할교육청','office'),('남 녀 구 분','coed'),('선 발 시 기','selectTime'),('대 표 번 호','tel')]:
        m=re.search(re.escape(label)+r'\s*(.{0,40}?)\s*(?=설 립|관할교육청|남 녀|선 발|입학자선정|대 표|입학전형|교과특성화|$)',t)
        d[key]=m.group(1).strip() if m else ''
    m=re.search(r'전체학생수\s*:\s*([0-9,]+)',t); d['students']=m.group(1) if m else ''
    m=re.search(r'교원수\s*:\s*([0-9,]+)',t); d['teachers']=m.group(1) if m else ''
    m=re.search(r'학급수\s*:\s*([0-9,]+)',t); d['classes']=m.group(1) if m else ''
    # 남/여 학생수
    m=re.search(r'남학생수\s*:\s*([0-9,]+)',t); d['male']=m.group(1) if m else ''
    m=re.search(r'여학생수\s*:\s*([0-9,]+)',t); d['female']=m.group(1) if m else ''
    d['note']=''
    m=re.search(r'※\s*([^※]{5,120}?)\s*입학전형 자료',t)
    if m: d['note']=m.group(1).strip()
    return d

def search_idx(kw):
    h=get("https://www.hischool.go.kr/entrance/search.do?keyword="+urllib.parse.quote(kw))
    return [i for i in dict.fromkeys(re.findall(r'view\.do\?idx=(\d+)',h)) if i]

if __name__=='__main__':
    idxs=json.load(open('../jasago_idx.json'))
    extra=['1592','1070','1631']  # 이대부고, 대구 대건고, 한가람고
    out={}
    for i in idxs+extra:
        try:
            d=detail(i); out[i]=d
            print(i,d['name'],'|',d['address'][:36],'|',d['students'],'|',d['coed'],'|',d['note'][:40])
        except Exception as e:
            print('ERR',i,e)
        time.sleep(0.2)
    json.dump(out,open('portal.json','w'),ensure_ascii=False,indent=1)
