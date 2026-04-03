"""
Career Plan (DreamMate) URLs - 커리어 실행 API 라우팅

설계 문서: documents/backend/커리어실행_DreamMate_Django_DB_설계서.md
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views_execution_plan_ai import ExecutionPlanAiGenerateView
from .views import (
    RoadmapViewSet, RoadmapItemViewSet, RoadmapTodoViewSet, RoadmapMilestoneViewSet,
    DreamResourceViewSet, ResourceSectionViewSet,
    DreamSpaceViewSet, SpaceParticipantViewSet,
    SharedDreamRoadmapViewSet
)

app_name = 'career_plan'

router = DefaultRouter()

# Roadmap (로드맵)
router.register(r'roadmaps', RoadmapViewSet, basename='roadmap')
router.register(r'roadmap-items', RoadmapItemViewSet, basename='roadmap-item')
router.register(r'roadmap-todos', RoadmapTodoViewSet, basename='roadmap-todo')
router.register(r'roadmap-milestones', RoadmapMilestoneViewSet, basename='roadmap-milestone')

# Dream Resource (드림 라이브러리)
router.register(r'dream-resources', DreamResourceViewSet, basename='dream-resource')
router.register(r'resource-sections', ResourceSectionViewSet, basename='resource-section')

# Dream Space (드림 스페이스)
router.register(r'dream-spaces', DreamSpaceViewSet, basename='dream-space')
router.register(r'space-participants', SpaceParticipantViewSet, basename='space-participant')

# Shared Dream Roadmap (공유 드림 로드맵)
router.register(r'shared-dream-roadmaps', SharedDreamRoadmapViewSet, basename='shared-dream-roadmap')

urlpatterns = [
    path('execution-plan-ai/generate/', ExecutionPlanAiGenerateView.as_view(), name='execution-plan-ai-generate'),
    path('', include(router.urls)),
]
