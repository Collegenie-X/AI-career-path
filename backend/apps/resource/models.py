"""
Resource models for learning materials
"""

from django.db import models
from django.contrib.auth import get_user_model
from common.models import TimeStampedModel, UUIDPrimaryKeyModel

User = get_user_model()


class Resource(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    Learning resource model
    """
    RESOURCE_TYPE_CHOICES = [
        ('article', '아티클'),
        ('video', '비디오'),
        ('book', '책'),
        ('course', '강의'),
        ('tool', '도구'),
        ('other', '기타'),
    ]
    
    title = models.CharField(max_length=300, verbose_name='제목')
    description = models.TextField(blank=True, verbose_name='설명')
    
    resource_type = models.CharField(
        max_length=50,
        choices=RESOURCE_TYPE_CHOICES,
        default='article',
        verbose_name='자료 유형'
    )
    
    url = models.URLField(verbose_name='URL')
    thumbnail_url = models.URLField(blank=True, verbose_name='썸네일 URL')
    
    tags = models.JSONField(default=list, verbose_name='태그')
    
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_resources',
        verbose_name='등록자'
    )
    
    view_count = models.IntegerField(default=0, verbose_name='조회수')
    
    is_active = models.BooleanField(default=True, verbose_name='활성 상태')
    
    class Meta:
        db_table = 'resources'
        verbose_name = '학습 자료'
        verbose_name_plural = '학습 자료 목록'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['resource_type', 'is_active']),
            models.Index(fields=['-view_count']),
        ]
    
    def __str__(self):
        return self.title
