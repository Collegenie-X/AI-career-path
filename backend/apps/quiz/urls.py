"""
URL patterns for quiz app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'quiz'

router = DefaultRouter()
router.register(r'questions', views.QuizQuestionViewSet, basename='question')
router.register(r'results', views.QuizResultViewSet, basename='result')
router.register(r'reports', views.RiasecReportViewSet, basename='report')

urlpatterns = [
    path('', include(router.urls)),
]
