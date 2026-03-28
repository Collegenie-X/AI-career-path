# career_path.SharedPlan 과 정렬: report_count + 로드맵당 공유 1행

from django.db import migrations, models


def _dedupe_shared_dream_by_roadmap(apps, schema_editor):
    """동일 roadmap에 여러 공유 행이 있으면 최신(shared_at, id) 1건만 남김."""
    from collections import defaultdict

    SharedDreamRoadmap = apps.get_model("career_plan", "SharedDreamRoadmap")
    by_roadmap = defaultdict(list)
    for obj in SharedDreamRoadmap.objects.all().order_by("-shared_at", "-id"):
        by_roadmap[obj.roadmap_id].append(obj.pk)
    for _rid, pks in by_roadmap.items():
        if len(pks) <= 1:
            continue
        SharedDreamRoadmap.objects.filter(pk__in=pks[1:]).delete()


def _noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("career_plan", "0002_remove_planitem_plan_remove_plangroup_creator_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="shareddreamroadmap",
            name="report_count",
            field=models.IntegerField(default=0, verbose_name="신고 수"),
        ),
        migrations.RunPython(_dedupe_shared_dream_by_roadmap, _noop_reverse),
        migrations.AddConstraint(
            model_name="shareddreamroadmap",
            constraint=models.UniqueConstraint(
                fields=("roadmap",),
                name="uniq_shared_dream_roadmap_one_row_per_roadmap",
            ),
        ),
    ]
