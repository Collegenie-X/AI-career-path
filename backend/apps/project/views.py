"""
Views for project management
"""

from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from django_filters.rest_framework import DjangoFilterBackend

from .models import Project, UserProject
from .serializers import ProjectSerializer, UserProjectSerializer
from common.permissions import IsOwner


class ProjectViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for project templates (read-only)
    """
    queryset = Project.objects.filter(is_active=True)
    serializer_class = ProjectSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['difficulty']
    search_fields = ['title', 'description', 'tech_stack']
    
    @extend_schema(tags=['Projects'])
    def list(self, request, *args, **kwargs):
        """Get projects list"""
        return super().list(request, *args, **kwargs)
    
    @extend_schema(tags=['Projects'])
    def retrieve(self, request, *args, **kwargs):
        """Get single project"""
        return super().retrieve(request, *args, **kwargs)


class UserProjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for user projects (CRUD)
    """
    serializer_class = UserProjectSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status']
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return UserProject.objects.none()
        return UserProject.objects.filter(user=self.request.user)
    
    @extend_schema(tags=['Projects'])
    def list(self, request, *args, **kwargs):
        """Get user's projects list"""
        return super().list(request, *args, **kwargs)
    
    @extend_schema(tags=['Projects'])
    def create(self, request, *args, **kwargs):
        """Create new user project"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @extend_schema(tags=['Projects'])
    def retrieve(self, request, *args, **kwargs):
        """Get single user project"""
        return super().retrieve(request, *args, **kwargs)
    
    @extend_schema(tags=['Projects'])
    def partial_update(self, request, *args, **kwargs):
        """Update user project"""
        return super().partial_update(request, *args, **kwargs)
    
    @extend_schema(tags=['Projects'])
    def destroy(self, request, *args, **kwargs):
        """Delete user project"""
        return super().destroy(request, *args, **kwargs)
