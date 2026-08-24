import json,urllib.request,urllib.parse,time,re
UA={'User-Agent':'Mozilla/5.0'}
def api(path,**kw):
    q=urllib.parse.urlencode(dict(Type='json',**kw))
    u=f"https://open.neis.go.kr/hub/{path}?{q}"
    try:
        r=urllib.request.Request(u,headers=UA)
        d=json.loads(urllib.request.urlopen(r,timeout=40).read().decode('utf-8'))
    except Exception as e:
        return None,str(e)
    if path in d:
        rows=[]
        for blk in d[path]:
            if 'row' in blk: rows=blk['row']
            if 'head' in blk:
                tot=blk['head'][0].get('list_total_count')
        return rows, tot
    return None, d.get('RESULT',{}).get('MESSAGE','')
