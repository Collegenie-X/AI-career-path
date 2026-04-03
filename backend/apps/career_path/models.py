"""
Career Path Models - 커리어 패스 모델

설계 문서: documents/backend/커리어패스_Career_Django_DB_설계서.md

Note: Group과 GroupMember는 apps.community 앱에서 import하여 사용
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from common.models import TimeStampedModel, UUIDPrimaryKeyModel

User = get_user_model()

# Import Group and GroupMember from community app
from apps.community.models import Group, GroupMember


# ============================================================================
# School Model (커뮤니티)
# ============================================================================

class School(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    학교 모델
    
    - 선생님(teacher)이 생성
    - 학생들은 학교 코드로 가입
    - 학교 공간에서 같은 학교 학생들의 공유 패스 조회 가능
    """
    
    SCHOOL_TYPE_CHOICES = [
        ('elementary', '초등학교'),
        ('middle', '중학교'),
        ('high', '고등학교'),
    ]
    
    name = models.CharField(max_length=200, verbose_name='학교 이름')
    code = models.CharField(
        max_length=50,
        unique=True,
        blank=True,
        default='',
        verbose_name='학교 가입 코드'
    )
    
    operator = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='operated_schools',
        verbose_name='학교 운영자 (선생님)'
    )
    
    # PostgreSQL ArrayField 대신 JSONField — SQLite 로컬 개발 호환 (문자열 배열)
    grades = models.JSONField(default=list, blank=True, verbose_name='관리 학년 목록')
    
    member_count = models.IntegerField(default=0, verbose_name='소속 학생 수')
    
    description = models.TextField(blank=True, null=True, verbose_name='학교 설명')
    region = models.CharField(max_length=100, blank=True, null=True, verbose_name='지역')
    
    school_type = models.CharField(
        max_length=50,
        choices=SCHOOL_TYPE_CHOICES,
        blank=True,
        null=True,
        verbose_name='학교 유형'
    )
    
    class Meta:
        db_table = 'career_path_schools'
        verbose_name = '학교'
        verbose_name_plural = '학교 목록'
        ordering = ['name']
        indexes = [
            models.Index(fields=['code'], name='idx_cp_schools_code'),
            models.Index(fields=['operator'], name='idx_cp_schools_operator'),
            models.Index(fields=['region', 'school_type'], name='idx_cp_schools_region_type'),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.code})"


# ============================================================================
# Career Plan Models (커리어 패스)
# ============================================================================

