"""
커리어 실행(로드맵) 관리자 — 활동 → 주차 TODO · 마일스톤 통합 보기.
career_path.admin_career_overview_html 와 동일한 용도(변경 폼 상단 요약).
"""

from django.db.models import Prefetch
from django.urls import reverse
from django.utils.html import escape, format_html
from django.utils.safestring import mark_safe

from .models import Roadmap, RoadmapItem, RoadmapMilestone, RoadmapTodo

_TREE_STYLE = """
.rm-admin-tree { font-size: 13px; line-height: 1.5; max-width: 1000px; }
.rm-admin-tree .rm-tier-block {
  border: 1px solid #c5d4de; border-radius: 6px; margin: 0.65em 0; padding: 0.35em 0.5em;
  background: #f7fafc;
}
.rm-admin-tree .rm-item-sum { cursor: pointer; font-weight: 700; color: #174b63; list-style: none; }
.rm-admin-tree .rm-item-sum::-webkit-details-marker { display: none; }
.rm-admin-tree .rm-item-body { margin: 0.5em 0 0.15em 0.25em; padding-left: 0.5em;
  border-left: 2px solid #8ab4c7; }
.rm-admin-tree ul.rm-todo-list { list-style: none; margin: 0.25em 0 0 0; padding-left: 0; }
.rm-admin-tree li.rm-todo-node { font-size: 12px; color: #475569; margin: 0.15em 0; }
.rm-admin-tree .rm-todo-done { color: #0d9488; font-weight: bold; }
.rm-admin-tree .rm-item-meta { color: #64748b; font-size: 11px; margin-left: 0.35em; }
.rm-admin-tree .rm-mstone-block {
  margin: 0.45em 0; padding: 0.25em 0.4em; background: #fff; border-radius: 4px;
  border: 1px solid #e2e8f0;
}
.rm-admin-tree .rm-mstone-sum { cursor: pointer; font-weight: 600; color: #334155; list-style: none; font-size: 12.5px; }
.rm-admin-tree .rm-mstone-sum::-webkit-details-marker { display: none; }
.rm-admin-tree .rm-mstone-body { margin: 0.35em 0 0 0.35em; color: #64748b; font-size: 12px; }
.rm-admin-tree .rm-id { color: #64748b; font-weight: normal; font-size: 11px; }
.rm-admin-tree .rm-empty { color: #94a3b8; font-style: italic; margin: 0.25em 0; font-size: 12px; }
.rm-admin-tree h3.rm-ms-head { font-size: 0.95em; margin: 0.75em 0 0.35em 0; color: #334155; }
"""


def _todos_ul(item: RoadmapItem) -> str:
    todos = list(item.todos.all())
    if not todos:
        return str(format_html('<p class="rm-empty">주차 TODO 없음</p>'))
    lis = []
    for t in todos:
        mark = '✓' if t.is_done else '○'
        cls = 'rm-todo-done' if t.is_done else ''
        lis.append(
            format_html(
                '<li class="rm-todo-node"><span class="{}">{}</span> {} '
                '<span class="rm-item-meta">({})</span></li>',
                cls,
                mark,
                escape(t.title),
                escape(t.week_label or ''),
            )
        )
    return str(
        format_html(
            '<ul class="rm-todo-list">{}</ul>',
            mark_safe(''.join(str(x) for x in lis)),
        )
    )


def _item_details_html(roadmap_item: RoadmapItem) -> str:
    url = reverse('admin:career_plan_roadmapitem_change', args=[roadmap_item.pk])
    meta = format_html(
        '<span class="rm-item-meta">{} · 난이도 {}</span>',
        escape(roadmap_item.get_type_display()),
        roadmap_item.difficulty,
    )
    body = mark_safe(_todos_ul(roadmap_item))
    return str(
        format_html(
            '<details open class="rm-tier-block">'
            '<summary class="rm-item-sum">'
            '<a href="{}">{}</a>{}'
            '</summary>'
            '<div class="rm-item-body">{}</div>'
            '</details>',
            url,
            escape(roadmap_item.title),
            meta,
            body,
        )
    )


def _milestone_details_html(ms: RoadmapMilestone) -> str:
    url = reverse('admin:career_plan_roadmapmilestone_change', args=[ms.pk])
    raw = ms.description or ''
    desc = raw[:280] + ('…' if len(raw) > 280 else '')
    body_html = escape(desc) if desc else format_html('<span class="rm-empty">설명 없음</span>')
    return str(
        format_html(
            '<details class="rm-mstone-block">'
            '<summary class="rm-mstone-sum">'
            '<a href="{}">{}</a> <span class="rm-id">{}</span>'
            '</summary>'
            '<div class="rm-mstone-body">{}</div>'
            '</details>',
            url,
            escape(ms.title),
            escape(ms.month_week_label or ''),
            body_html,
        )
    )


def build_roadmap_overview_html(roadmap: Roadmap) -> str:
    """로드맵 변경 화면용 활동·TODO·마일스톤 요약 HTML."""
    todo_qs = RoadmapTodo.objects.order_by('week_number', 'sort_order', 'created_at')
    rm = (
        Roadmap.objects.filter(pk=roadmap.pk)
        .prefetch_related(
            Prefetch(
                'items',
                queryset=RoadmapItem.objects.order_by('sort_order', 'created_at').prefetch_related(
                    Prefetch('todos', queryset=todo_qs)
                ),
            ),
            Prefetch(
                'milestones',
                queryset=RoadmapMilestone.objects.order_by('sort_order', 'created_at'),
            ),
        )
        .first()
    )
    if not rm:
        return ''

    head = format_html(
        '<p style="color:#666;font-size:12px;margin:0 0 0.75em 0;">'
        '▸ 활동 제목을 클릭하면 해당 활동·TODO를 편집합니다. 마일스톤은 접어서 볼 수 있습니다.'
        '</p>'
    )

    items = list(rm.items.all())
    item_blocks = []
    for it in items:
        item_blocks.append(_item_details_html(it))

    milestones = list(rm.milestones.all())
    ms_blocks = []
    for ms in milestones:
        ms_blocks.append(_milestone_details_html(ms))

    if not items and not milestones:
        tree = format_html(
            '<div class="rm-admin-tree"><style>{}</style>'
            '<p class="rm-empty">등록된 활동·마일스톤이 없습니다.</p></div>',
            mark_safe(_TREE_STYLE),
        )
        return mark_safe(str(head) + str(tree))

    chunks = [
        str(head),
        str(format_html('<div class="rm-admin-tree"><style>{}</style>', mark_safe(_TREE_STYLE))),
    ]
    if item_blocks:
        chunks.append('<h3 class="rm-ms-head">활동 · 주차 TODO</h3>')
        chunks.extend(item_blocks)
    if ms_blocks:
        chunks.append('<h3 class="rm-ms-head">마일스톤</h3>')
        chunks.extend(ms_blocks)
    chunks.append('</div>')
    return mark_safe(''.join(chunks))
