"""
Django Admin configuration for community app
"""

from django.contrib import admin
from .models import (
    Group,
    GroupMember,
    SharedRoadmap,
    RoadmapComment,
    RoadmapLike,
    RoadmapBookmark,
)


class GroupMemberInline(admin.TabularInline):
    model = GroupMember
    extra = 0
    fields = ['user', 'role', 'joined_at']
    readonly_fields = ['joined_at']


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = [
        'name',
        'emoji',
        'creator',
        'member_count',
        'is_public',
        'created_at',
    ]
    list_filter = ['is_public', 'created_at']
    search_fields = ['name', 'description', 'invite_code']
    ordering = ['-created_at']
    inlines = [GroupMemberInline]
    readonly_fields = ['invite_code', 'member_count']


class RoadmapCommentInline(admin.TabularInline):
    model = RoadmapComment
    extra = 0
    fields = ['author', 'content', 'created_at']
    readonly_fields = ['created_at']


@admin.register(SharedRoadmap)
class SharedRoadmapAdmin(admin.ModelAdmin):
    list_display = [
        'title',
        'owner',
        'group',
        'share_scope',
        'likes',
        'bookmarks',
        'comments_count',
        'created_at',
    ]
    list_filter = ['share_scope', 'created_at']
    search_fields = ['title', 'description', 'owner__name']
    ordering = ['-created_at']
    inlines = [RoadmapCommentInline]
    readonly_fields = ['likes', 'bookmarks', 'comments_count']


@admin.register(RoadmapComment)
class RoadmapCommentAdmin(admin.ModelAdmin):
    list_display = ['get_roadmap_title', 'author', 'get_content_preview', 'created_at']
    list_filter = ['created_at']
    search_fields = ['content', 'author__name', 'roadmap__title']
    ordering = ['-created_at']
    
    def get_roadmap_title(self, obj):
        return obj.roadmap.title
    get_roadmap_title.short_description = 'Roadmap'
    
    def get_content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    get_content_preview.short_description = 'Comment'


@admin.register(RoadmapLike)
class RoadmapLikeAdmin(admin.ModelAdmin):
    list_display = ['roadmap', 'user', 'created_at']
    list_filter = ['created_at']
    search_fields = ['roadmap__title', 'user__name', 'user__email']
    ordering = ['-created_at']
    autocomplete_fields = ['roadmap', 'user']


@admin.register(RoadmapBookmark)
class RoadmapBookmarkAdmin(admin.ModelAdmin):
    list_display = ['roadmap', 'user', 'created_at']
    list_filter = ['created_at']
    search_fields = ['roadmap__title', 'user__name', 'user__email']
    ordering = ['-created_at']
    autocomplete_fields = ['roadmap', 'user']
