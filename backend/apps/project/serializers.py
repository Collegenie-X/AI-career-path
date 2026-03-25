"""
Serializers for project app
"""

from rest_framework import serializers
from .models import Project, UserProject


class ProjectSerializer(serializers.ModelSerializer):
    """
    Serializer for Project model
    """
    class Meta:
        model = Project
        fields = [
            'id',
            'title',
            'description',
            'difficulty',
            'estimated_hours',
            'tech_stack',
            'learning_objectives',
            'thumbnail_url',
            'created_at',
        ]


class UserProjectSerializer(serializers.ModelSerializer):
    """
    Serializer for UserProject model
    """
    project_title = serializers.CharField(source='project.title', read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)
    
    class Meta:
        model = UserProject
        fields = [
            'id',
            'user',
            'user_name',
            'project',
            'project_title',
            'title',
            'description',
            'status',
            'github_url',
            'demo_url',
            'started_at',
            'completed_at',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']
