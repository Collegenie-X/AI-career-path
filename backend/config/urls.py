"""
AI Career Path Backend URL Configuration
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/quiz/', include('apps.quiz.urls')),
    path('api/v1/explore/', include('apps.explore.urls')),
    path('api/v1/career-path/', include('apps.career_path.urls')),
    path('api/v1/community/', include('apps.community.urls')),
    path('api/v1/career-plan/', include('apps.career_plan.urls')),
    path('api/v1/resources/', include('apps.resource.urls')),
    path('api/v1/projects/', include('apps.project.urls')),
    path('api/v1/portfolio/', include('apps.portfolio.urls')),
    
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

admin.site.site_header = 'AI Career Path Admin'
admin.site.site_title = 'AI Career Path'
admin.site.index_title = '관리자 대시보드'
