# PlanItem.goal_group: 목표 그룹 삭제 시 소속 활동도 함께 삭제 (CASCADE)

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("career_path", "0005_dedupe_sharedplan_unique_career_plan"),
    ]

    operations = [
        migrations.AlterField(
            model_name="planitem",
            name="goal_group",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="items",
                to="career_path.goalgroup",
                verbose_name="소속 목표 그룹",
            ),
        ),
    ]
