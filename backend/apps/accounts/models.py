"""
User model for authentication and profile management
"""

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from common.models import TimeStampedModel, UUIDPrimaryKeyModel


class UserManager(BaseUserManager):
    """
    Custom user manager for email-based authentication
    """
    def create_user(self, email, name, password=None, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')
        
        email = self.normalize_email(email)
        user = self.model(email=email, name=name, **extra_fields)
        
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        
        user.save(using=self._db)
        return user

    def create_superuser(self, email, name, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, name, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin, UUIDPrimaryKeyModel, TimeStampedModel):
    """
    Custom User model with social login support
    """
    
    GRADE_CHOICES = [
        ('elementary_4', '초등학교 4학년'),
        ('elementary_5', '초등학교 5학년'),
        ('elementary_6', '초등학교 6학년'),
        ('middle_1', '중학교 1학년'),
        ('middle_2', '중학교 2학년'),
        ('middle_3', '중학교 3학년'),
        ('high_1', '고등학교 1학년'),
        ('high_2', '고등학교 2학년'),
        ('high_3', '고등학교 3학년'),
        ('university', '대학생'),
        ('graduate', '대학원생'),
        ('working', '직장인'),
        ('other', '기타'),
    ]
    
    SOCIAL_PROVIDER_CHOICES = [
        ('google', 'Google'),
        ('kakao', 'Kakao'),
        ('naver', 'Naver'),
        ('email', 'Email'),
    ]
    
    email = models.EmailField(unique=True, verbose_name='이메일')
    name = models.CharField(max_length=100, verbose_name='이름')
    grade = models.CharField(
        max_length=20,
        choices=GRADE_CHOICES,
        default='middle_1',
        verbose_name='학년'
    )
    emoji = models.CharField(max_length=10, default='🧑‍🎓', verbose_name='프로필 이모지')
    
    social_provider = models.CharField(
        max_length=20,
        choices=SOCIAL_PROVIDER_CHOICES,
        default='email',
        verbose_name='소셜 로그인 제공자'
    )
    social_uid = models.CharField(max_length=255, blank=True, verbose_name='소셜 UID')
    profile_image_url = models.URLField(blank=True, verbose_name='프로필 이미지 URL')
    
    is_active = models.BooleanField(default=True, verbose_name='활성 상태')
    is_staff = models.BooleanField(default=False, verbose_name='스태프 권한')
    
    last_login_at = models.DateTimeField(null=True, blank=True, verbose_name='마지막 로그인')
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']
    
    class Meta:
        db_table = 'users'
        verbose_name = '사용자'
        verbose_name_plural = '사용자 목록'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['social_provider', 'social_uid']),
            models.Index(fields=['grade']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.email})"
