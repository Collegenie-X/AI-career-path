# Generated manually for Group extended fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('community', '0002_remove_sharedroadmap_user_path_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='group',
            name='max_members',
            field=models.PositiveIntegerField(default=50, verbose_name='최대 인원'),
        ),
        migrations.AddField(
            model_name='group',
            name='category',
            field=models.CharField(
                choices=[
                    ('study', '스터디'),
                    ('project', '프로젝트'),
                    ('mentoring', '멘토링'),
                    ('school_club', '동아리'),
                    ('other', '기타'),
                ],
                default='study',
                max_length=32,
                verbose_name='카테고리',
            ),
        ),
        migrations.AddField(
            model_name='group',
            name='mode',
            field=models.CharField(
                choices=[
                    ('online', '온라인'),
                    ('offline', '오프라인'),
                    ('hybrid', '온·오프'),
                ],
                default='online',
                max_length=16,
                verbose_name='진행 방식',
            ),
        ),
        migrations.AddField(
            model_name='group',
            name='tags',
            field=models.JSONField(blank=True, default=list, verbose_name='태그'),
        ),
    ]
