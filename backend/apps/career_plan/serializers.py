"""
Serializers for career plan app
"""

from rest_framework import serializers
from .models import ExecutionPlan, PlanItem, PlanGroup, PlanGroupMember


class PlanItemSerializer(serializers.ModelSerializer):
    """
    Serializer for PlanItem model
    """
    class Meta:
        model = PlanItem
        fields = [
            'id',
            'title',
            'description',
            'status',
            'due_date',
            'completed_at',
            'order_index',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['completed_at', 'created_at', 'updated_at']


class ExecutionPlanListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for execution plan list
    """
    items_count = serializers.SerializerMethodField()
    completed_items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ExecutionPlan
        fields = [
            'id',
            'title',
            'status',
            'priority',
            'due_date',
            'progress_percentage',
            'items_count',
            'completed_items_count',
            'created_at',
        ]
    
    def get_items_count(self, obj):
        return obj.items.count()
    
    def get_completed_items_count(self, obj):
        return obj.items.filter(status='completed').count()


class ExecutionPlanDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for execution plan with items
    """
    items = PlanItemSerializer(many=True, read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)
    
    class Meta:
        model = ExecutionPlan
        fields = [
            'id',
            'user',
            'user_name',
            'title',
            'description',
            'status',
            'priority',
            'due_date',
            'completed_at',
            'progress_percentage',
            'items',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['user', 'completed_at', 'progress_percentage']


class ExecutionPlanCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating/updating execution plan
    """
    class Meta:
        model = ExecutionPlan
        fields = ['title', 'description', 'status', 'priority', 'due_date']


class PlanGroupSerializer(serializers.ModelSerializer):
    """
    Serializer for PlanGroup model
    """
    creator_name = serializers.CharField(source='creator.name', read_only=True)
    
    class Meta:
        model = PlanGroup
        fields = [
            'id',
            'name',
            'description',
            'emoji',
            'creator',
            'creator_name',
            'member_count',
            'created_at',
        ]
        read_only_fields = ['creator', 'member_count', 'created_at']
