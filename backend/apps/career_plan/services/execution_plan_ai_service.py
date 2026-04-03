"""
OpenAI 호출 및 실행계획 JSON 검증 (DreamMate 주간 WBS 생성).
"""

from __future__ import annotations

import json
import logging
from typing import Any

import requests
from django.conf import settings

logger = logging.getLogger(__name__)

# 프론트 plan_depth와 동기화 (ExecutionPlanAiDepthPicker)
PLAN_DEPTH_GUIDES: dict[str, str] = {
    "detailed": (
        "분량: 세부. 각 주차마다 goal(주간 목표)은 한 문장으로 측정 가능하게 쓰고, "
        "subTasks(하위 활동·실행 단계)는 반드시 주당 4~7개. 각 subTask는 동사로 시작하는 짧은 할 일. "
        "deliverable은 그 주에 낼 결과물·산출물. researchNoteOutline은 whatToDo/howToVerify/reflectionPrompts를 빠짐없이 채움."
    ),
    "brief": (
        "분량: 간략. 각 주차 goal은 명확한 한 줄. subTasks는 주당 2~5개(하위 활동). "
        "deliverable 한 줄. researchNoteOutline은 핵심만."
    ),
    "simple": (
        "분량: 간단. 각 주차 goal은 짧게. subTasks는 주당 1~3개(최소 필수 하위 활동). "
        "researchNoteOutline은 각 필드 최소 한 줄."
    ),
}

# 검증·보정 시 subTasks 최소 개수 (plan_depth)
MIN_SUBTASKS_BY_DEPTH: dict[str, int] = {
    "detailed": 4,
    "brief": 2,
    "simple": 1,
}

STUDENT_LEVEL_GUIDES: dict[str, str] = {
    "el": "초등: 하루 30~60분 단위로 쉬운 표현, 놀이·관찰 중심 활동을 섞습니다.",
    "ms_lower": "중 저학년: 과목 균형과 기본 습관(복습·수면)을 강조하고, 부담을 낮춥니다.",
    "ms_upper": "중 고학년: 내신·기초 실력과 탐구·활동의 연결을 명확히 합니다.",
    "hs_lower": "고 저학년: 선택 과목·진로 방향을 반영하고 성취도·활동을 균형 있게 배치합니다.",
    "hs_mid": "고 중간: 수능·학종 등 목표에 맞춰 주간 루틴과 점검 주기를 촘촘히 합니다.",
    "hs_upper": "고 고학년: 시험·제출 일정에 맞춰 마무리·모의·약점 보완을 우선합니다.",
    "univ": "대학·성인: 자기주도 학습, 포트폴리오·네트워킹·실무 역량을 주간 단위로 쪼갭니다.",
}


class ExecutionPlanAiError(Exception):
    """기본 오류"""


class ExecutionPlanAiConfigError(ExecutionPlanAiError):
    """API 키 미설정 등"""


class ExecutionPlanAiUpstreamError(ExecutionPlanAiError):
    """OpenAI HTTP 오류"""

    def __init__(
        self,
        message: str,
        *,
        http_status: int | None = None,
        openai_message: str | None = None,
    ):
        super().__init__(message)
        self.http_status = http_status
        self.openai_message = openai_message


class ExecutionPlanAiParseError(ExecutionPlanAiError):
    """JSON 파싱·스키마 오류"""


OPENAI_CHAT_COMPLETIONS_URL = "https://api.openai.com/v1/chat/completions"


def _parse_openai_error_body(res: requests.Response) -> str:
    """OpenAI 오류 JSON 의 error.message 또는 원문 일부."""
    text = (res.text or "")[:2000]
    try:
        data = res.json()
    except (ValueError, json.JSONDecodeError):
        return text or f"HTTP {res.status_code}"
    err = data.get("error")
    if isinstance(err, dict):
        msg = err.get("message") or err.get("code")
        if msg:
            return str(msg)
    if isinstance(err, str):
        return err
    return text or f"HTTP {res.status_code}"


def compute_expected_week_count(selected_months: list[int], weeks_per_month: int) -> int:
    n = len({m for m in selected_months if 1 <= m <= 12})
    if n == 0:
        return weeks_per_month
    count = n * weeks_per_month
    max_weeks = getattr(settings, "EXECUTION_PLAN_AI_MAX_WEEKS", 52)
    return max(1, min(count, max_weeks))


