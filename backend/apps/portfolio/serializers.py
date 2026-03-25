"""
Serializers for portfolio app
"""

from rest_framework import serializers
from .models import PortfolioItem


class PortfolioItemSerializer(serializers.ModelSerializer):
    """
    Serializer for PortfolioItem model
    """
    user_name = serializers.CharField(source='user.name', read_only=True)
    
    class Meta:
        model = PortfolioItem
        fields = [
            'id',
            'user',
            'user_name',
            'item_type',
            'title',
            'description',
            'organization',
            'started_at',
            'ended_at',
            'is_ongoing',
            'url',
            'image_url',
            'tags',
            'order_index',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['user', 'created_at', 'updated_at']
