"""
Django Admin configuration for User model
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """
    Custom User admin with enhanced features
    """
    list_display = [
        'email',
        'name',
        'grade',
        'emoji',
        'social_provider',
        'is_active',
        'is_staff',
        'created_at',
    ]
    list_filter = ['grade', 'social_provider', 'is_active', 'is_staff', 'created_at']
    search_fields = ['email', 'name', 'social_uid']
    ordering = ['-created_at']
    
    fieldsets = [
        ('Basic', {
            'fields': ['email', 'name', 'grade', 'emoji']
        }),
        ('Social login', {
            'fields': ['social_provider', 'social_uid', 'profile_image_url']
        }),
        ('Permissions', {
            'fields': ['is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions']
        }),
        ('Timestamps', {
            'fields': ['created_at', 'updated_at', 'last_login_at'],
            'classes': ['collapse']
        }),
    ]
    
    readonly_fields = ['created_at', 'updated_at', 'last_login_at']
    
    add_fieldsets = [
        ('Required', {
            'classes': ['wide'],
            'fields': ['email', 'name', 'password1', 'password2'],
        }),
    ]
