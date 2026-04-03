"""
Django settings for AI Career Path project.
Base settings shared across all environments.
"""

from pathlib import Path
from datetime import timedelta
from decouple import AutoConfig, Csv

BASE_DIR = Path(__file__).resolve().parent.parent.parent
# CWD와 무관하게 `backend/.env` 를 읽습니다 (예: 레포 루트에서 `python backend/manage.py` 실행).
config = AutoConfig(search_path=BASE_DIR)

SECRET_KEY = config('DJANGO_SECRET_KEY', default='django-insecure-dev-key-change-in-production')

DEBUG = config('DJANGO_DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = config('DJANGO_ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=Csv())

# REST API에서는 슬래시 없어도 301 리다이렉트 없이 바로 처리 (프론트 rewrite 호환)
APPEND_SLASH = False

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
    'drf_spectacular',
    'social_django',
    'storages',
    
    'apps.accounts',
    'apps.quiz',
    'apps.explore',
    'apps.career_path',
    'apps.community',
    'apps.career_plan',
    'apps.resource',
    'apps.project',
    'apps.portfolio',
    'common',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'common.middleware.PerformanceMonitoringMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

AUTH_USER_MODEL = 'accounts.User'

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'ko-kr'

TIME_ZONE = 'Asia/Seoul'

USE_I18N = True

USE_TZ = True

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'EXCEPTION_HANDLER': 'common.exceptions.custom_exception_handler',
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'AI Career Path API',
    'DESCRIPTION': 'AI 기반 커리어 패스 설계 플랫폼 REST API',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    'SCHEMA_PATH_PREFIX': '/api/v1/',
    'SERVERS': [
        {'url': 'http://127.0.0.1:8000', 'description': '로컬 개발'},
    ],
    'CONTACT': {'name': 'AI Career Path'},
    'TAGS': [
        {'name': 'Authentication', 'description': '소셜 로그인, JWT, 프로필'},
        {'name': 'Quiz', 'description': '적성 검사·RIASEC'},
        {'name': 'Explore - Jobs', 'description': '직업·직무 인포그래픽'},
        {'name': 'Explore - High Schools', 'description': '고등학교 탐색'},
        {'name': 'Explore - Universities', 'description': '대학·전형 인포그래픽'},
        {'name': 'Career Path', 'description': '커리어 패스 템플릿·사용자 패스·학교'},
        {'name': 'Career Plan', 'description': '실행 계획·계획 그룹'},
        {'name': 'Community', 'description': '그룹·공유 로드맵'},
        {'name': 'Resources', 'description': '학습 자료'},
        {'name': 'Projects', 'description': '프로젝트 템플릿·사용자 프로젝트'},
        {'name': 'Portfolio', 'description': '포트폴리오 항목'},
    ],
    'SWAGGER_UI_SETTINGS': {
        'deepLinking': True,
        'persistAuthorization': True,
        'displayOperationId': False,
        'filter': True,
    },
    'APPEND_COMPONENTS': {
        'securitySchemes': {
            'bearerAuth': {
                'type': 'http',
                'scheme': 'bearer',
                'bearerFormat': 'JWT',
                'description': 'Authorization: Bearer <access_token>',
            }
        }
    },
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=config('JWT_ACCESS_TOKEN_LIFETIME_MINUTES', default=60, cast=int)),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=config('JWT_REFRESH_TOKEN_LIFETIME_DAYS', default=30, cast=int)),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': config('JWT_SIGNING_KEY', default=SECRET_KEY),
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

AUTHENTICATION_BACKENDS = [
    'social_core.backends.google.GoogleOAuth2',
    'social_core.backends.kakao.KakaoOAuth2',
    'social_core.backends.naver.NaverOAuth2',
    'django.contrib.auth.backends.ModelBackend',
]

SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = config('GOOGLE_CLIENT_ID', default='')
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = config('GOOGLE_CLIENT_SECRET', default='')
SOCIAL_AUTH_GOOGLE_OAUTH2_REDIRECT_URI = config('GOOGLE_REDIRECT_URI', default='')

SOCIAL_AUTH_KAKAO_KEY = config('KAKAO_CLIENT_ID', default='')
SOCIAL_AUTH_KAKAO_SECRET = config('KAKAO_CLIENT_SECRET', default='')
SOCIAL_AUTH_KAKAO_REDIRECT_URI = config('KAKAO_REDIRECT_URI', default='')

SOCIAL_AUTH_NAVER_KEY = config('NAVER_CLIENT_ID', default='')
SOCIAL_AUTH_NAVER_SECRET = config('NAVER_CLIENT_SECRET', default='')
SOCIAL_AUTH_NAVER_REDIRECT_URI = config('NAVER_REDIRECT_URI', default='')

# 실행계획 AI (OpenAI) — DreamMate 주간 WBS 자동 생성
OPENAI_API_KEY = config('OPENAI_API_KEY', default='')
OPENAI_EXECUTION_PLAN_MODEL = config('OPENAI_EXECUTION_PLAN_MODEL', default='gpt-4o')
OPENAI_EXECUTION_PLAN_TIMEOUT_SECONDS = config('OPENAI_EXECUTION_PLAN_TIMEOUT_SECONDS', default=120, cast=int)
EXECUTION_PLAN_AI_WEEKS_PER_MONTH = config('EXECUTION_PLAN_AI_WEEKS_PER_MONTH', default=4, cast=int)
EXECUTION_PLAN_AI_MAX_WEEKS = config('EXECUTION_PLAN_AI_MAX_WEEKS', default=52, cast=int)
EXECUTION_PLAN_AI_USER_MONTHLY_LIMIT = config('EXECUTION_PLAN_AI_USER_MONTHLY_LIMIT', default=10, cast=int)

SOCIAL_AUTH_PIPELINE = (
    'social_core.pipeline.social_auth.social_details',
    'social_core.pipeline.social_auth.social_uid',
    'social_core.pipeline.social_auth.auth_allowed',
    'social_core.pipeline.social_auth.social_user',
    'social_core.pipeline.user.get_username',
    'social_core.pipeline.user.create_user',
    'social_core.pipeline.social_auth.associate_user',
    'social_core.pipeline.social_auth.load_extra_data',
    'social_core.pipeline.user.user_details',
)

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
            'maxBytes': 1024 * 1024 * 10,
            'backupCount': 5,
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'apps': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}
