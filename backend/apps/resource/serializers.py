"""
Serializers for resource app
"""

from rest_framework import serializers
from .models import Resource


class ResourceSerializer(serializers.ModelSerializer):
    """
    Serializer for Resource model
    """
    created_by_name = serializers.CharField(source='created_by.name', read_only=True)
    
    class Meta:
        model = Resource
        fields = [
            'id',
            'title',
            'description',
            'resource_type',
            'url',
            'thumbnail_url',
            'tags',
            'created_by',
            'created_by_name',
            'view_count',
            'created_at',
        ]
        read_only_fields = ['created_by', 'view_count', 'created_at']
