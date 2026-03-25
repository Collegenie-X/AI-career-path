"""
High school exploration models (8 models)
"""

from django.db import models
from common.models import TimeStampedModel, UUIDPrimaryKeyModel


class HighSchoolCategory(TimeStampedModel):
    """
    High school category model (e.g., science_high, autonomous_private)
    """
    id = models.CharField(max_length=100, primary_key=True, verbose_name='카테고리 ID')
    name = models.CharField(max_length=100, verbose_name='카테고리 이름')
    emoji = models.CharField(max_length=10, verbose_name='이모지')
    color = models.CharField(max_length=7, verbose_name='색상 코드')
    description = models.TextField(blank=True, verbose_name='설명')
    
    planet_size = models.CharField(max_length=50, default='medium', verbose_name='행성 크기')
    planet_orbit_radius = models.IntegerField(default=200, verbose_name='행성 궤도 반지름')
    planet_glow_color = models.CharField(max_length=7, blank=True, verbose_name='행성 발광 색상')
    
    order_index = models.IntegerField(default=0, verbose_name='정렬 순서')
    
    class Meta:
        db_table = 'high_school_categories'
        verbose_name = '고교 카테고리'
        verbose_name_plural = '고교 카테고리 목록'
        ordering = ['order_index', 'name']
    
    def __str__(self):
        return f"{self.emoji} {self.name}"


class HighSchool(TimeStampedModel):
    """
    High school model with basic information
    """
    SCHOOL_TYPE_CHOICES = [
        ('science', '과학고'),
        ('gifted', '영재고'),
        ('foreign_language', '외국어고'),
        ('international', '국제고'),
        ('autonomous_private', '자율형 사립고'),
        ('ib', 'IB 학교'),
        ('general', '일반고'),
    ]
    
    id = models.CharField(max_length=100, primary_key=True, verbose_name='학교 ID')
    name = models.CharField(max_length=200, verbose_name='학교명')
    
    category = models.ForeignKey(
        HighSchoolCategory,
        on_delete=models.CASCADE,
        related_name='high_schools',
        verbose_name='카테고리'
    )
    
    location = models.CharField(max_length=200, verbose_name='위치')
    school_type = models.CharField(
        max_length=50,
        choices=SCHOOL_TYPE_CHOICES,
        verbose_name='학교 유형'
    )
    
    difficulty = models.IntegerField(default=3, verbose_name='입학 난이도')
    annual_admission = models.IntegerField(default=0, verbose_name='연간 모집 인원')
    
    tuition = models.CharField(max_length=100, blank=True, verbose_name='학비')
    dormitory = models.BooleanField(default=False, verbose_name='기숙사 여부')
    ib_certified = models.BooleanField(default=False, verbose_name='IB 인증 여부')
    
    education_philosophy = models.TextField(blank=True, verbose_name='교육 철학')
    curriculum_features = models.TextField(blank=True, verbose_name='교육과정 특징')
    
    website_url = models.URLField(blank=True, verbose_name='웹사이트 URL')
    
    is_active = models.BooleanField(default=True, verbose_name='활성 상태')
    
    class Meta:
        db_table = 'high_schools'
        verbose_name = '고등학교'
        verbose_name_plural = '고등학교 목록'
        ordering = ['category', 'name']
        indexes = [
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['school_type']),
            models.Index(fields=['difficulty']),
            models.Index(fields=['dormitory']),
        ]
    
    def __str__(self):
        return self.name


class HighSchoolAdmissionStep(UUIDPrimaryKeyModel):
    """
    Admission process steps for high school
    """
    high_school = models.ForeignKey(
        HighSchool,
        on_delete=models.CASCADE,
        related_name='admission_steps',
        verbose_name='고등학교'
    )
    step = models.IntegerField(verbose_name='단계 번호')
    title = models.CharField(max_length=200, verbose_name='단계 제목')
    detail = models.TextField(verbose_name='상세 설명')
    icon = models.CharField(max_length=10, default='📝', verbose_name='아이콘')
    order_index = models.IntegerField(default=0, verbose_name='정렬 순서')
    
    class Meta:
        db_table = 'high_school_admission_steps'
        verbose_name = '고교 입학 단계'
        verbose_name_plural = '고교 입학 단계 목록'
        ordering = ['high_school', 'order_index']
        indexes = [
            models.Index(fields=['high_school', 'order_index']),
        ]
    
    def __str__(self):
        return f"{self.high_school.name} - Step {self.step}: {self.title}"


