"""
Views for career execution plans
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone

from .models import ExecutionPlan, PlanItem, PlanGroup
from .serializers import (
    ExecutionPlanListSerializer,
    ExecutionPlanDetailSerializer,
    ExecutionPlanCreateUpdateSerializer,
    PlanItemSerializer,
    PlanGroupSerializer,
)
from common.permissions import IsOwner


class ExecutionPlanViewSet(viewsets.ModelViewSet):
    """
    ViewSet for execution plans (CRUD)
    """
    permission_classes = [IsAuthenticated, IsOwner]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'priority']
    search_fields = ['title', 'description']
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return ExecutionPlan.objects.none()
        return ExecutionPlan.objects.filter(
            user=self.request.user
        ).prefetch_related('items')
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ExecutionPlanListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ExecutionPlanCreateUpdateSerializer
        return ExecutionPlanDetailSerializer
    
    @extend_schema(tags=['Career Plan'])
    def list(self, request, *args, **kwargs):
        """Get execution plans list"""
        return super().list(request, *args, **kwargs)
    
    @extend_schema(tags=['Career Plan'])
    def create(self, request, *args, **kwargs):
        """Create new execution plan"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        plan = serializer.save(user=request.user)
        
        result_serializer = ExecutionPlanDetailSerializer(plan)
        return Response(result_serializer.data, status=status.HTTP_201_CREATED)
    
    @extend_schema(tags=['Career Plan'])
    def retrieve(self, request, *args, **kwargs):
        """Get single execution plan"""
        return super().retrieve(request, *args, **kwargs)
    
    @extend_schema(tags=['Career Plan'])
    def partial_update(self, request, *args, **kwargs):
        """Update execution plan"""
        return super().partial_update(request, *args, **kwargs)
    
    @extend_schema(tags=['Career Plan'])
    def destroy(self, request, *args, **kwargs):
        """Delete execution plan"""
        return super().destroy(request, *args, **kwargs)
    
    @extend_schema(tags=['Career Plan'])
    @action(detail=True, methods=['get'], url_path='items')
    def items(self, request, pk=None):
        """
        Get items for an execution plan
        """
        plan = self.get_object()
        items = plan.items.order_by('order_index')
        serializer = PlanItemSerializer(items, many=True)
        return Response(serializer.data)
    
    @extend_schema(tags=['Career Plan'])
    @action(detail=True, methods=['post'], url_path='items')
    def add_item(self, request, pk=None):
        """
        Add item to execution plan
        """
        plan = self.get_object()
        
        serializer = PlanItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        item = serializer.save(plan=plan)
        
        return Response(
            PlanItemSerializer(item).data,
            status=status.HTTP_201_CREATED
        )


class PlanGroupViewSet(viewsets.ModelViewSet):
    """
    ViewSet for plan groups
    """
    serializer_class = PlanGroupSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return PlanGroup.objects.none()
        return PlanGroup.objects.filter(
            members__user=self.request.user
        ).distinct()
    
    @extend_schema(tags=['Career Plan'])
    def list(self, request, *args, **kwargs):
        """Get plan groups list"""
        return super().list(request, *args, **kwargs)
    
    @extend_schema(tags=['Career Plan'])
    def create(self, request, *args, **kwargs):
        """Create new plan group"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        group = serializer.save(creator=request.user)
        
        from .models import PlanGroupMember
        PlanGroupMember.objects.create(
            group=group,
            user=request.user,
            role='admin'
        )
        
        return Response(
            PlanGroupSerializer(group).data,
            status=status.HTTP_201_CREATED
        )
