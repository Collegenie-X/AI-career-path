"""
커리어 패스 관리자 — 학년 → 목표 → 활동 → 하위 활동 상하 트리 표시.
"""

from django.db.models import Prefetch
from django.urls import reverse
from django.utils.html import escape, format_html
from django.utils.safestring import mark_safe

from .models import CareerPlan, GoalGroup, PlanItem, PlanYear, SubItem

_TREE_STYLE = """
.cp-admin-tree { font-size: 13px; line-height: 1.5; max-width: 1000px; }
.cp-admin-tree > .cp-tree-root { margin: 0; padding: 0; list-style: none; }
.cp-admin-tree .cp-tier-grade {
  border: 1px solid #c5d4de; border-radius: 6px; margin: 0.65em 0; padding: 0.35em 0.5em;
  background: #f7fafc;
}
.cp-admin-tree .cp-grade-sum { cursor: pointer; font-weight: 700; color: #174b63; list-style: none; }
.cp-admin-tree .cp-grade-sum::-webkit-details-marker { display: none; }
.cp-admin-tree .cp-grade-body { margin: 0.5em 0 0.15em 0.25em; padding-left: 0.5em;
  border-left: 2px solid #8ab4c7; }
.cp-admin-tree .cp-tier-goal {
  margin: 0.45em 0; padding: 0.25em 0.4em; background: #fff; border-radius: 4px;
  border: 1px solid #e2e8f0;
}
.cp-admin-tree .cp-goal-sum { cursor: pointer; font-weight: 600; color: #334155; list-style: none; font-size: 12.5px; }
.cp-admin-tree .cp-goal-sum::-webkit-details-marker { display: none; }
.cp-admin-tree .cp-goal-body { margin: 0.4em 0 0 0.35em; padding-left: 0.65em;
  border-left: 2px dashed #cbd5e1; }
.cp-admin-tree ul.cp-item-list { list-style: none; margin: 0.25em 0 0 0; padding-left: 0; }
.cp-admin-tree li.cp-item-node { margin: 0.35em 0; padding-left: 0.5em;
  border-left: 2px solid #94a3b8; }
.cp-admin-tree .cp-item-line { display: block; }
.cp-admin-tree .cp-item-line a { font-weight: 600; color: #1e40af; }
.cp-admin-tree .cp-item-meta { color: #64748b; font-size: 11px; margin-left: 0.35em; }
.cp-admin-tree ul.cp-sub-list { list-style: none; margin: 0.2em 0 0.15em 0.75em; padding-left: 0.65em;
  border-left: 1px dotted #94a3b8; }
.cp-admin-tree li.cp-sub-node { font-size: 12px; color: #475569; margin: 0.15em 0; }
.cp-admin-tree .cp-sub-done { display: inline-block; width: 1em; color: #0d9488; font-weight: bold; }
.cp-admin-tree .cp-id { color: #64748b; font-weight: normal; font-size: 11px; }
.cp-admin-tree .cp-empty { color: #94a3b8; font-style: italic; margin: 0.25em 0; font-size: 12px; }
"""


def _plan_items_with_subs_queryset():
    return PlanItem.objects.order_by('sort_order', 'created_at').prefetch_related(
        Prefetch(
            'sub_items',
            queryset=SubItem.objects.order_by('sort_order', 'created_at'),
        )
    )


def _sub_items_ul(plan_item: PlanItem) -> str:
    subs = list(plan_item.sub_items.all())
    if not subs:
        return ''
    lis = []
    for s in subs:
        mark = '✓' if s.is_done else '○'
        lis.append(
            format_html(
                '<li class="cp-sub-node"><span class="cp-sub-done">{}</span> {}</li>',
                mark,
                escape(s.title),
            )
        )
    return str(
        format_html(
            '<ul class="cp-sub-list">{}</ul>',
            mark_safe(''.join(str(x) for x in lis)),
        )
    )


def _plan_item_li(plan_item: PlanItem) -> str:
    url = reverse('admin:career_path_planitem_change', args=[plan_item.pk])
    meta = format_html(
        '<span class="cp-item-meta">{} · 월 {}</span>',
        escape(plan_item.get_type_display()),
        escape(str(plan_item.months)[:36]),
    )
    sub_html = _sub_items_ul(plan_item)
    block = format_html(
        '<li class="cp-item-node">'
        '<span class="cp-item-line">'
        '<a href="{}">{}</a>{}'
        '</span>{}'
        '</li>',
        url,
        escape(plan_item.title),
        meta,
        mark_safe(sub_html),
    )
    return str(block)


