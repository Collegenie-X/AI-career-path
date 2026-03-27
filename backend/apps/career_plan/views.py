"""
Career Plan (DreamMate) Views - 커리어 실행 API

설계 문서: documents/backend/커리어실행_DreamMate_Django_DB_설계서.md
"""

from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from django.utils import timezone

from .models import (
    Roadmap, RoadmapItem, RoadmapTodo, RoadmapMilestone,
    DreamResource, ResourceSection,
    DreamSpace, SpaceParticipant,
    SharedDreamRoadmap, SharedDreamRoadmapGroup
)
from .serializers import (
    RoadmapListSerializer, RoadmapDetailSerializer,
    RoadmapCreateSerializer, RoadmapUpdateSerializer,
    RoadmapItemSerializer, RoadmapItemCreateSerializer,
    RoadmapTodoSerializer, RoadmapTodoCreateSerializer,
    RoadmapMilestoneSerializer,
    DreamResourceListSerializer, DreamResourceDetailSerializer,
    DreamResourceCreateSerializer, DreamResourceUpdateSerializer,
    ResourceSectionSerializer,
    DreamSpaceListSerializer, DreamSpaceDetailSerializer,
    DreamSpaceCreateSerializer, SpaceParticipantSerializer,
    SharedDreamRoadmapListSerializer, SharedDreamRoadmapDetailSerializer,
    SharedDreamRoadmapCreateSerializer, SharedDreamRoadmapUpdateSerializer
)


# ============================================================================
# Roadmap ViewSets
# ============================================================================

