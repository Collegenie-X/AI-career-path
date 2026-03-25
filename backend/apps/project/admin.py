"""
Django Admin configuration for project app
"""

from django.contrib import admin
from .models import Project, UserProject


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = [
        'title',
        'difficulty',
        'estimated_hours',
        'is_active',
        'created_at',
    ]
    list_filter = ['difficulty', 'is_active', 'created_at']
    search_fields = ['title', 'description']
    ordering = ['-created_at']


@admin.register(UserProject)
class UserProjectAdmin(admin.ModelAdmin):
    list_display = [
        'get_user_name',
        'title',
        'status',
        'started_at',
        'completed_at',
        'created_at',
    ]
    list_filter = ['status', 'created_at']
    search_fields = ['user__name', 'title', 'description']
    ordering = ['-created_at']
    
    def get_user_name(self, obj):
        return obj.user.name
    get_user_name.short_description = 'User'
