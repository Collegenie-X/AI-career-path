"""
Serializers for career path app
"""

from rest_framework import serializers
from .models import (
    CareerPathTemplate,
    TemplateYear,
    TemplateItem,
    UserCareerPath,
    School,
    SchoolMember,
)


class TemplateItemSerializer(serializers.ModelSerializer):
    """
    Serializer for TemplateItem model
    """
    class Meta:
        model = TemplateItem
        fields = [
            'id',
            'item_type',
            'title',
            'description',
            'month',
            'emoji',
            'order_index',
        ]


class TemplateYearSerializer(serializers.ModelSerializer):
    """
    Serializer for TemplateYear model with nested items
    """
    items = TemplateItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = TemplateYear
        fields = ['id', 'year', 'items', 'order_index']


class CareerPathTemplateListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for template list
    """
    years_count = serializers.SerializerMethodField()
    items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = CareerPathTemplate
        fields = [
            'id',
            'template_key',
            'title',
            'category',
            'job_id',
            'university_id',
            'description',
            'likes',
            'uses',
            'is_official',
            'years_count',
            'items_count',
            'created_at',
        ]
    
    def get_years_count(self, obj):
        return obj.years.count()
    
    def get_items_count(self, obj):
        return TemplateItem.objects.filter(year__template=obj).count()


class CareerPathTemplateDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for template with nested years and items
    """
    years = TemplateYearSerializer(many=True, read_only=True)
    
    class Meta:
        model = CareerPathTemplate
        fields = [
            'id',
            'template_key',
            'title',
            'category',
            'job_id',
            'university_id',
            'description',
            'likes',
            'uses',
            'is_official',
            'years',
            'created_at',
            'updated_at',
        ]


class UserCareerPathListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for user career path list
    """
    template_title = serializers.CharField(source='template.title', read_only=True)
    
    class Meta:
        model = UserCareerPath
        fields = [
            'id',
            'template',
            'template_title',
            'title',
            'status',
            'share_scope',
            'progress_percentage',
            'created_at',
            'updated_at',
        ]


class UserCareerPathDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for user career path
    """
    template_title = serializers.CharField(source='template.title', read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)
    
    class Meta:
        model = UserCareerPath
        fields = [
            'id',
            'user',
            'user_name',
            'template',
            'template_title',
            'title',
            'description',
            'status',
            'share_scope',
            'path_data',
            'progress_percentage',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['user', 'progress_percentage']


class UserCareerPathCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating user career path from template
    """
    class Meta:
        model = UserCareerPath
        fields = ['template', 'title', 'description']


class UserCareerPathUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user career path
    """
    class Meta:
        model = UserCareerPath
        fields = ['title', 'description', 'status', 'share_scope', 'path_data']


class SchoolSerializer(serializers.ModelSerializer):
    """
    Serializer for School model
    """
    class Meta:
        model = School
        fields = [
            'id',
            'name',
            'school_type',
            'location',
            'invite_code',
            'member_count',
            'is_verified',
            'created_at',
        ]
        read_only_fields = ['invite_code', 'member_count', 'created_at']


class SchoolMemberSerializer(serializers.ModelSerializer):
    """
    Serializer for SchoolMember model
    """
    user_name = serializers.CharField(source='user.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    school_name = serializers.CharField(source='school.name', read_only=True)
    
    class Meta:
        model = SchoolMember
        fields = [
            'id',
            'school',
            'school_name',
            'user',
            'user_name',
            'user_email',
            'role',
            'joined_at',
        ]
        read_only_fields = ['joined_at']
