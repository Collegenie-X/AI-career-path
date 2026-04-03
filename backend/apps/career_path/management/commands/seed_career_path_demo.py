"""
커리어 패스 데모 시드 — 학교·그룹·커리어 패스·공유 패스 (템플릿은 프론트 JSON 전용).

사용:
  python manage.py seed_career_path_demo
  python manage.py seed_career_path_demo --reset  # 동일 이메일 사용자·관련 행 삭제 후 재생성
"""

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction

from apps.community.models import Group, GroupMember
from apps.career_path.models import (
    CareerPlan,
    GoalGroup,
    PlanItem,
    PlanYear,
    School,
    SharedPlan,
)

User = get_user_model()

SEED_EMAIL = 'seed.demo@example.com'
SEED_PASSWORD = 'seed12345'
SEED_NAME = '시드 데모'


def _create_career_plan_with_content(user, **kwargs):
    """최소 학년·목표·활동이 있는 커리어 패스."""
    plan = CareerPlan.objects.create(
        user=user,
        title=kwargs['title'],
        description=kwargs.get('description', ''),
        job_id=kwargs.get('job_id', 'job_dev'),
        job_name=kwargs.get('job_name', '개발자'),
        job_emoji=kwargs.get('job_emoji', '💻'),
        star_id=kwargs.get('star_id', 'star_tech'),
        star_name=kwargs.get('star_name', '기술 탐구'),
        star_emoji=kwargs.get('star_emoji', '⭐'),
        star_color=kwargs.get('star_color', '#6C5CE7'),
        is_template=False,
        template_category=None,
    )
    py = PlanYear.objects.create(
        career_plan=plan,
        grade_id='high1',
        grade_label='고등학교 1학년',
        semester='both',
        sort_order=0,
    )
    gg = GoalGroup.objects.create(
        plan_year=py,
        goal='기초 역량 쌓기',
        semester_id='',
        sort_order=0,
    )
    PlanItem.objects.create(
        plan_year=py,
        goal_group=gg,
        type='activity',
        title='온라인 강의 1개 이수',
        months=[3, 4],
        difficulty=2,
        cost='무료',
        organizer='',
        category_tags=['study'],
        activity_subtype='general',
        sort_order=0,
    )
    return plan


class Command(BaseCommand):
    help = 'Seed schools, groups, career plans, and public shared plans for career_path demo.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset',
            action='store_true',
            help='Delete existing seed user and related rows, then recreate.',
        )

    def handle(self, *args, **options):
        reset = options['reset']

        if reset:
            User.objects.filter(email=SEED_EMAIL).delete()
            self.stdout.write(self.style.WARNING(f'Removed user {SEED_EMAIL} and cascaded data.'))

        with transaction.atomic():
            user, created = User.objects.get_or_create(
                email=SEED_EMAIL,
                defaults={
                    'name': SEED_NAME,
                    'grade': 'high2',
                    'emoji': '🌱',
                },
            )
            user.set_password(SEED_PASSWORD)
            user.name = SEED_NAME
            user.save()

            school_a, _ = School.objects.update_or_create(
                code='SEEDHS01',
                defaults={
                    'name': '시드 고등학교',
                    'operator': user,
                    'grades': ['high1', 'high2', 'high3'],
                    'member_count': 120,
                    'description': '데모용 시드 학교',
                    'region': '서울',
                    'school_type': 'high',
                },
            )
            school_b, _ = School.objects.update_or_create(
                code='SEEDMS01',
                defaults={
                    'name': '시드 중학교',
                    'operator': user,
                    'grades': ['mid1', 'mid2', 'mid3'],
                    'member_count': 200,
                    'description': '데모용 시드 중학교',
                    'region': '경기',
                    'school_type': 'middle',
                },
            )

            group_defs = [
                ('시드 코딩 모임', '💻', 'Python·웹 기초 스터디'),
                ('시드 진로 탐구', '🔭', '대입·포트폴리오 정보 공유'),
                ('시드 디자인 랩', '🎨', 'UI·그래픽 작업실'),
            ]
            groups = []
            for name, emoji, desc in group_defs:
                g, _ = Group.objects.get_or_create(
                    name=name,
                    creator=user,
                    defaults={
                        'emoji': emoji,
                        'description': desc,
                        'is_public': True,
                        'member_count': 1,
                    },
                )
                if not GroupMember.objects.filter(group=g, user=user).exists():
                    GroupMember.objects.create(group=g, user=user, role='admin')
                groups.append(g)

            titles = [
                ('공개: AI·데이터 입문 로드맵', '데이터와 AI 기초를 다지는 3개년 계획입니다.'),
                ('공개: SW 마이스터고 준비', '실무형 고교 진학을 목표로 한 활동 위주 패스입니다.'),
                ('공개: 디자인·미디어 트랙', '영상·UI 포트폴리오 중심 로드맵입니다.'),
            ]
            for title, desc in titles:
                existing = CareerPlan.objects.filter(user=user, title=title).first()
                if existing:
                    SharedPlan.objects.update_or_create(
                        career_plan=existing,
                        defaults={
                            'user': user,
                            'share_type': 'public',
                            'description': desc,
                            'tags': ['seed', 'demo'],
                            'like_count': 12,
                            'bookmark_count': 4,
                            'view_count': 48,
                        },
                    )
                    continue

                cp = _create_career_plan_with_content(
                    user,
                    title=title,
                    description=desc,
                    job_id='job_seed',
                    job_name='시드 직업',
                    job_emoji='✨',
                    star_id='star_seed',
                    star_name='탐구형',
                    star_emoji='🌟',
                )
                SharedPlan.objects.create(
                    career_plan=cp,
                    user=user,
                    school=None,
                    share_type='public',
                    description=desc,
                    tags=['seed', 'demo'],
                    like_count=12,
                    bookmark_count=4,
                    view_count=48,
                )

            self.stdout.write(self.style.SUCCESS(
                f'Seed OK. Login: {SEED_EMAIL} / {SEED_PASSWORD}\n'
                f'  Schools: {school_a.name}, {school_b.name}\n'
                f'  Public groups: {len(groups)}\n'
                f'  Shared plans (public): {SharedPlan.objects.filter(user=user, share_type="public").count()}'
            ))
