"""
Models for quiz questions, choices, results, and RIASEC reports
"""

from django.db import models
from django.contrib.auth import get_user_model
from common.models import TimeStampedModel, UUIDPrimaryKeyModel

User = get_user_model()


class QuizQuestion(TimeStampedModel):
    """
    Quiz question model for RIASEC personality test
    """
    order_index = models.IntegerField(verbose_name='문제 순서')
    zone = models.CharField(max_length=100, verbose_name='존 이름')
    zone_icon = models.CharField(max_length=10, default='🎯', verbose_name='존 아이콘')
    situation = models.CharField(max_length=200, verbose_name='상황')
    description = models.TextField(verbose_name='문제 설명')
    feedback_map = models.JSONField(default=dict, verbose_name='선택지별 피드백')
    is_active = models.BooleanField(default=True, verbose_name='활성 상태')
    
    class Meta:
        db_table = 'quiz_questions'
        verbose_name = '적성 검사 문제'
        verbose_name_plural = '적성 검사 문제 목록'
        ordering = ['order_index']
        indexes = [
            models.Index(fields=['order_index']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"Q{self.order_index}: {self.situation}"


class QuizChoice(models.Model):
    """
    Quiz choice model for each question
    """
    question = models.ForeignKey(
        QuizQuestion,
        on_delete=models.CASCADE,
        related_name='choices',
        verbose_name='문제'
    )
    choice_key = models.CharField(max_length=10, verbose_name='선택지 키')
    text = models.TextField(verbose_name='선택지 텍스트')
    riasec_scores = models.JSONField(default=dict, verbose_name='RIASEC 점수')
    order_index = models.IntegerField(verbose_name='선택지 순서')
    
    class Meta:
        db_table = 'quiz_choices'
        verbose_name = '적성 검사 선택지'
        verbose_name_plural = '적성 검사 선택지 목록'
        ordering = ['question', 'order_index']
        unique_together = [['question', 'choice_key']]
        indexes = [
            models.Index(fields=['question', 'order_index']),
        ]
    
    def __str__(self):
        return f"{self.question.situation} - {self.choice_key}"


class QuizResult(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    Quiz result model storing user's test results
    """
    MODE_CHOICES = [
        ('quick', '빠른 검사'),
        ('full', '전체 검사'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='quiz_results',
        null=True,
        blank=True,
        verbose_name='사용자'
    )
    mode = models.CharField(
        max_length=10,
        choices=MODE_CHOICES,
        default='full',
        verbose_name='검사 모드'
    )
    answers = models.JSONField(default=list, verbose_name='답변 내역')
    riasec_scores = models.JSONField(default=dict, verbose_name='RIASEC 점수')
    top_type = models.CharField(max_length=2, verbose_name='1순위 타입')
    second_type = models.CharField(max_length=2, blank=True, verbose_name='2순위 타입')
    taken_at = models.DateTimeField(auto_now_add=True, verbose_name='응시 일시')
    
    class Meta:
        db_table = 'quiz_results'
        verbose_name = '적성 검사 결과'
        verbose_name_plural = '적성 검사 결과 목록'
        ordering = ['-taken_at']
        indexes = [
            models.Index(fields=['user', '-taken_at']),
            models.Index(fields=['top_type']),
            models.Index(fields=['mode']),
        ]
    
    def __str__(self):
        user_name = self.user.name if self.user else 'Anonymous'
        return f"{user_name} - {self.top_type} ({self.taken_at.strftime('%Y-%m-%d')})"


class RiasecReport(models.Model):
    """
    RIASEC type report with detailed descriptions
    """
    riasec_type = models.CharField(
        max_length=2,
        primary_key=True,
        verbose_name='RIASEC 타입'
    )
    type_name = models.CharField(max_length=50, verbose_name='타입 이름')
    emoji = models.CharField(max_length=10, verbose_name='이모지')
    tagline = models.CharField(max_length=100, verbose_name='태그라인')
    description = models.TextField(verbose_name='설명')
    strengths = models.JSONField(default=list, verbose_name='강점')
    weaknesses = models.JSONField(default=list, verbose_name='약점')
    career_keywords = models.JSONField(default=list, verbose_name='커리어 키워드')
    recommended_activities = models.JSONField(default=list, verbose_name='추천 활동')
    famous_people = models.JSONField(default=list, verbose_name='유명 인물')
    color = models.CharField(max_length=7, default='#6366f1', verbose_name='테마 색상')
    
    class Meta:
        db_table = 'riasec_reports'
        verbose_name = 'RIASEC 리포트'
        verbose_name_plural = 'RIASEC 리포트 목록'
        ordering = ['riasec_type']
    
    def __str__(self):
        return f"{self.riasec_type} - {self.type_name}"
