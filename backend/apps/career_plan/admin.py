"""
Career Plan (DreamMate) Admin - 커리어 실행 관리자 페이지

설계 문서: documents/backend/커리어실행_DreamMate_Django_DB_설계서.md
"""

from django.contrib import admin
from .models import (
    Roadmap, RoadmapItem, RoadmapTodo, RoadmapMilestone,
    DreamResource, ResourceSection,
    DreamSpace, SpaceParticipant,
    SharedDreamRoadmap, SharedDreamRoadmapGroup
)


# ============================================================================
# Roadmap Admin
# ============================================================================

class RoadmapTodoInline(admin.TabularInline):
    """로드맵 TODO 인라인"""
    model = RoadmapTodo
    extra = 0
    fields = ['week_label', 'week_number', 'entry_type', 'title', 'is_done', 'sort_order']
    ordering = ['week_number', 'sort_order']


class RoadmapItemInline(admin.TabularInline):
    """로드맵 활동 인라인"""
    model = RoadmapItem
    extra = 0
    fields = ['type', 'title', 'difficulty', 'sort_order']
    ordering = ['sort_order']


class RoadmapMilestoneInline(admin.TabularInline):
    """로드맵 마일스톤 인라인"""
    model = RoadmapMilestone
    extra = 0
    fields = ['title', 'month_week_label', 'recorded_at', 'sort_order']
    ordering = ['sort_order']


@admin.register(Roadmap)
class RoadmapAdmin(admin.ModelAdmin):
    """로드맵 관리자"""
    list_display = ['title', 'user', 'period', 'star_color', 'item_count', 'created_at']
    list_filter = ['period', 'created_at']
    search_fields = ['title', 'user__name', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
    inlines = [RoadmapItemInline, RoadmapMilestoneInline]
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('id', 'user', 'title', 'description', 'period', 'star_color')
        }),
        ('집중 활동', {
            'fields': ('focus_item_types',)
        }),
        ('최종 결과물', {
            'fields': (
                'final_result_title', 'final_result_description',
                'final_result_url', 'final_result_image_url'
            )
        }),
        ('타임스탬프', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(RoadmapItem)
class RoadmapItemAdmin(admin.ModelAdmin):
    """로드맵 활동 관리자"""
    list_display = ['title', 'roadmap', 'type', 'difficulty', 'sort_order', 'created_at']
    list_filter = ['type', 'difficulty', 'created_at']
    search_fields = ['title', 'roadmap__title']
    readonly_fields = ['id', 'created_at', 'updated_at']
    inlines = [RoadmapTodoInline]
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('id', 'roadmap', 'type', 'title', 'months', 'difficulty', 'sort_order')
        }),
        ('목표 및 성공 기준', {
            'fields': ('target_output', 'success_criteria')
        }),
        ('타임스탬프', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(RoadmapTodo)
class RoadmapTodoAdmin(admin.ModelAdmin):
    """로드맵 TODO 관리자"""
    list_display = ['title', 'roadmap_item', 'week_label', 'week_number', 'entry_type', 'is_done', 'sort_order']
    list_filter = ['is_done', 'entry_type', 'week_number', 'created_at']
    search_fields = ['title', 'roadmap_item__title']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('id', 'roadmap_item', 'week_label', 'week_number', 'entry_type', 'title', 'sort_order')
        }),
        ('완료 상태', {
            'fields': ('is_done', 'note', 'output_ref')
        }),
        ('타임스탬프', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(RoadmapMilestone)
class RoadmapMilestoneAdmin(admin.ModelAdmin):
    """로드맵 마일스톤 관리자"""
    list_display = ['title', 'roadmap', 'month_week_label', 'recorded_at', 'sort_order']
    list_filter = ['recorded_at', 'created_at']
    search_fields = ['title', 'roadmap__title', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('id', 'roadmap', 'title', 'description', 'month_week_label', 'sort_order')
        }),
        ('결과물', {
            'fields': ('time_log', 'result_url', 'image_url', 'recorded_at')
        }),
        ('타임스탬프', {
            'fields': ('created_at', 'updated_at')
        }),
    )


# ============================================================================
# Dream Resource Admin
# ============================================================================

class ResourceSectionInline(admin.TabularInline):
    """자료 섹션 인라인"""
    model = ResourceSection
    extra = 0
    fields = ['title', 'sort_order']
    ordering = ['sort_order']


