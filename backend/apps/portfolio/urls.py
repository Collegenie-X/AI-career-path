"""
URL patterns for portfolio app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'portfolio'

router = DefaultRouter()
router.register(r'', views.PortfolioItemViewSet, basename='item')

urlpatterns = [
    path('', include(router.urls)),
]
