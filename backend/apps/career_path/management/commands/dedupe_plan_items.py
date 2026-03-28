"""
동일 학년·목표 그룹·제목·유형으로 중복된 PlanItem 행을 정리합니다.
(히스토리 테이블이 아니라, 저장 동기화 이슈 등으로 쌓인 중복 행용)

사용:
  python manage.py dedupe_plan_items --dry-run
  python manage.py dedupe_plan_items --career-plan-id <UUID>
"""

from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Count

from apps.career_path.models import PlanItem


class Command(BaseCommand):
    help = '중복 PlanItem 삭제 (학년·목표그룹·제목·유형 기준, 가장 먼저 생성된 행 유지)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='삭제하지 않고 대상만 출력합니다.',
        )
        parser.add_argument(
            '--career-plan-id',
            type=str,
            default=None,
            help='해당 커리어 패스에 속한 활동만 정리합니다.',
        )

    def handle(self, *args, **options):
        dry_run: bool = options['dry_run']
        career_plan_id = options.get('career_plan_id')

        base = PlanItem.objects.all()
        if career_plan_id:
            base = base.filter(plan_year__career_plan_id=career_plan_id)

        dup_keys = (
            base.values('plan_year_id', 'goal_group_id', 'title', 'type')
            .annotate(c=Count('id'))
            .filter(c__gt=1)
        )

        total_delete = 0
        for row in dup_keys:
            qs = PlanItem.objects.filter(
                plan_year_id=row['plan_year_id'],
                goal_group_id=row['goal_group_id'],
                title=row['title'],
                type=row['type'],
            ).order_by('sort_order', 'created_at', 'id')
            keeper = qs.first()
            rest = qs.exclude(pk=keeper.pk) if keeper else qs.none()
            n = rest.count()
            if n == 0:
                continue
            total_delete += n
            self.stdout.write(
                f"{'[dry-run] ' if dry_run else ''}"
                f"keep={keeper.id} title={row['title']!r} "
                f"delete_count={n} plan_year={row['plan_year_id']}"
            )
            if not dry_run:
                with transaction.atomic():
                    rest.delete()

        self.stdout.write(
            self.style.SUCCESS(
                f"완료: {'삭제 예정' if dry_run else '삭제'} 행 수 = {total_delete}"
            )
        )
