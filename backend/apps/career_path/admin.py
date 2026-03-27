"""
Career Path Admin - 커리어 패스 관리자

설계 문서: documents/backend/커리어패스_Career_Django_DB_설계서.md

Note: Group과 GroupMember는 community 앱에서 관리
"""

from django.contrib import admin
from .models import (
    School,
    CareerPlan, PlanYear, GoalGroup, PlanItem, SubItem, ItemLink,
    SharedPlan, SharedPlanGroup
)


# ============================================================================
# School Admin
# ============================================================================

@admin.register(School)
class SchoolAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'school_type', 'operator', 'member_count', 'created_at']
    list_filter = ['school_type', 'region', 'created_at']
    search_fields = ['name', 'code', 'operator__name']
    readonly_fields = ['id', 'code', 'created_at', 'updated_at']
    
    fieldsets = [
        ('기본 정보', {
            'fields': ['id', 'name', 'code', 'school_type', 'region', 'description']
        }),
        ('운영자', {
            'fields': ['operator', 'grades']
        }),
        ('통계', {
            'fields': ['member_count']
        }),
        ('타임스탬프', {
            'fields': ['created_at', 'updated_at']
        }),
    ]


# ============================================================================
# Career Plan Admin
# ============================================================================

class PlanYearInline(admin.TabularInline):
    model = PlanYear
    extra = 0
    fields = ['grade_id', 'grade_label', 'semester', 'sort_order']
    readonly_fields = ['id']


@admin.register(CareerPlan)
class CareerPlanAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'job_name', 'star_name', 'is_template', 'created_at']
    list_filter = ['is_template', 'job_id', 'star_id', 'created_at']
    search_fields = ['title', 'user__name', 'job_name', 'star_name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    inlines = [PlanYearInline]
    
    fieldsets = [
        ('기본 정보', {
            'fields': ['id', 'user', 'title', 'description']
        }),
        ('직업·적성', {
            'fields': [
                'job_id', 'job_name', 'job_emoji',
                'star_id', 'star_name', 'star_emoji', 'star_color'
            ]
        }),
        ('템플릿', {
            'fields': ['is_template', 'template_category']
        }),
        ('타임스탬프', {
            'fields': ['created_at', 'updated_at']
        }),
    ]


class GoalGroupInline(admin.TabularInline):
    model = GoalGroup
    extra = 0
    fields = ['goal', 'semester_id', 'sort_order']
    readonly_fields = ['id']


class PlanItemInline(admin.TabularInline):
    model = PlanItem
    extra = 0
    fields = ['type', 'title', 'months', 'difficulty', 'sort_order']
    readonly_fields = ['id']


@admin.register(PlanYear)
class PlanYearAdmin(admin.ModelAdmin):
    list_display = ['career_plan', 'grade_label', 'semester', 'sort_order']
    list_filter = ['semester', 'grade_id']
    search_fields = ['career_plan__title', 'grade_label']
    readonly_fields = ['id', 'created_at', 'updated_at']
    inlines = [GoalGroupInline, PlanItemInline]


@admin.register(GoalGroup)
class GoalGroupAdmin(admin.ModelAdmin):
    list_display = ['plan_year', 'goal', 'semester_id', 'sort_order']
    list_filter = ['semester_id']
    search_fields = ['goal', 'plan_year__career_plan__title']
    readonly_fields = ['id', 'created_at', 'updated_at']


class SubItemInline(admin.TabularInline):
    model = SubItem
    extra = 0
    fields = ['title', 'is_done', 'url', 'sort_order']
    readonly_fields = ['id']


class ItemLinkInline(admin.TabularInline):
    model = ItemLink
    extra = 0
    fields = ['title', 'url', 'kind', 'sort_order']
    readonly_fields = ['id']


@admin.register(PlanItem)
class PlanItemAdmin(admin.ModelAdmin):
    list_display = ['title', 'type', 'plan_year', 'goal_group', 'difficulty', 'sort_order']
    list_filter = ['type', 'activity_subtype', 'difficulty']
    search_fields = ['title', 'description', 'plan_year__career_plan__title']
    readonly_fields = ['id', 'created_at', 'updated_at']
    inlines = [SubItemInline, ItemLinkInline]
    
    fieldsets = [
        ('기본 정보', {
            'fields': ['id', 'plan_year', 'goal_group', 'type', 'title', 'description']
        }),
        ('실행 계획', {
            'fields': ['months', 'difficulty', 'cost', 'organizer', 'url']
        }),
        ('카테고리', {
            'fields': ['category_tags', 'activity_subtype']
        }),
        ('정렬', {
            'fields': ['sort_order']
        }),
        ('타임스탬프', {
            'fields': ['created_at', 'updated_at']
        }),
    ]


@admin.register(SubItem)
class SubItemAdmin(admin.ModelAdmin):
    list_display = ['title', 'plan_item', 'is_done', 'sort_order']
    list_filter = ['is_done']
    search_fields = ['title', 'plan_item__title']
    readonly_fields = ['id', 'created_at', 'updated_at']


@admin.register(ItemLink)
class ItemLinkAdmin(admin.ModelAdmin):
    list_display = ['title', 'plan_item', 'kind', 'url']
    list_filter = ['kind']
    search_fields = ['title', 'plan_item__title']
    readonly_fields = ['id', 'created_at', 'updated_at']


# ============================================================================
# Shared Plan Admin
# ============================================================================

@admin.register(SharedPlan)
class SharedPlanAdmin(admin.ModelAdmin):
    list_display = [
        'career_plan', 'user', 'share_type', 'school',
        'like_count', 'bookmark_count', 'view_count', 'comment_count',
        'shared_at', 'is_hidden'
    ]
    list_filter = ['share_type', 'is_hidden', 'shared_at']
    search_fields = ['career_plan__title', 'user__name', 'description', 'tags']
    readonly_fields = [
        'id', 'like_count', 'bookmark_count', 'view_count', 'comment_count',
        'shared_at', 'updated_at'
    ]
    
    fieldsets = [
        ('기본 정보', {
            'fields': ['id', 'career_plan', 'user', 'school']
        }),
        ('공유 설정', {
            'fields': ['share_type', 'description', 'tags', 'is_hidden']
        }),
        ('통계', {
            'fields': ['like_count', 'bookmark_count', 'view_count', 'comment_count']
        }),
        ('타임스탬프', {
            'fields': ['shared_at', 'updated_at']
        }),
    ]


@admin.register(SharedPlanGroup)
class SharedPlanGroupAdmin(admin.ModelAdmin):
    list_display = ['shared_plan', 'group', 'created_at']
    list_filter = ['created_at']
    search_fields = ['shared_plan__career_plan__title', 'group__name']
    readonly_fields = ['id', 'created_at', 'updated_at']
