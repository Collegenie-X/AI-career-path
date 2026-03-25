"""
Serializers for university exploration
"""

from rest_framework import serializers
from ..models import (
    UniversityAdmissionCategory,
    University,
    UniversityDepartment,
    UniversityAdmissionPlaybook,
    UniversityInfographic,
)


class UniversityAdmissionCategorySerializer(serializers.ModelSerializer):
    """
    Serializer for UniversityAdmissionCategory model
    """
    departments_count = serializers.SerializerMethodField()
    playbooks_count = serializers.SerializerMethodField()
    
    class Meta:
        model = UniversityAdmissionCategory
        fields = [
            'id',
            'name',
            'emoji',
            'color',
            'description',
            'key_features',
            'target_students',
            'planet_size',
            'planet_orbit_radius',
            'planet_glow_color',
            'order_index',
            'departments_count',
            'playbooks_count',
        ]
    
    def get_departments_count(self, obj):
        return obj.departments.filter(is_active=True).count()
    
    def get_playbooks_count(self, obj):
        return obj.playbooks.count()


class UniversityAdmissionPlaybookSerializer(serializers.ModelSerializer):
    """
    Serializer for UniversityAdmissionPlaybook model
    """
    admission_category_name = serializers.CharField(
        source='admission_category.name',
        read_only=True
    )
    
    class Meta:
        model = UniversityAdmissionPlaybook
        fields = [
            'id',
            'admission_category',
            'admission_category_name',
            'title',
            'description',
            'preparation_guide',
            'timeline',
            'key_strategies',
            'order_index',
            'created_at',
        ]


class UniversityDepartmentSerializer(serializers.ModelSerializer):
    """
    Serializer for UniversityDepartment model
    """
    university_name = serializers.CharField(source='university.name', read_only=True)
    admission_category_name = serializers.CharField(
        source='admission_category.name',
        read_only=True
    )
    
    class Meta:
        model = UniversityDepartment
        fields = [
            'id',
            'university',
            'university_name',
            'department_name',
            'college',
            'admission_category',
            'admission_category_name',
            'competition_rate',
            'required_grade',
            'description',
        ]


class UniversityInfographicSerializer(serializers.ModelSerializer):
    """
    Serializer for UniversityInfographic model
    """
    university_name = serializers.CharField(source='university.name', read_only=True)
    admission_category_name = serializers.CharField(
        source='admission_category.name',
        read_only=True
    )
    
    class Meta:
        model = UniversityInfographic
        fields = [
            'id',
            'university',
            'university_name',
            'admission_category',
            'admission_category_name',
            'infographic_type',
            'title',
            'description',
            'image_url',
            'thumbnail_url',
            'data_points',
            'view_count',
            'order_index',
            'created_at',
        ]
        read_only_fields = ['view_count', 'created_at']


class UniversityListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for university list
    """
    departments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = University
        fields = [
            'id',
            'name',
            'short_name',
            'university_type',
            'region',
            'departments_count',
        ]
    
    def get_departments_count(self, obj):
        return obj.departments.filter(is_active=True).count()


class UniversityDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for university with all related data
    """
    departments = UniversityDepartmentSerializer(many=True, read_only=True)
    infographics = UniversityInfographicSerializer(many=True, read_only=True)
    
    class Meta:
        model = University
        fields = [
            'id',
            'name',
            'short_name',
            'university_type',
            'region',
            'description',
            'website_url',
            'departments',
            'infographics',
            'created_at',
            'updated_at',
        ]
