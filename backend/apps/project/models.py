"""
Project models for project management
"""

from django.db import models
from django.contrib.auth import get_user_model
from common.models import TimeStampedModel, UUIDPrimaryKeyModel

User = get_user_model()


class Project(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    Project template model
    """
    DIFFICULTY_CHOICES = [
        ('beginner', '초급'),
        ('intermediate', '중급'),
        ('advanced', '고급'),
    ]
    
    title = models.CharField(max_length=300, verbose_name='프로젝트명')
    description = models.TextField(verbose_name='설명')
    
    difficulty = models.CharField(
        max_length=20,
        choices=DIFFICULTY_CHOICES,
        default='intermediate',
        verbose_name='난이도'
    )
    
    estimated_hours = models.IntegerField(default=0, verbose_name='예상 소요 시간')
    
    tech_stack = models.JSONField(default=list, verbose_name='기술 스택')
    learning_objectives = models.JSONField(default=list, verbose_name='학습 목표')
    
    thumbnail_url = models.URLField(blank=True, verbose_name='썸네일 URL')
    
    is_active = models.BooleanField(default=True, verbose_name='활성 상태')
    
    class Meta:
        db_table = 'projects'
        verbose_name = '프로젝트'
        verbose_name_plural = '프로젝트 목록'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['difficulty', 'is_active']),
        ]
    
    def __str__(self):
        return self.title


class UserProject(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    User's project instance
    """
    STATUS_CHOICES = [
        ('planning', '계획 중'),
        ('in_progress', '진행 중'),
        ('completed', '완료'),
        ('paused', '일시 중지'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='projects',
        verbose_name='사용자'
    )
    
    project = models.ForeignKey(
        Project,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='user_projects',
        verbose_name='프로젝트 템플릿'
    )
    
    title = models.CharField(max_length=300, verbose_name='제목')
    description = models.TextField(blank=True, verbose_name='설명')
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='planning',
        verbose_name='상태'
    )
    
    github_url = models.URLField(blank=True, verbose_name='GitHub URL')
    demo_url = models.URLField(blank=True, verbose_name='데모 URL')
    
    started_at = models.DateField(null=True, blank=True, verbose_name='시작일')
    completed_at = models.DateField(null=True, blank=True, verbose_name='완료일')
    
    class Meta:
        db_table = 'user_projects'
        verbose_name = '사용자 프로젝트'
        verbose_name_plural = '사용자 프로젝트 목록'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
        ]
    
    def __str__(self):
        return f"{self.user.name} - {self.title}"
