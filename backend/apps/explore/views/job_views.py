"""
Views for job exploration
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db.models import Q, Prefetch
from drf_spectacular.utils import extend_schema, OpenApiParameter
from django_filters.rest_framework import DjangoFilterBackend

from ..models import (
    JobCategory,
    Job,
    JobCareerPathStage,
    JobCareerPathTask,
    JobInfographic,
)
from ..serializers.job_serializers import (
    JobCategorySerializer,
    JobListSerializer,
    JobDetailSerializer,
    JobCareerPathStageSerializer,
    JobInfographicSerializer,
)
from common.permissions import IsAdminOrReadOnly


class JobCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for job categories (read-only)
    """
    queryset = JobCategory.objects.all()
    serializer_class = JobCategorySerializer
    permission_classes = [AllowAny]
    
    @extend_schema(tags=['Explore - Jobs'])
    def list(self, request, *args, **kwargs):
        """Get all job categories"""
        return super().list(request, *args, **kwargs)
    
    @extend_schema(tags=['Explore - Jobs'])
    def retrieve(self, request, *args, **kwargs):
        """Get single job category"""
        return super().retrieve(request, *args, **kwargs)


class JobViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for jobs with filtering and search
    """
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category', 'difficulty', 'rarity', 'kingdom_id']
    search_fields = ['name', 'name_en', 'description', 'company']
    
    def get_queryset(self):
        queryset = Job.objects.filter(is_active=True).select_related('category')
        
        if self.action == 'retrieve':
            queryset = queryset.prefetch_related(
                Prefetch(
                    'career_path_stages',
                    queryset=JobCareerPathStage.objects.prefetch_related('tasks').order_by('order_index')
                ),
                'key_preparations',
                'recommended_high_schools_rel',
                'recommended_universities_rel',
                'daily_schedules',
                'required_skills',
                'milestones',
                'acceptees',
                'infographics',
            )
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return JobDetailSerializer
        return JobListSerializer
    
    @extend_schema(
        tags=['Explore - Jobs'],
        parameters=[
            OpenApiParameter(name='category', type=str, description='카테고리 필터'),
            OpenApiParameter(name='difficulty', type=int, description='난이도 필터 (1-5)'),
            OpenApiParameter(name='rarity', type=str, description='희귀도 필터'),
            OpenApiParameter(name='search', type=str, description='검색어'),
        ]
    )
    def list(self, request, *args, **kwargs):
        """Get jobs list with filters"""
        return super().list(request, *args, **kwargs)
    
    @extend_schema(tags=['Explore - Jobs'])
    def retrieve(self, request, *args, **kwargs):
        """Get single job with all related data"""
        return super().retrieve(request, *args, **kwargs)
    
    @extend_schema(
        tags=['Explore - Jobs'],
        parameters=[
            OpenApiParameter(name='keyword', type=str, required=True, description='검색 키워드')
        ]
    )
    @action(detail=False, methods=['get'], url_path='search-by-preparation')
    def search_by_preparation(self, request):
        """
        Search jobs by key preparation items
        """
        keyword = request.query_params.get('keyword', '')
        
        if not keyword:
            return Response(
                {'error': 'keyword parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        jobs = Job.objects.filter(
            key_preparations__preparation_item__icontains=keyword,
            is_active=True
        ).distinct().select_related('category')
        
        serializer = JobListSerializer(jobs, many=True)
        return Response(serializer.data)
    
    @extend_schema(tags=['Explore - Jobs'])
    @action(detail=True, methods=['get'], url_path='career-path-stages')
    def career_path_stages(self, request, pk=None):
        """
        Get career path stages for a job
        """
        job = self.get_object()
        stages = job.career_path_stages.prefetch_related('tasks').order_by('order_index')
        serializer = JobCareerPathStageSerializer(stages, many=True)
        return Response(serializer.data)
    
    @extend_schema(tags=['Explore - Jobs'])
    @action(detail=True, methods=['get'], url_path='infographics')
    def infographics(self, request, pk=None):
        """
        Get infographics for a job
        """
        job = self.get_object()
        infographics = job.infographics.order_by('order_index')
        serializer = JobInfographicSerializer(infographics, many=True)
        return Response(serializer.data)


class JobInfographicViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for job infographics
    """
    queryset = JobInfographic.objects.select_related('job').order_by('-created_at')
    serializer_class = JobInfographicSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['job', 'infographic_type']
    
    @extend_schema(tags=['Explore - Jobs'])
    def list(self, request, *args, **kwargs):
        """Get all job infographics"""
        return super().list(request, *args, **kwargs)
    
    @extend_schema(tags=['Explore - Jobs'])
    def retrieve(self, request, *args, **kwargs):
        """Get single job infographic and increment view count"""
        instance = self.get_object()
        instance.view_count += 1
        instance.save(update_fields=['view_count'])
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
