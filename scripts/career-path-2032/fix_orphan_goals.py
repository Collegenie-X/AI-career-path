# -*- coding: utf-8 -*-
"""활동이 붙지 않아 화면에 안 보이던 목표를 실제 활동과 짝지어 준다."""
from common import load, save

FILE = "career-path-templates.json"
data = load(FILE)

for t in data:
    if t["id"] == "tpl-univ-vibe-coding-journey-001":
        year = t["years"][0]  # 중3
        year["items"].append({
            "type": "activity",
            "title": "GitHub 커밋 30회 + 개발 일지 10편 (7~11월, 주 2회)",
            "months": [7, 8, 9, 10, 11], "difficulty": 2, "organizer": "자체",
            "description": "코드보다 기록이 먼저 습관이 되어야 3년을 버팁니다. ① 주 2회 이상 커밋하고 커밋 메시지는 '무엇을 왜 고쳤는지' 한 줄로 직접 씁니다(AI가 짠 코드도 마찬가지). ② 격주로 개발 일지 1편을 써서 막혔던 지점과 해결 방법을 남깁니다. ③ AI가 만든 코드와 내가 고친 부분을 일지에 구분해 적습니다. 완료 기준: 커밋 30회 · 개발 일지 10편 · AI 사용 구분 기록 10건.",
            "categoryTags": ["project"], "activitySubtype": "project", "projectTrack": True,
            "aiTools": ["Cursor", "GitHub", "ChatGPT"],
            "deliverable": "GitHub 커밋 30회 기록 + 개발 일지 10편 + AI 사용 구분 기록 10건",
            "cost": "무료", "goalIndex": 1,
        })
    if t["id"] == "tpl-univ-ai-economy-journey-001":
        year = t["years"][2]  # 고3
        # 소논문 + 면접 자료 + 면접 스크립트가 한 항목에 뭉쳐 있어 목표별로 분리
        year["items"] = [it for it in year["items"] if it.get("goalIndex") != 0 or "소논문 최종본" not in it["title"]]
        year["items"] = [
            {
                "type": "activity",
                "title": "경제 소논문 최종본 확정 — 지적 사항 5개 전부 반영 (2~4월)",
                "months": [2, 3, 4], "difficulty": 4, "organizer": "자체·학교",
                "description": "고2 소논문을 '제출 가능한 완성본'으로 닫는 작업입니다. ① 교사·멘토가 남긴 지적 사항 5개를 목록으로 정리합니다. ② 항목마다 어떻게 고쳤는지 한 줄씩 붙여 수정 이력표를 만듭니다. ③ 데이터 출처와 계산식을 다시 확인해 부록으로 넣습니다. 완료 기준: 최종본 1편 · 지적 사항 5개 반영 이력표 1장 · 출처·계산식 부록 1부.",
                "categoryTags": ["paper", "activity"], "activitySubtype": "research",
                "aiTools": ["ChatGPT", "Google Sheets"],
                "deliverable": "소논문 최종본 1편 + 수정 이력표 1장(지적 5개) + 출처·계산식 부록 1부",
                "cost": "무료", "goalIndex": 0,
            },
            {
                "type": "activity",
                "title": "생기부 연계 면접용 활동 정리서 3편 + 통합 PDF 1개 (5~8월)",
                "months": [5, 6, 7, 8], "difficulty": 3, "organizer": "자체",
                "description": "2024학년도부터 대입 자기소개서는 폐지됐고, 학생부 활동을 스스로 설명하는 능력이 평가됩니다. ① 관찰 일지·소논문·모의투자 3개 활동을 각 1편으로 정리합니다. ② 편마다 숫자 근거(200행·30주·그래프 5개 등)를 1개 이상 넣습니다. ③ 3년 활동을 묶은 통합 PDF 1개를 만들고 5회 퇴고합니다. 완료 기준: 활동 정리서 3편 · 통합 PDF 1개 · 퇴고 5회 이력.",
                "categoryTags": ["activity"], "activitySubtype": "general",
                "aiTools": ["ChatGPT", "Notion"],
                "deliverable": "면접용 활동 정리서 3편(각 숫자 근거 포함) + 통합 PDF 1개 + 퇴고 5회 이력",
                "cost": "무료", "goalIndex": 1,
            },
            {
                "type": "activity",
                "title": "면접 답변 스크립트 30개 + 모의면접 6회 (9~10월)",
                "months": [9, 10], "difficulty": 3, "organizer": "자체·학교",
                "description": "경제 계열 면접은 '네 숫자를 네가 설명할 수 있는가'를 묻습니다. ① 예상 질문 30개를 4갈래(탐구 방법 / 데이터 해석 / 투자 판단 / 진로)로 만들어 답변을 씁니다. ② 답변마다 내 데이터에서 나온 숫자를 1개씩 넣습니다. ③ 모의면접 6회를 녹화해 군더더기 표현을 3개씩 지웁니다. 완료 기준: 스크립트 30개 · 모의면접 6회 녹화 · 표현 개선 기록 6건.",
                "categoryTags": ["activity"], "activitySubtype": "general",
                "aiTools": ["ChatGPT(모의 질문)", "휴대폰 녹화"],
                "deliverable": "면접 답변 스크립트 30개 + 모의면접 녹화 6편 + 표현 개선 기록 6건",
                "cost": "무료", "goalIndex": 2,
            },
        ] + [it for it in year["items"] if it.get("goalIndex") == 3]

for t in data:
    t["totalItems"] = sum(len(y["items"]) for y in t["years"])

save(FILE, data)
print("fixed")
