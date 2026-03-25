"""
URL patterns for accounts app
"""

from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    path('social-login/', views.social_login_view, name='social-login'),
    path('token/refresh/', views.token_refresh_view, name='token-refresh'),
    path('logout/', views.logout_view, name='logout'),
    path('me/', views.UserProfileView.as_view(), name='user-profile'),
]
