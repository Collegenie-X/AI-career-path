"""
실행계획 AI 생성 API Serializer
"""

from rest_framework import serializers


class MilestoneInputSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200, required=False, allow_blank=True)
    date_iso = serializers.CharField(max_length=32, required=False, allow_blank=True)


class ExecutionPlanAiGenerateRequestSerializer(serializers.Serializer):
    """title: 로드맵 전체 제목이 아니라 한 활동 항목의 제목(활동 초점)으로 쓰입니다."""
    title = serializers.CharField(max_length=500)
    plan_depth = serializers.ChoiceField(
        choices=['detailed', 'brief', 'simple'],
        default='brief',
    )
    category_id = serializers.CharField(max_length=32, required=False, allow_blank=True, default='')
    student_level = serializers.CharField(max_length=32, required=False, allow_blank=True, default='')
    level_label = serializers.CharField(max_length=120, required=False, allow_blank=True, default='')
    difficulty = serializers.IntegerField(required=False, min_value=1, max_value=5, default=3)
    final_goal = serializers.CharField(max_length=2000)
    selected_months = serializers.ListField(
        child=serializers.IntegerField(min_value=1, max_value=12),
        min_length=1,
    )
    milestones = MilestoneInputSerializer(many=True, required=False, default=list)
    constraints = serializers.CharField(max_length=2000, required=False, allow_blank=True)
    previous_summary = serializers.CharField(max_length=2000, required=False, allow_blank=True)

    def validate_selected_months(self, value):
        return sorted({int(m) for m in value})


