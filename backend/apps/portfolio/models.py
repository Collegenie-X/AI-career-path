"""
Portfolio models for user achievements
"""

from django.db import models
from django.contrib.auth import get_user_model
from common.models import TimeStampedModel, UUIDPrimaryKeyModel

User = get_user_model()


class PortfolioItem(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    Portfolio item model for user achievements
    """
    ITEM_TYPE_CHOICES = [
        ('project', '프로젝트'),
        ('competition', '대회'),
        ('certification', '자격증'),
        ('activity', '활동'),
        ('research', '연구'),
        ('other', '기타'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='portfolio_items',
        verbose_name='사용자'
    )
    
    item_type = models.CharField(
        max_length=50,
        choices=ITEM_TYPE_CHOICES,
        default='project',
        verbose_name='항목 유형'
    )
    
    title = models.CharField(max_length=300, verbose_name='제목')
    description = models.TextField(verbose_name='설명')
    
    organization = models.CharField(max_length=200, blank=True, verbose_name='기관/단체')
    
    started_at = models.DateField(verbose_name='시작일')
    ended_at = models.DateField(null=True, blank=True, verbose_name='종료일')
    
    is_ongoing = models.BooleanField(default=False, verbose_name='진행 중')
    
    url = models.URLField(blank=True, verbose_name='관련 URL')
    image_url = models.URLField(blank=True, verbose_name='이미지 URL')
    
    tags = models.JSONField(default=list, verbose_name='태그')
    
    order_index = models.IntegerField(default=0, verbose_name='정렬 순서')
    
    class Meta:
        db_table = 'portfolio_items'
        verbose_name = '포트폴리오 항목'
        verbose_name_plural = '포트폴리오 항목 목록'
        ordering = ['user', 'order_index', '-started_at']
        indexes = [
            models.Index(fields=['user', 'item_type']),
            models.Index(fields=['started_at']),
        ]
    
    def __str__(self):
        return f"{self.user.name} - {self.title}"
