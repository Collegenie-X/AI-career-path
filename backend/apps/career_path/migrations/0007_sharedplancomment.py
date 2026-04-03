# SharedPlanComment 모델

import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("career_path", "0006_alter_planitem_goal_group_cascade"),
    ]

    operations = [
        migrations.CreateModel(
            name="SharedPlanComment",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True, verbose_name="생성일시")),
                ("updated_at", models.DateTimeField(auto_now=True, verbose_name="수정일시")),
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                ("content", models.TextField(verbose_name="내용")),
                (
                    "author",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="shared_plan_comments",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="작성자",
                    ),
                ),
                (
                    "parent",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="replies",
                        to="career_path.sharedplancomment",
                        verbose_name="상위 댓글",
                    ),
                ),
                (
                    "shared_plan",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="plan_comments",
                        to="career_path.sharedplan",
                        verbose_name="공유 패스",
                    ),
                ),
            ],
            options={
                "verbose_name": "공유 패스 댓글",
                "verbose_name_plural": "공유 패스 댓글 목록",
                "db_table": "career_path_shared_plan_comments",
                "ordering": ["created_at"],
            },
        ),
        migrations.AddIndex(
            model_name="sharedplancomment",
            index=models.Index(
                fields=["shared_plan", "created_at"],
                name="idx_cp_spcom_plan_created",
            ),
        ),
    ]