class HighSchoolCareerPathDetail(UUIDPrimaryKeyModel):
    """
    Career path details by grade for high school
    """
    high_school = models.ForeignKey(
        HighSchool,
        on_delete=models.CASCADE,
        related_name='career_path_details',
        verbose_name='고등학교'
    )
    grade = models.CharField(max_length=50, verbose_name='학년')
    icon = models.CharField(max_length=10, default='📚', verbose_name='아이콘')
    tasks = models.JSONField(default=list, verbose_name='과제 목록')
    key_point = models.TextField(blank=True, verbose_name='핵심 포인트')
    order_index = models.IntegerField(default=0, verbose_name='정렬 순서')
    
    class Meta:
        db_table = 'high_school_career_path_details'
        verbose_name = '고교 학년별 준비사항'
        verbose_name_plural = '고교 학년별 준비사항 목록'
        ordering = ['high_school', 'order_index']
        indexes = [
            models.Index(fields=['high_school', 'order_index']),
        ]
    
    def __str__(self):
        return f"{self.high_school.name} - {self.grade}"


class HighSchoolHighlightStat(UUIDPrimaryKeyModel):
    """
    Highlight statistics for high school
    """
    high_school = models.ForeignKey(
        HighSchool,
        on_delete=models.CASCADE,
        related_name='highlight_stats',
        verbose_name='고등학교'
    )
    label = models.CharField(max_length=100, verbose_name='통계 라벨')
    value = models.CharField(max_length=100, verbose_name='통계 값')
    emoji = models.CharField(max_length=10, default='📊', verbose_name='이모지')
    color = models.CharField(max_length=7, default='#6366f1', verbose_name='색상')
    order_index = models.IntegerField(default=0, verbose_name='정렬 순서')
    
    class Meta:
        db_table = 'high_school_highlight_stats'
        verbose_name = '고교 주요 통계'
        verbose_name_plural = '고교 주요 통계 목록'
        ordering = ['high_school', 'order_index']
        indexes = [
            models.Index(fields=['high_school', 'order_index']),
        ]
    
    def __str__(self):
        return f"{self.high_school.name} - {self.label}: {self.value}"


class HighSchoolRealTalk(UUIDPrimaryKeyModel):
    """
    Real talk / honest reviews for high school
    """
    high_school = models.ForeignKey(
        HighSchool,
        on_delete=models.CASCADE,
        related_name='real_talks',
        verbose_name='고등학교'
    )
    emoji = models.CharField(max_length=10, default='💬', verbose_name='이모지')
    title = models.CharField(max_length=200, verbose_name='제목')
    content = models.TextField(verbose_name='내용')
    order_index = models.IntegerField(default=0, verbose_name='정렬 순서')
    
    class Meta:
        db_table = 'high_school_real_talks'
        verbose_name = '고교 솔직 후기'
        verbose_name_plural = '고교 솔직 후기 목록'
        ordering = ['high_school', 'order_index']
        indexes = [
            models.Index(fields=['high_school', 'order_index']),
        ]
    
    def __str__(self):
        return f"{self.high_school.name} - {self.title}"


class HighSchoolDailySchedule(UUIDPrimaryKeyModel):
    """
    Daily schedule for high school
    """
    high_school = models.ForeignKey(
        HighSchool,
        on_delete=models.CASCADE,
        related_name='daily_schedules',
        verbose_name='고등학교'
    )
    time = models.CharField(max_length=10, verbose_name='시간')
    activity = models.CharField(max_length=200, verbose_name='활동')
    emoji = models.CharField(max_length=10, default='📌', verbose_name='이모지')
    order_index = models.IntegerField(default=0, verbose_name='정렬 순서')
    
    class Meta:
        db_table = 'high_school_daily_schedules'
        verbose_name = '고교 하루 일과'
        verbose_name_plural = '고교 하루 일과 목록'
        ordering = ['high_school', 'order_index']
        indexes = [
            models.Index(fields=['high_school', 'order_index']),
        ]
    
    def __str__(self):
        return f"{self.high_school.name} - {self.time} {self.activity}"


class HighSchoolFamousProgram(UUIDPrimaryKeyModel):
    """
    Famous programs for high school
    """
    high_school = models.ForeignKey(
        HighSchool,
        on_delete=models.CASCADE,
        related_name='famous_programs',
        verbose_name='고등학교'
    )
    name = models.CharField(max_length=200, verbose_name='프로그램명')
    description = models.TextField(verbose_name='설명')
    benefit = models.TextField(blank=True, verbose_name='혜택')
    order_index = models.IntegerField(default=0, verbose_name='정렬 순서')
    
    class Meta:
        db_table = 'high_school_famous_programs'
        verbose_name = '고교 유명 프로그램'
        verbose_name_plural = '고교 유명 프로그램 목록'
        ordering = ['high_school', 'order_index']
        indexes = [
            models.Index(fields=['high_school', 'order_index']),
        ]
    
    def __str__(self):
        return f"{self.high_school.name} - {self.name}"
