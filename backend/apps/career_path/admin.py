"""
Career Path Admin - 커리어 패스 관리자

운영자는 주로 다음 두 메뉴를 사용하면 됩니다.
- 커리어 패스 목록: 클릭 시 학년·목표·활동 통합 보기 + 인라인 편집
- 공유 커리어 패스 목록: 공개 범위·숨김을 목록에서 바로 변경
"""

from django.contrib import admin
from django.db.models import CharField, IntegerField, OuterRef, Subquery
from django.db.models.functions import Coalesce
from django.urls import reverse
from django.utils.html import format_html

from .admin_career_overview_html import build_nested_career_plan_overview_html
from .models import (
    School,
    CareerPlan,
    PlanYear,
    GoalGroup,
    PlanItem,
    SubItem,
    ItemLink,
    SharedPlan,
    SharedPlanComment,
    SharedPlanGroup,
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
# Career Plan Admin (통합 요약)
# ============================================================================

class PlanYearInline(admin.StackedInline):
    model = PlanYear
    extra = 0
    fields = ['grade_id', 'grade_label', 'semester', 'sort_order']
    readonly_fields = ['id']
    show_change_link = True


class SharedPlanInline(admin.TabularInline):
    """같은 커리어 패스에 대한 공유(커뮤니티) 설정 — DB상 패스당 1행만 허용"""
    model = SharedPlan
    extra = 0
    max_num = 1
    can_delete = True
    fk_name = 'career_plan'
    fields = [
        'share_type', 'like_count', 'bookmark_count', 'view_count',
        'comment_count', 'report_count', 'is_hidden', 'shared_at',
    ]
    readonly_fields = ['like_count', 'bookmark_count', 'view_count', 'comment_count', 'shared_at']
    show_change_link = True


@admin.register(CareerPlan)
class CareerPlanAdmin(admin.ModelAdmin):
    change_form_template = 'admin/career_path/careerplan/change_form.html'
    list_display = [
        'title',
        'user',
        'job_name',
        'summary_share_status',
        'summary_like',
        'summary_bookmark',
        'summary_report',
        'is_template',
        'created_at',
    ]
    list_filter = ['is_template', 'created_at']
    search_fields = ['title', 'user__name', 'job_name', 'star_name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    inlines = [PlanYearInline, SharedPlanInline]
    ordering = ['-created_at']

    def changeform_view(self, request, object_id=None, form_url='', extra_context=None):
        extra_context = extra_context or {}
        if object_id:
            obj = self.get_object(request, object_id)
            if obj is not None:
                extra_context['nested_career_plan_tree'] = build_nested_career_plan_overview_html(
                    obj
                )
        return super().changeform_view(request, object_id, form_url, extra_context)

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

    def get_queryset(self, request):
        qs = super().get_queryset(request).select_related('user')
        latest_sp = SharedPlan.objects.filter(career_plan=OuterRef('pk')).order_by('-shared_at', '-id')
        return qs.annotate(
            _hub_share_type=Subquery(latest_sp.values('share_type')[:1], output_field=CharField(max_length=20)),
            _hub_like=Coalesce(
                Subquery(latest_sp.values('like_count')[:1], output_field=IntegerField()),
                0,
            ),
            _hub_bookmark=Coalesce(
                Subquery(latest_sp.values('bookmark_count')[:1], output_field=IntegerField()),
                0,
            ),
            _hub_report=Coalesce(
                Subquery(latest_sp.values('report_count')[:1], output_field=IntegerField()),
                0,
            ),
        )

    @admin.display(description='공개·공유', ordering='_hub_share_type')
    def summary_share_status(self, obj):
        st = getattr(obj, '_hub_share_type', None)
        if st is None:
            return format_html('<span style="color:#888;">미공유</span>')
        label = dict(SharedPlan.SHARE_TYPE_CHOICES).get(st, st)
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


class GoalGroupInline(admin.TabularInline):
    model = GoalGroup
    extra = 0
    fields = ['goal', 'semester_id', 'sort_order']
    readonly_fields = ['id']


class PlanYearRootPlanItemInline(admin.TabularInline):
    """
    목표 그룹에 넣지 않은 활동만 표시.
    (목표별 활동은 통합 보기 또는 목표 그룹 인라인과 겹치지 않도록 분리)
    """
    model = PlanItem
    fk_name = 'plan_year'
    extra = 0
    verbose_name = '학년 직속 활동'
    verbose_name_plural = '학년 직속 활동 (목표 그룹 미지정)'
    fields = ['type', 'title', 'months', 'difficulty', 'sort_order']
    readonly_fields = ['id']
    show_change_link = True

    def get_queryset(self, request):
        return super().get_queryset(request).filter(goal_group__isnull=True)


@admin.register(PlanYear)
class PlanYearAdmin(admin.ModelAdmin):
    change_form_template = 'admin/career_path/planyear/change_form.html'
    list_display = ['career_plan', 'grade_label', 'semester', 'sort_order']
    list_filter = ['semester', 'grade_id']
    search_fields = ['career_plan__title', 'grade_label']
    readonly_fields = ['id', 'created_at', 'updated_at']
    inlines = [GoalGroupInline, PlanYearRootPlanItemInline]

    def changeform_view(self, request, object_id=None, form_url='', extra_context=None):
        extra_context = extra_context or {}
        if object_id:
            obj = self.get_object(request, object_id)
            if obj is not None and getattr(obj, 'career_plan_id', None):
                extra_context['nested_career_plan_tree'] = build_nested_career_plan_overview_html(
                    obj.career_plan
                )
        return super().changeform_view(request, object_id, form_url, extra_context)


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
    """
    활동은 학년(PlanYear)·목표 그룹(GoalGroup)별로 한 행입니다.
    동일 제목이 여러 줄이면 중복 데이터일 수 있으므로,
    커리어 패스 상세에서 트리로 보거나 `dedupe_plan_items` 명령으로 정리하세요.
    """
    list_display = ['title', 'type', 'plan_year', 'goal_group', 'difficulty', 'sort_order']
    list_filter = ['type', 'activity_subtype', 'difficulty', 'plan_year__career_plan']
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


@admin.register(SharedPlanComment)
class SharedPlanCommentAdmin(admin.ModelAdmin):
    list_display = ['content_preview', 'shared_plan', 'author', 'created_at']
    list_filter = ['created_at']
    search_fields = ['content', 'shared_plan__career_plan__title', 'author__name']
    readonly_fields = ['id', 'created_at', 'updated_at']
    ordering = ['-created_at']

    @admin.display(description='내용')
    def content_preview(self, obj):
        t = obj.content or ''
        return t[:100] + ('…' if len(t) > 100 else '')


# ============================================================================
# Shared Plan Admin (목록에서 공개 범위 제어)
# ============================================================================

@admin.register(SharedPlan)
class SharedPlanAdmin(admin.ModelAdmin):
    """
    커뮤니티에 올라간 공유 패스를 한눈에 보고,
    공유 유형(비공개/전체·학교·그룹)과 숨김 여부를 목록에서 바로 수정합니다.
    """
    list_select_related = ('career_plan', 'user', 'school')
    list_display = [
        'career_plan_title_link',
        'user',
        'share_type',
        'like_count',
        'bookmark_count',
        'view_count',
        'comment_count',
        'report_count',
        'shared_at',
        'is_hidden',
    ]
    list_editable = ['share_type', 'is_hidden']
    list_display_links = ['career_plan_title_link']
    list_filter = ['share_type', 'is_hidden', 'shared_at']
    search_fields = ['career_plan__title', 'user__name', 'description', 'tags']
    readonly_fields = [
        'id',
        'like_count',
        'bookmark_count',
        'view_count',
        'comment_count',
        'shared_at',
        'updated_at',
    ]
    ordering = ['-shared_at']
    save_on_top = True

    fieldsets = [
        ('기본 정보', {
            'fields': ['id', 'career_plan', 'user', 'school']
        }),
        ('공유 설정', {
            'fields': ['share_type', 'description', 'tags', 'is_hidden']
        }),
        ('통계', {
            'fields': ['like_count', 'bookmark_count', 'view_count', 'comment_count', 'report_count']
        }),
        ('타임스탬프', {
            'fields': ['shared_at', 'updated_at']
        }),
    ]

    @admin.display(description='커리어 패스 (클릭 시 이 공유 레코드 편집)')
    def career_plan_title_link(self, obj):
        url = reverse('admin:career_path_sharedplan_change', args=[obj.pk])
        title = obj.career_plan.title if obj.career_plan_id else '—'
        return format_html('<a href="{}">{}</a>', url, title)


@admin.register(SharedPlanGroup)
class SharedPlanGroupAdmin(admin.ModelAdmin):
    list_display = ['shared_plan', 'group', 'created_at']
    list_filter = ['created_at']
    search_fields = ['shared_plan__career_plan__title', 'group__name']
    readonly_fields = ['id', 'created_at', 'updated_at']
