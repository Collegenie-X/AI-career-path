"""
URL patterns for resource app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'resource'

router = DefaultRouter()
router.register(r'', views.ResourceViewSet, basename='resource')

urlpatterns = [
    path('', include(router.urls)),
]
