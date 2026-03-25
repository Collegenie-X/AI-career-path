"""
University exploration models (4 models)
"""

from django.db import models
from common.models import TimeStampedModel, UUIDPrimaryKeyModel


class UniversityAdmissionCategory(TimeStampedModel):
    """
    University admission category model (e.g., 학생부종합, 학생부교과, 정시)
    """
    id = models.CharField(max_length=100, primary_key=True, verbose_name='전형 ID')
    name = models.CharField(max_length=100, verbose_name='전형 이름')
    emoji = models.CharField(max_length=10, verbose_name='이모지')
    color = models.CharField(max_length=7, verbose_name='색상 코드')
    description = models.TextField(blank=True, verbose_name='설명')
    
    key_features = models.JSONField(default=list, verbose_name='핵심 특징')
    target_students = models.JSONField(default=list, verbose_name='대상 학생')
    
    planet_size = models.CharField(max_length=50, default='medium', verbose_name='행성 크기')
    planet_orbit_radius = models.IntegerField(default=200, verbose_name='행성 궤도 반지름')
    planet_glow_color = models.CharField(max_length=7, blank=True, verbose_name='행성 발광 색상')
    
    order_index = models.IntegerField(default=0, verbose_name='정렬 순서')
    
    class Meta:
        db_table = 'university_admission_categories'
        verbose_name = '대입 전형 카테고리'
        verbose_name_plural = '대입 전형 카테고리 목록'
        ordering = ['order_index', 'name']
    
    def __str__(self):
        return f"{self.emoji} {self.name}"


class University(TimeStampedModel):
    """
    University model with basic information
    """
    UNIVERSITY_TYPE_CHOICES = [
        ('national', '국립'),
        ('public', '공립'),
        ('private', '사립'),
    ]
    
    id = models.CharField(max_length=100, primary_key=True, verbose_name='대학 ID')
    name = models.CharField(max_length=200, verbose_name='대학명')
    short_name = models.CharField(max_length=50, blank=True, verbose_name='약칭')
    
    university_type = models.CharField(
        max_length=20,
        choices=UNIVERSITY_TYPE_CHOICES,
        default='private',
        verbose_name='대학 유형'
    )
    region = models.CharField(max_length=100, verbose_name='지역')
    
    description = models.TextField(blank=True, verbose_name='설명')
    website_url = models.URLField(blank=True, verbose_name='웹사이트 URL')
    
    is_active = models.BooleanField(default=True, verbose_name='활성 상태')
    
    class Meta:
        db_table = 'universities'
        verbose_name = '대학교'
        verbose_name_plural = '대학교 목록'
        ordering = ['name']
        indexes = [
            models.Index(fields=['university_type', 'is_active']),
            models.Index(fields=['region']),
        ]
    
    def __str__(self):
        return self.name


class UniversityDepartment(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    University department model with admission category
    """
    university = models.ForeignKey(
        University,
        on_delete=models.CASCADE,
        related_name='departments',
        verbose_name='대학교'
    )
    
    department_name = models.CharField(max_length=200, verbose_name='학과명')
    college = models.CharField(max_length=200, blank=True, verbose_name='단과대학')
    
    admission_category = models.ForeignKey(
        UniversityAdmissionCategory,
        on_delete=models.CASCADE,
        related_name='departments',
        verbose_name='전형 카테고리'
    )
    
    competition_rate = models.CharField(max_length=50, blank=True, verbose_name='경쟁률')
    required_grade = models.CharField(max_length=50, blank=True, verbose_name='요구 등급')
    
    description = models.TextField(blank=True, verbose_name='학과 설명')
    
    is_active = models.BooleanField(default=True, verbose_name='활성 상태')
    
    class Meta:
        db_table = 'university_departments'
        verbose_name = '대학 학과'
        verbose_name_plural = '대학 학과 목록'
        ordering = ['university', 'department_name']
        indexes = [
            models.Index(fields=['university', 'is_active']),
            models.Index(fields=['admission_category']),
        ]
    
    def __str__(self):
        return f"{self.university.name} - {self.department_name}"


class UniversityAdmissionPlaybook(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    Admission playbook for each admission category
    """
    admission_category = models.ForeignKey(
        UniversityAdmissionCategory,
        on_delete=models.CASCADE,
        related_name='playbooks',
        verbose_name='전형 카테고리'
    )
    
    title = models.CharField(max_length=200, verbose_name='플레이북 제목')
    description = models.TextField(blank=True, verbose_name='설명')
    
    preparation_guide = models.TextField(verbose_name='준비 가이드')
    timeline = models.JSONField(default=list, verbose_name='타임라인')
    key_strategies = models.JSONField(default=list, verbose_name='핵심 전략')
    
    order_index = models.IntegerField(default=0, verbose_name='정렬 순서')
    
    class Meta:
        db_table = 'university_admission_playbooks'
        verbose_name = '대입 전형 플레이북'
        verbose_name_plural = '대입 전형 플레이북 목록'
        ordering = ['admission_category', 'order_index']
        indexes = [
            models.Index(fields=['admission_category', 'order_index']),
        ]
    
    def __str__(self):
        return f"{self.admission_category.name} - {self.title}"
