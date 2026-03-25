"""
Django Admin configuration for quiz app
"""

from django.contrib import admin
from .models import QuizQuestion, QuizChoice, QuizResult, RiasecReport


class QuizChoiceInline(admin.TabularInline):
    """
    Inline admin for quiz choices
    """
    model = QuizChoice
    extra = 0
    fields = ['choice_key', 'text', 'riasec_scores', 'order_index']
    ordering = ['order_index']


@admin.register(QuizQuestion)
class QuizQuestionAdmin(admin.ModelAdmin):
    """
    Admin for quiz questions
    """
    list_display = [
        'order_index',
        'zone',
        'zone_icon',
        'situation',
        'is_active',
        'created_at',
    ]
    list_filter = ['zone', 'is_active', 'created_at']
    search_fields = ['situation', 'description']
    ordering = ['order_index']
    inlines = [QuizChoiceInline]
    
    fieldsets = [
        ('Basic', {
            'fields': ['order_index', 'zone', 'zone_icon', 'is_active']
        }),
        ('Question', {
            'fields': ['situation', 'description']
        }),
        ('Feedback', {
            'fields': ['feedback_map'],
            'classes': ['collapse']
        }),
    ]


@admin.register(QuizResult)
class QuizResultAdmin(admin.ModelAdmin):
    """
    Admin for quiz results (read-only)
    """
    list_display = [
        'get_user_name',
        'mode',
        'top_type',
        'second_type',
        'get_top_score',
        'taken_at',
    ]
    list_filter = ['mode', 'top_type', 'taken_at']
    search_fields = ['user__name', 'user__email']
    ordering = ['-taken_at']
    readonly_fields = [
        'user',
        'mode',
        'answers',
        'riasec_scores',
        'top_type',
        'second_type',
        'taken_at',
    ]
    
    fieldsets = [
        ('User', {
            'fields': ['user', 'mode', 'taken_at']
        }),
        ('Result', {
            'fields': ['riasec_scores', 'top_type', 'second_type']
        }),
        ('Answers', {
            'fields': ['answers'],
            'classes': ['collapse']
        }),
    ]
    
    def get_user_name(self, obj):
        return obj.user.name if obj.user else 'Anonymous'
    get_user_name.short_description = 'User'
    
    def get_top_score(self, obj):
        if obj.riasec_scores and obj.top_type:
            return obj.riasec_scores.get(obj.top_type, 0)
        return 0
    get_top_score.short_description = 'Top score'
    
    def has_add_permission(self, request):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(RiasecReport)
class RiasecReportAdmin(admin.ModelAdmin):
    """
    Admin for RIASEC reports
    """
    list_display = [
        'riasec_type',
        'type_name',
        'emoji',
        'tagline',
        'color',
    ]
    search_fields = ['riasec_type', 'type_name', 'tagline']
    ordering = ['riasec_type']
    
    fieldsets = [
        ('Basic', {
            'fields': ['riasec_type', 'type_name', 'emoji', 'tagline', 'color']
        }),
        ('Description', {
            'fields': ['description']
        }),
        ('Traits', {
            'fields': ['strengths', 'weaknesses']
        }),
        ('Career', {
            'fields': ['career_keywords', 'recommended_activities', 'famous_people']
        }),
    ]