def _system_prompt() -> str:
    return (
        "당신은 한국 학생·청년의 주간 실행계획(WBS)을 설계하는 코치입니다.\n"
        "응답은 반드시 하나의 JSON 객체만 출력합니다. 마크다운, 코드펜스, 주석, JSON 바깥의 한글 설명을 쓰지 마세요.\n\n"
        "## 출력 스키마\n"
        "- schemaVersion: 정수 1\n"
        "- summary: 전체 초안을 3~6문장으로 요약 (한국어)\n"
        "- assumptions: 입력에서 가정한 점 문자열 배열 (비어 있어도 됨)\n"
        "- weeks: 배열. 길이는 요청의 expectedWeekCount와 정확히 같아야 함.\n\n"
        "## weeks[] 각 원소 (모든 주차에 필수)\n"
        "- month: 1~12. 반드시 입력에 주어진 selected_months 범위 안의 달만 사용.\n"
        "- weekIndexInMonth: 1~5 (해당 달의 몇 번째 주인지)\n"
        "- goal: 그 주의 '주간 목표' 한 줄. final_goal을 향해 진행되는 측정 가능한 문장.\n"
        "- subTasks: 문자열 배열. 위 goal을 달성하기 위한 '하위 활동·실행 단계'들. "
        "각 항목은 짧은 할 일(동사형). 주간 목표 없이 하위만 두지 말 것.\n"
        "- deliverable: 그 주에 완성·제출할 결과물·산출물 (없으면 빈 문자열 가능)\n"
        "- researchNoteOutline: 객체 {\n"
        '  "whatToDo": "이번 주에 실제로 할 일 요약",\n'
        '  "howToVerify": "완료 여부를 어떻게 확인할지",\n'
        '  "reflectionPrompts": ["회고 질문1", "회고 질문2"]\n'
        "  }\n\n"
        "## 계층 관계\n"
        "final_goal(입력) → 각 주의 goal이 이를 쪼개어 달성 → subTasks가 goal을 실행 가능한 단계로 분해.\n"
        "같은 주 안에서 goal과 subTasks가 논리적으로 연결되어야 합니다."
    )


def _user_payload_block(payload: dict[str, Any], expected_week_count: int, guidance: str) -> str:
    body = {
        "input": payload,
        "expectedWeekCount": expected_week_count,
        "executionPlanGuidance": guidance,
        "instructionsForModel": {
            "titleMeaning": (
                "title은 로드맵 전체 이름이 아니라, 지금 편집 중인 '한 활동'의 제목이다. "
                "이 활동에 맞춰 주간 목표·하위 활동을 생성할 것."
            ),
            "monthsRule": (
                "selected_months에 나열된 달에만 주차를 배분할 것. 다른 달은 사용하지 말 것."
            ),
            "weekStructure": (
                "매 주차마다 goal(주간 목표)과 subTasks(하위 실행 단계)를 모두 채울 것. "
                "subTasks는 체크리스트처럼 실행 가능한 문장으로."
            ),
        },
    }
    return json.dumps(body, ensure_ascii=False)


def resolve_execution_plan_guide(payload: dict[str, Any]) -> str:
    """plan_depth 중심. 레벨·카테고리는 비어 있으면 생략."""
    depth_key = (payload.get("plan_depth") or "brief").strip()
    parts: list[str] = [PLAN_DEPTH_GUIDES.get(depth_key, PLAN_DEPTH_GUIDES["brief"])]

    sl = (payload.get("student_level") or "").strip()
    if sl:
        parts.append(resolve_student_level_guide(sl))

    ll = (payload.get("level_label") or "").strip()
    if ll:
        parts.append(f"참고 수준 라벨: {ll}.")

    cat = (payload.get("category_id") or "").strip()
    if cat:
        parts.append(f"참고 분야 태그: {cat}.")

    return " ".join(parts)


