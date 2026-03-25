"""
URL patterns for community app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'community'

router = DefaultRouter()
router.register(r'groups', views.GroupViewSet, basename='group')
router.register(r'shared-roadmaps', views.SharedRoadmapViewSet, basename='shared-roadmap')

urlpatterns = [
    path('', include(router.urls)),
]