class CareerPlan(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    커리어 패스 (개인 진로 계획)
    
    - 사용자별 여러 개 생성 가능
    - 템플릿 플래그로 관리자 생성 템플릿 구분
    - 직업(job)·적성(star) 정보 포함
    """
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='career_plans',
        verbose_name='소유자'
    )
    
    # 기본 정보
    title = models.CharField(max_length=200, verbose_name='커리어 패스 제목')
    description = models.TextField(blank=True, null=True, verbose_name='커리어 패스 설명')
    
    # 직업 정보
    job_id = models.CharField(max_length=100, verbose_name='직업 ID')
    job_name = models.CharField(max_length=100, verbose_name='직업 이름')
    job_emoji = models.CharField(max_length=10, blank=True, null=True, verbose_name='직업 이모지')
    
    # 적성(별) 정보
    star_id = models.CharField(max_length=100, verbose_name='적성 ID')
    star_name = models.CharField(max_length=100, blank=True, null=True, verbose_name='적성 이름')
    star_emoji = models.CharField(max_length=10, blank=True, null=True, verbose_name='적성 이모지')
    star_color = models.CharField(max_length=20, default='#6C5CE7', verbose_name='적성 색상')
    
    # 템플릿 여부
    is_template = models.BooleanField(default=False, verbose_name='템플릿 여부')
    template_category = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name='템플릿 카테고리'
    )
    
    class Meta:
        db_table = 'career_path_career_plans'
        verbose_name = '커리어 패스'
        verbose_name_plural = '커리어 패스 목록'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at'], name='idx_cp_cplan_user_created'),
            models.Index(fields=['job_id'], name='idx_cp_cplan_job'),
            models.Index(fields=['star_id'], name='idx_cp_cplan_star'),
            models.Index(fields=['is_template'], name='idx_cp_cplan_template'),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.user.name})"
    
    @property
    def year_count(self):
        """학년 수 계산"""
        return self.years.count()
    
    @property
    def item_count(self):
        """총 활동 수 계산"""
        return PlanItem.objects.filter(plan_year__career_plan=self).count()


class PlanYear(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    학년별 계획
    
    - 한 커리어 패스는 여러 학년으로 구성
    - 학년당 여러 목표 그룹 보유
    """
    
    SEMESTER_CHOICES = [
        ('both', '1·2학기 통합'),
        ('first', '1학기만'),
        ('second', '2학기만'),
        ('split', '1·2학기 분리'),
        ('', '미선택'),
    ]
    
    career_plan = models.ForeignKey(
        CareerPlan,
        on_delete=models.CASCADE,
        related_name='years',
        verbose_name='소속 커리어 패스'
    )
    
    grade_id = models.CharField(max_length=20, verbose_name='학년 ID')
    grade_label = models.CharField(max_length=50, verbose_name='학년 라벨')
    
    semester = models.CharField(
        max_length=20,
        choices=SEMESTER_CHOICES,
        default='both',
        verbose_name='학기 옵션'
    )
    
    sort_order = models.IntegerField(default=0, verbose_name='정렬 순서')
    
    class Meta:
        db_table = 'career_path_plan_years'
        verbose_name = '학년별 계획'
        verbose_name_plural = '학년별 계획 목록'
        unique_together = ['career_plan', 'grade_id']
        ordering = ['sort_order', 'created_at']
        indexes = [
            models.Index(fields=['career_plan', 'sort_order'], name='idx_cp_plan_years_plan_order'),
            models.Index(fields=['grade_id'], name='idx_cp_plan_years_grade'),
        ]
    
    def __str__(self):
        return f"{self.career_plan.title} - {self.grade_label}"


class GoalGroup(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    목표-활동 그룹
    
    - 한 학년 내에서 목표별로 활동을 그룹핑
    - 예: "프로그래밍 기초 완성" 목표 → 3개 활동
    """
    
    SEMESTER_ID_CHOICES = [
        ('first', '1학기'),
        ('second', '2학기'),
        ('', '통합'),
    ]
    
    plan_year = models.ForeignKey(
        PlanYear,
        on_delete=models.CASCADE,
        related_name='goal_groups',
        verbose_name='소속 학년'
    )
    
    goal = models.TextField(verbose_name='목표')
    
    semester_id = models.CharField(
        max_length=20,
        choices=SEMESTER_ID_CHOICES,
        blank=True,
        default='',
        verbose_name='학기 구분'
    )
    
    sort_order = models.IntegerField(default=0, verbose_name='정렬 순서')
    
    class Meta:
        db_table = 'career_path_goal_groups'
        verbose_name = '목표 그룹'
        verbose_name_plural = '목표 그룹 목록'
        ordering = ['sort_order', 'created_at']
        indexes = [
            models.Index(fields=['plan_year', 'sort_order'], name='idx_cp_goal_groups_year_order'),
            models.Index(fields=['semester_id'], name='idx_cp_goal_groups_semester'),
        ]
    
    def __str__(self):
        return f"{self.goal} ({self.plan_year.grade_label})"


class PlanItem(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    활동·수상·작품·자격증
    
    - 한 학년 내 여러 활동 보유
    - 목표 그룹에 속할 수도, 독립적일 수도 있음
    - 월별 실행 계획 (months 배열)
    """
    
    TYPE_CHOICES = [
        ('activity', '활동'),
        ('award', '수상·대회'),
        ('portfolio', '작품'),
        ('certification', '자격증'),
    ]
    
    ACTIVITY_SUBTYPE_CHOICES = [
        ('project', '프로젝트'),
        ('intern', '인턴'),
        ('volunteer', '봉사'),
        ('camp', '캠프'),
        ('research', '연구'),
        ('paper', '논문'),
        ('general', '일반'),
    ]
    
    plan_year = models.ForeignKey(
        PlanYear,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name='소속 학년'
    )
    
    goal_group = models.ForeignKey(
        GoalGroup,
        on_delete=models.CASCADE,
        blank=True,
        null=True,
        related_name='items',
        verbose_name='소속 목표 그룹',
    )
    
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, verbose_name='활동 유형')
    title = models.CharField(max_length=300, verbose_name='활동 제목')
    
    # 실행 월 (정수 배열) — JSONField로 SQLite/PostgreSQL 공통 지원
    months = models.JSONField(default=list, blank=True, verbose_name='실행 월 목록')
    
    difficulty = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name='난이도'
    )
    
    cost = models.CharField(max_length=100, blank=True, null=True, verbose_name='비용')
    organizer = models.CharField(max_length=200, blank=True, null=True, verbose_name='주최 기관')
    url = models.URLField(blank=True, null=True, verbose_name='관련 URL')
    description = models.TextField(blank=True, null=True, verbose_name='상세 설명')
    
    category_tags = models.JSONField(default=list, blank=True, verbose_name='카테고리 태그')
    
    activity_subtype = models.CharField(
        max_length=50,
        choices=ACTIVITY_SUBTYPE_CHOICES,
        blank=True,
        null=True,
        verbose_name='활동 세부 유형'
    )
    
    sort_order = models.IntegerField(default=0, verbose_name='정렬 순서')

    # 타임라인·체크리스트 활동 단위 완료(상위 항목 체크); 하위 SubItem.is_done과 별개
    is_done = models.BooleanField(default=False, verbose_name='활동 완료')
    
    class Meta:
        db_table = 'career_path_plan_items'
        verbose_name = '활동 항목'
        verbose_name_plural = '활동 항목 목록'
        ordering = ['sort_order', 'created_at']
        indexes = [
            models.Index(fields=['plan_year', 'sort_order'], name='idx_cp_plan_items_year_order'),
            models.Index(fields=['goal_group'], name='idx_cp_plan_items_goal_group'),
            models.Index(fields=['type'], name='idx_cp_plan_items_type'),
            models.Index(fields=['months'], name='idx_cp_plan_items_months'),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.type})"
    
    @property
    def month_range_display(self):
        """월 범위 표시 (예: 3~5월)"""
        months = self.months
        if not months or not isinstance(months, list):
            return ''
        return f"{min(months)}~{max(months)}월"


