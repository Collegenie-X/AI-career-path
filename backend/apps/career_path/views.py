"""
Career Path Views - 커리어 패스 뷰

설계 문서: documents/backend/커리어패스_Career_Django_DB_설계서.md
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Prefetch, Q, Count
from django.db import transaction
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    School, Group, GroupMember,
    CareerPlan, PlanYear, GoalGroup, PlanItem, SubItem, ItemLink,
    SharedPlan, SharedPlanComment, SharedPlanGroup,
)
from .serializers import (
    SchoolSerializer, GroupSerializer, GroupMemberSerializer,
    CareerPlanListSerializer, CareerPlanDetailSerializer, CareerPlanCreateSerializer,
    PlanYearSerializer, PlanYearCreateSerializer,
    GoalGroupSerializer, GoalGroupCreateSerializer,
    PlanItemSerializer, PlanItemCreateSerializer,
    SubItemSerializer, ItemLinkSerializer,
    SharedPlanListSerializer, SharedPlanDetailSerializer, SharedPlanCreateSerializer,
    SharedPlanCommentSerializer, SharedPlanCommentCreateSerializer,
)


# ============================================================================
# School & Group ViewSets
# ============================================================================

class SchoolViewSet(viewsets.ModelViewSet):
    """
    학교 ViewSet
    
    - 선생님이 학교 생성
    - 학생들은 학교 코드로 가입
    - 목록/상세: 누구나 조회 (시드·탐색용)
    - 생성/수정/삭제: 로그인 + 운영자 본인
    """
    queryset = School.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['school_type', 'region']
    search_fields = ['name', 'code']
    ordering_fields = ['name', 'member_count', 'created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        """목록/상세: 전체 학교. 쓰기: 본인이 운영하는 학교만."""
        user = self.request.user
        base = School.objects.all().select_related('operator')
        if self.action in ('list', 'retrieve'):
            return base
        if user.is_authenticated:
            return base.filter(operator=user)
        return base.none()
    
    @action(detail=False, methods=['post'])
    def join(self, request):
        """학교 가입 (코드로)"""
        code = request.data.get('code')
        
        if not code:
            return Response(
                {'error': '학교 코드를 입력해주세요.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            school = School.objects.get(code=code)
        except School.DoesNotExist:
            return Response(
                {'error': '존재하지 않는 학교 코드입니다.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # 이미 가입했는지 확인
        # if SchoolMember.objects.filter(school=school, user=request.user).exists():
        #     return Response(
        #         {'error': '이미 가입한 학교입니다.'},
        #         status=status.HTTP_400_BAD_REQUEST
        #     )
        
        # 학교 멤버 생성
        # member = SchoolMember.objects.create(
        #     school=school,
        #     user=request.user,
        #     role='student'
        # )
        
        # 멤버 수 증가
        school.member_count += 1
        school.save(update_fields=['member_count'])
        
        return Response(
            SchoolSerializer(school).data,
            status=status.HTTP_201_CREATED
        )


class GroupViewSet(viewsets.ModelViewSet):
    """
    그룹 ViewSet
    
    - 학생이 자유롭게 생성
    - 초대 코드로 가입
    - 목록/상세: 공개 그룹 + (로그인 시) 내 그룹
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'member_count', 'created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        """비로그인: 공개 그룹만. 로그인: 공개 + 생성 + 멤버 소속."""
        public_qs = Group.objects.filter(is_public=True)
        user = self.request.user
        if not user.is_authenticated:
            return public_qs.distinct()
        created_groups = Group.objects.filter(creator=user)
        member_groups = Group.objects.filter(members__user=user)
        return (created_groups | member_groups | public_qs).distinct()
    
    def perform_create(self, serializer):
        """그룹 생성 시 생성자를 현재 사용자로 설정"""
        group = serializer.save(creator=self.request.user)
        
        # 생성자를 멤버로 추가
        GroupMember.objects.create(
            group=group,
            user=self.request.user,
            role='admin'
        )
    
    @action(detail=False, methods=['post'])
    def join(self, request):
        """그룹 가입 (초대 코드로)"""
        invite_code = request.data.get('invite_code')
        
        if not invite_code:
            return Response(
                {'error': '초대 코드를 입력해주세요.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            group = Group.objects.get(invite_code=invite_code)
        except Group.DoesNotExist:
            return Response(
                {'error': '존재하지 않는 초대 코드입니다.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # 이미 가입했는지 확인
        if GroupMember.objects.filter(group=group, user=request.user).exists():
            return Response(
                {'error': '이미 가입한 그룹입니다.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if group.member_count >= group.max_members:
            return Response(
                {'error': '그룹 정원이 찼습니다.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 그룹 멤버 생성
        member = GroupMember.objects.create(
            group=group,
            user=request.user,
            role='member'
        )
        
        # 멤버 수 증가
        group.member_count += 1
        group.save(update_fields=['member_count'])
        
        return Response(
            GroupSerializer(group).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        """그룹 멤버 목록 조회"""
        group = self.get_object()
        members = GroupMember.objects.filter(group=group).select_related('user')
        serializer = GroupMemberSerializer(members, many=True)
        return Response(serializer.data)


# ============================================================================
# Career Plan ViewSets
# ============================================================================

class CareerPlanViewSet(viewsets.ModelViewSet):
    """
    커리어 패스 ViewSet
    
    - 사용자별 커리어 패스 CRUD
    - 템플릿 조회
    - 템플릿 복사
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['job_id', 'star_id', 'is_template']
    search_fields = ['title', 'description', 'job_name', 'star_name']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """
        사용자 본인의 커리어 패스 + 템플릿 조회
        """
        user = self.request.user
        
        # 본인 패스 + 템플릿
        queryset = CareerPlan.objects.filter(
            Q(user=user) | Q(is_template=True)
        ).select_related('user')
        
        return queryset
    
    def get_serializer_class(self):
        """액션별 시리얼라이저 선택"""
        if self.action == 'list':
            return CareerPlanListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return CareerPlanCreateSerializer
        else:
            return CareerPlanDetailSerializer
    
    def retrieve(self, request, *args, **kwargs):
        """
        상세 조회 (전체 중첩 구조)
        
        N+1 문제 해결: prefetch_related
        """
        queryset = CareerPlan.objects.select_related('user').prefetch_related(
            Prefetch(
                'years',
                queryset=PlanYear.objects.prefetch_related(
                    Prefetch(
                        'goal_groups',
                        queryset=GoalGroup.objects.prefetch_related(
                            Prefetch(
                                'items',
                                queryset=PlanItem.objects.prefetch_related(
                                    'sub_items',
                                    'links',
                                )
                            )
                        )
                    ),
                    Prefetch(
                        'items',
                        queryset=PlanItem.objects.prefetch_related(
                            'sub_items',
                            'links',
                        )
                    )
                )
            ),
        )
        
        career_plan = queryset.get(pk=kwargs['pk'])
        serializer = self.get_serializer(career_plan)
        return Response(serializer.data)
    
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """커리어 패스 생성 (트랜잭션)"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        headers = self.get_success_headers(serializer.data)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=headers
        )
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def use_template(self, request, pk=None):
        """
        템플릿 복사
        
        - 템플릿을 기반으로 새 커리어 패스 생성
        - 전체 중첩 구조 복사
        """
        template = self.get_object()
        
        if not template.is_template:
            return Response(
                {'error': '템플릿이 아닙니다.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 커스텀 제목
        custom_title = request.data.get('title', template.title)
        
        # 템플릿 복사
        new_plan = CareerPlan.objects.create(
            user=request.user,
            title=custom_title,
            description=template.description,
            job_id=template.job_id,
            job_name=template.job_name,
            job_emoji=template.job_emoji,
            star_id=template.star_id,
            star_name=template.star_name,
            star_emoji=template.star_emoji,
            star_color=template.star_color,
            is_template=False,
        )
        
        # 학년별 계획 복사
        for year in template.years.all():
            new_year = PlanYear.objects.create(
                career_plan=new_plan,
                grade_id=year.grade_id,
                grade_label=year.grade_label,
                semester=year.semester,
                sort_order=year.sort_order,
            )
            
            # 목표 그룹 복사
            for goal_group in year.goal_groups.all():
                new_goal_group = GoalGroup.objects.create(
                    plan_year=new_year,
                    goal=goal_group.goal,
                    semester_id=goal_group.semester_id,
                    sort_order=goal_group.sort_order,
                )
                
                # 목표 그룹 내 활동 항목 복사
                for item in goal_group.items.all():
                    new_item = PlanItem.objects.create(
                        plan_year=new_year,
                        goal_group=new_goal_group,
                        type=item.type,
                        title=item.title,
                        months=item.months,
                        difficulty=item.difficulty,
                        cost=item.cost,
                        organizer=item.organizer,
                        url=item.url,
                        description=item.description,
                        category_tags=item.category_tags,
                        activity_subtype=item.activity_subtype,
                        sort_order=item.sort_order,
                    )
                    
                    # 하위 항목 복사
                    for sub_item in item.sub_items.all():
                        SubItem.objects.create(
                            plan_item=new_item,
                            title=sub_item.title,
                            is_done=False,  # 초기화
                            url=sub_item.url,
                            description=sub_item.description,
                            sort_order=sub_item.sort_order,
                        )
                    
                    # 링크 복사
                    for link in item.links.all():
                        ItemLink.objects.create(
                            plan_item=new_item,
                            title=link.title,
                            url=link.url,
                            kind=link.kind,
                            sort_order=link.sort_order,
                        )
            
            # 독립 활동 항목 복사 (목표 그룹 없음)
            for item in year.items.filter(goal_group__isnull=True):
                new_item = PlanItem.objects.create(
                    plan_year=new_year,
                    goal_group=None,
                    type=item.type,
                    title=item.title,
                    months=item.months,
                    difficulty=item.difficulty,
                    cost=item.cost,
                    organizer=item.organizer,
                    url=item.url,
                    description=item.description,
                    category_tags=item.category_tags,
                    activity_subtype=item.activity_subtype,
                    sort_order=item.sort_order,
                )
                
                for sub_item in item.sub_items.all():
                    SubItem.objects.create(
                        plan_item=new_item,
                        title=sub_item.title,
                        is_done=False,
                        url=sub_item.url,
                        description=sub_item.description,
                        sort_order=sub_item.sort_order,
                    )
                
                for link in item.links.all():
                    ItemLink.objects.create(
                        plan_item=new_item,
                        title=link.title,
                        url=link.url,
                        kind=link.kind,
                        sort_order=link.sort_order,
                    )
        
        serializer = CareerPlanDetailSerializer(new_plan)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PlanYearViewSet(viewsets.ModelViewSet):
    """학년별 계획 ViewSet"""
    
    serializer_class = PlanYearSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """사용자 본인의 커리어 패스 내 학년만 조회"""
        return PlanYear.objects.filter(
            career_plan__user=self.request.user
        ).select_related('career_plan')
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PlanYearCreateSerializer
        return PlanYearSerializer


class GoalGroupViewSet(viewsets.ModelViewSet):
    """목표 그룹 ViewSet"""
    
    serializer_class = GoalGroupSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """사용자 본인의 커리어 패스 내 목표 그룹만 조회"""
        return GoalGroup.objects.filter(
            plan_year__career_plan__user=self.request.user
        ).select_related('plan_year')
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return GoalGroupCreateSerializer
        return GoalGroupSerializer


class PlanItemViewSet(viewsets.ModelViewSet):
    """활동 항목 ViewSet"""
    
    serializer_class = PlanItemSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['type', 'activity_subtype']
    ordering_fields = ['sort_order', 'created_at']
    ordering = ['sort_order']
    
    def get_queryset(self):
        """사용자 본인의 커리어 패스 내 활동만 조회"""
        return PlanItem.objects.filter(
            plan_year__career_plan__user=self.request.user
        ).select_related('plan_year', 'goal_group').prefetch_related(
            'sub_items', 'links'
        )
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PlanItemCreateSerializer
        return PlanItemSerializer


class SubItemViewSet(viewsets.ModelViewSet):
    """하위 실행 항목 ViewSet"""
    
    serializer_class = SubItemSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """사용자 본인의 커리어 패스 내 하위 항목만 조회"""
        return SubItem.objects.filter(
            plan_item__plan_year__career_plan__user=self.request.user
        ).select_related('plan_item')
    
    @action(detail=True, methods=['post'])
    def toggle_done(self, request, pk=None):
        """완료 여부 토글"""
        sub_item = self.get_object()
        sub_item.is_done = not sub_item.is_done
        sub_item.save(update_fields=['is_done'])
        
        serializer = self.get_serializer(sub_item)
        return Response(serializer.data)


# ============================================================================
# Shared Plan ViewSets
# ============================================================================

class SharedPlanViewSet(viewsets.ModelViewSet):
    """
    공유 패스 ViewSet
    
    - 전체 공유 / 학교 공유 / 그룹 공유
    - 목록/상세: 비로그인은 public만, 로그인 시 공개·내 공유·그룹 멤버십 기반
    - 생성/수정/삭제: 로그인 필요
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['share_type', 'school']
    search_fields = ['career_plan__title', 'description', 'tags']
    ordering_fields = ['shared_at', 'updated_at', 'like_count', 'bookmark_count', 'view_count']
    ordering = ['-shared_at']

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        """
        공유 패스 조회 권한
        
        - 비로그인: 전체 공유(public)만
        - 로그인: public + 본인이 공유한 항목 + (옵션) 학교/그룹 필터
        """
        user = self.request.user
        
        queryset = SharedPlan.objects.filter(
            is_hidden=False
        ).select_related('user', 'career_plan', 'school').prefetch_related('group_links')
        
        share_type = self.request.query_params.get('share_type')

        if not user.is_authenticated:
            return queryset.filter(share_type='public')

        if share_type == 'public':
            return queryset.filter(share_type='public')
        if share_type == 'school':
            return queryset.filter(share_type='school')
        if share_type == 'group':
            user_group_ids = GroupMember.objects.filter(user=user).values_list('group_id', flat=True)
            return queryset.filter(
                share_type='group',
                group_links__group_id__in=user_group_ids
            ).distinct()

        user_group_ids = GroupMember.objects.filter(user=user).values_list('group_id', flat=True)
        return queryset.filter(
            Q(share_type='public')
            | Q(user=user)
            | Q(share_type='group', group_links__group_id__in=user_group_ids)
        ).distinct()
    
    def get_serializer_class(self):
        """액션별 시리얼라이저 선택"""
        if self.action == 'list':
            return SharedPlanListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return SharedPlanCreateSerializer
        else:
            return SharedPlanDetailSerializer

    @action(
        detail=False,
        methods=['get'],
        url_path='mine',
        permission_classes=[IsAuthenticated],
    )
    def mine(self, request):
        """현재 사용자가 공유한 패스 목록 (내 공개 프로필용)"""
        qs = SharedPlan.objects.filter(is_hidden=False, user=request.user).select_related(
            'user', 'career_plan', 'school'
        ).prefetch_related('group_links').order_by('-shared_at')
        serializer = SharedPlanListSerializer(qs, many=True)
        return Response(serializer.data)
    
    def retrieve(self, request, *args, **kwargs):
        """
        상세 조회 (조회 수 증가, 댓글 prefetch)
        """
        pk = kwargs.get('pk')
        base = (
            self.get_queryset()
            .select_related('user', 'career_plan', 'school')
            .prefetch_related(
                Prefetch(
                    'plan_comments',
                    SharedPlanComment.objects.select_related('author').order_by('created_at'),
                ),
                'group_links__group',
            )
        )
        instance = get_object_or_404(base, pk=pk)
        instance.view_count += 1
        instance.save(update_fields=['view_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], url_path='by-career-plan/(?P<career_plan_id>[^/.]+)')
    def by_career_plan(self, request, career_plan_id=None):
        """커리어 패스 ID로 공유 패스 조회 (패스당 공유 레코드 1행)"""
        try:
            CareerPlan.objects.get(pk=career_plan_id, user=request.user)
        except CareerPlan.DoesNotExist:
            return Response(
                {'error': '커리어 패스를 찾을 수 없습니다.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        try:
            shared_plan = SharedPlan.objects.select_related('user', 'career_plan', 'school').get(
                career_plan_id=career_plan_id,
            )
            serializer = SharedPlanDetailSerializer(shared_plan)
            return Response(serializer.data)
        except SharedPlan.DoesNotExist:
            return Response(
                {'error': '공유 패스를 찾을 수 없습니다.'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        """좋아요 (추후 Reaction 모델로 구현)"""
        shared_plan = self.get_object()
        shared_plan.like_count += 1
        shared_plan.save(update_fields=['like_count'])
        
        return Response({'like_count': shared_plan.like_count})
    
    @action(detail=True, methods=['post'])
    def bookmark(self, request, pk=None):
        """북마크 (추후 Reaction 모델로 구현)"""
        shared_plan = self.get_object()
        shared_plan.bookmark_count += 1
        shared_plan.save(update_fields=['bookmark_count'])
        
        return Response({'bookmark_count': shared_plan.bookmark_count})

    @action(
        detail=True,
        methods=['post'],
        url_path='comments',
        permission_classes=[IsAuthenticated],
    )
    def post_comment(self, request, pk=None):
        """공유 패스에 댓글 작성 (답글: {\"content\":\"...\",\"parent\":\"uuid\"})"""
        shared_plan = self.get_object()
        ser = SharedPlanCommentCreateSerializer(
            data=request.data,
            context={**self.get_serializer_context(), 'shared_plan': shared_plan},
        )
        ser.is_valid(raise_exception=True)
        ser.save()
        return Response(
            SharedPlanCommentSerializer(ser.instance).data,
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=True,
        methods=['delete'],
        url_path=r'comments/(?P<comment_id>[^/.]+)',
        permission_classes=[IsAuthenticated],
    )
    def delete_comment(self, request, pk=None, comment_id=None):
        """본인 댓글만 삭제 (답글 CASCADE)"""
        shared_plan = self.get_object()
        comment = shared_plan.plan_comments.filter(pk=comment_id).first()
        if not comment:
            return Response({'detail': '댓글을 찾을 수 없습니다.'}, status=status.HTTP_404_NOT_FOUND)
        if comment.author_id != request.user.id:
            return Response({'detail': '삭제 권한이 없습니다.'}, status=status.HTTP_403_FORBIDDEN)
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