def _items_block_under_goal(items: list) -> str:
    if not items:
        return str(format_html('<p class="cp-empty">활동 없음</p>'))
    inner = ''.join(_plan_item_li(it) for it in items)
    return str(format_html('<ul class="cp-item-list">{}</ul>', mark_safe(inner)))


def _goal_details_html(goal_text: str, items: list) -> str:
    preview = goal_text if len(goal_text) <= 400 else goal_text[:397] + '…'
    body = _items_block_under_goal(items)
    return str(
        format_html(
            '<details open class="cp-tier-goal">'
            '<summary class="cp-goal-sum"><span class="cp-node-goal">{}</span></summary>'
            '<div class="cp-goal-body">{}</div>'
            '</details>',
            escape(preview),
            mark_safe(body),
        )
    )


def _year_details_html(plan_year: PlanYear) -> str:
    y_url = reverse('admin:career_path_planyear_change', args=[plan_year.pk])
    sections = []
    for gg in plan_year.goal_groups.all():
        sections.append(_goal_details_html(gg.goal, list(gg.items.all())))
    root = list(plan_year.items.all())
    if root:
        sections.append(
            _goal_details_html('【학년 직속】 (목표 그룹 미지정)', root)
        )
    if not sections:
        sections.append(str(format_html('<p class="cp-empty">목표·활동 없음</p>')))
    body_inner = mark_safe(''.join(sections))
    return str(
        format_html(
            '<details open class="cp-tier-grade">'
            '<summary class="cp-grade-sum">'
            '<a class="cp-node-grade" href="{}">{}</a> <span class="cp-id">({})</span>'
            '</summary>'
            '<div class="cp-grade-body">{}</div>'
            '</details>',
            y_url,
            escape(plan_year.grade_label),
            escape(plan_year.grade_id),
            body_inner,
        )
    )


def build_nested_career_plan_overview_html(career_plan: CareerPlan) -> str:
    """커리어 패스 변경 화면용 상하 트리 HTML."""
    item_qs = _plan_items_with_subs_queryset()
    plan = (
        CareerPlan.objects.filter(pk=career_plan.pk)
        .prefetch_related(
            Prefetch(
                'years',
                queryset=PlanYear.objects.order_by('sort_order', 'created_at').prefetch_related(
                    Prefetch(
                        'goal_groups',
                        queryset=GoalGroup.objects.order_by(
                            'sort_order', 'created_at'
                        ).prefetch_related(
                            Prefetch('items', queryset=item_qs),
                        ),
                    ),
                    Prefetch(
                        'items',
                        queryset=item_qs.filter(goal_group__isnull=True),
                    ),
                ),
            )
        )
        .first()
    )
    if not plan:
        return ''

    head = format_html(
        '<p style="color:#666;font-size:12px;margin:0 0 0.75em 0;">'
        '▸ 학년·목표는 접어서 볼 수 있습니다. 활동 제목 → 상세에서 하위 활동·링크를 편집합니다.'
        '</p>'
    )

    years = list(plan.years.all())
    if not years:
        return mark_safe(
            str(head)
            + str(
                format_html(
                    '<div class="cp-admin-tree"><style>{}</style>'
                    '<p class="cp-empty">등록된 학년별 계획이 없습니다.</p></div>',
                    mark_safe(_TREE_STYLE),
                )
            )
        )

    year_lis = []
    for py in years:
        year_lis.append(
            format_html(
                '<li style="list-style:none;margin:0 0 0.35em 0;padding:0;">{}</li>',
                mark_safe(_year_details_html(py)),
            )
        )
    tree = format_html(
        '<div class="cp-admin-tree">'
        '<style>{}</style>'
        '<ul class="cp-tree-root">{}</ul>'
        '</div>',
        mark_safe(_TREE_STYLE),
        mark_safe(''.join(str(li) for li in year_lis)),
    )

    return mark_safe(str(head) + str(tree))