class SubItem(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    활동 하위 실행 항목 (체크리스트)
    
    - 큰 활동을 작은 단위로 쪼갠 실행 항목
    - 완료 여부(is_done) 체크
    """
    
    plan_item = models.ForeignKey(
        PlanItem,
        on_delete=models.CASCADE,
        related_name='sub_items',
        verbose_name='소속 활동'
    )
    
    title = models.CharField(max_length=300, verbose_name='하위 항목 제목')
    is_done = models.BooleanField(default=False, verbose_name='완료 여부')
    url = models.URLField(blank=True, null=True, verbose_name='관련 URL')
    description = models.TextField(blank=True, null=True, verbose_name='상세 설명')
    
    sort_order = models.IntegerField(default=0, verbose_name='정렬 순서')
    
    class Meta:
        db_table = 'career_path_sub_items'
        verbose_name = '하위 실행 항목'
        verbose_name_plural = '하위 실행 항목 목록'
        ordering = ['sort_order', 'created_at']
        indexes = [
            models.Index(fields=['plan_item', 'sort_order'], name='idx_cp_sub_items_item_order'),
            models.Index(fields=['is_done'], name='idx_cp_sub_items_done'),
        ]
    
    def __str__(self):
        return f"{self.title} ({'✓' if self.is_done else '○'})"


class ItemLink(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    활동 참고 링크
    
    - 한 활동에 여러 참고 링크 첨부 가능
    - 링크 종류(kind)로 구분
    """
    
    LINK_KIND_CHOICES = [
        ('official', '공식 사이트'),
        ('application', '신청 페이지'),
        ('reference', '참고 자료'),
        ('portfolio', '포트폴리오'),
        ('result', '결과물'),
    ]
    
    plan_item = models.ForeignKey(
        PlanItem,
        on_delete=models.CASCADE,
        related_name='links',
        verbose_name='소속 활동'
    )
    
    title = models.CharField(max_length=200, verbose_name='링크 제목')
    url = models.URLField(verbose_name='링크 URL')
    kind = models.CharField(
        max_length=50,
        choices=LINK_KIND_CHOICES,
        blank=True,
        null=True,
        verbose_name='링크 종류'
    )
    
    sort_order = models.IntegerField(default=0, verbose_name='정렬 순서')
    
    class Meta:
        db_table = 'career_path_item_links'
        verbose_name = '활동 참고 링크'
        verbose_name_plural = '활동 참고 링크 목록'
        ordering = ['sort_order', 'created_at']
        indexes = [
            models.Index(fields=['plan_item', 'sort_order'], name='idx_cp_item_links_item_order'),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.kind})"


# ============================================================================
# Shared Plan Models (공유된 커리어 패스)
# ============================================================================

