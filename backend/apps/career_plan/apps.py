from django.apps import AppConfig


class CareerPlanConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.career_plan'
    # 관리자 사이드바: 커리어 패스(career_path)와 구분 — DreamMate 화면·로드맵 API 데이터
    verbose_name = 'DreamMate · 커리어 실행'

    def ready(self):
        # noqa: F401 — 댓글 수 동기화 시그널 등록
        from . import signals  # pylint: disable=unused-import
