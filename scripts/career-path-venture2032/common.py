# -*- coding: utf-8 -*-
"""창직 2032 템플릿 공통 헬퍼."""

STARS = {
    'tech':        ('기술 왕국', '💻', '#10B981'),
    'create':      ('창작 왕국', '🎨', '#F59E0B'),
    'explore':     ('탐구 왕국', '🔬', '#4A90D9'),
    'challenge':   ('도전 왕국', '🚀', '#EF4444'),
    'communicate': ('소통 왕국', '📡', '#EC4899'),
    'connect':     ('연결 왕국', '🤝', '#F97316'),
    'nature':      ('자연 왕국', '🌱', '#22C55E'),
    'order':       ('질서 왕국', '⚖️', '#8B5CF6'),
}

AI_NOTE = ("본 패스는 2032년 창직·1인 기업 시나리오를 전제로 AI가 설계한 가상 템플릿입니다. "
           "활동·비용·기관 정보는 실행 전 반드시 직접 확인하고 학교·보호자·전문가와 상의하세요.")

def item(kind, title, months, difficulty, organizer, description, deliverable, cost,
         tags, subtype=None, goal=0, priority=None, project=False, ai=None, links=None):
    d = {
        'type': kind,
        'title': title,
        'months': months,
        'difficulty': difficulty,
        'organizer': organizer,
        'description': description,
        'deliverable': deliverable,
        'cost': cost,
        'categoryTags': tags,
        'goalIndex': goal,
    }
    if subtype:
        d['activitySubtype'] = subtype
    if priority:
        d['priority'] = priority
    if project:
        d['projectTrack'] = True
    if ai:
        d['aiTools'] = ai
    if links:
        d['links'] = links
    return d

def axes(ai_l, plan_l, fusion_l, venture_l, deliver_l, question_l):
    """각 인자는 [(score, evidence) x3] — 1년차·2년차·3년차."""
    spec = [
        ('ai', '🤖', 'AI 활용력', ai_l),
        ('plan', '🧭', '기획력', plan_l),
        ('fusion', '🔗', '융합력', fusion_l),
        ('venture', '🚀', '창직력', venture_l),
        ('deliver', '🎤', '전달력', deliver_l),
        ('question', '📚', '질문력 (독서 기반)', question_l),
    ]
    stages = ['1년차', '2년차', '3년차']
    return [
        {'key': k, 'icon': ic, 'name': nm,
         'levels': [{'stage': stages[i], 'score': lv[i][0], 'evidence': lv[i][1]} for i in range(3)]}
        for k, ic, nm, lv in spec
    ]

def template(tid, star, title, description, job_id, job_name, job_emoji, tags,
             north, growth_axes, growth_note, orchestra_note, orchestra, years,
             strategies, story, likes=0):
    star_name, star_emoji, star_color = STARS[star]
    total = sum(len(y['items']) for y in years)
    return {
        'id': tid,
        'title': title,
        'description': description,
        'authorName': 'AI Career 공식 (창직 2032)',
        'authorEmoji': '🚀',
        'authorType': 'official',
        'isAiGenerated': True,
        'aiGeneratedNote': AI_NOTE,
        'starId': star,
        'starName': star_name,
        'starEmoji': star_emoji,
        'starColor': star_color,
        'jobId': job_id,
        'jobName': job_name,
        'jobEmoji': job_emoji,
        'category': 'job',
        'admissionTypeStrategies': strategies,
        'northStar': north,
        'competencyGrowth': {'note': growth_note, 'axes': growth_axes},
        'aiOrchestra': {'note': orchestra_note, 'agents': orchestra},
        'successStories': [story],
        'likes': likes,
        'uses': 0,
        'tags': tags,
        'totalItems': total,
        'years': years,
    }

def year(step, label, goals, items):
    return {'gradeId': f'step{step}', 'gradeLabel': label, 'goals': goals, 'items': items}
