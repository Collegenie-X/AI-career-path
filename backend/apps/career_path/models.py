"""
Career path models for templates and user paths
"""

from django.db import models
from django.contrib.auth import get_user_model
from common.models import TimeStampedModel, UUIDPrimaryKeyModel
from common.utils import generate_invite_code

User = get_user_model()


class CareerPathTemplate(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    Career path template model
    """
    CATEGORY_CHOICES = [
        ('job', '직업'),
        ('high_school', '고등학교'),
        ('university', '대학교'),
        ('general', '일반'),
    ]
    
    template_key = models.CharField(
        max_length=200,
        unique=True,
        verbose_name='템플릿 키'
    )
    title = models.CharField(max_length=300, verbose_name='제목')
    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        default='general',
        verbose_name='카테고리'
    )
    
    job_id = models.CharField(max_length=100, blank=True, verbose_name='연결된 직업 ID')
    university_id = models.CharField(max_length=100, blank=True, verbose_name='연결된 대학 ID')
    
    description = models.TextField(blank=True, verbose_name='설명')
    
    likes = models.IntegerField(default=0, verbose_name='좋아요 수')
    uses = models.IntegerField(default=0, verbose_name='사용 횟수')
    
    is_official = models.BooleanField(default=False, verbose_name='공식 템플릿 여부')
    is_active = models.BooleanField(default=True, verbose_name='활성 상태')
    
    class Meta:
        db_table = 'career_path_templates'
        verbose_name = '커리어 패스 템플릿'
        verbose_name_plural = '커리어 패스 템플릿 목록'
        ordering = ['-is_official', '-likes', '-created_at']
        indexes = [
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['job_id']),
            models.Index(fields=['university_id']),
            models.Index(fields=['-likes']),
        ]
    
    def __str__(self):
        return self.title


class TemplateYear(UUIDPrimaryKeyModel):
    """
    Year grouping for template items
    """
    template = models.ForeignKey(
        CareerPathTemplate,
        on_delete=models.CASCADE,
        related_name='years',
        verbose_name='템플릿'
    )
    year = models.CharField(max_length=50, verbose_name='연도')
    order_index = models.IntegerField(default=0, verbose_name='정렬 순서')
    
    class Meta:
        db_table = 'template_years'
        verbose_name = '템플릿 연도'
        verbose_name_plural = '템플릿 연도 목록'
        ordering = ['template', 'order_index']
        indexes = [
            models.Index(fields=['template', 'order_index']),
        ]
    
    def __str__(self):
        return f"{self.template.title} - {self.year}"


class TemplateItem(UUIDPrimaryKeyModel):
    """
    Individual activity item in a template
    """
    ITEM_TYPE_CHOICES = [
        ('activity', '활동'),
        ('study', '학습'),
        ('competition', '대회'),
        ('project', '프로젝트'),
        ('certification', '자격증'),
        ('other', '기타'),
    ]
    
    year = models.ForeignKey(
        TemplateYear,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name='연도'
    )
    
    item_type = models.CharField(
        max_length=50,
        choices=ITEM_TYPE_CHOICES,
        default='activity',
        verbose_name='항목 유형'
    )
    title = models.CharField(max_length=300, verbose_name='제목')
    description = models.TextField(blank=True, verbose_name='설명')
    
    month = models.IntegerField(null=True, blank=True, verbose_name='월')
    emoji = models.CharField(max_length=10, default='📌', verbose_name='이모지')
    
    order_index = models.IntegerField(default=0, verbose_name='정렬 순서')
    
    class Meta:
        db_table = 'template_items'
        verbose_name = '템플릿 항목'
        verbose_name_plural = '템플릿 항목 목록'
        ordering = ['year', 'order_index']
        indexes = [
            models.Index(fields=['year', 'order_index']),
            models.Index(fields=['item_type']),
        ]
    
    def __str__(self):
        return f"{self.year.year} - {self.title}"


class UserCareerPath(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    User's career path instance based on a template
    """
    STATUS_CHOICES = [
        ('planning', '계획 중'),
        ('in_progress', '진행 중'),
        ('completed', '완료'),
        ('paused', '일시 중지'),
    ]
    
    SHARE_SCOPE_CHOICES = [
        ('private', '비공개'),
        ('school', '학교 공개'),
        ('group', '그룹 공개'),
        ('public', '전체 공개'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='career_paths',
        verbose_name='사용자'
    )
    
    template = models.ForeignKey(
        CareerPathTemplate,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='user_paths',
        verbose_name='기반 템플릿'
    )
    
    title = models.CharField(max_length=300, verbose_name='제목')
    description = models.TextField(blank=True, verbose_name='설명')
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='planning',
        verbose_name='상태'
    )
    
    share_scope = models.CharField(
        max_length=20,
        choices=SHARE_SCOPE_CHOICES,
        default='private',
        verbose_name='공유 범위'
    )
    
    path_data = models.JSONField(default=dict, verbose_name='패스 데이터')
    
    progress_percentage = models.IntegerField(default=0, verbose_name='진행률')
    
    class Meta:
        db_table = 'user_career_paths'
        verbose_name = '사용자 커리어 패스'
        verbose_name_plural = '사용자 커리어 패스 목록'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['template']),
            models.Index(fields=['status']),
            models.Index(fields=['share_scope']),
        ]
    
    def __str__(self):
        return f"{self.user.name} - {self.title}"


class School(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    School model for group management
    """
    SCHOOL_TYPE_CHOICES = [
        ('elementary', '초등학교'),
        ('middle', '중학교'),
        ('high', '고등학교'),
        ('university', '대학교'),
        ('academy', '학원'),
        ('other', '기타'),
    ]
    
    name = models.CharField(max_length=200, verbose_name='학교명')
    school_type = models.CharField(
        max_length=50,
        choices=SCHOOL_TYPE_CHOICES,
        verbose_name='학교 유형'
    )
    location = models.CharField(max_length=200, blank=True, verbose_name='위치')
    
    invite_code = models.CharField(
        max_length=20,
        unique=True,
        default=generate_invite_code,
        verbose_name='초대 코드'
    )
    
    member_count = models.IntegerField(default=0, verbose_name='멤버 수')
    
    is_verified = models.BooleanField(default=False, verbose_name='인증 여부')
    
    class Meta:
        db_table = 'schools'
        verbose_name = '학교'
        verbose_name_plural = '학교 목록'
        ordering = ['name']
        indexes = [
            models.Index(fields=['school_type']),
            models.Index(fields=['invite_code']),
        ]
    
    def __str__(self):
        return self.name


class SchoolMember(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    School membership model
    """
    ROLE_CHOICES = [
        ('student', '학생'),
        ('teacher', '선생님'),
        ('admin', '관리자'),
    ]
    
    school = models.ForeignKey(
        School,
        on_delete=models.CASCADE,
        related_name='members',
        verbose_name='학교'
    )
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='school_memberships',
        verbose_name='사용자'
    )
    
    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='student',
        verbose_name='역할'
    )
    
    joined_at = models.DateTimeField(auto_now_add=True, verbose_name='가입일')
    
    class Meta:
        db_table = 'school_members'
        verbose_name = '학교 멤버'
        verbose_name_plural = '학교 멤버 목록'
        ordering = ['-joined_at']
        unique_together = [['school', 'user']]
        indexes = [
            models.Index(fields=['school', 'role']),
            models.Index(fields=['user']),
        ]
    
    def __str__(self):
        return f"{self.user.name} - {self.school.name} ({self.role})"
