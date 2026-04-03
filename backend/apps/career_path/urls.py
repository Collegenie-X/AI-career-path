"""
Career Path URLs - 커리어 패스 URL 설정

설계 문서: documents/backend/커리어패스_Career_Django_DB_설계서.md
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SchoolViewSet, GroupViewSet,
    CareerPlanViewSet, PlanYearViewSet, GoalGroupViewSet, PlanItemViewSet, SubItemViewSet,
    SharedPlanViewSet
)

app_name = 'career_path'

router = DefaultRouter()

# Community
router.register(r'schools', SchoolViewSet, basename='school')
router.register(r'groups', GroupViewSet, basename='group')

# Career Plans
router.register(r'career-plans', CareerPlanViewSet, basename='career-plan')
router.register(r'plan-years', PlanYearViewSet, basename='plan-year')
router.register(r'goal-groups', GoalGroupViewSet, basename='goal-group')
router.register(r'plan-items', PlanItemViewSet, basename='plan-item')
router.register(r'sub-items', SubItemViewSet, basename='sub-item')

# Shared Plans
router.register(r'shared-plans', SharedPlanViewSet, basename='shared-plan')

urlpatterns = [
    path('', include(router.urls)),
]
