"""
Career Plan (DreamMate) Admin - 커리어 실행 관리자 페이지

운영자는 로드맵 변경 화면에서 활동·TODO·마일스톤 통합 보기를 확인할 수 있습니다.
공유(커뮤니티)는 로드맵당 1행(career_path.SharedPlan 과 동일 패턴)입니다.

설계 문서: documents/backend/커리어실행_DreamMate_Django_DB_설계서.md
"""

from django.contrib import admin
from django.db.models import CharField, IntegerField, OuterRef, Subquery
from django.db.models.functions import Coalesce
from django.utils.html import format_html

from .admin_roadmap_overview_html import build_roadmap_overview_html
from .models import (
    Roadmap, RoadmapItem, RoadmapTodo, RoadmapMilestone,
    DreamResource, ResourceSection,
    DreamSpace, SpaceParticipant,
    SharedDreamRoadmap, SharedDreamRoadmapGroup,
    ExecutionPlanAiUsage,
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


class SharedDreamRoadmapInline(admin.TabularInline):
    """같은 로드맵에 대한 공유(커뮤니티) 설정 — DB상 로드맵당 1행만 허용"""
    model = SharedDreamRoadmap
    extra = 0
    max_num = 1
    can_delete = True
    fk_name = 'roadmap'
    fields = [
        'share_type', 'like_count', 'bookmark_count', 'view_count',
        'comment_count', 'report_count', 'is_hidden', 'shared_at',
    ]
    readonly_fields = [
        'like_count', 'bookmark_count', 'view_count', 'comment_count',
        'report_count', 'shared_at',
    ]
    show_change_link = True


@admin.register(Roadmap)
class RoadmapAdmin(admin.ModelAdmin):
    """로드맵 관리자"""
    change_form_template = 'admin/career_plan/roadmap/change_form.html'
    list_display = [
        'title',
        'user',
        'period',
        'summary_share_status',
        'summary_like',
        'summary_bookmark',
        'summary_report',
        'item_count',
        'created_at',
    ]
    list_filter = ['period', 'created_at']
    search_fields = ['title', 'user__name', 'description']
    readonly_fields = ['id', 'created_at', 'updated_at']
    inlines = [RoadmapItemInline, RoadmapMilestoneInline, SharedDreamRoadmapInline]
    ordering = ['-created_at']

    def changeform_view(self, request, object_id=None, form_url='', extra_context=None):
        extra_context = extra_context or {}
        if object_id:
            obj = self.get_object(request, object_id)
            if obj is not None:
                extra_context['roadmap_overview_tree'] = build_roadmap_overview_html(obj)
        return super().changeform_view(request, object_id, form_url, extra_context)

    def get_queryset(self, request):
        qs = super().get_queryset(request).select_related('user')
        latest_sr = SharedDreamRoadmap.objects.filter(roadmap=OuterRef('pk')).order_by('-shared_at', '-id')
        return qs.annotate(
            _hub_share_type=Subquery(
                latest_sr.values('share_type')[:1], output_field=CharField(max_length=20)
            ),
            _hub_like=Coalesce(
                Subquery(latest_sr.values('like_count')[:1], output_field=IntegerField()),
                0,
            ),
            _hub_bookmark=Coalesce(
                Subquery(latest_sr.values('bookmark_count')[:1], output_field=IntegerField()),
                0,
            ),
            _hub_report=Coalesce(
                Subquery(latest_sr.values('report_count')[:1], output_field=IntegerField()),
                0,
            ),
        )

    @admin.display(description='공개·공유', ordering='_hub_share_type')
    def summary_share_status(self, obj):
        st = getattr(obj, '_hub_share_type', None)
        if st is None:
            return format_html('<span style="color:#888;">미공유</span>')
        label = dict(SharedDreamRoadmap.SHARE_TYPE_CHOICES).get(st, st)
        return label

    @admin.display(description='좋아요', ordering='_hub_like')
    def summary_like(self, obj):
        return getattr(obj, '_hub_like', 0) or 0

    @admin.display(description='북마크', ordering='_hub_bookmark')
    def summary_bookmark(self, obj):
        return getattr(obj, '_hub_bookmark', 0) or 0

    @admin.display(description='신고', ordering='_hub_report')
    def summary_report(self, obj):
        return getattr(obj, '_hub_report', 0) or 0

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
    list_display = [
        'roadmap', 'user', 'share_type', 'like_count', 'view_count',
        'report_count', 'shared_at', 'is_hidden',
    ]
    list_filter = ['share_type', 'is_hidden', 'shared_at']
    search_fields = ['roadmap__title', 'user__name', 'description', 'tags']
    readonly_fields = [
        'id', 'like_count', 'bookmark_count', 'view_count', 'comment_count',
        'report_count', 'shared_at',
    ]
    inlines = [SharedDreamRoadmapGroupInline]
    
    fieldsets = (
        ('기본 정보', {
            'fields': ('id', 'roadmap', 'user', 'share_type', 'description', 'tags', 'is_hidden')
        }),
        ('통계', {
            'fields': (
                'like_count', 'bookmark_count', 'view_count', 'comment_count', 'report_count',
            )
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


@admin.register(ExecutionPlanAiUsage)
class ExecutionPlanAiUsageAdmin(admin.ModelAdmin):
    """실행계획 AI 월별 호출 횟수"""

    list_display = ['user', 'period_key', 'call_count', 'updated_at']
    list_filter = ['period_key']
    search_fields = ['user__email', 'user__username']
    readonly_fields = ['created_at', 'updated_at']
