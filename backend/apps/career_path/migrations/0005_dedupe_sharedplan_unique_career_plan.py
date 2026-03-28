# 커리어 패스당 공유(SharedPlan) 1행 + 기존 중복 병합

from django.db import migrations, models


def merge_duplicate_shared_plans(apps, schema_editor):
    SharedPlan = apps.get_model("career_path", "SharedPlan")
    SharedPlanGroup = apps.get_model("career_path", "SharedPlanGroup")
    from django.db.models import Count

    dup_rows = (
        SharedPlan.objects.values("career_plan_id")
        .annotate(n=Count("id"))
        .filter(n__gt=1)
    )
    for row in dup_rows:
        cid = row["career_plan_id"]
        plans = list(
            SharedPlan.objects.filter(career_plan_id=cid).order_by(
                "-shared_at", "-updated_at", "-id"
            )
        )
        if len(plans) < 2:
            continue
        keeper = plans[0]
        for sp in plans[1:]:
            keeper.like_count = max(keeper.like_count, sp.like_count)
            keeper.bookmark_count = max(keeper.bookmark_count, sp.bookmark_count)
            keeper.view_count = max(keeper.view_count, sp.view_count)
            keeper.comment_count = max(keeper.comment_count, sp.comment_count)
            keeper.report_count = max(getattr(keeper, "report_count", 0), getattr(sp, "report_count", 0))
        keeper.save(
            update_fields=[
                "like_count",
                "bookmark_count",
                "view_count",
                "comment_count",
                "report_count",
                "updated_at",
            ]
        )
        for sp in plans[1:]:
            for link in list(SharedPlanGroup.objects.filter(shared_plan_id=sp.id)):
                existing = SharedPlanGroup.objects.filter(
                    shared_plan_id=keeper.id, group_id=link.group_id
                ).first()
                if existing:
                    link.delete()
                else:
                    link.shared_plan_id = keeper.id
                    link.save(update_fields=["shared_plan_id"])
            sp.delete()


class Migration(migrations.Migration):

    dependencies = [
        ("career_path", "0004_sharedplan_report_count"),
    ]

    operations = [
        migrations.RunPython(merge_duplicate_shared_plans, migrations.RunPython.noop),
        migrations.RemoveIndex(
            model_name="sharedplan",
            name="idx_cp_splan_career_plan",
        ),
        migrations.AddConstraint(
            model_name="sharedplan",
            constraint=models.UniqueConstraint(
                fields=("career_plan",),
                name="uniq_sharedplan_one_row_per_career_plan",
            ),
        ),
    ]
