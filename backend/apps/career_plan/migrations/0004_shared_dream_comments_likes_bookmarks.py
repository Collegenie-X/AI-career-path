# 공유 드림 로드맵 댓글·좋아요·북마크 (사용자별)

import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("career_plan", "0003_shared_dream_report_and_unique_roadmap"),
    ]

    operations = [
        migrations.CreateModel(
            name="SharedDreamRoadmapComment",
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
                        related_name="shared_dream_roadmap_comments",
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
                        to="career_plan.shareddreamroadmapcomment",
                        verbose_name="상위 댓글",
                    ),
                ),
                (
                    "shared_roadmap",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="dream_comments",
                        to="career_plan.shareddreamroadmap",
                        verbose_name="공유 로드맵",
                    ),
                ),
            ],
            options={
                "verbose_name": "공유 드림 로드맵 댓글",
                "verbose_name_plural": "공유 드림 로드맵 댓글 목록",
                "db_table": "shared_dream_roadmap_comments",
                "ordering": ["created_at"],
            },
        ),
        migrations.AddIndex(
            model_name="shareddreamroadmapcomment",
            index=models.Index(
                fields=["shared_roadmap", "created_at"],
                name="idx_sdrm_com_shared_created",
            ),
        ),
        migrations.CreateModel(
            name="SharedDreamRoadmapLike",
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
                (
                    "shared_roadmap",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="user_likes",
                        to="career_plan.shareddreamroadmap",
                        verbose_name="공유 로드맵",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="shared_dream_roadmap_likes",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="사용자",
                    ),
                ),
            ],
            options={
                "verbose_name": "공유 드림 로드맵 좋아요",
                "verbose_name_plural": "공유 드림 로드맵 좋아요 목록",
                "db_table": "shared_dream_roadmap_likes",
            },
        ),
        migrations.AddIndex(
            model_name="shareddreamroadmaplike",
            index=models.Index(
                fields=["shared_roadmap"],
                name="idx_sdrm_like_shared",
            ),
        ),
        migrations.AddIndex(
            model_name="shareddreamroadmaplike",
            index=models.Index(
                fields=["user"],
                name="idx_sdrm_like_user",
            ),
        ),
        migrations.AlterUniqueTogether(
            name="shareddreamroadmaplike",
            unique_together={("shared_roadmap", "user")},
        ),
        migrations.CreateModel(
            name="SharedDreamRoadmapBookmark",
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
                (
                    "shared_roadmap",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="user_bookmarks",
                        to="career_plan.shareddreamroadmap",
                        verbose_name="공유 로드맵",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="shared_dream_roadmap_bookmarks",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="사용자",
                    ),
                ),
            ],
            options={
                "verbose_name": "공유 드림 로드맵 북마크",
                "verbose_name_plural": "공유 드림 로드맵 북마크 목록",
                "db_table": "shared_dream_roadmap_bookmarks",
            },
        ),
        migrations.AddIndex(
            model_name="shareddreamroadmapbookmark",
            index=models.Index(
                fields=["shared_roadmap"],
                name="idx_sdrm_bm_shared",
            ),
        ),
        migrations.AddIndex(
            model_name="shareddreamroadmapbookmark",
            index=models.Index(
                fields=["user"],
                name="idx_sdrm_bm_user",
            ),
        ),
        migrations.AlterUniqueTogether(
            name="shareddreamroadmapbookmark",
            unique_together={("shared_roadmap", "user")},
        ),
    ]
