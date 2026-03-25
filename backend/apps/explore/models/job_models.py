"""
Job exploration models (11 models)
"""

from django.db import models
from common.models import TimeStampedModel, UUIDPrimaryKeyModel


class JobCategory(TimeStampedModel):
    """
    Job category model (e.g., engineering-tech, medical-health)
    """
    id = models.CharField(max_length=100, primary_key=True, verbose_name='카테고리 ID')
    name = models.CharField(max_length=100, verbose_name='카테고리 이름')
    emoji = models.CharField(max_length=10, verbose_name='이모지')
    color = models.CharField(max_length=7, verbose_name='색상 코드')
    description = models.TextField(blank=True, verbose_name='설명')
    order_index = models.IntegerField(default=0, verbose_name='정렬 순서')
    
    class Meta:
        db_table = 'job_categories'
        verbose_name = '직업 카테고리'
        verbose_name_plural = '직업 카테고리 목록'
        ordering = ['order_index', 'name']
    
    def __str__(self):
        return f"{self.emoji} {self.name}"


class Job(TimeStampedModel):
    """
    Job model with basic information
    """
    RARITY_CHOICES = [
        ('common', 'Common'),
        ('rare', 'Rare'),
        ('epic', 'Epic'),
        ('legendary', 'Legendary'),
    ]
    
    id = models.CharField(max_length=100, primary_key=True, verbose_name='직업 ID')
    name = models.CharField(max_length=200, verbose_name='직업명')
    name_en = models.CharField(max_length=200, blank=True, verbose_name='영문명')
    emoji = models.CharField(max_length=10, verbose_name='이모지')
    
    category = models.ForeignKey(
        JobCategory,
        on_delete=models.CASCADE,
        related_name='jobs',
        verbose_name='카테고리'
    )
    
    kingdom_id = models.CharField(max_length=100, default='explore', verbose_name='왕국 ID')
    rarity = models.CharField(
        max_length=20,
        choices=RARITY_CHOICES,
        default='common',
        verbose_name='희귀도'
    )
    
    riasec_profile = models.JSONField(default=dict, verbose_name='RIASEC 프로필')
    
    description = models.TextField(verbose_name='상세 설명')
    short_description = models.CharField(max_length=200, blank=True, verbose_name='짧은 설명')
    
    company = models.CharField(max_length=300, blank=True, verbose_name='주요 회사')
    salary_range = models.CharField(max_length=100, blank=True, verbose_name='연봉 범위')
    
    difficulty = models.IntegerField(default=3, verbose_name='난이도')
    
    future_outlook = models.TextField(blank=True, verbose_name='미래 전망')
    outlook_score = models.IntegerField(default=3, verbose_name='전망 점수')
    
    is_active = models.BooleanField(default=True, verbose_name='활성 상태')
    
    class Meta:
        db_table = 'jobs'
        verbose_name = '직업'
        verbose_name_plural = '직업 목록'
        ordering = ['category', 'name']
        indexes = [
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['difficulty']),
            models.Index(fields=['rarity']),
            models.Index(fields=['kingdom_id']),
        ]
    
    def __str__(self):
        return f"{self.emoji} {self.name}"