@admin.register(DreamResource)
class DreamResourceAdmin(admin.ModelAdmin):
    """드림 자료 관리자"""
    list_display = ['title', 'user', 'type', 'share_type', 'like_count', 'download_count', 'created_at']
    list_filter = ['type', 'share_type', 'is_hidden', 'created_at']
    search_fields = ['title', 'user__name', 'description', 'tags']
    readonly_fields = ['id', 'like_count', 'bookmark_count', 'download_count', 'view_count', 'comment_count', 'created_at', 'updated_at']
    inlines = [ResourceSectionInline]
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('id', 'user', 'type', 'title', 'description', 'tags')
        }),
        ('파일', {
            'fields': ('file_url', 'thumbnail_url')
        }),
        ('공유 설정', {
            'fields': ('share_type', 'is_hidden')
        }),
        ('통계', {
            'fields': ('like_count', 'bookmark_count', 'download_count', 'view_count', 'comment_count')
        }),
        ('타임스탬프', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(ResourceSection)
class ResourceSectionAdmin(admin.ModelAdmin):
    """자료 섹션 관리자"""
    list_display = ['title', 'resource', 'sort_order', 'created_at']
    list_filter = ['created_at']
    search_fields = ['title', 'resource__title', 'content']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('id', 'resource', 'title', 'content', 'sort_order')
        }),
        ('타임스탬프', {
            'fields': ('created_at', 'updated_at')
        }),
    )


# ============================================================================
# Dream Space Admin
# ============================================================================

class SpaceParticipantInline(admin.TabularInline):
    """스페이스 참여자 인라인"""
    model = SpaceParticipant
    extra = 0
    fields = ['user', 'status', 'applied_at', 'approved_at', 'confirmed_at']
    readonly_fields = ['applied_at', 'approved_at', 'confirmed_at']


@admin.register(DreamSpace)
class DreamSpaceAdmin(admin.ModelAdmin):
    """드림 스페이스 관리자"""
    list_display = ['title', 'group', 'program_type', 'recruitment_status', 'current_participants', 'max_participants', 'created_at']
    list_filter = ['program_type', 'recruitment_status', 'created_at']
    search_fields = ['title', 'group__name', 'description']
    readonly_fields = ['id', 'current_participants', 'created_at', 'updated_at']
    inlines = [SpaceParticipantInline]
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('id', 'group', 'title', 'description', 'program_type')
        }),
        ('모집 정보', {
            'fields': ('recruitment_status', 'max_participants', 'current_participants')
        }),
        ('일정', {
            'fields': ('start_date', 'end_date')
        }),
        ('타임스탬프', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(SpaceParticipant)
class SpaceParticipantAdmin(admin.ModelAdmin):
    """스페이스 참여자 관리자"""
    list_display = ['user', 'space', 'status', 'applied_at', 'approved_at', 'confirmed_at']
    list_filter = ['status', 'applied_at', 'approved_at', 'confirmed_at']
    search_fields = ['user__name', 'space__title']
    readonly_fields = ['id', 'applied_at', 'approved_at', 'confirmed_at']
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('id', 'space', 'user', 'status')
        }),
        ('타임스탬프', {
            'fields': ('applied_at', 'approved_at', 'confirmed_at')
        }),
    )


# ============================================================================
# Shared Dream Roadmap Admin
# ============================================================================

class SharedDreamRoadmapGroupInline(admin.TabularInline):
    """공유 드림 로드맵-그룹 연결 인라인"""
    model = SharedDreamRoadmapGroup
    extra = 0
    fields = ['group']


@admin.register(SharedDreamRoadmap)
class SharedDreamRoadmapAdmin(admin.ModelAdmin):
    """공유 드림 로드맵 관리자"""
    list_display = ['roadmap', 'user', 'share_type', 'like_count', 'view_count', 'shared_at', 'is_hidden']
    list_filter = ['share_type', 'is_hidden', 'shared_at']
    search_fields = ['roadmap__title', 'user__name', 'description', 'tags']
    readonly_fields = ['id', 'like_count', 'bookmark_count', 'view_count', 'comment_count', 'shared_at']
    inlines = [SharedDreamRoadmapGroupInline]
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('id', 'roadmap', 'user', 'share_type', 'description', 'tags', 'is_hidden')
        }),
        ('통계', {
            'fields': ('like_count', 'bookmark_count', 'view_count', 'comment_count')
        }),
        ('타임스탬프', {
            'fields': ('shared_at',)
        }),
    )


@admin.register(SharedDreamRoadmapGroup)
class SharedDreamRoadmapGroupAdmin(admin.ModelAdmin):
    """공유 드림 로드맵-그룹 연결 관리자"""
    list_display = ['shared_roadmap', 'group', 'created_at']
    list_filter = ['created_at']
    search_fields = ['shared_roadmap__roadmap__title', 'group__name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('id', 'shared_roadmap', 'group')
        }),
        ('타임스탬프', {
            'fields': ('created_at', 'updated_at')
        }),
    )