def build_user_prompt(
    payload: dict[str, Any],
    expected_week_count: int,
    *,
    guidance: str = "",
) -> str:
    months = payload.get("selected_months") or []
    months_fmt = ", ".join(f"{int(m)}월" for m in months if isinstance(m, (int, float)) and 1 <= int(m) <= 12)
    fg = (payload.get("final_goal") or "").strip()
    title = (payload.get("title") or "").strip()
    constraints = (payload.get("constraints") or "").strip()
    prev = (payload.get("previous_summary") or "").strip()
    milestone_lines: list[str] = []
    for ms in payload.get("milestones") or []:
        if not isinstance(ms, dict):
            continue
        t = (ms.get("title") or "").strip()
        d = (ms.get("date_iso") or "").strip()
        if t or d:
            milestone_lines.append(f"- {t or '일정'}{(' / ' + d) if d else ''}")

    extra = [
        "## 모델에게 추가 지시",
        f"- 적용 월(스케줄 범위): {months_fmt or '(입력 없음)'}",
        f"- 활동 제목(title): {title or '(없음)'}",
        f"- 최종 목표(final_goal): {fg or '(없음)'}",
    ]
    if constraints:
        extra.append(f"- 제약·메모(constraints): {constraints}")
    if milestone_lines:
        extra.append("- 중요 일정(milestones):\n" + "\n".join(milestone_lines))
    if prev:
        extra.append(
            "- 직전 생성 요약(previous_summary) 톤·구성을 참고하되, 내용은 이번 입력에 맞출 것:\n"
            + prev[:1200]
        )
    extra.append(
        f"- 정확히 {expected_week_count}개의 weeks를 생성. 각 원소에 goal + subTasks + researchNoteOutline을 빠짐없이."
    )
    extra.append("")
    extra.append("## 입력 JSON")
    extra.append(_user_payload_block(payload, expected_week_count, guidance))

    return "\n".join(extra)


def call_openai_json(system: str, user: str) -> dict[str, Any]:
    api_key = getattr(settings, "OPENAI_API_KEY", "") or ""
    if not api_key.strip():
        raise ExecutionPlanAiConfigError("OPENAI_API_KEY is not configured")

    model = getattr(settings, "OPENAI_EXECUTION_PLAN_MODEL", "gpt-4o")
    timeout = getattr(settings, "OPENAI_EXECUTION_PLAN_TIMEOUT_SECONDS", 120)

    body = {
        "model": model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "temperature": 0.65,
        "response_format": {"type": "json_object"},
    }

    try:
        res = requests.post(
            OPENAI_CHAT_COMPLETIONS_URL,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json=body,
            timeout=timeout,
        )
    except requests.RequestException as exc:
        logger.exception("OpenAI request failed")
        raise ExecutionPlanAiUpstreamError(
            f"network: {exc}",
            http_status=None,
            openai_message=str(exc),
        ) from exc

    if res.status_code >= 400:
        openai_msg = _parse_openai_error_body(res)
        logger.warning("OpenAI HTTP %s: %s", res.status_code, openai_msg)
        raise ExecutionPlanAiUpstreamError(
            f"OpenAI HTTP {res.status_code}: {openai_msg[:300]}",
            http_status=res.status_code,
            openai_message=openai_msg,
        )

    try:
        data = res.json()
        content = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, ValueError, TypeError) as exc:
        raise ExecutionPlanAiParseError("Invalid OpenAI response shape") from exc

    if not isinstance(content, str):
        raise ExecutionPlanAiParseError("Empty content")

    try:
        parsed = json.loads(content)
    except json.JSONDecodeError as exc:
        raise ExecutionPlanAiParseError(str(exc)) from exc

    if not isinstance(parsed, dict):
        raise ExecutionPlanAiParseError("Root must be object")

    return parsed


def _min_subtasks_for_depth(plan_depth: str) -> int:
    return MIN_SUBTASKS_BY_DEPTH.get((plan_depth or "brief").strip(), MIN_SUBTASKS_BY_DEPTH["brief"])


def _pad_subtasks(
    sub_list: list[str],
    *,
    month: int,
    wi: int,
    minimum: int,
) -> list[str]:
    out = list(sub_list)
    n = 1
    while len(out) < minimum:
        out.append(f"{month}월 {wi}주차 하위 활동 {n}")
        n += 1
    return out[:12]


