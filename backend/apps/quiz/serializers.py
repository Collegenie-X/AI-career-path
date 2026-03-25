"""
Serializers for quiz app
"""

from rest_framework import serializers
from .models import QuizQuestion, QuizChoice, QuizResult, RiasecReport


class QuizChoiceSerializer(serializers.ModelSerializer):
    """
    Serializer for QuizChoice model
    """
    class Meta:
        model = QuizChoice
        fields = ['id', 'choice_key', 'text', 'riasec_scores', 'order_index']


class QuizQuestionSerializer(serializers.ModelSerializer):
    """
    Serializer for QuizQuestion model with nested choices
    """
    choices = QuizChoiceSerializer(many=True, read_only=True)
    
    class Meta:
        model = QuizQuestion
        fields = [
            'id',
            'order_index',
            'zone',
            'zone_icon',
            'situation',
            'description',
            'feedback_map',
            'choices',
        ]


class QuizQuestionListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for quiz question list
    """
    choices_count = serializers.SerializerMethodField()
    
    class Meta:
        model = QuizQuestion
        fields = ['id', 'order_index', 'zone', 'zone_icon', 'situation', 'choices_count']
    
    def get_choices_count(self, obj):
        return obj.choices.count()


class QuizResultSubmitSerializer(serializers.Serializer):
    """
    Serializer for submitting quiz results
    """
    mode = serializers.ChoiceField(choices=['quick', 'full'], default='full')
    answers = serializers.ListField(
        child=serializers.DictField(),
        min_length=1
    )


class RiasecReportSerializer(serializers.ModelSerializer):
    """
    Serializer for RIASEC report
    """
    class Meta:
        model = RiasecReport
        fields = [
            'riasec_type',
            'type_name',
            'emoji',
            'tagline',
            'description',
            'strengths',
            'weaknesses',
            'career_keywords',
            'recommended_activities',
            'famous_people',
            'color',
        ]


class QuizResultSerializer(serializers.ModelSerializer):
    """
    Serializer for QuizResult model
    """
    report = serializers.SerializerMethodField()
    user_name = serializers.CharField(source='user.name', read_only=True)
    
    class Meta:
        model = QuizResult
        fields = [
            'id',
            'user',
            'user_name',
            'mode',
            'answers',
            'riasec_scores',
            'top_type',
            'second_type',
            'report',
            'taken_at',
        ]
        read_only_fields = ['id', 'taken_at']
    
    def get_report(self, obj):
        try:
            report = RiasecReport.objects.get(riasec_type=obj.top_type)
            return RiasecReportSerializer(report).data
        except RiasecReport.DoesNotExist:
            return None


class QuizResultListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for quiz result list
    """
    user_name = serializers.CharField(source='user.name', read_only=True)
    
    class Meta:
        model = QuizResult
        fields = [
            'id',
            'user_name',
            'mode',
            'top_type',
            'second_type',
            'taken_at',
        ]