class JobCareerPathStage(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    Career path stage for a job (e.g., 중학교, 고등학교, 대학교, 취업)
    """
    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='career_path_stages',
        verbose_name='직업'
    )
    stage = models.CharField(max_length=100, verbose_name='단계')
    period = models.CharField(max_length=100, verbose_name='기간')
    icon = models.CharField(max_length=10, default='📍', verbose_name='아이콘')
    order_index = models.IntegerField(default=0, verbose_name='정렬 순서')
    
    class Meta:
        db_table = 'job_career_path_stages'
        verbose_name = '직업 커리어 단계'
        verbose_name_plural = '직업 커리어 단계 목록'
        ordering = ['job', 'order_index']
        indexes = [
            models.Index(fields=['job', 'order_index']),
        ]
    
    def __str__(self):
        return f"{self.job.name} - {self.stage}"


class JobCareerPathTask(UUIDPrimaryKeyModel):
    """
    Task for each career path stage
    """
    stage = models.ForeignKey(
        JobCareerPathStage,
        on_delete=models.CASCADE,
        related_name='tasks',
        verbose_name='단계'
    )
    task_description = models.TextField(verbose_name='과제 설명')
    order_index = models.IntegerField(default=0, verbose_name='정렬 순서')
    
    class Meta:
        db_table = 'job_career_path_tasks'
        verbose_name = '직업 커리어 과제'
        verbose_name_plural = '직업 커리어 과제 목록'
        ordering = ['stage', 'order_index']
        indexes = [
            models.Index(fields=['stage', 'order_index']),
        ]
    
    def __str__(self):
        return f"{self.stage.stage} - {self.task_description[:50]}"


class JobKeyPreparation(UUIDPrimaryKeyModel):
    """
    Key preparation items for a job
    """
    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='key_preparations',
        verbose_name='직업'
    )
    preparation_item = models.CharField(max_length=300, verbose_name='준비사항')
    order_index = models.IntegerField(default=0, verbose_name='정렬 순서')
    
    class Meta:
        db_table = 'job_key_preparations'
        verbose_name = '직업 핵심 준비사항'
        verbose_name_plural = '직업 핵심 준비사항 목록'
        ordering = ['job', 'order_index']
        indexes = [
            models.Index(fields=['job', 'order_index']),
        ]
    
    def __str__(self):
        return f"{self.job.name} - {self.preparation_item}"


class JobRecommendedHighSchool(UUIDPrimaryKeyModel):
    """
    Recommended high school types for a job
    """
    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='recommended_high_schools_rel',
        verbose_name='직업'
    )
    high_school_type = models.CharField(max_length=100, verbose_name='고교 유형')
    high_school_name = models.CharField(max_length=200, verbose_name='고교명')
    order_index = models.IntegerField(default=0, verbose_name='정렬 순서')
    
    class Meta:
        db_table = 'job_recommended_high_schools'
        verbose_name = '직업 추천 고등학교'
        verbose_name_plural = '직업 추천 고등학교 목록'
        ordering = ['job', 'order_index']
        indexes = [
            models.Index(fields=['job', 'order_index']),
            models.Index(fields=['high_school_type']),
        ]
    
    def __str__(self):
        return f"{self.job.name} - {self.high_school_name}"


class JobRecommendedUniversity(UUIDPrimaryKeyModel):
    """
    Recommended universities for a job
    """
    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='recommended_universities_rel',
        verbose_name='직업'
    )
    university_name = models.CharField(max_length=200, verbose_name='대학명')
    admission_type = models.CharField(max_length=100, blank=True, verbose_name='전형 유형')
    difficulty = models.IntegerField(default=3, verbose_name='난이도')
    order_index = models.IntegerField(default=0, verbose_name='정렬 순서')
    
    class Meta:
        db_table = 'job_recommended_universities'
        verbose_name = '직업 추천 대학교'
        verbose_name_plural = '직업 추천 대학교 목록'
        ordering = ['job', 'order_index']
        indexes = [
            models.Index(fields=['job', 'order_index']),
            models.Index(fields=['difficulty']),
        ]
    
    def __str__(self):
        return f"{self.job.name} - {self.university_name}"


class JobDailySchedule(UUIDPrimaryKeyModel):
    """
    Daily schedule for a job
    """
    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='daily_schedules',
        verbose_name='직업'
    )
    time = models.CharField(max_length=10, verbose_name='시간')
    activity = models.CharField(max_length=200, verbose_name='활동')
    emoji = models.CharField(max_length=10, default='📌', verbose_name='이모지')
    order_index = models.IntegerField(default=0, verbose_name='정렬 순서')
    
    class Meta:
        db_table = 'job_daily_schedules'
        verbose_name = '직업 하루 일과'
        verbose_name_plural = '직업 하루 일과 목록'
        ordering = ['job', 'order_index']
        indexes = [
            models.Index(fields=['job', 'order_index']),
        ]
    
    def __str__(self):
        return f"{self.job.name} - {self.time} {self.activity}"


class JobRequiredSkill(UUIDPrimaryKeyModel):
    """
    Required skills for a job with scores
    """
    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='required_skills',
        verbose_name='직업'
    )
    skill_name = models.CharField(max_length=100, verbose_name='역량명')
    score = models.IntegerField(default=3, verbose_name='점수')
    order_index = models.IntegerField(default=0, verbose_name='정렬 순서')
    
    class Meta:
        db_table = 'job_required_skills'
        verbose_name = '직업 필수 역량'
        verbose_name_plural = '직업 필수 역량 목록'
        ordering = ['job', 'order_index']
        indexes = [
            models.Index(fields=['job', 'order_index']),
        ]
    
    def __str__(self):
        return f"{self.job.name} - {self.skill_name} ({self.score})"


class JobMilestone(UUIDPrimaryKeyModel):
    """
    Career milestones for a job
    """
    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='milestones',
        verbose_name='직업'
    )
    stage = models.CharField(max_length=100, verbose_name='단계')
    title = models.CharField(max_length=200, verbose_name='제목')
    description = models.TextField(verbose_name='설명')
    icon = models.CharField(max_length=10, default='🎯', verbose_name='아이콘')
    order_index = models.IntegerField(default=0, verbose_name='정렬 순서')
    
    class Meta:
        db_table = 'job_milestones'
        verbose_name = '직업 마일스톤'
        verbose_name_plural = '직업 마일스톤 목록'
        ordering = ['job', 'order_index']
        indexes = [
            models.Index(fields=['job', 'order_index']),
        ]
    
    def __str__(self):
        return f"{self.job.name} - {self.title}"


class JobAcceptee(UUIDPrimaryKeyModel):
    """
    Success stories / acceptee examples for a job
    """
    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='acceptees',
        verbose_name='직업'
    )
    acceptee_type = models.CharField(max_length=100, verbose_name='합격 유형')
    name = models.CharField(max_length=100, verbose_name='이름')
    school = models.CharField(max_length=200, verbose_name='학교')
    gpa = models.CharField(max_length=50, blank=True, verbose_name='학점')
    activities = models.JSONField(default=list, verbose_name='주요 활동')
    order_index = models.IntegerField(default=0, verbose_name='정렬 순서')
    
    class Meta:
        db_table = 'job_acceptees'
        verbose_name = '직업 합격 사례'
        verbose_name_plural = '직업 합격 사례 목록'
        ordering = ['job', 'order_index']
        indexes = [
            models.Index(fields=['job', 'order_index']),
        ]
    
    def __str__(self):
        return f"{self.job.name} - {self.name} ({self.school})"
