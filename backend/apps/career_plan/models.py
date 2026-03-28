"""
Career Plan (DreamMate) Models - 커리어 실행 모델

설계 문서: documents/backend/커리어실행_DreamMate_Django_DB_설계서.md

Note: Group과 GroupMember는 apps.community 앱에서 import하여 사용
Note: 이 앱은 DreamMate (커리어 실행) 기능을 담당합니다.
"""

from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from common.models import TimeStampedModel, UUIDPrimaryKeyModel

User = get_user_model()

# Import Group from community app
from apps.community.models import Group


# ============================================================================
# Roadmap Models (로드맵)
# ============================================================================

class Roadmap(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    로드맵 (개인 실행 계획)
    
    - 단기 실행 계획 (방과후·방학·학기)
    - 주차별 TODO 관리
    - 최종 결과물 기록
    """
    
    PERIOD_CHOICES = [
        ('afterschool', '방과후'),
        ('vacation', '방학'),
        ('semester', '학기'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='roadmaps',
        verbose_name='소유자'
    )
    
    title = models.CharField(max_length=200, verbose_name='로드맵 제목')
    description = models.TextField(blank=True, null=True, verbose_name='로드맵 설명')
    
    period = models.CharField(
        max_length=20,
        choices=PERIOD_CHOICES,
        verbose_name='실행 기간'
    )
    
    star_color = models.CharField(
        max_length=20,
        default='#6C5CE7',
        verbose_name='적성 색상'
    )
    
    # 집중 활동 유형 (JSON 배열)
    focus_item_types = models.JSONField(
        default=list,
        blank=True,
        verbose_name='집중 활동 유형'
    )
    
    # 최종 결과물
    final_result_title = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        verbose_name='최종 결과물 제목'
    )
    final_result_description = models.TextField(
        blank=True,
        null=True,
        verbose_name='최종 결과물 설명'
    )
    final_result_url = models.URLField(
        blank=True,
        null=True,
        verbose_name='최종 결과물 URL'
    )
    final_result_image_url = models.URLField(
        blank=True,
        null=True,
        verbose_name='최종 결과물 이미지 URL'
    )
    
    class Meta:
        db_table = 'roadmaps'
        verbose_name = '로드맵'
        verbose_name_plural = '로드맵 목록'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at'], name='idx_roadmaps_user_created'),
            models.Index(fields=['period'], name='idx_roadmaps_period'),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.user.name})"
    
    @property
    def item_count(self):
        """활동 수"""
        return self.items.count()
    
    @property
    def completed_todo_count(self):
        """완료된 TODO 수"""
        return RoadmapTodo.objects.filter(
            roadmap_item__roadmap=self,
            is_done=True
        ).count()
    
    @property
    def total_todo_count(self):
        """전체 TODO 수"""
        return RoadmapTodo.objects.filter(
            roadmap_item__roadmap=self
        ).count()


class RoadmapItem(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    로드맵 활동 항목
    
    - 활동·수상·프로젝트·논문
    - 월별 실행 계획
    - 목표 산출물·성공 기준
    """
    
    TYPE_CHOICES = [
        ('activity', '활동'),
        ('award', '수상·대회'),
        ('project', '프로젝트'),
        ('paper', '논문·연구'),
    ]
    
    roadmap = models.ForeignKey(
        Roadmap,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name='소속 로드맵'
    )
    
    type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        verbose_name='활동 유형'
    )
    
    title = models.CharField(max_length=300, verbose_name='활동 제목')
    
    # 실행 월 (JSON 배열)
    months = models.JSONField(
        default=list,
        blank=True,
        verbose_name='실행 월 목록'
    )
    
    difficulty = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name='난이도'
    )
    
    # 목표 산출물
    target_output = models.TextField(
        blank=True,
        null=True,
        verbose_name='목표 산출물'
    )
    
    # 성공 기준
    success_criteria = models.TextField(
        blank=True,
        null=True,
        verbose_name='성공 기준'
    )
    
    sort_order = models.IntegerField(default=0, verbose_name='정렬 순서')
    
    class Meta:
        db_table = 'roadmap_items'
        verbose_name = '로드맵 활동'
        verbose_name_plural = '로드맵 활동 목록'
        ordering = ['sort_order', 'created_at']
        indexes = [
            models.Index(fields=['roadmap', 'sort_order'], name='idx_roadmap_items_order'),
            models.Index(fields=['type'], name='idx_roadmap_items_type'),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.type})"
    
    @property
    def completed_todo_count(self):
        """완료된 TODO 수"""
        return self.todos.filter(is_done=True).count()
    
    @property
    def total_todo_count(self):
        """전체 TODO 수"""
        return self.todos.count()


