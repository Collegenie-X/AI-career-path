"""
Views for career path templates and user paths
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.db.models import Prefetch
from drf_spectacular.utils import extend_schema, OpenApiParameter
from django_filters.rest_framework import DjangoFilterBackend

from .models import (
    CareerPathTemplate,
    TemplateYear,
    TemplateItem,
    UserCareerPath,
    School,
    SchoolMember,
)
from .serializers import (
    CareerPathTemplateListSerializer,
    CareerPathTemplateDetailSerializer,
    UserCareerPathListSerializer,
    UserCareerPathDetailSerializer,
    UserCareerPathCreateSerializer,
    UserCareerPathUpdateSerializer,
    SchoolSerializer,
    SchoolMemberSerializer,
)
from common.permissions import IsOwner


class CareerPathTemplateViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for career path templates (read-only for users)
    """
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['category', 'job_id', 'university_id', 'is_official']
    search_fields = ['title', 'description']
    
    def get_queryset(self):
        queryset = CareerPathTemplate.objects.filter(is_active=True)
        
        if self.action == 'retrieve':
            queryset = queryset.prefetch_related(
                Prefetch(
                    'years',
                    queryset=TemplateYear.objects.prefetch_related('items').order_by('order_index')
                )
            )
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CareerPathTemplateDetailSerializer
        return CareerPathTemplateListSerializer
    
    @extend_schema(
        tags=['Career Path'],
        parameters=[
            OpenApiParameter(name='category', type=str, description='카테고리 필터'),
            OpenApiParameter(name='job_id', type=str, description='직업 ID 필터'),
            OpenApiParameter(name='is_official', type=bool, description='공식 템플릿 여부'),
        ]
    )
    def list(self, request, *args, **kwargs):
        """Get career path templates list"""
        return super().list(request, *args, **kwargs)
    
    @extend_schema(tags=['Career Path'])
    def retrieve(self, request, *args, **kwargs):
        """Get single career path template with all years and items"""
        return super().retrieve(request, *args, **kwargs)
    
    @extend_schema(tags=['Career Path'])
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def like(self, request, pk=None):
        """
        Toggle like for a template
        """
        template = self.get_object()
        template.likes += 1
        template.save(update_fields=['likes'])
        
        return Response({
            'likes': template.likes,
            'message': 'Template liked successfully'
        })


class UserCareerPathViewSet(viewsets.ModelViewSet):
    """
    ViewSet for user career paths (CRUD)
    """
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'share_scope']
    
    def get_queryset(self):
        return UserCareerPath.objects.filter(
            user=self.request.user
        ).select_related('template', 'user')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return UserCareerPathListSerializer
        elif self.action == 'create':
            return UserCareerPathCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserCareerPathUpdateSerializer
        return UserCareerPathDetailSerializer
    
    @extend_schema(tags=['Career Path'])
    def list(self, request, *args, **kwargs):
        """Get user's career paths list"""
        return super().list(request, *args, **kwargs)
    
    @extend_schema(
        tags=['Career Path'],
        request=UserCareerPathCreateSerializer,
        responses={201: UserCareerPathDetailSerializer}
    )
    def create(self, request, *args, **kwargs):
        """Create new career path from template"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        template = serializer.validated_data.get('template')
        
        user_path = UserCareerPath.objects.create(
            user=request.user,
            template=template,
            title=serializer.validated_data['title'],
            description=serializer.validated_data.get('description', ''),
            path_data={},
        )
        
        if template:
            template.uses += 1
            template.save(update_fields=['uses'])
        
        result_serializer = UserCareerPathDetailSerializer(user_path)
        return Response(result_serializer.data, status=status.HTTP_201_CREATED)
    
    @extend_schema(tags=['Career Path'])
    def retrieve(self, request, *args, **kwargs):
        """Get single career path"""
        return super().retrieve(request, *args, **kwargs)
    
    @extend_schema(
        tags=['Career Path'],
        request=UserCareerPathUpdateSerializer
    )
    def partial_update(self, request, *args, **kwargs):
        """Update career path"""
        return super().partial_update(request, *args, **kwargs)
    
    @extend_schema(tags=['Career Path'])
    def destroy(self, request, *args, **kwargs):
        """Delete career path"""
        return super().destroy(request, *args, **kwargs)


class SchoolViewSet(viewsets.ModelViewSet):
    """
    ViewSet for schools
    """
    queryset = School.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['school_type']
    search_fields = ['name', 'location']
    
    @extend_schema(tags=['Career Path'])
    def list(self, request, *args, **kwargs):
        """Get schools list"""
        return super().list(request, *args, **kwargs)
    
    @extend_schema(tags=['Career Path'])
    def create(self, request, *args, **kwargs):
        """Create new school"""
        return super().create(request, *args, **kwargs)
    
    @extend_schema(tags=['Career Path'])
    @action(detail=False, methods=['post'])
    def join(self, request):
        """
        Join a school using invite code
        """
        invite_code = request.data.get('invite_code')
        
        if not invite_code:
            return Response(
                {'error': 'invite_code is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            school = School.objects.get(invite_code=invite_code)
        except School.DoesNotExist:
            return Response(
                {'error': 'Invalid invite code'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        member, created = SchoolMember.objects.get_or_create(
            school=school,
            user=request.user,
            defaults={'role': 'student'}
        )
        
        if created:
            school.member_count += 1
            school.save(update_fields=['member_count'])
        
        return Response({
            'school': SchoolSerializer(school).data,
            'member': SchoolMemberSerializer(member).data,
            'is_new_member': created,
        }, status=status.HTTP_200_OK)
