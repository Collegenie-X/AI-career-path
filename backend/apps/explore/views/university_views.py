"""
Views for university exploration
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter
from django_filters.rest_framework import DjangoFilterBackend

from ..models import (
    UniversityAdmissionCategory,
    University,
    UniversityDepartment,
    UniversityAdmissionPlaybook,
    UniversityInfographic,
)
from ..serializers.university_serializers import (
    UniversityAdmissionCategorySerializer,
    UniversityListSerializer,
    UniversityDetailSerializer,
    UniversityDepartmentSerializer,
    UniversityAdmissionPlaybookSerializer,
    UniversityInfographicSerializer,
)


class UniversityAdmissionCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for university admission categories (read-only)
    """
    queryset = UniversityAdmissionCategory.objects.all()
    serializer_class = UniversityAdmissionCategorySerializer
    permission_classes = [AllowAny]
    
    @extend_schema(tags=['Explore - Universities'])
    def list(self, request, *args, **kwargs):
        """Get all admission categories"""
        return super().list(request, *args, **kwargs)
    
    @extend_schema(tags=['Explore - Universities'])
    def retrieve(self, request, *args, **kwargs):
        """Get single admission category"""
        return super().retrieve(request, *args, **kwargs)
    
    @extend_schema(tags=['Explore - Universities'])
    @action(detail=True, methods=['get'], url_path='playbooks')
    def playbooks(self, request, pk=None):
        """
        Get playbooks for an admission category
        """
        category = self.get_object()
        playbooks = category.playbooks.order_by('order_index')
        serializer = UniversityAdmissionPlaybookSerializer(playbooks, many=True)
        return Response(serializer.data)
    
    @extend_schema(tags=['Explore - Universities'])
    @action(detail=True, methods=['get'], url_path='infographics')
    def infographics(self, request, pk=None):
        """
        Get infographics for an admission category
        """
        category = self.get_object()
        infographics = category.infographics.order_by('order_index')
        serializer = UniversityInfographicSerializer(infographics, many=True)
        return Response(serializer.data)


class UniversityViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for universities with filtering and search
    """
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['university_type', 'region']
    search_fields = ['name', 'short_name', 'description']
    
    def get_queryset(self):
        queryset = University.objects.filter(is_active=True)
        
        if self.action == 'retrieve':
            queryset = queryset.prefetch_related(
                'departments',
                'infographics',
            )
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return UniversityDetailSerializer
        return UniversityListSerializer
    
    @extend_schema(
        tags=['Explore - Universities'],
        parameters=[
            OpenApiParameter(name='university_type', type=str, description='대학 유형 필터'),
            OpenApiParameter(name='region', type=str, description='지역 필터'),
            OpenApiParameter(name='search', type=str, description='검색어'),
        ]
    )
    def list(self, request, *args, **kwargs):
        """Get universities list with filters"""
        return super().list(request, *args, **kwargs)
    
    @extend_schema(tags=['Explore - Universities'])
    def retrieve(self, request, *args, **kwargs):
        """Get single university with all related data"""
        return super().retrieve(request, *args, **kwargs)
    
    @extend_schema(
        tags=['Explore - Universities'],
        parameters=[
            OpenApiParameter(
                name='admission_category',
                type=str,
                description='전형 카테고리 필터'
            )
        ]
    )
    @action(detail=True, methods=['get'], url_path='departments')
    def departments(self, request, pk=None):
        """
        Get departments for a university
        """
        university = self.get_object()
        departments = university.departments.filter(is_active=True).select_related(
            'admission_category'
        )
        
        admission_category = request.query_params.get('admission_category')
        if admission_category:
            departments = departments.filter(admission_category_id=admission_category)
        
        serializer = UniversityDepartmentSerializer(departments, many=True)
        return Response(serializer.data)
    
    @extend_schema(tags=['Explore - Universities'])
    @action(detail=True, methods=['get'], url_path='infographics')
    def infographics(self, request, pk=None):
        """
        Get infographics for a university
        """
        university = self.get_object()
        infographics = university.infographics.order_by('order_index')
        serializer = UniversityInfographicSerializer(infographics, many=True)
        return Response(serializer.data)


class UniversityInfographicViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for university infographics
    """
    queryset = UniversityInfographic.objects.select_related(
        'university',
        'admission_category'
    ).order_by('-created_at')
    serializer_class = UniversityInfographicSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['university', 'admission_category', 'infographic_type']
    
    @extend_schema(tags=['Explore - Universities'])
    def list(self, request, *args, **kwargs):
        """Get all university infographics"""
        return super().list(request, *args, **kwargs)
    
    @extend_schema(tags=['Explore - Universities'])
    def retrieve(self, request, *args, **kwargs):
        """Get single university infographic and increment view count"""
        instance = self.get_object()
        instance.view_count += 1
        instance.save(update_fields=['view_count'])
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
