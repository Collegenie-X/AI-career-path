"""
Community models for groups, shared roadmaps, comments, and interactions
"""

from django.db import models
from django.contrib.auth import get_user_model
from common.models import TimeStampedModel, UUIDPrimaryKeyModel
from common.utils import generate_invite_code

User = get_user_model()


class Group(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    Group model for community features
    """
    name = models.CharField(max_length=200, verbose_name='그룹명')
    description = models.TextField(blank=True, verbose_name='설명')
    emoji = models.CharField(max_length=10, default='👥', verbose_name='이모지')
    
    creator = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='created_groups',
        verbose_name='생성자'
    )
    
    invite_code = models.CharField(
        max_length=20,
        unique=True,
        default=generate_invite_code,
        verbose_name='초대 코드'
    )
    
    member_count = models.IntegerField(default=1, verbose_name='멤버 수')
    
    is_public = models.BooleanField(default=False, verbose_name='공개 여부')
    
    class Meta:
        db_table = 'groups'
        verbose_name = '그룹'
        verbose_name_plural = '그룹 목록'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['creator']),
            models.Index(fields=['invite_code']),
            models.Index(fields=['is_public']),
        ]
    
    def __str__(self):
        return f"{self.emoji} {self.name}"


class GroupMember(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    Group membership model
    """
    ROLE_CHOICES = [
        ('admin', '관리자'),
        ('member', '멤버'),
    ]
    
    group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        related_name='members',
        verbose_name='그룹'
    )
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='group_memberships',
        verbose_name='사용자'
    )
    
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='member',
        verbose_name='역할'
    )
    
    joined_at = models.DateTimeField(auto_now_add=True, verbose_name='가입일')
    
    class Meta:
        db_table = 'group_members'
        verbose_name = '그룹 멤버'
        verbose_name_plural = '그룹 멤버 목록'
        ordering = ['-joined_at']
        unique_together = [['group', 'user']]
        indexes = [
            models.Index(fields=['group', 'role']),
            models.Index(fields=['user']),
        ]
    
    def __str__(self):
        return f"{self.user.name} - {self.group.name}"


class SharedRoadmap(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    Shared roadmap model
    """
    SHARE_SCOPE_CHOICES = [
        ('group', '그룹 공개'),
        ('public', '전체 공개'),
    ]
    
    career_plan = models.ForeignKey(
        'career_path.CareerPlan',
        on_delete=models.CASCADE,
        related_name='community_shared_roadmaps',
        null=True,
        blank=True,
        verbose_name='커리어 패스'
    )
    
    owner = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='shared_roadmaps',
        verbose_name='소유자'
    )
    
    group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        related_name='shared_roadmaps',
        null=True,
        blank=True,
        verbose_name='그룹'
    )
    
    title = models.CharField(max_length=300, verbose_name='제목')
    description = models.TextField(blank=True, verbose_name='설명')
    
    share_scope = models.CharField(
        max_length=20,
        choices=SHARE_SCOPE_CHOICES,
        default='group',
        verbose_name='공유 범위'
    )
    
    likes = models.IntegerField(default=0, verbose_name='좋아요 수')
    bookmarks = models.IntegerField(default=0, verbose_name='북마크 수')
    comments_count = models.IntegerField(default=0, verbose_name='댓글 수')
    
    class Meta:
        db_table = 'shared_roadmaps'
        verbose_name = '공유 로드맵'
        verbose_name_plural = '공유 로드맵 목록'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['owner', '-created_at']),
            models.Index(fields=['group', '-created_at']),
            models.Index(fields=['share_scope']),
            models.Index(fields=['-likes']),
        ]
    
    def __str__(self):
        return f"{self.owner.name} - {self.title}"


class RoadmapComment(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    Comment model for shared roadmaps
    """
    roadmap = models.ForeignKey(
        SharedRoadmap,
        on_delete=models.CASCADE,
        related_name='comments',
        verbose_name='로드맵'
    )
    
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='roadmap_comments',
        verbose_name='작성자'
    )
    
    content = models.TextField(verbose_name='댓글 내용')
    
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        related_name='replies',
        null=True,
        blank=True,
        verbose_name='상위 댓글'
    )
    
    class Meta:
        db_table = 'roadmap_comments'
        verbose_name = '로드맵 댓글'
        verbose_name_plural = '로드맵 댓글 목록'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['roadmap', 'created_at']),
            models.Index(fields=['author']),
            models.Index(fields=['parent']),
        ]
    
    def __str__(self):
        return f"{self.author.name} - {self.content[:50]}"


class RoadmapLike(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    Like model for shared roadmaps
    """
    roadmap = models.ForeignKey(
        SharedRoadmap,
        on_delete=models.CASCADE,
        related_name='likes_rel',
        verbose_name='로드맵'
    )
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='roadmap_likes',
        verbose_name='사용자'
    )
    
    class Meta:
        db_table = 'roadmap_likes'
        verbose_name = '로드맵 좋아요'
        verbose_name_plural = '로드맵 좋아요 목록'
        ordering = ['-created_at']
        unique_together = [['roadmap', 'user']]
        indexes = [
            models.Index(fields=['roadmap']),
            models.Index(fields=['user']),
        ]
    
    def __str__(self):
        return f"{self.user.name} likes {self.roadmap.title}"


class RoadmapBookmark(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    Bookmark model for shared roadmaps
    """
    roadmap = models.ForeignKey(
        SharedRoadmap,
        on_delete=models.CASCADE,
        related_name='bookmarks_rel',
        verbose_name='로드맵'
    )
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='roadmap_bookmarks',
        verbose_name='사용자'
    )
    
    class Meta:
        db_table = 'roadmap_bookmarks'
        verbose_name = '로드맵 북마크'
        verbose_name_plural = '로드맵 북마크 목록'
        ordering = ['-created_at']
        unique_together = [['roadmap', 'user']]
        indexes = [
            models.Index(fields=['roadmap']),
            models.Index(fields=['user', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.name} bookmarked {self.roadmap.title}"
