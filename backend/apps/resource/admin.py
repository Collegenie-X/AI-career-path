"""
Django Admin configuration for resource app
"""

from django.contrib import admin
from .models import Resource


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = [
        'title',
        'resource_type',
        'created_by',
        'view_count',
        'is_active',
        'created_at',
    ]
    list_filter = ['resource_type', 'is_active', 'created_at']
    search_fields = ['title', 'description', 'tags']
    ordering = ['-created_at']
    readonly_fields = ['view_count']
