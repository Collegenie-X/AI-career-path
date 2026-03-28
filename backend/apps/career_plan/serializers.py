"""
Career Plan (DreamMate) Serializers - 커리어 실행 시리얼라이저

설계 문서: documents/backend/커리어실행_DreamMate_Django_DB_설계서.md
"""

from rest_framework import serializers
from django.db import transaction
from .models import (
    Roadmap, RoadmapItem, RoadmapTodo, RoadmapMilestone,
    DreamResource, ResourceSection,
    DreamSpace, SpaceParticipant,
    SharedDreamRoadmap, SharedDreamRoadmapGroup
)


# ============================================================================
# Roadmap Serializers
# ============================================================================

class RoadmapTodoSerializer(serializers.ModelSerializer):
    """로드맵 TODO 시리얼라이저"""
    
    class Meta:
        model = RoadmapTodo
        fields = [
            'id', 'week_label', 'week_number', 'entry_type',
            'title', 'is_done', 'note', 'output_ref', 'sort_order',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class RoadmapTodoCreateSerializer(serializers.ModelSerializer):
    """로드맵 TODO 생성 시리얼라이저"""
    
    class Meta:
        model = RoadmapTodo
        fields = [
            'week_label', 'week_number', 'entry_type',
            'title', 'is_done', 'note', 'output_ref', 'sort_order'
        ]


class RoadmapItemSerializer(serializers.ModelSerializer):
    """로드맵 활동 시리얼라이저 (TODO 포함)"""
    
    todos = RoadmapTodoSerializer(many=True, read_only=True)
    completed_todo_count = serializers.ReadOnlyField()
    total_todo_count = serializers.ReadOnlyField()
    
    class Meta:
        model = RoadmapItem
        fields = [
            'id', 'type', 'title', 'months', 'difficulty',
            'target_output', 'success_criteria', 'sort_order',
            'todos', 'completed_todo_count', 'total_todo_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class RoadmapItemCreateSerializer(serializers.ModelSerializer):
    """로드맵 활동 생성 시리얼라이저 (TODO 포함)"""
    
    todos = RoadmapTodoCreateSerializer(many=True, required=False)
    
    class Meta:
        model = RoadmapItem
        fields = [
            'type', 'title', 'months', 'difficulty',
            'target_output', 'success_criteria', 'sort_order',
            'todos'
        ]
    
    def create(self, validated_data):
        todos_data = validated_data.pop('todos', [])
        
        roadmap_item = RoadmapItem.objects.create(**validated_data)
        
        for todo_data in todos_data:
            RoadmapTodo.objects.create(roadmap_item=roadmap_item, **todo_data)
        
        return roadmap_item


class RoadmapMilestoneSerializer(serializers.ModelSerializer):
    """로드맵 마일스톤 시리얼라이저"""
    
    class Meta:
        model = RoadmapMilestone
        fields = [
            'id', 'title', 'description', 'month_week_label',
            'time_log', 'result_url', 'image_url', 'recorded_at',
            'sort_order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class RoadmapListSerializer(serializers.ModelSerializer):
    """로드맵 목록 시리얼라이저 (간단)"""
    
    item_count = serializers.ReadOnlyField()
    completed_todo_count = serializers.ReadOnlyField()
    total_todo_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Roadmap
        fields = [
            'id', 'title', 'description', 'period', 'star_color',
            'focus_item_types', 'item_count', 'completed_todo_count',
            'total_todo_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class RoadmapDetailSerializer(serializers.ModelSerializer):
    """로드맵 상세 시리얼라이저 (전체 중첩 구조)"""
    
    items = RoadmapItemSerializer(many=True, read_only=True)
    milestones = RoadmapMilestoneSerializer(many=True, read_only=True)
    item_count = serializers.ReadOnlyField()
    completed_todo_count = serializers.ReadOnlyField()
    total_todo_count = serializers.ReadOnlyField()
    user_name = serializers.CharField(source='user.name', read_only=True)
    
    class Meta:
        model = Roadmap
        fields = [
            'id', 'user', 'user_name', 'title', 'description',
            'period', 'star_color', 'focus_item_types',
            'final_result_title', 'final_result_description',
            'final_result_url', 'final_result_image_url',
            'items', 'milestones',
            'item_count', 'completed_todo_count', 'total_todo_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class RoadmapCreateSerializer(serializers.ModelSerializer):
    """로드맵 생성 시리얼라이저 (전체 중첩 구조)"""
    
    items = RoadmapItemCreateSerializer(many=True, required=False)
    milestones = RoadmapMilestoneSerializer(many=True, required=False)
    
    class Meta:
        model = Roadmap
        fields = [
            'title', 'description', 'period', 'star_color',
            'focus_item_types', 'final_result_title',
            'final_result_description', 'final_result_url',
            'final_result_image_url', 'items', 'milestones'
        ]
    
    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        milestones_data = validated_data.pop('milestones', [])
        
        user = self.context['request'].user
        roadmap = Roadmap.objects.create(user=user, **validated_data)
        
        # 활동 생성
        for item_data in items_data:
            todos_data = item_data.pop('todos', [])
            roadmap_item = RoadmapItem.objects.create(roadmap=roadmap, **item_data)
            
            # TODO 생성
            for todo_data in todos_data:
                RoadmapTodo.objects.create(roadmap_item=roadmap_item, **todo_data)
        
        # 마일스톤 생성
        for milestone_data in milestones_data:
            RoadmapMilestone.objects.create(roadmap=roadmap, **milestone_data)
        
        return roadmap


class RoadmapUpdateSerializer(serializers.ModelSerializer):
    """로드맵 수정 시리얼라이저"""
    
    class Meta:
        model = Roadmap
        fields = [
            'title', 'description', 'period', 'star_color',
            'focus_item_types', 'final_result_title',
            'final_result_description', 'final_result_url',
            'final_result_image_url'
        ]


# ============================================================================
# Dream Resource Serializers
# ============================================================================

class ResourceSectionSerializer(serializers.ModelSerializer):
    """자료 섹션 시리얼라이저"""
    
    class Meta:
        model = ResourceSection
        fields = [
            'id', 'title', 'content', 'sort_order',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ResourceSectionCreateSerializer(serializers.ModelSerializer):
    """자료 섹션 생성 시리얼라이저"""
    
    class Meta:
        model = ResourceSection
        fields = ['title', 'content', 'sort_order']


class DreamResourceListSerializer(serializers.ModelSerializer):
    """드림 자료 목록 시리얼라이저"""
    
    user_name = serializers.CharField(source='user.name', read_only=True)
    
    class Meta:
        model = DreamResource
        fields = [
            'id', 'user', 'user_name', 'type', 'title',
            'thumbnail_url', 'tags', 'like_count', 'bookmark_count',
            'download_count', 'view_count', 'comment_count',
            'share_type', 'is_hidden', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'created_at']


class DreamResourceDetailSerializer(serializers.ModelSerializer):
    """드림 자료 상세 시리얼라이저"""
    
    sections = ResourceSectionSerializer(many=True, read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)
    
    class Meta:
        model = DreamResource
        fields = [
            'id', 'user', 'user_name', 'type', 'title', 'description',
            'file_url', 'thumbnail_url', 'tags',
            'like_count', 'bookmark_count', 'download_count',
            'view_count', 'comment_count', 'share_type', 'is_hidden',
            'sections', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'like_count', 'bookmark_count',
            'download_count', 'view_count', 'comment_count',
            'created_at', 'updated_at'
        ]


class DreamResourceCreateSerializer(serializers.ModelSerializer):
    """드림 자료 생성 시리얼라이저"""
    
    sections = ResourceSectionCreateSerializer(many=True, required=False)
    
    class Meta:
        model = DreamResource
        fields = [
            'type', 'title', 'description', 'file_url',
            'thumbnail_url', 'tags', 'share_type', 'sections'
        ]
    
    @transaction.atomic
    def create(self, validated_data):
        sections_data = validated_data.pop('sections', [])
        
        user = self.context['request'].user
        resource = DreamResource.objects.create(user=user, **validated_data)
        
        for section_data in sections_data:
            ResourceSection.objects.create(resource=resource, **section_data)
        
        return resource


class DreamResourceUpdateSerializer(serializers.ModelSerializer):
    """드림 자료 수정 시리얼라이저"""
    
    class Meta:
        model = DreamResource
        fields = [
            'title', 'description', 'file_url', 'thumbnail_url',
            'tags', 'share_type', 'is_hidden'
        ]


# ============================================================================
# Dream Space Serializers
# ============================================================================

class SpaceParticipantSerializer(serializers.ModelSerializer):
    """스페이스 참여자 시리얼라이저"""
    
    user_name = serializers.CharField(source='user.name', read_only=True)
    
    class Meta:
        model = SpaceParticipant
        fields = [
            'id', 'user', 'user_name', 'status',
            'applied_at', 'approved_at', 'confirmed_at'
        ]
        read_only_fields = [
            'id', 'user', 'applied_at', 'approved_at', 'confirmed_at'
        ]


class DreamSpaceListSerializer(serializers.ModelSerializer):
    """드림 스페이스 목록 시리얼라이저"""
    
    group_name = serializers.CharField(source='group.name', read_only=True)
    
    class Meta:
        model = DreamSpace
        fields = [
            'id', 'group', 'group_name', 'title', 'program_type',
            'recruitment_status', 'max_participants',
            'current_participants', 'start_date', 'end_date',
            'created_at'
        ]
        read_only_fields = ['id', 'current_participants', 'created_at']


class DreamSpaceDetailSerializer(serializers.ModelSerializer):
    """드림 스페이스 상세 시리얼라이저"""
    
    group_name = serializers.CharField(source='group.name', read_only=True)
    participants = SpaceParticipantSerializer(many=True, read_only=True)
    
    class Meta:
        model = DreamSpace
        fields = [
            'id', 'group', 'group_name', 'title', 'description',
            'program_type', 'recruitment_status', 'max_participants',
            'current_participants', 'start_date', 'end_date',
            'participants', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'current_participants', 'created_at', 'updated_at'
        ]


class DreamSpaceCreateSerializer(serializers.ModelSerializer):
    """드림 스페이스 생성 시리얼라이저"""
    
    class Meta:
        model = DreamSpace
        fields = [
            'group', 'title', 'description', 'program_type',
            'recruitment_status', 'max_participants',
            'start_date', 'end_date'
        ]


# ============================================================================
# Shared Roadmap Serializers
# ============================================================================

class SharedDreamRoadmapGroupSerializer(serializers.ModelSerializer):
    """공유 드림 로드맵-그룹 연결 시리얼라이저"""
    
    group_name = serializers.CharField(source='group.name', read_only=True)
    
    class Meta:
        model = SharedDreamRoadmapGroup
        fields = ['id', 'group', 'group_name']
        read_only_fields = ['id']


class SharedDreamRoadmapListSerializer(serializers.ModelSerializer):
    """공유 드림 로드맵 목록 시리얼라이저"""
    
    user_name = serializers.CharField(source='user.name', read_only=True)
    roadmap_title = serializers.CharField(source='roadmap.title', read_only=True)
    
    class Meta:
        model = SharedDreamRoadmap
        fields = [
            'id', 'user', 'user_name', 'roadmap', 'roadmap_title',
            'share_type', 'tags', 'like_count', 'bookmark_count',
            'view_count', 'comment_count', 'report_count', 'shared_at', 'is_hidden'
        ]
        read_only_fields = [
            'id', 'user', 'like_count', 'bookmark_count',
            'view_count', 'comment_count', 'report_count', 'shared_at'
        ]


class SharedDreamRoadmapDetailSerializer(serializers.ModelSerializer):
    """공유 드림 로드맵 상세 시리얼라이저"""
    
    user_name = serializers.CharField(source='user.name', read_only=True)
    roadmap = RoadmapDetailSerializer(read_only=True)
    group_links = SharedDreamRoadmapGroupSerializer(many=True, read_only=True)
    
    class Meta:
        model = SharedDreamRoadmap
        fields = [
            'id', 'user', 'user_name', 'roadmap', 'share_type',
            'description', 'tags', 'like_count', 'bookmark_count',
            'view_count', 'comment_count', 'report_count', 'shared_at', 'is_hidden',
            'group_links'
        ]
        read_only_fields = [
            'id', 'user', 'like_count', 'bookmark_count',
            'view_count', 'comment_count', 'report_count', 'shared_at'
        ]


class SharedDreamRoadmapCreateSerializer(serializers.ModelSerializer):
    """공유 드림 로드맵 생성 시리얼라이저"""
    
    group_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        write_only=True
    )
    
    class Meta:
        model = SharedDreamRoadmap
        fields = [
            'roadmap', 'share_type', 'description', 'tags',
            'is_hidden', 'group_ids'
        ]
    
    @transaction.atomic
    def create(self, validated_data):
        group_ids = validated_data.pop('group_ids', [])
        user = self.context['request'].user
        roadmap = validated_data.pop('roadmap')
        # 로드맵당 공유 1행 — 재요청 시 갱신 (career_path.SharedPlan 과 동일 DB 제약)
        shared_roadmap, _created = SharedDreamRoadmap.objects.update_or_create(
            roadmap=roadmap,
            defaults={**validated_data, 'user': user},
        )
        shared_roadmap.group_links.all().delete()
        from apps.community.models import Group
        for group_id in group_ids:
            try:
                group = Group.objects.get(id=group_id)
                SharedDreamRoadmapGroup.objects.create(
                    shared_roadmap=shared_roadmap,
                    group=group,
                )
            except Group.DoesNotExist:
                pass
        return shared_roadmap


class SharedDreamRoadmapUpdateSerializer(serializers.ModelSerializer):
    """공유 드림 로드맵 수정 시리얼라이저"""
    
    group_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        write_only=True
    )
    
    class Meta:
        model = SharedDreamRoadmap
        fields = [
            'share_type', 'description', 'tags', 'is_hidden', 'group_ids'
        ]
    
    @transaction.atomic
    def update(self, instance, validated_data):
        group_ids = validated_data.pop('group_ids', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # 그룹 연결 업데이트
        if group_ids is not None:
            instance.group_links.all().delete()
            
            from apps.community.models import Group
            for group_id in group_ids:
                try:
                    group = Group.objects.get(id=group_id)
                    SharedDreamRoadmapGroup.objects.create(
                        shared_roadmap=instance,
                        group=group
                    )
                except Group.DoesNotExist:
                    pass
        
        return instance
