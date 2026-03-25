"""
Django Admin configuration for explore app
"""

from django.contrib import admin
from django.utils.html import format_html
from .models import (
    JobCategory,
    Job,
    JobCareerPathStage,
    JobCareerPathTask,
    JobKeyPreparation,
    JobInfographic,
    HighSchoolCategory,
    HighSchool,
    HighSchoolAdmissionStep,
    HighSchoolHighlightStat,
    HighSchoolInfographic,
    UniversityAdmissionCategory,
    University,
    UniversityDepartment,
    UniversityAdmissionPlaybook,
    UniversityInfographic,
)


@admin.register(JobCategory)
class JobCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'emoji', 'color', 'order_index', 'created_at']
    list_editable = ['order_index']
    search_fields = ['name']
    ordering = ['order_index']


class JobCareerPathTaskInline(admin.TabularInline):
    model = JobCareerPathTask
    extra = 0
    fields = ['task_description', 'order_index']
    ordering = ['order_index']


class JobCareerPathStageInline(admin.StackedInline):
    model = JobCareerPathStage
    extra = 0
    fields = ['stage', 'period', 'icon', 'order_index']
    ordering = ['order_index']


class JobKeyPreparationInline(admin.TabularInline):
    model = JobKeyPreparation
    extra = 0
    fields = ['preparation_item', 'order_index']
    ordering = ['order_index']


class JobInfographicInline(admin.TabularInline):
    model = JobInfographic
    extra = 0
    fields = ['infographic_type', 'title', 'image_url', 'order_index']
    ordering = ['order_index']


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = [
        'name',
        'emoji',
        'category',
        'difficulty',
        'rarity',
        'is_active',
        'created_at',
    ]
    list_filter = ['category', 'difficulty', 'rarity', 'is_active']
    search_fields = ['name', 'name_en', 'description', 'company']
    ordering = ['category', 'name']
    inlines = [JobCareerPathStageInline, JobKeyPreparationInline, JobInfographicInline]
    
    fieldsets = [
        ('Basic', {
            'fields': ['id', 'name', 'name_en', 'emoji', 'category', 'kingdom_id']
        }),
        ('Classification', {
            'fields': ['rarity', 'difficulty', 'is_active']
        }),
        ('Description', {
            'fields': ['description', 'short_description']
        }),
        ('Company & salary', {
            'fields': ['company', 'salary_range']
        }),
        ('Outlook', {
            'fields': ['future_outlook', 'outlook_score']
        }),
        ('RIASEC', {
            'fields': ['riasec_profile'],
            'classes': ['collapse']
        }),
    ]


@admin.register(JobInfographic)
class JobInfographicAdmin(admin.ModelAdmin):
    list_display = ['job', 'infographic_type', 'title', 'image_preview', 'view_count', 'created_at']
    list_filter = ['infographic_type', 'created_at']
    search_fields = ['job__name', 'title']
    ordering = ['job', 'order_index']
    
    def image_preview(self, obj):
        if obj.image_url:
            return format_html(
                '<img src="{}" width="100" height="60" style="object-fit: cover; border-radius: 4px;" />',
                obj.image_url
            )
        return '-'
    image_preview.short_description = 'Preview'


@admin.register(HighSchoolCategory)
class HighSchoolCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'emoji', 'color', 'planet_size', 'order_index', 'created_at']
    list_editable = ['order_index']
    search_fields = ['name']
    ordering = ['order_index']


class HighSchoolAdmissionStepInline(admin.TabularInline):
    model = HighSchoolAdmissionStep
    extra = 0
    fields = ['step', 'title', 'icon', 'order_index']
    ordering = ['order_index']


class HighSchoolHighlightStatInline(admin.TabularInline):
    model = HighSchoolHighlightStat
    extra = 0
    fields = ['label', 'value', 'emoji', 'color', 'order_index']
    ordering = ['order_index']


