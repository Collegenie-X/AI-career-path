"""
Serializers for community app
"""

from rest_framework import serializers
from .models import (
    Group,
    GroupMember,
    SharedRoadmap,
    RoadmapComment,
    RoadmapLike,
    RoadmapBookmark,
)


class GroupSerializer(serializers.ModelSerializer):
    """
    Serializer for Group model
    """
    creator_name = serializers.CharField(source='creator.name', read_only=True)
    
    class Meta:
        model = Group
        fields = [
            'id',
            'name',
            'description',
            'emoji',
            'creator',
            'creator_name',
            'invite_code',
            'member_count',
            'is_public',
            'created_at',
        ]
        read_only_fields = ['creator', 'invite_code', 'member_count', 'created_at']


class GroupMemberSerializer(serializers.ModelSerializer):
    """
    Serializer for GroupMember model
    """
    user_name = serializers.CharField(source='user.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    
    class Meta:
        model = GroupMember
        fields = [
            'id',
            'group',
            'user',
            'user_name',
            'user_email',
            'role',
            'joined_at',
        ]
        read_only_fields = ['joined_at']


class RoadmapCommentSerializer(serializers.ModelSerializer):
    """
    Serializer for RoadmapComment model
    """
    author_name = serializers.CharField(source='author.name', read_only=True)
    author_emoji = serializers.CharField(source='author.emoji', read_only=True)
    replies_count = serializers.SerializerMethodField()
    
    class Meta:
        model = RoadmapComment
        fields = [
            'id',
            'roadmap',
            'author',
            'author_name',
            'author_emoji',
            'content',
            'parent',
            'replies_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['author', 'created_at', 'updated_at']
    
    def get_replies_count(self, obj):
        return obj.replies.count()


class SharedRoadmapListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for shared roadmap list
    """
    owner_name = serializers.CharField(source='owner.name', read_only=True)
    owner_emoji = serializers.CharField(source='owner.emoji', read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)
    
    class Meta:
        model = SharedRoadmap
        fields = [
            'id',
            'career_plan',
            'owner',
            'owner_name',
            'owner_emoji',
            'group',
            'group_name',
            'title',
            'description',
            'share_scope',
            'likes',
            'bookmarks',
            'comments_count',
            'created_at',
        ]


class SharedRoadmapDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for shared roadmap
    """
    owner_name = serializers.CharField(source='owner.name', read_only=True)
    owner_emoji = serializers.CharField(source='owner.emoji', read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)
    comments = RoadmapCommentSerializer(many=True, read_only=True)
    
    class Meta:
        model = SharedRoadmap
        fields = [
            'id',
            'career_plan',
            'owner',
            'owner_name',
            'owner_emoji',
            'group',
            'group_name',
            'title',
            'description',
            'share_scope',
            'likes',
            'bookmarks',
            'comments_count',
            'comments',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['owner', 'likes', 'bookmarks', 'comments_count']


class SharedRoadmapCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating shared roadmap
    """
    class Meta:
        model = SharedRoadmap
        fields = ['career_plan', 'group', 'title', 'description', 'share_scope']