class RoadmapTodo(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    주차별 TODO (week-by-week)
    
    - 활동을 주차별로 쪼갠 실행 항목
    - goal (목표) vs task (작업) 구분
    - 완료 여부·메모·산출물 참조
    """
    
    ENTRY_TYPE_CHOICES = [
        ('goal', '목표'),
        ('task', '작업'),
    ]
    
    roadmap_item = models.ForeignKey(
        RoadmapItem,
        on_delete=models.CASCADE,
        related_name='todos',
        verbose_name='소속 활동'
    )
    
    week_label = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name='주차 라벨'
    )
    
    week_number = models.IntegerField(
        blank=True,
        null=True,
        verbose_name='주차 번호'
    )
    
    entry_type = models.CharField(
        max_length=20,
        choices=ENTRY_TYPE_CHOICES,
        default='task',
        verbose_name='항목 유형'
    )
    
    title = models.CharField(max_length=300, verbose_name='TODO 제목')
    
    is_done = models.BooleanField(default=False, verbose_name='완료 여부')
    
    note = models.TextField(
        blank=True,
        null=True,
        verbose_name='메모'
    )
    
    output_ref = models.CharField(
        max_length=500,
        blank=True,
        null=True,
        verbose_name='산출물 참조'
    )
    
    sort_order = models.IntegerField(default=0, verbose_name='정렬 순서')
    
    class Meta:
        db_table = 'roadmap_todos'
        verbose_name = '로드맵 TODO'
        verbose_name_plural = '로드맵 TODO 목록'
        ordering = ['week_number', 'sort_order', 'created_at']
        indexes = [
            models.Index(fields=['roadmap_item', 'week_number'], name='idx_roadmap_todos_week'),
            models.Index(fields=['is_done'], name='idx_roadmap_todos_done'),
        ]
    
    def __str__(self):
        status = '✓' if self.is_done else '○'
        return f"{status} {self.title} ({self.week_label})"


class RoadmapMilestone(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    실행 결과 기록 (마일스톤)
    
    - 로드맵 실행 중 중요한 성과 기록
    - 시간 투입·결과물·이미지 첨부
    """
    
    roadmap = models.ForeignKey(
        Roadmap,
        on_delete=models.CASCADE,
        related_name='milestones',
        verbose_name='소속 로드맵'
    )
    
    title = models.CharField(max_length=200, verbose_name='마일스톤 제목')
    description = models.TextField(blank=True, null=True, verbose_name='마일스톤 설명')
    
    month_week_label = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        verbose_name='월·주차 라벨'
    )
    
    time_log = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        verbose_name='투입 시간'
    )
    
    result_url = models.URLField(
        blank=True,
        null=True,
        verbose_name='결과물 URL'
    )
    
    image_url = models.URLField(
        blank=True,
        null=True,
        verbose_name='이미지 URL'
    )
    
    recorded_at = models.DateTimeField(
        blank=True,
        null=True,
        verbose_name='기록 일시'
    )
    
    sort_order = models.IntegerField(default=0, verbose_name='정렬 순서')
    
    class Meta:
        db_table = 'roadmap_milestones'
        verbose_name = '로드맵 마일스톤'
        verbose_name_plural = '로드맵 마일스톤 목록'
        ordering = ['sort_order', '-recorded_at']
        indexes = [
            models.Index(fields=['roadmap', 'sort_order'], name='idx_milestones_order'),
            models.Index(fields=['-recorded_at'], name='idx_milestones_recorded'),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.roadmap.title})"


# ============================================================================
# Dream Resource Models (드림 라이브러리)
# ============================================================================

