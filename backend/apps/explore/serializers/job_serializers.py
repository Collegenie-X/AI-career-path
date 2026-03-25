"""
Serializers for job exploration
"""

from rest_framework import serializers
from ..models import (
    JobCategory,
    Job,
    JobCareerPathStage,
    JobCareerPathTask,
    JobKeyPreparation,
    JobRecommendedHighSchool,
    JobRecommendedUniversity,
    JobDailySchedule,
    JobRequiredSkill,
    JobMilestone,
    JobAcceptee,
    JobInfographic,
)


class JobCategorySerializer(serializers.ModelSerializer):
    """
    Serializer for JobCategory model
    """
    jobs_count = serializers.SerializerMethodField()
    
    class Meta:
        model = JobCategory
        fields = [
            'id',
            'name',
            'emoji',
            'color',
            'description',
            'order_index',
            'jobs_count',
        ]
    
    def get_jobs_count(self, obj):
        return obj.jobs.filter(is_active=True).count()


class JobCareerPathTaskSerializer(serializers.ModelSerializer):
    """
    Serializer for JobCareerPathTask model
    """
    class Meta:
        model = JobCareerPathTask
        fields = ['id', 'task_description', 'order_index']


class JobCareerPathStageSerializer(serializers.ModelSerializer):
    """
    Serializer for JobCareerPathStage model with nested tasks
    """
    tasks = JobCareerPathTaskSerializer(many=True, read_only=True)
    
    class Meta:
        model = JobCareerPathStage
        fields = ['id', 'stage', 'period', 'icon', 'tasks', 'order_index']


class JobKeyPreparationSerializer(serializers.ModelSerializer):
    """
    Serializer for JobKeyPreparation model
    """
    class Meta:
        model = JobKeyPreparation
        fields = ['id', 'preparation_item', 'order_index']


class JobRecommendedHighSchoolSerializer(serializers.ModelSerializer):
    """
    Serializer for JobRecommendedHighSchool model
    """
    class Meta:
        model = JobRecommendedHighSchool
        fields = ['id', 'high_school_type', 'high_school_name', 'order_index']


class JobRecommendedUniversitySerializer(serializers.ModelSerializer):
    """
    Serializer for JobRecommendedUniversity model
    """
    class Meta:
        model = JobRecommendedUniversity
        fields = ['id', 'university_name', 'admission_type', 'difficulty', 'order_index']


class JobDailyScheduleSerializer(serializers.ModelSerializer):
    """
    Serializer for JobDailySchedule model
    """
    class Meta:
        model = JobDailySchedule
        fields = ['id', 'time', 'activity', 'emoji', 'order_index']


class JobRequiredSkillSerializer(serializers.ModelSerializer):
    """
    Serializer for JobRequiredSkill model
    """
    class Meta:
        model = JobRequiredSkill
        fields = ['id', 'skill_name', 'score', 'order_index']


class JobMilestoneSerializer(serializers.ModelSerializer):
    """
    Serializer for JobMilestone model
    """
    class Meta:
        model = JobMilestone
        fields = ['id', 'stage', 'title', 'description', 'icon', 'order_index']


class JobAccepteeSerializer(serializers.ModelSerializer):
    """
    Serializer for JobAcceptee model
    """
    class Meta:
        model = JobAcceptee
        fields = [
            'id',
            'acceptee_type',
            'name',
            'school',
            'gpa',
            'activities',
            'order_index',
        ]


class JobInfographicSerializer(serializers.ModelSerializer):
    """
    Serializer for JobInfographic model
    """
    job_name = serializers.CharField(source='job.name', read_only=True)
    
    class Meta:
        model = JobInfographic
        fields = [
            'id',
            'job',
            'job_name',
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


class JobListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for job list
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_emoji = serializers.CharField(source='category.emoji', read_only=True)
    
    class Meta:
        model = Job
        fields = [
            'id',
            'name',
            'name_en',
            'emoji',
            'category',
            'category_name',
            'category_emoji',
            'rarity',
            'short_description',
            'difficulty',
            'salary_range',
            'outlook_score',
        ]


class JobDetailSerializer(serializers.ModelSerializer):
    """
    Detailed serializer for job with all related data
    """
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    career_path_stages = JobCareerPathStageSerializer(many=True, read_only=True)
    key_preparations = JobKeyPreparationSerializer(many=True, read_only=True)
    recommended_high_schools_rel = JobRecommendedHighSchoolSerializer(many=True, read_only=True)
    recommended_universities_rel = JobRecommendedUniversitySerializer(many=True, read_only=True)
    daily_schedules = JobDailyScheduleSerializer(many=True, read_only=True)
    required_skills = JobRequiredSkillSerializer(many=True, read_only=True)
    milestones = JobMilestoneSerializer(many=True, read_only=True)
    acceptees = JobAccepteeSerializer(many=True, read_only=True)
    infographics = JobInfographicSerializer(many=True, read_only=True)
    
    class Meta:
        model = Job
        fields = [
            'id',
            'name',
            'name_en',
            'emoji',
            'category',
            'category_name',
            'kingdom_id',
            'rarity',
            'riasec_profile',
            'description',
            'short_description',
            'company',
            'salary_range',
            'difficulty',
            'future_outlook',
            'outlook_score',
            'career_path_stages',
            'key_preparations',
            'recommended_high_schools_rel',
            'recommended_universities_rel',
            'daily_schedules',
            'required_skills',
            'milestones',
            'acceptees',
            'infographics',
            'created_at',
            'updated_at',
        ]
