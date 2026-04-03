# Generated manually for SharedPlan.report_count

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("career_path", "0003_delete_usercareerpath_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="sharedplan",
            name="report_count",
            field=models.IntegerField(default=0, verbose_name="신고 수"),
        ),
    ]