class DreamResource(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    드림 라이브러리 (자료)
    
    - 포트폴리오·가이드·템플릿
    - 파일 업로드 (S3)
    - 좋아요·북마크·다운로드 수
    """
    
    TYPE_CHOICES = [
        ('portfolio', '포트폴리오'),
        ('guide', '가이드'),
        ('template', '템플릿'),
    ]
    
    SHARE_TYPE_CHOICES = [
        ('private', '비공개'),
        ('public', '전체 공유'),
        ('space', '그룹 공유'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='dream_resources',
        verbose_name='작성자'
    )
    
    type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        verbose_name='자료 유형'
    )
    
    title = models.CharField(max_length=200, verbose_name='자료 제목')
    description = models.TextField(blank=True, null=True, verbose_name='자료 설명')
    
    # 파일
    file_url = models.URLField(
        blank=True,
        null=True,
        verbose_name='파일 URL'
    )
    thumbnail_url = models.URLField(
        blank=True,
        null=True,
        verbose_name='썸네일 URL'
    )
    
    # 태그 (JSON 배열)
    tags = models.JSONField(
        default=list,
        blank=True,
        verbose_name='태그'
    )
    
    # 통계
    like_count = models.IntegerField(default=0, verbose_name='좋아요 수')
    bookmark_count = models.IntegerField(default=0, verbose_name='북마크 수')
    download_count = models.IntegerField(default=0, verbose_name='다운로드 수')
    view_count = models.IntegerField(default=0, verbose_name='조회 수')
    comment_count = models.IntegerField(default=0, verbose_name='댓글 수')
    
    # 공유 설정
    share_type = models.CharField(
        max_length=20,
        choices=SHARE_TYPE_CHOICES,
        default='private',
        verbose_name='공유 유형'
    )
    
    is_hidden = models.BooleanField(default=False, verbose_name='숨김 여부')
    
    class Meta:
        db_table = 'dream_resources'
        verbose_name = '드림 자료'
        verbose_name_plural = '드림 자료 목록'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', '-created_at'], name='idx_resources_user_created'),
            models.Index(fields=['type'], name='idx_resources_type'),
            models.Index(fields=['share_type'], name='idx_resources_share_type'),
            models.Index(fields=['-like_count'], name='idx_resources_likes'),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.type})"


class ResourceSection(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    자료 섹션 (가이드·템플릿 내부 구조)
    
    - 가이드·템플릿은 여러 섹션으로 구성
    """
    
    resource = models.ForeignKey(
        DreamResource,
        on_delete=models.CASCADE,
        related_name='sections',
        verbose_name='소속 자료'
    )
    
    title = models.CharField(max_length=200, verbose_name='섹션 제목')
    content = models.TextField(verbose_name='섹션 내용')
    
    sort_order = models.IntegerField(default=0, verbose_name='정렬 순서')
    
    class Meta:
        db_table = 'resource_sections'
        verbose_name = '자료 섹션'
        verbose_name_plural = '자료 섹션 목록'
        ordering = ['sort_order', 'created_at']
        indexes = [
            models.Index(fields=['resource', 'sort_order'], name='idx_sections_order'),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.resource.title})"


# ============================================================================
# Dream Space Models (드림 스페이스)
# ============================================================================

class DreamSpace(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    드림 스페이스 (그룹 프로그램)
    
    - 그룹 내에서 운영하는 프로그램
    - 수업형·프로젝트형·멘토링형
    - 참여자 모집·승인·진행
    """
    
    PROGRAM_TYPE_CHOICES = [
        ('class', '수업형'),
        ('project', '프로젝트형'),
        ('mentoring', '멘토링형'),
    ]
    
    RECRUITMENT_STATUS_CHOICES = [
        ('open', '모집중'),
        ('closed', '모집마감'),
    ]
    
    group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        related_name='dream_spaces',
        verbose_name='소속 그룹'
    )
    
    title = models.CharField(max_length=200, verbose_name='프로그램 제목')
    description = models.TextField(verbose_name='프로그램 설명')
    
    program_type = models.CharField(
        max_length=20,
        choices=PROGRAM_TYPE_CHOICES,
        verbose_name='프로그램 유형'
    )
    
    recruitment_status = models.CharField(
        max_length=20,
        choices=RECRUITMENT_STATUS_CHOICES,
        default='open',
        verbose_name='모집 상태'
    )
    
    max_participants = models.IntegerField(
        blank=True,
        null=True,
        verbose_name='최대 참여자 수'
    )
    
    current_participants = models.IntegerField(
        default=0,
        verbose_name='현재 참여자 수'
    )
    
    start_date = models.DateField(blank=True, null=True, verbose_name='시작일')
    end_date = models.DateField(blank=True, null=True, verbose_name='종료일')
    
    class Meta:
        db_table = 'dream_spaces'
        verbose_name = '드림 스페이스'
        verbose_name_plural = '드림 스페이스 목록'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['group'], name='idx_spaces_group'),
            models.Index(fields=['program_type'], name='idx_spaces_program_type'),
            models.Index(fields=['recruitment_status'], name='idx_spaces_recruitment'),
        ]
    
    def __str__(self):
        return f"{self.title} ({self.group.name})"


class SpaceParticipant(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    드림 스페이스 참여자
    
    - 신청 → 승인 → 참여 확정 → 진행 체크
    """
    
    STATUS_CHOICES = [
        ('applied', '신청'),
        ('approved', '승인'),
        ('confirmed', '참여 확정'),
        ('inProgress', '진행 체크'),
    ]
    
    space = models.ForeignKey(
        DreamSpace,
        on_delete=models.CASCADE,
        related_name='participants',
        verbose_name='소속 스페이스'
    )
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='space_participations',
        verbose_name='참여자'
    )
    
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='applied',
        verbose_name='참여 상태'
    )
    
    applied_at = models.DateTimeField(auto_now_add=True, verbose_name='신청 일시')
    approved_at = models.DateTimeField(blank=True, null=True, verbose_name='승인 일시')
    confirmed_at = models.DateTimeField(blank=True, null=True, verbose_name='확정 일시')
    
    class Meta:
        db_table = 'space_participants'
        verbose_name = '스페이스 참여자'
        verbose_name_plural = '스페이스 참여자 목록'
        unique_together = ['space', 'user']
        ordering = ['applied_at']
        indexes = [
            models.Index(fields=['space', 'status'], name='idx_participants_status'),
            models.Index(fields=['user'], name='idx_participants_user'),
        ]
    
    def __str__(self):
        return f"{self.user.name} in {self.space.title} ({self.status})"


