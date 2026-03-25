"""
URL patterns for project app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'project'

router = DefaultRouter()
router.register(r'templates', views.ProjectViewSet, basename='template')
router.register(r'my-projects', views.UserProjectViewSet, basename='my-project')

urlpatterns = [
    path('', include(router.urls)),
]
