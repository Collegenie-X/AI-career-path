"""
Infographic models for job, high school, and university (3 models)
"""

from django.db import models
from common.models import TimeStampedModel, UUIDPrimaryKeyModel
from .job_models import Job
from .high_school_models import HighSchool
from .university_models import University, UniversityAdmissionCategory


class JobInfographic(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    Infographic model for jobs
    """
    INFOGRAPHIC_TYPE_CHOICES = [
        ('salary_curve', '연봉 커브'),
        ('career_timeline', '커리어 타임라인'),
        ('skill_radar', '역량 레이더 차트'),
        ('day_in_life', '하루 일과'),
        ('industry_outlook', '산업 전망'),
    ]
    
    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='infographics',
        verbose_name='직업'
    )
    
    infographic_type = models.CharField(
        max_length=50,
        choices=INFOGRAPHIC_TYPE_CHOICES,
        verbose_name='인포그래픽 유형'
    )
    
    title = models.CharField(max_length=200, verbose_name='제목')
    description = models.TextField(blank=True, verbose_name='설명')
    
    image_url = models.URLField(blank=True, verbose_name='이미지 URL')
    thumbnail_url = models.URLField(blank=True, verbose_name='썸네일 URL')
    
    data_points = models.JSONField(default=dict, verbose_name='데이터 포인트')
    
    view_count = models.IntegerField(default=0, verbose_name='조회수')
    order_index = models.IntegerField(default=0, verbose_name='정렬 순서')
    
    class Meta:
        db_table = 'job_infographics'
        verbose_name = '직업 인포그래픽'
        verbose_name_plural = '직업 인포그래픽 목록'
        ordering = ['job', 'order_index']
        indexes = [
            models.Index(fields=['job', 'infographic_type']),
            models.Index(fields=['view_count']),
        ]
    
    def __str__(self):
        return f"{self.job.name} - {self.title}"


class HighSchoolInfographic(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    Infographic model for high schools
    """
    INFOGRAPHIC_TYPE_CHOICES = [
        ('admission_stats', '입학 통계'),
        ('competition_rate', '경쟁률 추이'),
        ('university_admission', '대입 진학 현황'),
        ('curriculum_structure', '교육과정 구조'),
    ]
    
    high_school = models.ForeignKey(
        HighSchool,
        on_delete=models.CASCADE,
        related_name='infographics',
        verbose_name='고등학교'
    )
    
    infographic_type = models.CharField(
        max_length=50,
        choices=INFOGRAPHIC_TYPE_CHOICES,
        verbose_name='인포그래픽 유형'
    )
    
    title = models.CharField(max_length=200, verbose_name='제목')
    description = models.TextField(blank=True, verbose_name='설명')
    
    image_url = models.URLField(blank=True, verbose_name='이미지 URL')
    thumbnail_url = models.URLField(blank=True, verbose_name='썸네일 URL')
    
    data_points = models.JSONField(default=dict, verbose_name='데이터 포인트')
    
    view_count = models.IntegerField(default=0, verbose_name='조회수')
    order_index = models.IntegerField(default=0, verbose_name='정렬 순서')
    
    class Meta:
        db_table = 'high_school_infographics'
        verbose_name = '고교 인포그래픽'
        verbose_name_plural = '고교 인포그래픽 목록'
        ordering = ['high_school', 'order_index']
        indexes = [
            models.Index(fields=['high_school', 'infographic_type']),
            models.Index(fields=['view_count']),
        ]
    
    def __str__(self):
        return f"{self.high_school.name} - {self.title}"


class UniversityInfographic(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    Infographic model for universities
    """
    INFOGRAPHIC_TYPE_CHOICES = [
        ('admission_stats', '입학 통계'),
        ('competition_rate', '경쟁률 추이'),
        ('major_comparison', '학과 비교'),
        ('admission_strategy', '입시 전략'),
        ('grade_distribution', '등급 분포'),
    ]
    
    university = models.ForeignKey(
        University,
        on_delete=models.CASCADE,
        related_name='infographics',
        null=True,
        blank=True,
        verbose_name='대학교'
    )
    
    admission_category = models.ForeignKey(
        UniversityAdmissionCategory,
        on_delete=models.CASCADE,
        related_name='infographics',
        null=True,
        blank=True,
        verbose_name='전형 카테고리'
    )
    
    infographic_type = models.CharField(
        max_length=50,
        choices=INFOGRAPHIC_TYPE_CHOICES,
        verbose_name='인포그래픽 유형'
    )
    
    title = models.CharField(max_length=200, verbose_name='제목')
    description = models.TextField(blank=True, verbose_name='설명')
    
    image_url = models.URLField(blank=True, verbose_name='이미지 URL')
    thumbnail_url = models.URLField(blank=True, verbose_name='썸네일 URL')
    
    data_points = models.JSONField(default=dict, verbose_name='데이터 포인트')
    
    view_count = models.IntegerField(default=0, verbose_name='조회수')
    order_index = models.IntegerField(default=0, verbose_name='정렬 순서')
    
    class Meta:
        db_table = 'university_infographics'
        verbose_name = '대입 인포그래픽'
        verbose_name_plural = '대입 인포그래픽 목록'
        ordering = ['order_index']
        indexes = [
            models.Index(fields=['university', 'infographic_type']),
            models.Index(fields=['admission_category', 'infographic_type']),
            models.Index(fields=['view_count']),
        ]
    
    def __str__(self):
        target = self.university.name if self.university else self.admission_category.name
        return f"{target} - {self.title}"
