"""
Career execution plan models
"""

from django.db import models
from django.contrib.auth import get_user_model
from common.models import TimeStampedModel, UUIDPrimaryKeyModel

User = get_user_model()


class ExecutionPlan(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    Execution plan model for career activities
    """
    STATUS_CHOICES = [
        ('todo', '할 일'),
        ('in_progress', '진행 중'),
        ('completed', '완료'),
        ('cancelled', '취소'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', '낮음'),
        ('medium', '보통'),
        ('high', '높음'),
        ('urgent', '긴급'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='execution_plans',
        verbose_name='사용자'
    )
    
    title = models.CharField(max_length=300, verbose_name='제목')
    description = models.TextField(blank=True, verbose_name='설명')
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='todo',
        verbose_name='상태'
    )
    
    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES,
        default='medium',
        verbose_name='우선순위'
    )
    
    due_date = models.DateField(null=True, blank=True, verbose_name='마감일')
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name='완료일')
    
    progress_percentage = models.IntegerField(default=0, verbose_name='진행률')
    
    class Meta:
        db_table = 'execution_plans'
        verbose_name = '실행 계획'
        verbose_name_plural = '실행 계획 목록'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['due_date']),
            models.Index(fields=['priority']),
        ]
    
    def __str__(self):
        return f"{self.user.name} - {self.title}"


class PlanItem(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    Individual item in an execution plan
    """
    STATUS_CHOICES = [
        ('todo', '할 일'),
        ('in_progress', '진행 중'),
        ('completed', '완료'),
        ('cancelled', '취소'),
    ]
    
    plan = models.ForeignKey(
        ExecutionPlan,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name='실행 계획'
    )
    
    title = models.CharField(max_length=300, verbose_name='제목')
    description = models.TextField(blank=True, verbose_name='설명')
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='todo',
        verbose_name='상태'
    )
    
    due_date = models.DateField(null=True, blank=True, verbose_name='마감일')
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name='완료일')
    
    order_index = models.IntegerField(default=0, verbose_name='정렬 순서')
    
    class Meta:
        db_table = 'plan_items'
        verbose_name = '계획 항목'
        verbose_name_plural = '계획 항목 목록'
        ordering = ['plan', 'order_index']
        indexes = [
            models.Index(fields=['plan', 'status']),
            models.Index(fields=['due_date']),
        ]
    
    def __str__(self):
        return f"{self.plan.title} - {self.title}"


class PlanGroup(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    Group for sharing execution plans
    """
    name = models.CharField(max_length=200, verbose_name='그룹명')
    description = models.TextField(blank=True, verbose_name='설명')
    emoji = models.CharField(max_length=10, default='📋', verbose_name='이모지')
    
    creator = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='created_plan_groups',
        verbose_name='생성자'
    )
    
    member_count = models.IntegerField(default=1, verbose_name='멤버 수')
    
    class Meta:
        db_table = 'plan_groups'
        verbose_name = '계획 그룹'
        verbose_name_plural = '계획 그룹 목록'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['creator']),
        ]
    
    def __str__(self):
        return f"{self.emoji} {self.name}"


class PlanGroupMember(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    Membership for plan groups
    """
    ROLE_CHOICES = [
        ('admin', '관리자'),
        ('member', '멤버'),
    ]
    
    group = models.ForeignKey(
        PlanGroup,
        on_delete=models.CASCADE,
        related_name='members',
        verbose_name='그룹'
    )
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='plan_group_memberships',
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
        db_table = 'plan_group_members'
        verbose_name = '계획 그룹 멤버'
        verbose_name_plural = '계획 그룹 멤버 목록'
        ordering = ['-joined_at']
        unique_together = [['group', 'user']]
        indexes = [
            models.Index(fields=['group', 'role']),
            models.Index(fields=['user']),
        ]
    
    def __str__(self):
        return f"{self.user.name} - {self.group.name}"
