"""
Views for quiz questions, results, and reports
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema, OpenApiParameter

from .models import QuizQuestion, QuizResult, RiasecReport
from .serializers import (
    QuizQuestionSerializer,
    QuizQuestionListSerializer,
    QuizResultSerializer,
    QuizResultListSerializer,
    QuizResultSubmitSerializer,
    RiasecReportSerializer,
)
from .services.riasec_calculator import RiasecCalculator

User = get_user_model()


class QuizQuestionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for quiz questions (read-only)
    """
    queryset = QuizQuestion.objects.filter(is_active=True).prefetch_related('choices')
    permission_classes = [AllowAny]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return QuizQuestionListSerializer
        return QuizQuestionSerializer
    
    @extend_schema(
        tags=['Quiz'],
        parameters=[
            OpenApiParameter(
                name='mode',
                type=str,
                enum=['quick', 'full'],
                description='검사 모드 (quick: 10문항, full: 전체)'
            )
        ]
    )
    def list(self, request, *args, **kwargs):
        """Get quiz questions list"""
        mode = request.query_params.get('mode', 'full')
        
        queryset = self.get_queryset()
        
        if mode == 'quick':
            queryset = queryset[:10]
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @extend_schema(tags=['Quiz'])
    def retrieve(self, request, *args, **kwargs):
        """Get single quiz question"""
        return super().retrieve(request, *args, **kwargs)


class QuizResultViewSet(viewsets.ModelViewSet):
    """
    ViewSet for quiz results
    """
    serializer_class = QuizResultSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return QuizResult.objects.filter(user=self.request.user).order_by('-taken_at')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return QuizResultListSerializer
        elif self.action == 'create':
            return QuizResultSubmitSerializer
        return QuizResultSerializer
    
    @extend_schema(
        tags=['Quiz'],
        request=QuizResultSubmitSerializer,
        responses={201: QuizResultSerializer}
    )
    def create(self, request, *args, **kwargs):
        """Submit quiz result and get RIASEC report"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        mode = serializer.validated_data['mode']
        answers = serializer.validated_data['answers']
        
        result_data = RiasecCalculator.calculate_result(answers)
        
        quiz_result = QuizResult.objects.create(
            user=request.user if request.user.is_authenticated else None,
            mode=mode,
            answers=answers,
            riasec_scores=result_data['riasec_scores'],
            top_type=result_data['top_type'],
            second_type=result_data['second_type'],
        )
        
        result_serializer = QuizResultSerializer(quiz_result)
        return Response(result_serializer.data, status=status.HTTP_201_CREATED)
    
    @extend_schema(tags=['Quiz'])
    def list(self, request, *args, **kwargs):
        """Get user's quiz results list"""
        return super().list(request, *args, **kwargs)
    
    @extend_schema(tags=['Quiz'])
    def retrieve(self, request, *args, **kwargs):
        """Get single quiz result"""
        return super().retrieve(request, *args, **kwargs)


class RiasecReportViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for RIASEC reports (read-only)
    """
    queryset = RiasecReport.objects.all()
    serializer_class = RiasecReportSerializer
    permission_classes = [AllowAny]
    lookup_field = 'riasec_type'
    
    @extend_schema(tags=['Quiz'])
    def list(self, request, *args, **kwargs):
        """Get all RIASEC reports"""
        return super().list(request, *args, **kwargs)
    
    @extend_schema(tags=['Quiz'])
    def retrieve(self, request, *args, **kwargs):
        """Get single RIASEC report by type"""
        return super().retrieve(request, *args, **kwargs)
