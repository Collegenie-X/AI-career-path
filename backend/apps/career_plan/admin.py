"""
Django Admin configuration for career plan app
"""

from django.contrib import admin
from .models import ExecutionPlan, PlanItem, PlanGroup, PlanGroupMember


class PlanItemInline(admin.TabularInline):
    model = PlanItem
    extra = 0
    fields = ['title', 'status', 'due_date', 'order_index']
    ordering = ['order_index']


@admin.register(ExecutionPlan)
class ExecutionPlanAdmin(admin.ModelAdmin):
    list_display = [
        'get_user_name',
        'title',
        'status',
        'priority',
        'due_date',
        'progress_percentage',
        'created_at',
    ]
    list_filter = ['status', 'priority', 'due_date', 'created_at']
    search_fields = ['user__name', 'title', 'description']
    ordering = ['-created_at']
    inlines = [PlanItemInline]
    readonly_fields = ['progress_percentage', 'completed_at']
    
    def get_user_name(self, obj):
        return obj.user.name
    get_user_name.short_description = 'User'


@admin.register(PlanGroup)
class PlanGroupAdmin(admin.ModelAdmin):
    list_display = ['name', 'emoji', 'creator', 'member_count', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['-created_at']
    readonly_fields = ['member_count']