class SharedPlan(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    공유된 커리어 패스
    
    - 개인 커리어 패스를 커뮤니티에 공유
    - 공유 유형: 전체 공유(public), 학교 공유(school), 그룹 공유(group)
    - 좋아요·북마크·댓글 기능
    """
    
    SHARE_TYPE_CHOICES = [
        ('private', '비공개'),
        ('public', '전체 공유'),
        ('school', '학교 공유'),
        ('group', '그룹 공유'),
    ]
    
    career_plan = models.ForeignKey(
        CareerPlan,
        on_delete=models.CASCADE,
        related_name='shared_instances',
        verbose_name='원본 커리어 패스'
    )
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='shared_plans',
        verbose_name='공유자'
    )
    
    school = models.ForeignKey(
        School,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='shared_plans',
        verbose_name='소속 학교'
    )
    
    share_type = models.CharField(
        max_length=20,
        choices=SHARE_TYPE_CHOICES,
        default='private',
        verbose_name='공유 유형'
    )
    
    description = models.TextField(blank=True, null=True, verbose_name='공유 설명')
    
    tags = models.JSONField(default=list, blank=True, verbose_name='태그')
    
    # 통계 (비정규화 - 성능 최적화)
    like_count = models.IntegerField(default=0, verbose_name='좋아요 수')
    bookmark_count = models.IntegerField(default=0, verbose_name='북마크 수')
    view_count = models.IntegerField(default=0, verbose_name='조회 수')
    comment_count = models.IntegerField(default=0, verbose_name='댓글 수')
    report_count = models.IntegerField(default=0, verbose_name='신고 수')
    
    shared_at = models.DateTimeField(auto_now_add=True, verbose_name='공유 일시')
    
    is_hidden = models.BooleanField(default=False, verbose_name='숨김 여부')
    
    class Meta:
        db_table = 'career_path_shared_plans'
        verbose_name = '공유 커리어 패스'
        verbose_name_plural = '공유 커리어 패스 목록'
        ordering = ['-shared_at']
        constraints = [
            models.UniqueConstraint(
                fields=['career_plan'],
                name='uniq_sharedplan_one_row_per_career_plan',
            ),
        ]
        indexes = [
            models.Index(fields=['user', '-shared_at'], name='idx_cp_splan_user_shared'),
            models.Index(fields=['school'], name='idx_cp_splan_school'),
            models.Index(fields=['share_type'], name='idx_cp_splan_share_type'),
            models.Index(fields=['-like_count'], name='idx_cp_splan_likes'),
            models.Index(fields=['-shared_at'], name='idx_cp_splan_shared'),
            models.Index(fields=['is_hidden'], name='idx_cp_splan_hidden'),
        ]
    
    def __str__(self):
        return f"Shared: {self.career_plan.title} ({self.share_type})"


class SharedPlanComment(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    공유 커리어 패스 댓글 (답글: parent)
    """

    shared_plan = models.ForeignKey(
        SharedPlan,
        on_delete=models.CASCADE,
        related_name='plan_comments',
        verbose_name='공유 패스',
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='shared_plan_comments',
        verbose_name='작성자',
    )
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies',
        verbose_name='상위 댓글',
    )
    content = models.TextField(verbose_name='내용')

    class Meta:
        db_table = 'career_path_shared_plan_comments'
        verbose_name = '공유 패스 댓글'
        verbose_name_plural = '공유 패스 댓글 목록'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['shared_plan', 'created_at'], name='idx_cp_spcom_plan_created'),
        ]

    def __str__(self):
        return f"Comment on {self.shared_plan_id} by {self.author_id}"


class SharedPlanGroup(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    공유 패스 - 그룹 연결 (M:N)
    
    - 한 공유 패스를 여러 그룹에 동시 공유 가능
    """
    
    shared_plan = models.ForeignKey(
        SharedPlan,
        on_delete=models.CASCADE,
        related_name='group_links',
        verbose_name='공유 패스'
    )
    
    group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        related_name='career_path_shared_plan_links',
        verbose_name='그룹'
    )
    
    class Meta:
        db_table = 'career_path_shared_plan_groups'
        verbose_name = '공유 패스-그룹 연결'
        verbose_name_plural = '공유 패스-그룹 연결 목록'
        unique_together = ['shared_plan', 'group']
        indexes = [
            models.Index(fields=['shared_plan'], name='idx_cp_spg_shared_plan'),
            models.Index(fields=['group'], name='idx_cp_spg_group'),
        ]
    
    def __str__(self):
        return f"{self.shared_plan.career_plan.title} → {self.group.name}"