def validate_and_normalize_weeks(
    data: dict[str, Any],
    *,
    expected_week_count: int,
    selected_months: list[int],
    plan_depth: str = "brief",
) -> dict[str, Any]:
    weeks = data.get("weeks")
    if not isinstance(weeks, list):
        raise ExecutionPlanAiParseError("weeks must be array")

    months_set = {m for m in selected_months if 1 <= m <= 12}
    if not months_set:
        months_set = {3}

    min_sub = _min_subtasks_for_depth(plan_depth)

    normalized_weeks: list[dict[str, Any]] = []
    for idx, w in enumerate(weeks):
        if len(normalized_weeks) >= expected_week_count:
            break
        if not isinstance(w, dict):
            continue
        month = w.get("month")
        if not isinstance(month, int) or month < 1 or month > 12:
            month = sorted(months_set)[idx % len(months_set)] if months_set else 3
        if month not in months_set:
            month = min(months_set, key=lambda m: abs(m - month))

        wi = w.get("weekIndexInMonth")
        if not isinstance(wi, int) or wi < 1 or wi > 5:
            wi = (idx % 4) + 1

        goal = w.get("goal")
        goal_str = goal.strip() if isinstance(goal, str) else ""
        if not goal_str:
            goal_str = f"{month}월 {wi}주차 목표 정하기"

        deliverable = w.get("deliverable")
        del_str = deliverable.strip() if isinstance(deliverable, str) else ""

        rno = w.get("researchNoteOutline")
        if not isinstance(rno, dict):
            rno = {
                "whatToDo": goal_str,
                "howToVerify": "체크리스트로 확인",
                "reflectionPrompts": ["이번 주 잘한 점은?", "다음 주에 바꿀 점은?"],
            }

        subs = w.get("subTasks")
        sub_list: list[str] = []
        if isinstance(subs, list):
            for s in subs:
                if isinstance(s, str) and s.strip():
                    sub_list.append(s.strip())
        if len(sub_list) < 1:
            sub_list = [f"{month}월 {wi}주차 세부 실행 1", f"{month}월 {wi}주차 세부 실행 2"]
        sub_list = _pad_subtasks(sub_list, month=month, wi=wi, minimum=min_sub)

        normalized_weeks.append({
            "month": month,
            "weekIndexInMonth": wi,
            "goal": goal_str,
            "deliverable": del_str,
            "researchNoteOutline": rno,
            "subTasks": sub_list[:12],
        })

    while len(normalized_weeks) < expected_week_count:
        m = sorted(months_set)[len(normalized_weeks) % len(months_set)]
        wi = (len(normalized_weeks) % 4) + 1
        pad = _pad_subtasks(
            [f"{m}월 세부 1", f"{m}월 세부 2"],
            month=m,
            wi=wi,
            minimum=min_sub,
        )
        normalized_weeks.append({
            "month": m,
            "weekIndexInMonth": wi,
            "goal": f"{m}월 {wi}주차 목표 (보완 생성)",
            "deliverable": "",
            "researchNoteOutline": {
                "whatToDo": "계획 보완",
                "howToVerify": "기록 확인",
                "reflectionPrompts": ["한 줄 회고"],
            },
            "subTasks": pad[:12],
        })

    normalized_weeks = normalized_weeks[:expected_week_count]

    out = {
        "schemaVersion": int(data.get("schemaVersion", 1) or 1),
        "summary": str(data.get("summary") or "").strip() or "실행계획 초안",
        "assumptions": data.get("assumptions") if isinstance(data.get("assumptions"), list) else [],
        "weeks": normalized_weeks,
    }
    return out


def resolve_student_level_guide(student_level: str) -> str:
    key = (student_level or "").strip()
    return STUDENT_LEVEL_GUIDES.get(key, STUDENT_LEVEL_GUIDES.get("ms_lower", ""))


def generate_execution_plan(payload: dict[str, Any]) -> dict[str, Any]:
    selected = payload.get("selected_months") or []
    if not isinstance(selected, list):
        selected = []
    months = [int(m) for m in selected if isinstance(m, (int, float)) and 1 <= int(m) <= 12]
    weeks_per_month = getattr(settings, "EXECUTION_PLAN_AI_WEEKS_PER_MONTH", 4)
    expected = compute_expected_week_count(months, weeks_per_month)

    guidance = resolve_execution_plan_guide(payload)
    system = _system_prompt()
    user = build_user_prompt(payload, expected, guidance=guidance)
    raw = call_openai_json(system, user)
    depth_key = (payload.get("plan_depth") or "brief").strip()
    return validate_and_normalize_weeks(
        raw,
        expected_week_count=expected,
        selected_months=months or [3],
        plan_depth=depth_key,
    )
