"""
커리어 패스 PATCH 시 학년·목표·활동을 ID 기준으로 갱신합니다.
전체 삭제 후 재생성하지 않아 동일 패스에 대한 불필요한 행 난립을 줄입니다.

중첩 필드(goal_groups, items, sub_items, links)가 페이로드에 없으면
해당 구간은 건드리지 않습니다(부분 갱신 호환).
"""

from __future__ import annotations

import copy
import uuid
from typing import Any

from django.db import transaction

from .models import CareerPlan, GoalGroup, ItemLink, PlanItem, PlanYear, SubItem


def _to_uuid(value: Any) -> uuid.UUID | None:
    if value is None:
        return None
    if isinstance(value, uuid.UUID):
        return value
    try:
        return uuid.UUID(str(value))
    except (ValueError, TypeError, AttributeError):
        return None


def _scalar_plan_year_fields(data: dict) -> dict:
    allowed = {'grade_id', 'grade_label', 'semester', 'sort_order'}
    return {k: data[k] for k in allowed if k in data}


def _scalar_goal_group_fields(data: dict) -> dict:
    allowed = {'goal', 'semester_id', 'sort_order'}
    return {k: data[k] for k in allowed if k in data}


def _scalar_plan_item_fields(data: dict) -> dict:
    allowed = {
        'type', 'title', 'months', 'difficulty', 'cost', 'organizer', 'url',
        'description', 'category_tags', 'activity_subtype', 'sort_order',
    }
    return {k: data[k] for k in allowed if k in data}


def _scalar_sub_item_fields(data: dict) -> dict:
    allowed = {'title', 'is_done', 'url', 'description', 'sort_order'}
    return {k: data[k] for k in allowed if k in data}


def _scalar_link_fields(data: dict) -> dict:
    allowed = {'title', 'url', 'kind', 'sort_order'}
    return {k: data[k] for k in allowed if k in data}


def _sync_sub_items(plan_item: PlanItem, payload: list[dict]) -> None:
    incoming_ids: list[uuid.UUID] = []
    for row in payload:
        uid = _to_uuid(row.get('id'))
        if uid:
            incoming_ids.append(uid)
    plan_item.sub_items.exclude(id__in=incoming_ids).delete()
    for row in payload:
        row = copy.copy(row)
        sid = _to_uuid(row.pop('id', None))
        fields = _scalar_sub_item_fields(row)
        if sid and SubItem.objects.filter(id=sid, plan_item=plan_item).exists():
            sub = SubItem.objects.get(pk=sid)
            for k, v in fields.items():
                setattr(sub, k, v)
            sub.save()
        else:
            SubItem.objects.create(plan_item=plan_item, **fields)


def _sync_item_links(plan_item: PlanItem, payload: list[dict]) -> None:
    incoming_ids: list[uuid.UUID] = []
    for row in payload:
        uid = _to_uuid(row.get('id'))
        if uid:
            incoming_ids.append(uid)
    plan_item.links.exclude(id__in=incoming_ids).delete()
    for row in payload:
        row = copy.copy(row)
        lid = _to_uuid(row.pop('id', None))
        fields = _scalar_link_fields(row)
        if lid and ItemLink.objects.filter(id=lid, plan_item=plan_item).exists():
            link = ItemLink.objects.get(pk=lid)
            for k, v in fields.items():
                setattr(link, k, v)
            link.save()
        else:
            ItemLink.objects.create(plan_item=plan_item, **fields)


def _sync_plan_items(
    plan_year: PlanYear,
    goal_group: GoalGroup | None,
    items_payload: list[dict],
) -> None:
    qs = PlanItem.objects.filter(plan_year=plan_year, goal_group=goal_group)
    incoming_ids: list[uuid.UUID] = []
    for row in items_payload:
        uid = _to_uuid(row.get('id'))
        if uid:
            incoming_ids.append(uid)
    qs.exclude(id__in=incoming_ids).delete()

    for row in items_payload:
        row = copy.copy(row)
        sub_items_data = row.pop('sub_items', None)
        links_data = row.pop('links', None)
        row.pop('plan_year', None)
        row.pop('goal_group', None)
        iid = _to_uuid(row.pop('id', None))
        fields = _scalar_plan_item_fields(row)

        if iid and PlanItem.objects.filter(id=iid, plan_year=plan_year).exists():
            pi = PlanItem.objects.get(pk=iid)
            pi.goal_group = goal_group
            for k, v in fields.items():
                setattr(pi, k, v)
            pi.save()
        else:
            pi = PlanItem.objects.create(
                plan_year=plan_year,
                goal_group=goal_group,
                **fields,
            )
        if sub_items_data is not None:
            _sync_sub_items(pi, sub_items_data)
        if links_data is not None:
            _sync_item_links(pi, links_data)


def _sync_goal_groups(plan_year: PlanYear, groups_payload: list[dict]) -> None:
    incoming_ids: list[uuid.UUID] = []
    for row in groups_payload:
        uid = _to_uuid(row.get('id'))
        if uid:
            incoming_ids.append(uid)
    plan_year.goal_groups.exclude(id__in=incoming_ids).delete()

    for row in groups_payload:
        row = copy.copy(row)
        items_data = row.pop('items', None)
        row.pop('plan_year', None)
        gid = _to_uuid(row.pop('id', None))
        fields = _scalar_goal_group_fields(row)

        if gid and GoalGroup.objects.filter(id=gid, plan_year=plan_year).exists():
            gg = GoalGroup.objects.get(pk=gid)
            for k, v in fields.items():
                setattr(gg, k, v)
            gg.save()
        else:
            gg = GoalGroup.objects.create(plan_year=plan_year, **fields)
        if items_data is not None:
            _sync_plan_items(plan_year, gg, items_data)


def _sync_year_root_items(plan_year: PlanYear, items_payload: list[dict]) -> None:
    _sync_plan_items(plan_year, None, items_payload)


@transaction.atomic
def sync_career_plan_years_from_payload(career_plan: CareerPlan, years_payload: list[dict]) -> None:
    """
    years_payload: 검증된 학년 dict 목록. 페이로드에 id가 없는 학년은 신규 생성.
    목록에 없는 기존 학년은 삭제(CASCADE로 하위 포함).
    """
    incoming_year_ids: list[uuid.UUID] = []
    for row in years_payload:
        uid = _to_uuid(row.get('id'))
        if uid:
            incoming_year_ids.append(uid)
    career_plan.years.exclude(id__in=incoming_year_ids).delete()

    for row in years_payload:
        row = copy.copy(row)
        goal_groups_data = row.pop('goal_groups', None)
        items_data = row.pop('items', None)
        row.pop('career_plan', None)
        yid = _to_uuid(row.pop('id', None))
        fields = _scalar_plan_year_fields(row)

        if yid and PlanYear.objects.filter(id=yid, career_plan=career_plan).exists():
            py = PlanYear.objects.get(pk=yid)
            for k, v in fields.items():
                setattr(py, k, v)
            py.save()
        else:
            py = PlanYear.objects.create(career_plan=career_plan, **fields)

        if goal_groups_data is not None:
            _sync_goal_groups(py, goal_groups_data)
        if items_data is not None:
            _sync_year_root_items(py, items_data)
