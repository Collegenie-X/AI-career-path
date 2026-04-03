"""
Views for community features
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    Group,
    GroupMember,
    SharedRoadmap,
    RoadmapComment,
    RoadmapLike,
    RoadmapBookmark,
)
from .serializers import (
    GroupSerializer,
    GroupMemberSerializer,
    SharedRoadmapListSerializer,
    SharedRoadmapDetailSerializer,
    SharedRoadmapCreateSerializer,
    RoadmapCommentSerializer,
)
from common.permissions import IsGroupAdmin, IsOwner


class GroupViewSet(viewsets.ModelViewSet):
    """
    ViewSet for groups
    """
    serializer_class = GroupSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['is_public']
    search_fields = ['name', 'description']
    
    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsGroupAdmin()]
        elif self.action == 'create':
            return [IsAuthenticated()]
        return [AllowAny()]
    
    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Group.objects.filter(
                models.Q(is_public=True) | models.Q(members__user=self.request.user)
            ).distinct()
        return Group.objects.filter(is_public=True)
    
    @extend_schema(tags=['Community'])
    def list(self, request, *args, **kwargs):
        """Get groups list"""
        return super().list(request, *args, **kwargs)
    
    @extend_schema(tags=['Community'])
    def create(self, request, *args, **kwargs):
        """Create new group"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        group = serializer.save(creator=request.user)
        
        GroupMember.objects.create(
            group=group,
            user=request.user,
            role='admin'
        )
        
        return Response(
            GroupSerializer(group).data,
            status=status.HTTP_201_CREATED
        )
    
    @extend_schema(tags=['Community'])
    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        """
        Join a group using invite code
        """
        group = self.get_object()
        
        member, created = GroupMember.objects.get_or_create(
            group=group,
            user=request.user,
            defaults={'role': 'member'}
        )
        
        if created:
            group.member_count += 1
            group.save(update_fields=['member_count'])
        
        return Response({
            'group': GroupSerializer(group).data,
            'member': GroupMemberSerializer(member).data,
            'is_new_member': created,
        })


class SharedRoadmapViewSet(viewsets.ModelViewSet):
    """
    ViewSet for shared roadmaps
    """
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['share_scope', 'group']
    search_fields = ['title', 'description']
    
    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsOwner()]
        elif self.action == 'create':
            return [IsAuthenticated()]
        return [AllowAny()]
    
    def get_queryset(self):
        queryset = SharedRoadmap.objects.select_related(
            'owner',
            'group',
            'career_plan',
        )
        
        if not self.request.user.is_authenticated:
            return queryset.filter(share_scope='public')
        
        return queryset.filter(
            models.Q(share_scope='public') |
            models.Q(owner=self.request.user) |
            models.Q(group__members__user=self.request.user)
        ).distinct()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return SharedRoadmapListSerializer
        elif self.action == 'create':
            return SharedRoadmapCreateSerializer
        return SharedRoadmapDetailSerializer
    
    @extend_schema(tags=['Community'])
    def list(self, request, *args, **kwargs):
        """Get shared roadmaps list"""
        return super().list(request, *args, **kwargs)
    
    @extend_schema(tags=['Community'])
    def create(self, request, *args, **kwargs):
        """Share a roadmap"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        roadmap = serializer.save(owner=request.user)
        
        result_serializer = SharedRoadmapDetailSerializer(roadmap)
        return Response(result_serializer.data, status=status.HTTP_201_CREATED)
    
    @extend_schema(tags=['Community'])
    @action(detail=True, methods=['post'])
    def like(self, request, pk=None):
        """
        Toggle like for a roadmap
        """
        roadmap = self.get_object()
        
        like, created = RoadmapLike.objects.get_or_create(
            roadmap=roadmap,
            user=request.user
        )
        
        if not created:
            like.delete()
            roadmap.likes -= 1
            roadmap.save(update_fields=['likes'])
            return Response({'liked': False, 'likes': roadmap.likes})
        else:
            roadmap.likes += 1
            roadmap.save(update_fields=['likes'])
            return Response({'liked': True, 'likes': roadmap.likes})
    
    @extend_schema(tags=['Community'])
    @action(detail=True, methods=['post'])
    def bookmark(self, request, pk=None):
        """
        Toggle bookmark for a roadmap
        """
        roadmap = self.get_object()
        
        bookmark, created = RoadmapBookmark.objects.get_or_create(
            roadmap=roadmap,
            user=request.user
        )
        
        if not created:
            bookmark.delete()
            roadmap.bookmarks -= 1
            roadmap.save(update_fields=['bookmarks'])
            return Response({'bookmarked': False, 'bookmarks': roadmap.bookmarks})
        else:
            roadmap.bookmarks += 1
            roadmap.save(update_fields=['bookmarks'])
            return Response({'bookmarked': True, 'bookmarks': roadmap.bookmarks})
    
    @extend_schema(tags=['Community'])
    @action(detail=True, methods=['post'])
    def comments(self, request, pk=None):
        """
        Add a comment to a roadmap
        """
        roadmap = self.get_object()
        
        serializer = RoadmapCommentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        comment = serializer.save(
            roadmap=roadmap,
            author=request.user
        )
        
        roadmap.comments_count += 1
        roadmap.save(update_fields=['comments_count'])
        
        return Response(
            RoadmapCommentSerializer(comment).data,
            status=status.HTTP_201_CREATED
        )
