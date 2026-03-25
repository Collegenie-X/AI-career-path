"""
URL patterns for career path app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'career_path'

router = DefaultRouter()
router.register(r'templates', views.CareerPathTemplateViewSet, basename='template')
router.register(r'my-paths', views.UserCareerPathViewSet, basename='my-path')
router.register(r'schools', views.SchoolViewSet, basename='school')

urlpatterns = [
    path('', include(router.urls)),
]
