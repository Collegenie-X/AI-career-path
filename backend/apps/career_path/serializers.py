"""
Career Path Serializers - 커리어 패스 시리얼라이저

설계 문서: documents/backend/커리어패스_Career_Django_DB_설계서.md
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db import transaction
from .models import (
    School, Group, GroupMember,
    CareerPlan, PlanYear, GoalGroup, PlanItem, SubItem, ItemLink,
    SharedPlan, SharedPlanComment, SharedPlanGroup,
)
from .nested_sync import sync_career_plan_years_from_payload

User = get_user_model()


# ============================================================================
# User Serializer (간단한 사용자 정보)
# ============================================================================

class UserSimpleSerializer(serializers.ModelSerializer):
    """사용자 간단 정보 (공유 패스 등에서 사용)"""
    
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'emoji', 'grade']
        read_only_fields = fields


# ============================================================================
# School & Group Serializers
# ============================================================================

class SchoolSerializer(serializers.ModelSerializer):
    """학교 시리얼라이저"""
    
    operator_name = serializers.CharField(source='operator.name', read_only=True)
    operator_emoji = serializers.CharField(source='operator.emoji', read_only=True)
    
    class Meta:
        model = School
        fields = [
            'id', 'name', 'code', 'operator', 'operator_name', 'operator_emoji',
            'grades', 'member_count', 'description', 'region', 'school_type',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'code', 'member_count', 'created_at', 'updated_at']


class GroupSerializer(serializers.ModelSerializer):
    """그룹 시리얼라이저 (apps.community.models.Group)"""
    
    creator_name = serializers.CharField(source='creator.name', read_only=True)
    creator_emoji = serializers.CharField(source='creator.emoji', read_only=True)
    
    class Meta:
        model = Group
        fields = [
            'id', 'name', 'emoji', 'description',
            'creator', 'creator_name', 'creator_emoji',
            'invite_code', 'member_count', 'max_members', 'category', 'mode', 'tags',
            'is_public',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'creator', 'invite_code', 'member_count',
            'created_at', 'updated_at'
        ]
    
    def validate_max_members(self, value):
        if value < 2 or value > 200:
            raise serializers.ValidationError('최대 인원은 2~200 사이로 설정해 주세요.')
        return value
    
    def validate_tags(self, value):
        if value is None:
            return []
        if not isinstance(value, list):
            raise serializers.ValidationError('태그는 배열이어야 합니다.')
        cleaned = [str(t).strip() for t in value if str(t).strip()]
        if len(cleaned) > 20:
            raise serializers.ValidationError('태그는 최대 20개까지 입력할 수 있습니다.')
        return cleaned[:20]


class GroupMemberSerializer(serializers.ModelSerializer):
    """그룹 멤버 시리얼라이저"""
    
    user_name = serializers.CharField(source='user.name', read_only=True)
    user_emoji = serializers.CharField(source='user.emoji', read_only=True)
    user_grade = serializers.CharField(source='user.grade', read_only=True)
    
    class Meta:
        model = GroupMember
        fields = [
            'id', 'group', 'user', 'user_name', 'user_emoji', 'user_grade',
            'role', 'joined_at'
        ]
        read_only_fields = ['id', 'joined_at']


# ============================================================================
# Career Plan Serializers (중첩 구조)
# ============================================================================

class ItemLinkSerializer(serializers.ModelSerializer):
    """활동 참고 링크 시리얼라이저"""
    
    class Meta:
        model = ItemLink
        fields = ['id', 'title', 'url', 'kind', 'sort_order']
        read_only_fields = []
        extra_kwargs = {'id': {'read_only': False, 'required': False}}


class SubItemSerializer(serializers.ModelSerializer):
    """하위 실행 항목 시리얼라이저"""
    
    class Meta:
        model = SubItem
        fields = ['id', 'title', 'is_done', 'url', 'description', 'sort_order']
        read_only_fields = []
        extra_kwargs = {'id': {'read_only': False, 'required': False}}


class PlanItemSerializer(serializers.ModelSerializer):
    """활동 항목 시리얼라이저"""
    
    sub_items = SubItemSerializer(many=True, read_only=True)
    links = ItemLinkSerializer(many=True, read_only=True)
    
    class Meta:
        model = PlanItem
        fields = [
            'id', 'type', 'title', 'months', 'difficulty',
            'cost', 'organizer', 'url', 'description',
            'category_tags', 'activity_subtype', 'sort_order',
            'is_done',
            'sub_items', 'links'
        ]
        read_only_fields = ['id']


class PlanItemCreateSerializer(serializers.ModelSerializer):
    """활동 항목 생성 시리얼라이저 (하위 항목·링크 포함)"""

    sub_items = SubItemSerializer(many=True, required=False)
    links = ItemLinkSerializer(many=True, required=False)
    
    class Meta:
        model = PlanItem
        fields = [
            'id', 'plan_year', 'goal_group', 'type', 'title', 'months', 'difficulty',
            'cost', 'organizer', 'url', 'description',
            'category_tags', 'activity_subtype', 'sort_order',
            'is_done',
            'sub_items', 'links'
        ]
        read_only_fields = ['plan_year', 'goal_group']
        extra_kwargs = {'id': {'read_only': False, 'required': False}}
    
    def create(self, validated_data):
        sub_items_data = validated_data.pop('sub_items', [])
        links_data = validated_data.pop('links', [])
        
        plan_item = PlanItem.objects.create(**validated_data)
        
        # 하위 항목 생성
        for sub_item_data in sub_items_data:
            SubItem.objects.create(plan_item=plan_item, **sub_item_data)
        
        # 링크 생성
        for link_data in links_data:
            ItemLink.objects.create(plan_item=plan_item, **link_data)
        
        return plan_item
    
    def update(self, instance, validated_data):
        sub_items_data = validated_data.pop('sub_items', None)
        links_data = validated_data.pop('links', None)
        
        # 기본 필드 업데이트
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # 하위 항목 업데이트 (기존 삭제 후 재생성)
        if sub_items_data is not None:
            instance.sub_items.all().delete()
            for sub_item_data in sub_items_data:
                SubItem.objects.create(plan_item=instance, **sub_item_data)
        
        # 링크 업데이트 (기존 삭제 후 재생성)
        if links_data is not None:
            instance.links.all().delete()
            for link_data in links_data:
                ItemLink.objects.create(plan_item=instance, **link_data)
        
        return instance


class GoalGroupSerializer(serializers.ModelSerializer):
    """목표 그룹 시리얼라이저"""
    
    items = PlanItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = GoalGroup
        fields = ['id', 'goal', 'semester_id', 'sort_order', 'items']
        read_only_fields = ['id']


class GoalGroupCreateSerializer(serializers.ModelSerializer):
    """목표 그룹 생성 시리얼라이저 (활동 항목 포함)"""

    items = PlanItemCreateSerializer(many=True, required=False)
    
    class Meta:
        model = GoalGroup
        fields = ['id', 'plan_year', 'goal', 'semester_id', 'sort_order', 'items']
        read_only_fields = ['plan_year']
        extra_kwargs = {'id': {'read_only': False, 'required': False}}
    
    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        
        goal_group = GoalGroup.objects.create(**validated_data)
        
        # 활동 항목 생성 (plan_year 는 모델 필수 — 부모 학년에서 설정)
        for item_data in items_data:
            sub_items_data = item_data.pop('sub_items', [])
            links_data = item_data.pop('links', [])
            item_data.pop('plan_year', None)
            item_data.pop('goal_group', None)

            plan_item = PlanItem.objects.create(
                plan_year=goal_group.plan_year,
                goal_group=goal_group,
                **item_data
            )
            
            # 하위 항목 생성
            for sub_item_data in sub_items_data:
                SubItem.objects.create(plan_item=plan_item, **sub_item_data)
            
            # 링크 생성
            for link_data in links_data:
                ItemLink.objects.create(plan_item=plan_item, **link_data)
        
        return goal_group


class PlanYearSerializer(serializers.ModelSerializer):
    """학년별 계획 시리얼라이저"""
    
    goal_groups = GoalGroupSerializer(many=True, read_only=True)
    items = PlanItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = PlanYear
        fields = [
            'id', 'grade_id', 'grade_label', 'semester', 'sort_order',
            'goal_groups', 'items'
        ]
        read_only_fields = ['id']


class PlanYearCreateSerializer(serializers.ModelSerializer):
    """학년별 계획 생성 시리얼라이저 (목표 그룹·활동 항목 포함)"""

    goal_groups = GoalGroupCreateSerializer(many=True, required=False)
    items = PlanItemCreateSerializer(many=True, required=False)
    
    class Meta:
        model = PlanYear
        fields = [
            'id', 'career_plan', 'grade_id', 'grade_label', 'semester', 'sort_order',
            'goal_groups', 'items'
        ]
        read_only_fields = ['career_plan']
        extra_kwargs = {'id': {'read_only': False, 'required': False}}
    
    def create(self, validated_data):
        goal_groups_data = validated_data.pop('goal_groups', [])
        items_data = validated_data.pop('items', [])
        
        plan_year = PlanYear.objects.create(**validated_data)
        
        # 목표 그룹 생성
        for goal_group_data in goal_groups_data:
            goal_items_data = goal_group_data.pop('items', [])
            goal_group_data.pop('plan_year', None)
            
            goal_group = GoalGroup.objects.create(
                plan_year=plan_year,
                **goal_group_data
            )
            
            # 목표 그룹 내 활동 항목 생성
            for item_data in goal_items_data:
                sub_items_data = item_data.pop('sub_items', [])
                links_data = item_data.pop('links', [])
                item_data.pop('plan_year', None)
                item_data.pop('goal_group', None)
                
                plan_item = PlanItem.objects.create(
                    plan_year=plan_year,
                    goal_group=goal_group,
                    **item_data
                )
                
                for sub_item_data in sub_items_data:
                    SubItem.objects.create(plan_item=plan_item, **sub_item_data)
                
                for link_data in links_data:
                    ItemLink.objects.create(plan_item=plan_item, **link_data)
        
        # 독립 활동 항목 생성 (목표 그룹 없음)
        for item_data in items_data:
            sub_items_data = item_data.pop('sub_items', [])
            links_data = item_data.pop('links', [])
            item_data.pop('plan_year', None)
            item_data.pop('goal_group', None)
            
            plan_item = PlanItem.objects.create(
                plan_year=plan_year,
                **item_data
            )
            
            for sub_item_data in sub_items_data:
                SubItem.objects.create(plan_item=plan_item, **sub_item_data)
            
            for link_data in links_data:
                ItemLink.objects.create(plan_item=plan_item, **link_data)
        
        return plan_year


class CareerPlanListSerializer(serializers.ModelSerializer):
    """커리어 패스 목록 시리얼라이저 (요약 정보)"""
    
    user_name = serializers.CharField(source='user.name', read_only=True)
    year_count = serializers.IntegerField(read_only=True)
    item_count = serializers.IntegerField(read_only=True)
    
    class Meta:
        model = CareerPlan
        fields = [
            'id', 'user', 'user_name', 'title', 'description',
            'job_id', 'job_name', 'job_emoji',
            'star_id', 'star_name', 'star_emoji', 'star_color',
            'is_template', 'template_category',
            'year_count', 'item_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'year_count', 'item_count', 'created_at', 'updated_at']


class CareerPlanDetailSerializer(serializers.ModelSerializer):
    """커리어 패스 상세 시리얼라이저 (전체 중첩 구조)"""
    
    user = UserSimpleSerializer(read_only=True)
    years = PlanYearSerializer(many=True, read_only=True)
    
    class Meta:
        model = CareerPlan
        fields = [
            'id', 'user', 'title', 'description',
            'job_id', 'job_name', 'job_emoji',
            'star_id', 'star_name', 'star_emoji', 'star_color',
            'is_template', 'template_category',
            'years',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class CareerPlanCreateSerializer(serializers.ModelSerializer):
    """커리어 패스 생성 시리얼라이저 (전체 중첩 구조 포함)"""
    
    years = PlanYearCreateSerializer(many=True, required=False)
    
    class Meta:
        model = CareerPlan
        fields = [
            'id', 'title', 'description',
            'job_id', 'job_name', 'job_emoji',
            'star_id', 'star_name', 'star_emoji', 'star_color',
            'is_template', 'template_category',
            'years'
        ]
        read_only_fields = ['id']
    
    def create(self, validated_data):
        years_data = validated_data.pop('years', [])
        
        # 현재 로그인한 사용자를 소유자로 설정
        user = self.context['request'].user
        career_plan = CareerPlan.objects.create(user=user, **validated_data)
        
        # 학년별 계획 생성
        for year_data in years_data:
            goal_groups_data = year_data.pop('goal_groups', [])
            items_data = year_data.pop('items', [])
            year_data.pop('career_plan', None)
            
            plan_year = PlanYear.objects.create(
                career_plan=career_plan,
                **year_data
            )
            
            # 목표 그룹 생성
            for goal_group_data in goal_groups_data:
                goal_items_data = goal_group_data.pop('items', [])
                goal_group_data.pop('plan_year', None)
                
                goal_group = GoalGroup.objects.create(
                    plan_year=plan_year,
                    **goal_group_data
                )
                
                # 목표 그룹 내 활동 항목 생성
                for item_data in goal_items_data:
                    sub_items_data = item_data.pop('sub_items', [])
                    links_data = item_data.pop('links', [])
                    item_data.pop('plan_year', None)
                    item_data.pop('goal_group', None)
                    
                    plan_item = PlanItem.objects.create(
                        plan_year=plan_year,
                        goal_group=goal_group,
                        **item_data
                    )
                    
                    for sub_item_data in sub_items_data:
                        SubItem.objects.create(plan_item=plan_item, **sub_item_data)
                    
                    for link_data in links_data:
                        ItemLink.objects.create(plan_item=plan_item, **link_data)
            
            # 독립 활동 항목 생성
            for item_data in items_data:
                sub_items_data = item_data.pop('sub_items', [])
                links_data = item_data.pop('links', [])
                item_data.pop('plan_year', None)
                item_data.pop('goal_group', None)
                
                plan_item = PlanItem.objects.create(
                    plan_year=plan_year,
                    **item_data
                )
                
                for sub_item_data in sub_items_data:
                    SubItem.objects.create(plan_item=plan_item, **sub_item_data)
                
                for link_data in links_data:
                    ItemLink.objects.create(plan_item=plan_item, **link_data)
        
        return career_plan

    @transaction.atomic
    def update(self, instance, validated_data):
        """학년·목표·활동은 ID 기준으로 갱신(동일 행 유지). years 미전달 시 구조는 유지."""
        years_data = validated_data.pop('years', None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if years_data is not None:
            sync_career_plan_years_from_payload(instance, years_data)

        return instance


# ============================================================================
# Shared Plan Serializers
# ============================================================================

class SharedPlanCommentSerializer(serializers.ModelSerializer):
    """공유 패스 댓글"""

    author = UserSimpleSerializer(read_only=True)

    class Meta:
        model = SharedPlanComment
        fields = ['id', 'author', 'content', 'parent', 'created_at']
        read_only_fields = ['id', 'author', 'created_at']


class SharedPlanCommentCreateSerializer(serializers.ModelSerializer):
    """댓글 작성 (답글 시 parent UUID)"""

    content = serializers.CharField(min_length=1, max_length=8000)

    class Meta:
        model = SharedPlanComment
        fields = ['content', 'parent']
        extra_kwargs = {'parent': {'required': False, 'allow_null': True}}

    def validate_parent(self, value):
        if value is None:
            return value
        shared_plan = self.context['shared_plan']
        if value.shared_plan_id != shared_plan.id:
            raise serializers.ValidationError('이 공유 패스의 댓글이 아닙니다.')
        return value

    def create(self, validated_data):
        validated_data['author'] = self.context['request'].user
        validated_data['shared_plan'] = self.context['shared_plan']
        return super().create(validated_data)


class SharedPlanListSerializer(serializers.ModelSerializer):
    """공유 패스 목록 시리얼라이저 (요약 정보)"""
    
    user = UserSimpleSerializer(read_only=True)
    career_plan_title = serializers.CharField(source='career_plan.title', read_only=True)
    job_name = serializers.CharField(source='career_plan.job_name', read_only=True)
    job_emoji = serializers.CharField(source='career_plan.job_emoji', read_only=True)
    star_name = serializers.CharField(source='career_plan.star_name', read_only=True)
    star_color = serializers.CharField(source='career_plan.star_color', read_only=True)
    group_ids = serializers.SerializerMethodField()
    
    class Meta:
        model = SharedPlan
        fields = [
            'id', 'career_plan', 'user', 'career_plan_title',
            'job_name', 'job_emoji', 'star_name', 'star_color',
            'share_type', 'description', 'tags', 'group_ids',
            'like_count', 'bookmark_count', 'view_count', 'comment_count', 'report_count',
            'shared_at', 'updated_at', 'is_hidden'
        ]
        read_only_fields = [
            'id', 'like_count', 'bookmark_count', 'view_count', 'comment_count', 'report_count',
            'shared_at', 'updated_at'
        ]
    
    def get_group_ids(self, obj):
        return [str(link.group_id) for link in obj.group_links.all()]


class SharedPlanDetailSerializer(serializers.ModelSerializer):
    """공유 패스 상세 시리얼라이저 (전체 커리어 패스 포함)"""
    
    user = UserSimpleSerializer(read_only=True)
    career_plan = CareerPlanDetailSerializer(read_only=True)
    school = SchoolSerializer(read_only=True)
    groups = serializers.SerializerMethodField()
    comments = SharedPlanCommentSerializer(many=True, read_only=True, source='plan_comments')
    
    class Meta:
        model = SharedPlan
        fields = [
            'id', 'career_plan', 'user', 'school', 'groups',
            'share_type', 'description', 'tags',
            'like_count', 'bookmark_count', 'view_count', 'comment_count', 'report_count',
            'shared_at', 'updated_at', 'is_hidden',
            'comments',
        ]
        read_only_fields = [
            'id', 'like_count', 'bookmark_count', 'view_count', 'comment_count', 'report_count',
            'shared_at', 'updated_at'
        ]
    
    def get_groups(self, obj):
        """연결된 그룹 목록"""
        group_links = obj.group_links.select_related('group').all()
        return [
            {
                'id': str(link.group.id),
                'name': link.group.name,
                'emoji': link.group.emoji
            }
            for link in group_links
        ]


class SharedPlanCreateSerializer(serializers.ModelSerializer):
    """공유 패스 생성 시리얼라이저"""
    
    group_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        write_only=True,
        help_text='그룹 공유 시 그룹 ID 목록'
    )
    
    class Meta:
        model = SharedPlan
        fields = [
            'id', 'career_plan', 'school', 'share_type', 'description', 'tags',
            'group_ids'
        ]
        read_only_fields = ['id']
    
    @transaction.atomic
    def create(self, validated_data):
        group_ids = validated_data.pop('group_ids', [])
        user = self.context['request'].user
        career_plan = validated_data.pop('career_plan')

        if getattr(career_plan, 'user_id', None) != user.id:
            raise serializers.ValidationError(
                {'career_plan': '본인의 커리어 패스만 공유할 수 있습니다.'}
            )

        defaults = {**validated_data, 'user': user}
        shared_plan, _created = SharedPlan.objects.update_or_create(
            career_plan=career_plan,
            defaults=defaults,
        )

        shared_plan.group_links.all().delete()
        for group_id in group_ids:
            try:
                group = Group.objects.get(id=group_id)
                SharedPlanGroup.objects.create(shared_plan=shared_plan, group=group)
            except Group.DoesNotExist:
                pass

        return shared_plan
    
    @transaction.atomic
    def update(self, instance, validated_data):
        group_ids = validated_data.pop('group_ids', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if group_ids is not None:
            instance.group_links.all().delete()
            for group_id in group_ids:
                try:
                    group = Group.objects.get(id=group_id)
                    SharedPlanGroup.objects.create(shared_plan=instance, group=group)
                except Group.DoesNotExist:
                    pass
        
        return instance
