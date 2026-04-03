# PlanItem 활동 단위 완료(타임라인 체크)

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("career_path", "0007_sharedplancomment"),
    ]

    operations = [
        migrations.AddField(
            model_name="planitem",
            name="is_done",
            field=models.BooleanField(default=False, verbose_name="활동 완료"),
        ),
    ]
