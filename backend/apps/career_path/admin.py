"""
Django Admin configuration for career path app
"""

from django.contrib import admin
from .models import (
    CareerPathTemplate,
    TemplateYear,
    TemplateItem,
    UserCareerPath,
    School,
    SchoolMember,
)


class TemplateItemInline(admin.TabularInline):
    model = TemplateItem
    extra = 0
    fields = ['item_type', 'title', 'month', 'emoji', 'order_index']
    ordering = ['order_index']


class TemplateYearInline(admin.StackedInline):
    model = TemplateYear
    extra = 0
    fields = ['year', 'order_index']
    ordering = ['order_index']


@admin.register(CareerPathTemplate)
class CareerPathTemplateAdmin(admin.ModelAdmin):
    list_display = [
        'title',
        'category',
        'is_official',
        'likes',
        'uses',
        'is_active',
        'created_at',
    ]
    list_filter = ['category', 'is_official', 'is_active', 'created_at']
    search_fields = ['title', 'template_key', 'description']
    ordering = ['-is_official', '-likes']
    inlines = [TemplateYearInline]
    
    fieldsets = [
        ('Basic', {
            'fields': ['template_key', 'title', 'category', 'description']
        }),
        ('Links', {
            'fields': ['job_id', 'university_id']
        }),
        ('Stats', {
            'fields': ['likes', 'uses', 'is_official', 'is_active']
        }),
    ]


@admin.register(UserCareerPath)
class UserCareerPathAdmin(admin.ModelAdmin):
    list_display = [
        'get_user_name',
        'title',
        'status',
        'share_scope',
        'progress_percentage',
        'created_at',
    ]
    list_filter = ['status', 'share_scope', 'created_at']
    search_fields = ['user__name', 'user__email', 'title']
    ordering = ['-created_at']
    readonly_fields = ['user', 'template', 'progress_percentage', 'created_at', 'updated_at']
    
    fieldsets = [
        ('User', {
            'fields': ['user', 'template']
        }),
        ('Path', {
            'fields': ['title', 'description', 'status', 'share_scope']
        }),
        ('Progress', {
            'fields': ['progress_percentage', 'path_data']
        }),
        ('Timestamps', {
            'fields': ['created_at', 'updated_at'],
            'classes': ['collapse']
        }),
    ]
    
    def get_user_name(self, obj):
        return obj.user.name
    get_user_name.short_description = 'User'


class SchoolMemberInline(admin.TabularInline):
    model = SchoolMember
    extra = 0
    fields = ['user', 'role', 'joined_at']
    readonly_fields = ['joined_at']


@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = [
        'name',
        'school_type',
        'location',
        'invite_code',
        'member_count',
        'is_verified',
        'created_at',
    ]
    list_filter = ['school_type', 'is_verified', 'created_at']
    search_fields = ['name', 'location', 'invite_code']
    ordering = ['name']
    inlines = [SchoolMemberInline]
    readonly_fields = ['invite_code', 'member_count']
    
    fieldsets = [
        ('Basic', {
            'fields': ['name', 'school_type', 'location']
        }),
        ('Invite', {
            'fields': ['invite_code', 'member_count']
        }),
        ('Verification', {
            'fields': ['is_verified']
        }),
    ]
