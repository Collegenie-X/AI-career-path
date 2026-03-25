"""
Django Admin configuration for portfolio app
"""

from django.contrib import admin
from .models import PortfolioItem


@admin.register(PortfolioItem)
class PortfolioItemAdmin(admin.ModelAdmin):
    list_display = [
        'get_user_name',
        'title',
        'item_type',
        'organization',
        'started_at',
        'ended_at',
        'is_ongoing',
        'created_at',
    ]
    list_filter = ['item_type', 'is_ongoing', 'started_at', 'created_at']
    search_fields = ['user__name', 'title', 'description', 'organization']
    ordering = ['-created_at']
    
    def get_user_name(self, obj):
        return obj.user.name
    get_user_name.short_description = 'User'
