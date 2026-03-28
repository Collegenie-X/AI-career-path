from django.apps import AppConfig


class CareerPathConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.career_path'
    verbose_name = '커리어 실행'

    def ready(self):
        from . import signals  # noqa: F401