# ============================================================================
# Shared Roadmap Models (공유된 로드맵)
# ============================================================================

class SharedDreamRoadmap(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    공유된 드림 로드맵
    
    - 개인 로드맵을 커뮤니티에 공유
    - 공유 유형: 전체 공유(public), 그룹 공유(space)
    - 학교 공유 없음 (DreamMate는 그룹만 존재)
    """
    
    SHARE_TYPE_CHOICES = [
        ('private', '비공개'),
        ('public', '전체 공유'),
        ('space', '그룹 공유'),
    ]
    
    roadmap = models.ForeignKey(
        Roadmap,
        on_delete=models.CASCADE,
        related_name='shared_instances',
        verbose_name='원본 로드맵'
    )
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='shared_dream_roadmaps',
        verbose_name='공유자'
    )
    
    share_type = models.CharField(
        max_length=20,
        choices=SHARE_TYPE_CHOICES,
        default='private',
        verbose_name='공유 유형'
    )
    
    description = models.TextField(blank=True, null=True, verbose_name='공유 설명')
    
    tags = models.JSONField(
        default=list,
        blank=True,
        verbose_name='태그'
    )
    
    # 통계 (비정규화 — career_path.SharedPlan 과 동일 패턴)
    like_count = models.IntegerField(default=0, verbose_name='좋아요 수')
    bookmark_count = models.IntegerField(default=0, verbose_name='북마크 수')
    view_count = models.IntegerField(default=0, verbose_name='조회 수')
    comment_count = models.IntegerField(default=0, verbose_name='댓글 수')
    report_count = models.IntegerField(default=0, verbose_name='신고 수')
    
    shared_at = models.DateTimeField(auto_now_add=True, verbose_name='공유 일시')
    
    is_hidden = models.BooleanField(default=False, verbose_name='숨김 여부')
    
    class Meta:
        db_table = 'shared_dream_roadmaps'
        verbose_name = '공유 드림 로드맵'
        verbose_name_plural = '공유 드림 로드맵 목록'
        ordering = ['-shared_at']
        constraints = [
            models.UniqueConstraint(
                fields=['roadmap'],
                name='uniq_shared_dream_roadmap_one_row_per_roadmap',
            ),
        ]
        indexes = [
            models.Index(fields=['user', '-shared_at'], name='idx_shared_dream_rm_user'),
            models.Index(fields=['roadmap'], name='idx_shared_dream_rm_roadmap'),
            models.Index(fields=['share_type'], name='idx_shared_dream_rm_type'),
            models.Index(fields=['-like_count'], name='idx_shared_dream_rm_likes'),
        ]
    
    def __str__(self):
        return f"Shared: {self.roadmap.title} ({self.share_type})"


class SharedDreamRoadmapGroup(UUIDPrimaryKeyModel, TimeStampedModel):
    """
    공유 드림 로드맵 - 그룹 연결 (M:N)
    """
    
    shared_roadmap = models.ForeignKey(
        SharedDreamRoadmap,
        on_delete=models.CASCADE,
        related_name='group_links',
        verbose_name='공유 로드맵'
    )
    
    group = models.ForeignKey(
        Group,
        on_delete=models.CASCADE,
        related_name='shared_dream_roadmap_links',
        verbose_name='그룹'
    )
    
    class Meta:
        db_table = 'shared_dream_roadmap_groups'
        verbose_name = '공유 드림 로드맵-그룹 연결'
        verbose_name_plural = '공유 드림 로드맵-그룹 연결 목록'
        unique_together = ['shared_roadmap', 'group']
        indexes = [
            models.Index(fields=['shared_roadmap'], name='idx_sdrg_shared_roadmap'),
            models.Index(fields=['group'], name='idx_sdrg_group'),
        ]
    
    def __str__(self):
        return f"{self.shared_roadmap.roadmap.title} → {self.group.name}"
