"""
Serializers for User authentication and profile management
"""

from rest_framework import serializers
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model
    """
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'name',
            'grade',
            'emoji',
            'social_provider',
            'profile_image_url',
            'is_active',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'email', 'social_provider', 'created_at', 'updated_at']


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user profile
    """
    class Meta:
        model = User
        fields = ['name', 'grade', 'emoji']


class SocialLoginRequestSerializer(serializers.Serializer):
    """
    Serializer for social login request
    """
    provider = serializers.ChoiceField(choices=['google', 'kakao', 'naver'])
    code = serializers.CharField(max_length=500)


class SocialLoginResponseSerializer(serializers.Serializer):
    """
    Serializer for social login response
    """
    access_token = serializers.CharField()
    refresh_token = serializers.CharField()
    user = UserSerializer()
    is_new_user = serializers.BooleanField()


class TokenRefreshRequestSerializer(serializers.Serializer):
    """
    Serializer for token refresh request
    """
    refresh_token = serializers.CharField()


class TokenRefreshResponseSerializer(serializers.Serializer):
    """
    Serializer for token refresh response
    """
    access_token = serializers.CharField()
    refresh_token = serializers.CharField()