class RoadmapViewSet(viewsets.ModelViewSet):
    """
    로드맵 ViewSet
    
    - 개인 실행 계획 CRUD
    - 활동·TODO·마일스톤 관리
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['period']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_queryset(self):
        return Roadmap.objects.filter(
            user=self.request.user
        ).select_related('user').prefetch_related(
            'items__todos', 'milestones'
        )
    
    def get_serializer_class(self):
        if self.action == 'list':
            return RoadmapListSerializer
        elif self.action == 'create':
            return RoadmapCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return RoadmapUpdateSerializer
        return RoadmapDetailSerializer
    
    @transaction.atomic
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def add_item(self, request, pk=None):
        """
        로드맵에 활동 추가
        """
        roadmap = self.get_object()
        
        serializer = RoadmapItemCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        roadmap_item = serializer.save(roadmap=roadmap)
        
        result_serializer = RoadmapItemSerializer(roadmap_item)
        return Response(result_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def add_milestone(self, request, pk=None):
        """
        로드맵에 마일스톤 추가
        """
        roadmap = self.get_object()
        
        serializer = RoadmapMilestoneSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        milestone = serializer.save(roadmap=roadmap)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class RoadmapItemViewSet(viewsets.ModelViewSet):
    """
    로드맵 활동 ViewSet
    
    - 활동 CRUD
    - TODO 관리
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['type', 'difficulty']
    ordering_fields = ['sort_order', 'created_at']
    ordering = ['sort_order', 'created_at']
    
    def get_queryset(self):
        return RoadmapItem.objects.filter(
            roadmap__user=self.request.user
        ).select_related('roadmap').prefetch_related('todos')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return RoadmapItemCreateSerializer
        return RoadmapItemSerializer
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def add_todo(self, request, pk=None):
        """
        활동에 TODO 추가
        """
        roadmap_item = self.get_object()
        
        serializer = RoadmapTodoCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        todo = serializer.save(roadmap_item=roadmap_item)
        
        result_serializer = RoadmapTodoSerializer(todo)
        return Response(result_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def reorder_todos(self, request, pk=None):
        """
        TODO 순서 재정렬
        
        Request body: { "todo_ids": ["uuid1", "uuid2", ...] }
        """
        roadmap_item = self.get_object()
        todo_ids = request.data.get('todo_ids', [])
        
        for index, todo_id in enumerate(todo_ids):
            RoadmapTodo.objects.filter(
                id=todo_id,
                roadmap_item=roadmap_item
            ).update(sort_order=index)
        
        return Response({'message': 'TODO 순서가 업데이트되었습니다.'})


class RoadmapTodoViewSet(viewsets.ModelViewSet):
    """
    로드맵 TODO ViewSet
    
    - TODO CRUD
    - 완료 토글
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['is_done', 'entry_type', 'week_number']
    ordering_fields = ['week_number', 'sort_order', 'created_at']
    ordering = ['week_number', 'sort_order', 'created_at']
    
    def get_queryset(self):
        return RoadmapTodo.objects.filter(
            roadmap_item__roadmap__user=self.request.user
        ).select_related('roadmap_item__roadmap')
    
    serializer_class = RoadmapTodoSerializer
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def toggle_done(self, request, pk=None):
        """
        TODO 완료 토글
        """
        todo = self.get_object()
        todo.is_done = not todo.is_done
        todo.save()
        
        serializer = self.get_serializer(todo)
        return Response(serializer.data)


class RoadmapMilestoneViewSet(viewsets.ModelViewSet):
    """
    로드맵 마일스톤 ViewSet
    
    - 마일스톤 CRUD
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['sort_order', 'recorded_at', 'created_at']
    ordering = ['sort_order', '-recorded_at']
    
    def get_queryset(self):
        return RoadmapMilestone.objects.filter(
            roadmap__user=self.request.user
        ).select_related('roadmap')
    
    serializer_class = RoadmapMilestoneSerializer


# ============================================================================
# Dream Resource ViewSets
# ============================================================================

class DreamResourceViewSet(viewsets.ModelViewSet):
    """
    드림 자료 ViewSet
    
    - 포트폴리오·가이드·템플릿 CRUD
    - 공유 설정
    - 좋아요·북마크·다운로드
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['type', 'share_type']
    search_fields = ['title', 'description', 'tags']
    ordering_fields = ['created_at', 'like_count', 'download_count', 'view_count']
    ordering = ['-created_at']
    
    def get_queryset(self):
        if self.action == 'list':
            # 본인 자료 + 공개 자료
            from django.db.models import Q
            return DreamResource.objects.filter(
                Q(user=self.request.user) | Q(share_type='public', is_hidden=False)
            ).select_related('user').prefetch_related('sections')
        
        return DreamResource.objects.filter(
            user=self.request.user
        ).select_related('user').prefetch_related('sections')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return DreamResourceListSerializer
        elif self.action == 'create':
            return DreamResourceCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return DreamResourceUpdateSerializer
        return DreamResourceDetailSerializer
    
    @transaction.atomic
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def add_section(self, request, pk=None):
        """
        자료에 섹션 추가
        """
        resource = self.get_object()
        
        serializer = ResourceSectionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        section = serializer.save(resource=resource)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def like(self, request, pk=None):
        """
        자료 좋아요
        """
        resource = self.get_object()
        resource.like_count += 1
        resource.save()
        
        return Response({'like_count': resource.like_count})
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def bookmark(self, request, pk=None):
        """
        자료 북마크
        """
        resource = self.get_object()
        resource.bookmark_count += 1
        resource.save()
        
        return Response({'bookmark_count': resource.bookmark_count})
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def download(self, request, pk=None):
        """
        자료 다운로드 (카운트 증가)
        """
        resource = self.get_object()
        resource.download_count += 1
        resource.save()
        
        return Response({'download_count': resource.download_count})
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def view(self, request, pk=None):
        """
        자료 조회 (카운트 증가)
        """
        resource = self.get_object()
        resource.view_count += 1
        resource.save()
        
        return Response({'view_count': resource.view_count})


class ResourceSectionViewSet(viewsets.ModelViewSet):
    """
    자료 섹션 ViewSet
    
    - 섹션 CRUD
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['sort_order', 'created_at']
    ordering = ['sort_order', 'created_at']
    
    def get_queryset(self):
        return ResourceSection.objects.filter(
            resource__user=self.request.user
        ).select_related('resource')
    
    serializer_class = ResourceSectionSerializer


# ============================================================================
# Dream Space ViewSets
# ============================================================================

class DreamSpaceViewSet(viewsets.ModelViewSet):
    """
    드림 스페이스 ViewSet
    
    - 그룹 프로그램 CRUD
    - 참여자 관리
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['program_type', 'recruitment_status']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'start_date']
    ordering = ['-created_at']
    
    def get_queryset(self):
        # 본인이 속한 그룹의 스페이스
        from apps.community.models import GroupMember
        user_group_ids = GroupMember.objects.filter(
            user=self.request.user
        ).values_list('group_id', flat=True)
        
        return DreamSpace.objects.filter(
            group_id__in=user_group_ids
        ).select_related('group').prefetch_related('participants__user')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return DreamSpaceListSerializer
        elif self.action == 'create':
            return DreamSpaceCreateSerializer
        return DreamSpaceDetailSerializer
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def apply(self, request, pk=None):
        """
        스페이스 참여 신청
        """
        space = self.get_object()
        
        # 이미 신청했는지 확인
        if SpaceParticipant.objects.filter(
            space=space,
            user=request.user
        ).exists():
            return Response(
                {'error': '이미 신청했습니다.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        participant = SpaceParticipant.objects.create(
            space=space,
            user=request.user,
            status='applied'
        )
        
        serializer = SpaceParticipantSerializer(participant)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def approve_participant(self, request, pk=None):
        """
        참여자 승인
        
        Request body: { "participant_id": "uuid" }
        """
        space = self.get_object()
        participant_id = request.data.get('participant_id')
        
        try:
            participant = SpaceParticipant.objects.get(
                id=participant_id,
                space=space
            )
        except SpaceParticipant.DoesNotExist:
            return Response(
                {'error': '참여자를 찾을 수 없습니다.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        participant.status = 'approved'
        participant.approved_at = timezone.now()
        participant.save()
        
        serializer = SpaceParticipantSerializer(participant)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def confirm_participant(self, request, pk=None):
        """
        참여 확정
        
        Request body: { "participant_id": "uuid" }
        """
        space = self.get_object()
        participant_id = request.data.get('participant_id')
        
        try:
            participant = SpaceParticipant.objects.get(
                id=participant_id,
                space=space
            )
        except SpaceParticipant.DoesNotExist:
            return Response(
                {'error': '참여자를 찾을 수 없습니다.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        participant.status = 'confirmed'
        participant.confirmed_at = timezone.now()
        participant.save()
        
        # 현재 참여자 수 증가
        space.current_participants += 1
        space.save()
        
        serializer = SpaceParticipantSerializer(participant)
        return Response(serializer.data)


class SpaceParticipantViewSet(viewsets.ReadOnlyModelViewSet):
    """
    스페이스 참여자 ViewSet (읽기 전용)
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status']
    ordering_fields = ['applied_at', 'approved_at', 'confirmed_at']
    ordering = ['-applied_at']
    
    def get_queryset(self):
        # 본인이 속한 그룹의 스페이스 참여자
        from apps.community.models import GroupMember
        user_group_ids = GroupMember.objects.filter(
            user=self.request.user
        ).values_list('group_id', flat=True)
        
        return SpaceParticipant.objects.filter(
            space__group_id__in=user_group_ids
        ).select_related('space__group', 'user')
    
    serializer_class = SpaceParticipantSerializer


# ============================================================================
# Shared Roadmap ViewSets
# ============================================================================

class SharedDreamRoadmapViewSet(viewsets.ModelViewSet):
    """
    공유 드림 로드맵 ViewSet
    
    - 로드맵 공유 CRUD
    - 좋아요·북마크·조회
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['share_type']
    search_fields = ['roadmap__title', 'description', 'tags']
    ordering_fields = ['shared_at', 'like_count', 'view_count']
    ordering = ['-shared_at']
    
    def get_queryset(self):
        if self.action == 'list':
            # 본인 공유 + 전체 공유
            from django.db.models import Q
            return SharedDreamRoadmap.objects.filter(
                Q(user=self.request.user) | Q(share_type='public', is_hidden=False)
            ).select_related('user', 'roadmap').prefetch_related('group_links__group')
        
        return SharedDreamRoadmap.objects.filter(
            user=self.request.user
        ).select_related('user', 'roadmap').prefetch_related('group_links__group')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return SharedDreamRoadmapListSerializer
        elif self.action == 'create':
            return SharedDreamRoadmapCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return SharedDreamRoadmapUpdateSerializer
        return SharedDreamRoadmapDetailSerializer
    
    @transaction.atomic
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def like(self, request, pk=None):
        """
        공유 드림 로드맵 좋아요
        """
        shared_roadmap = self.get_object()
        shared_roadmap.like_count += 1
        shared_roadmap.save()
        
        return Response({'like_count': shared_roadmap.like_count})
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def bookmark(self, request, pk=None):
        """
        공유 드림 로드맵 북마크
        """
        shared_roadmap = self.get_object()
        shared_roadmap.bookmark_count += 1
        shared_roadmap.save()
        
        return Response({'bookmark_count': shared_roadmap.bookmark_count})
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def view(self, request, pk=None):
        """
        공유 드림 로드맵 조회 (카운트 증가)
        """
        shared_roadmap = self.get_object()
        shared_roadmap.view_count += 1
        shared_roadmap.save()
        
        return Response({'view_count': shared_roadmap.view_count})
