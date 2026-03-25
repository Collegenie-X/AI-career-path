"""
URL patterns for explore app
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    JobCategoryViewSet,
    JobViewSet,
    JobInfographicViewSet,
    HighSchoolCategoryViewSet,
    HighSchoolViewSet,
    HighSchoolInfographicViewSet,
    UniversityAdmissionCategoryViewSet,
    UniversityViewSet,
    UniversityInfographicViewSet,
)

app_name = 'explore'

router = DefaultRouter()

router.register(r'job-categories', JobCategoryViewSet, basename='job-category')
router.register(r'jobs', JobViewSet, basename='job')
router.register(r'job-infographics', JobInfographicViewSet, basename='job-infographic')

router.register(r'high-school-categories', HighSchoolCategoryViewSet, basename='high-school-category')
router.register(r'high-schools', HighSchoolViewSet, basename='high-school')
router.register(r'high-school-infographics', HighSchoolInfographicViewSet, basename='high-school-infographic')

router.register(r'admission-categories', UniversityAdmissionCategoryViewSet, basename='admission-category')
router.register(r'universities', UniversityViewSet, basename='university')
router.register(r'university-infographics', UniversityInfographicViewSet, basename='university-infographic')

urlpatterns = [
    path('', include(router.urls)),
]
