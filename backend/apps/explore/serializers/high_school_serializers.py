"""
Serializers for high school exploration
"""

from rest_framework import serializers
from ..models import (
    HighSchoolCategory,
    HighSchool,
    HighSchoolAdmissionStep,
    HighSchoolCareerPathDetail,
    HighSchoolHighlightStat,
    HighSchoolRealTalk,
    HighSchoolDailySchedule,
    HighSchoolFamousProgram,
    HighSchoolInfographic,
)


class HighSchoolCategorySerializer(serializers.ModelSerializer):
    """
    Serializer for HighSchoolCategory model
    """
    high_schools_count = serializers.SerializerMethodField()
    
    class Meta:
        model = HighSchoolCategory
        fields = [
            'id',
            'name',
            'emoji',
            'color',
            'description',
            'planet_size',
            'planet_orbit_radius',
            'planet_glow_color',
            'order_index',
            'high_schools_count',
        ]
    
    def get_high_schools_count(self, obj):
        return obj.high_schools.filter(is_active=True).count()


class HighSchoolAdmissionStepSerializer(serializers.ModelSerializer):
    """
    Serializer for HighSchoolAdmissionStep model
    """
    class Meta:
        model = HighSchoolAdmissionStep
        fields = ['id', 'step', 'title', 'detail', 'icon', 'order_index']


class HighSchoolCareerPathDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for HighSchoolCareerPathDetail model
    """
    class Meta:
        model = HighSchoolCareerPathDetail
        fields = ['id', 'grade', 'icon', 'tasks', 'key_point', 'order_index']


class HighSchoolHighlightStatSerializer(serializers.ModelSerializer):
    """
    Serializer for HighSchoolHighlightStat model
    """
    class Meta:
        model = HighSchoolHighlightStat
        fields = ['id', 'label', 'value', 'emoji', 'color', 'order_index']


class HighSchoolRealTalkSerializer(serializers.ModelSerializer):
    """
    Serializer for HighSchoolRealTalk model
    """
    class Meta:
        model = HighSchoolRealTalk
        fields = ['id', 'emoji', 'title', 'content', 'order_index']


class HighSchoolDailyScheduleSerializer(serializers.ModelSerializer):
    """
    Serializer for HighSchoolDailySchedule model
    """
    class Meta:
        model = HighSchoolDailySchedule
        fields = ['id', 'time', 'activity', 'emoji', 'order_index']


class HighSchoolFamousProgramSerializer(serializers.ModelSerializer):
    """
    Serializer for HighSchoolFamousProgram model
    """
    class Meta:
        model = HighSchoolFamousProgram
        fields = ['id', 'name', 'description', 'benefit', 'order_index']


class HighSchoolInfographicSerializer(serializers.ModelSerializer):
    """
    Serializer for HighSchoolInfographic model
    """
    high_school_name = serializers.CharField(source='high_school.name', read_only=True)
    
    class Meta:
        model = HighSchoolInfographic
        fields = [
            'id',
            'high_school',
            'high_school_name',
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


class HighSchoolListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for high school list
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_emoji = serializers.CharField(source='category.emoji', read_only=True)
    
    class Meta:
        model = HighSchool
        fields = [
            'id',
            'name',
            'category',
            'category_name',
            'category_emoji',
            'location',
            'school_type',
            'difficulty',
            'annual_admission',
            'dormitory',
            'ib_certified',
        ]


class HighSchoolDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for high school with all related data
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    admission_steps = HighSchoolAdmissionStepSerializer(many=True, read_only=True)
    career_path_details = HighSchoolCareerPathDetailSerializer(many=True, read_only=True)
    highlight_stats = HighSchoolHighlightStatSerializer(many=True, read_only=True)
    real_talks = HighSchoolRealTalkSerializer(many=True, read_only=True)
    daily_schedules = HighSchoolDailyScheduleSerializer(many=True, read_only=True)
    famous_programs = HighSchoolFamousProgramSerializer(many=True, read_only=True)
    infographics = HighSchoolInfographicSerializer(many=True, read_only=True)
    
    class Meta:
        model = HighSchool
        fields = [
            'id',
            'name',
            'category',
            'category_name',
            'location',
            'school_type',
            'difficulty',
            'annual_admission',
            'tuition',
            'dormitory',
            'ib_certified',
            'education_philosophy',
            'curriculum_features',
            'website_url',
            'admission_steps',
            'career_path_details',
            'highlight_stats',
            'real_talks',
            'daily_schedules',
            'famous_programs',
            'infographics',
            'created_at',
            'updated_at',
        ]


class HighSchoolCompareSerializer(serializers.ModelSerializer):
    """
    Serializer for comparing multiple high schools
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    highlight_stats = HighSchoolHighlightStatSerializer(many=True, read_only=True)
    admission_steps_count = serializers.SerializerMethodField()
    famous_programs_count = serializers.SerializerMethodField()
    
    class Meta:
        model = HighSchool
        fields = [
            'id',
            'name',
            'category_name',
            'location',
            'difficulty',
            'tuition',
            'dormitory',
            'highlight_stats',
            'admission_steps_count',
            'famous_programs_count',
        ]
    
    def get_admission_steps_count(self, obj):
        return obj.admission_steps.count()
    
    def get_famous_programs_count(self, obj):
        return obj.famous_programs.count()
