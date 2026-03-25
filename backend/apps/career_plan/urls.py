"""
URL patterns for career plan app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'career_plan'

router = DefaultRouter()
router.register(r'plans', views.ExecutionPlanViewSet, basename='plan')
router.register(r'groups', views.PlanGroupViewSet, basename='group')

urlpatterns = [
    path('', include(router.urls)),
]
