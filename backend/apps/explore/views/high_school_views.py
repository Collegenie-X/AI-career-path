"""
Views for high school exploration
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db.models import Prefetch
from drf_spectacular.utils import extend_schema, OpenApiParameter
from django_filters.rest_framework import DjangoFilterBackend

from ..models import (
    HighSchoolCategory,
    HighSchool,
    HighSchoolAdmissionStep,
    HighSchoolInfographic,
)
from ..serializers.high_school_serializers import (
    HighSchoolCategorySerializer,
    HighSchoolListSerializer,
    HighSchoolDetailSerializer,
    HighSchoolCompareSerializer,
    HighSchoolInfographicSerializer,
)


class HighSchoolCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for high school categories (read-only)
    """
    queryset = HighSchoolCategory.objects.all()
    serializer_class = HighSchoolCategorySerializer
    permission_classes = [AllowAny]
    
    @extend_schema(tags=['Explore - High Schools'])
    def list(self, request, *args, **kwargs):
        """Get all high school categories"""
        return super().list(request, *args, **kwargs)
    
    @extend_schema(tags=['Explore - High Schools'])
    def retrieve(self, request, *args, **kwargs):
        """Get single high school category"""
        return super().retrieve(request, *args, **kwargs)


class HighSchoolViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for high schools with filtering and search
    """
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category', 'school_type', 'difficulty', 'dormitory', 'ib_certified']
    search_fields = ['name', 'location', 'education_philosophy']
    
    def get_queryset(self):
        queryset = HighSchool.objects.filter(is_active=True).select_related('category')
        
        if self.action == 'retrieve':
            queryset = queryset.prefetch_related(
                'admission_steps',
                'career_path_details',
                'highlight_stats',
                'real_talks',
                'daily_schedules',
                'famous_programs',
                'infographics',
            )
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return HighSchoolDetailSerializer
        elif self.action == 'compare':
            return HighSchoolCompareSerializer
        return HighSchoolListSerializer
    
    @extend_schema(
        tags=['Explore - High Schools'],
        parameters=[
            OpenApiParameter(name='category', type=str, description='카테고리 필터'),
            OpenApiParameter(name='school_type', type=str, description='학교 유형 필터'),
            OpenApiParameter(name='difficulty', type=int, description='난이도 필터 (1-5)'),
            OpenApiParameter(name='dormitory', type=bool, description='기숙사 여부'),
            OpenApiParameter(name='search', type=str, description='검색어'),
        ]
    )
    def list(self, request, *args, **kwargs):
        """Get high schools list with filters"""
        return super().list(request, *args, **kwargs)
    
    @extend_schema(tags=['Explore - High Schools'])
    def retrieve(self, request, *args, **kwargs):
        """Get single high school with all related data"""
        return super().retrieve(request, *args, **kwargs)
    
    @extend_schema(
        tags=['Explore - High Schools'],
        parameters=[
            OpenApiParameter(
                name='ids',
                type=str,
                required=True,
                description='쉼표로 구분된 학교 ID 목록 (예: ksa,snu_science)'
            )
        ]
    )
    @action(detail=False, methods=['get'])
    def compare(self, request):
        """
        Compare multiple high schools
        """
        ids = request.query_params.get('ids', '')
        
        if not ids:
            return Response(
                {'error': 'ids parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        school_ids = [id.strip() for id in ids.split(',')]
        
        schools = HighSchool.objects.filter(
            id__in=school_ids,
            is_active=True
        ).select_related('category').prefetch_related(
            'highlight_stats',
            'admission_steps',
            'famous_programs',
        )
        
        serializer = HighSchoolCompareSerializer(schools, many=True)
        return Response(serializer.data)
    
    @extend_schema(tags=['Explore - High Schools'])
    @action(detail=True, methods=['get'], url_path='admission-steps')
    def admission_steps(self, request, pk=None):
        """
        Get admission steps for a high school
        """
        from ..serializers.high_school_serializers import HighSchoolAdmissionStepSerializer
        
        high_school = self.get_object()
        steps = high_school.admission_steps.order_by('order_index')
        serializer = HighSchoolAdmissionStepSerializer(steps, many=True)
        return Response(serializer.data)
    
    @extend_schema(tags=['Explore - High Schools'])
    @action(detail=True, methods=['get'], url_path='career-path-details')
    def career_path_details(self, request, pk=None):
        """
        Get career path details for a high school
        """
        from ..serializers.high_school_serializers import HighSchoolCareerPathDetailSerializer
        
        high_school = self.get_object()
        details = high_school.career_path_details.order_by('order_index')
        serializer = HighSchoolCareerPathDetailSerializer(details, many=True)
        return Response(serializer.data)
    
    @extend_schema(tags=['Explore - High Schools'])
    @action(detail=True, methods=['get'], url_path='infographics')
    def infographics(self, request, pk=None):
        """
        Get infographics for a high school
        """
        high_school = self.get_object()
        infographics = high_school.infographics.order_by('order_index')
        serializer = HighSchoolInfographicSerializer(infographics, many=True)
        return Response(serializer.data)


class HighSchoolInfographicViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for high school infographics
    """
    queryset = HighSchoolInfographic.objects.select_related('high_school').order_by('-created_at')
    serializer_class = HighSchoolInfographicSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['high_school', 'infographic_type']
    
    @extend_schema(tags=['Explore - High Schools'])
    def list(self, request, *args, **kwargs):
        """Get all high school infographics"""
        return super().list(request, *args, **kwargs)
    
    @extend_schema(tags=['Explore - High Schools'])
    def retrieve(self, request, *args, **kwargs):
        """Get single high school infographic and increment view count"""
        instance = self.get_object()
        instance.view_count += 1
        instance.save(update_fields=['view_count'])
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
