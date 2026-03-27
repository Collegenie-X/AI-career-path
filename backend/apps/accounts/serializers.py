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


class EmailSignupRequestSerializer(serializers.Serializer):
    """
    Serializer for email signup request
    """
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, max_length=128, write_only=True)
    name = serializers.CharField(max_length=100)
    grade = serializers.ChoiceField(choices=User.GRADE_CHOICES, required=False)
    emoji = serializers.CharField(max_length=10, required=False, default='👤')


class EmailSignupResponseSerializer(serializers.Serializer):
    """
    Serializer for email signup response
    """
    access_token = serializers.CharField()
    refresh_token = serializers.CharField()
    user = UserSerializer()


class EmailLoginRequestSerializer(serializers.Serializer):
    """
    Serializer for email login request
    """
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class EmailLoginResponseSerializer(serializers.Serializer):
    """
    Serializer for email login response
    """
    access_token = serializers.CharField()
    refresh_token = serializers.CharField()
    user = UserSerializer()