class HighSchoolInfographicInline(admin.TabularInline):
    model = HighSchoolInfographic
    extra = 0
    fields = ['infographic_type', 'title', 'image_url', 'order_index']
    ordering = ['order_index']


@admin.register(HighSchool)
class HighSchoolAdmin(admin.ModelAdmin):
    list_display = [
        'name',
        'category',
        'school_type',
        'difficulty',
        'dormitory',
        'is_active',
        'created_at',
    ]
    list_filter = ['category', 'school_type', 'difficulty', 'dormitory', 'ib_certified', 'is_active']
    search_fields = ['name', 'location']
    ordering = ['category', 'name']
    inlines = [HighSchoolAdmissionStepInline, HighSchoolHighlightStatInline, HighSchoolInfographicInline]
    
    fieldsets = [
        ('Basic', {
            'fields': ['id', 'name', 'category', 'location', 'school_type']
        }),
        ('Admission', {
            'fields': ['difficulty', 'annual_admission', 'tuition', 'dormitory', 'ib_certified']
        }),
        ('Education', {
            'fields': ['education_philosophy', 'curriculum_features']
        }),
        ('Other', {
            'fields': ['website_url', 'is_active']
        }),
    ]


@admin.register(HighSchoolInfographic)
class HighSchoolInfographicAdmin(admin.ModelAdmin):
    list_display = ['high_school', 'infographic_type', 'title', 'image_preview', 'view_count', 'created_at']
    list_filter = ['infographic_type', 'created_at']
    search_fields = ['high_school__name', 'title']
    ordering = ['high_school', 'order_index']
    
    def image_preview(self, obj):
        if obj.image_url:
            return format_html(
                '<img src="{}" width="100" height="60" style="object-fit: cover; border-radius: 4px;" />',
                obj.image_url
            )
        return '-'
    image_preview.short_description = 'Preview'


@admin.register(UniversityAdmissionCategory)
class UniversityAdmissionCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'emoji', 'color', 'planet_size', 'order_index', 'created_at']
    list_editable = ['order_index']
    search_fields = ['name']
    ordering = ['order_index']


class UniversityDepartmentInline(admin.TabularInline):
    model = UniversityDepartment
    extra = 0
    fields = ['department_name', 'college', 'admission_category', 'is_active']


class UniversityInfographicInline(admin.TabularInline):
    model = UniversityInfographic
    extra = 0
    fields = ['infographic_type', 'title', 'image_url', 'order_index']
    ordering = ['order_index']


@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ['name', 'short_name', 'university_type', 'region', 'is_active', 'created_at']
    list_filter = ['university_type', 'region', 'is_active']
    search_fields = ['name', 'short_name']
    ordering = ['name']
    inlines = [UniversityDepartmentInline, UniversityInfographicInline]
    
    fieldsets = [
        ('Basic', {
            'fields': ['id', 'name', 'short_name', 'university_type', 'region']
        }),
        ('Description', {
            'fields': ['description', 'website_url']
        }),
        ('Status', {
            'fields': ['is_active']
        }),
    ]


@admin.register(UniversityInfographic)
class UniversityInfographicAdmin(admin.ModelAdmin):
    list_display = ['get_target', 'infographic_type', 'title', 'image_preview', 'view_count', 'created_at']
    list_filter = ['infographic_type', 'created_at']
    search_fields = ['university__name', 'admission_category__name', 'title']
    ordering = ['order_index']
    
    def get_target(self, obj):
        if obj.university:
            return f"University: {obj.university.name}"
        elif obj.admission_category:
            return f"Track: {obj.admission_category.name}"
        return "All"
    get_target.short_description = 'Target'
    
    def image_preview(self, obj):
        if obj.image_url:
            return format_html(
                '<img src="{}" width="100" height="60" style="object-fit: cover; border-radius: 4px;" />',
                obj.image_url
            )
        return '-'
    image_preview.short_description = 'Preview'
