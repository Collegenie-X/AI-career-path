"""
실행계획 AI 생성 API
"""

import logging

from django.conf import settings
from django.db import transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import ExecutionPlanAiUsage
from .serializers_execution_plan_ai import ExecutionPlanAiGenerateRequestSerializer
from .services.execution_plan_ai_service import (
    ExecutionPlanAiConfigError,
    ExecutionPlanAiError,
    ExecutionPlanAiParseError,
    ExecutionPlanAiUpstreamError,
    compute_expected_week_count,
    generate_execution_plan,
)

logger = logging.getLogger(__name__)


def _openai_upstream_user_detail(exc: ExecutionPlanAiUpstreamError) -> str:
    """HTTP 상태·OpenAI 본문 키워드로 사용자용 문구 선택."""
    st = getattr(exc, 'http_status', None)
    om = (getattr(exc, 'openai_message', None) or '').lower()

    if st == 401:
        return (
            'OpenAI API 키가 올바르지 않거나 만료되었을 수 있어요. '
            'backend `.env` 의 `OPENAI_API_KEY` 를 확인하거나 새 키를 발급해 주세요.'
        )
    if st == 403:
        return 'OpenAI API 접근이 거부되었어요. 키 권한·조직 정책을 확인해 주세요.'
    if st == 429:
        return 'OpenAI 요청 한도에 도달했어요. 잠시 후 다시 시도해 주세요.'
    if st in (500, 502, 503):
        return 'OpenAI 측 일시 오류입니다. 잠시 후 다시 시도해 주세요.'
    if 'insufficient_quota' in om or 'billing' in om:
        return 'OpenAI 계정 결제·크레딧을 확인해 주세요.'
    if st == 400 and 'model' in om:
        return '모델 이름을 확인해 주세요. (`OPENAI_EXECUTION_PLAN_MODEL`, 예: gpt-4o)'
    if st is None and getattr(exc, 'openai_message', None):
        return '네트워크 연결을 확인해 주세요. (방화벽·프록시·DNS)'
    return 'AI 서버와 통신 중 오류가 났어요. 잠시 후 다시 시도해 주세요.'


def _period_key_monthly() -> str:
    return timezone.now().strftime('%Y-%m')


def _get_limit() -> int:
    return getattr(settings, 'EXECUTION_PLAN_AI_USER_MONTHLY_LIMIT', 10)


def _reserve_quota(user) -> tuple[bool, int, int]:
    """
    성공 시에만 호출 횟수를 올립니다. OpenAI 실패 시 release_quota로 되돌립니다.
    Returns (ok, limit, remaining_after).
    """
    limit = _get_limit()
    if limit <= 0:
        return True, 0, 999

    period_key = _period_key_monthly()
    with transaction.atomic():
        row, _ = ExecutionPlanAiUsage.objects.select_for_update().get_or_create(
            user=user,
            period_key=period_key,
            defaults={'call_count': 0},
        )
        if row.call_count >= limit:
            return False, limit, 0
        row.call_count += 1
        row.save(update_fields=['call_count', 'updated_at'])
        remaining = max(0, limit - row.call_count)
    return True, limit, remaining


def _release_quota(user) -> None:
    limit = _get_limit()
    if limit <= 0:
        return
    period_key = _period_key_monthly()
    with transaction.atomic():
        try:
            row = ExecutionPlanAiUsage.objects.select_for_update().get(
                user=user,
                period_key=period_key,
            )
        except ExecutionPlanAiUsage.DoesNotExist:
            return
        if row.call_count > 0:
            row.call_count -= 1
            row.save(update_fields=['call_count', 'updated_at'])


class ExecutionPlanAiGenerateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ser = ExecutionPlanAiGenerateRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        data = ser.validated_data

        ok, limit, remaining = _reserve_quota(request.user)
        if not ok:
            return Response(
                {
                    'code': 'QUOTA_EXCEEDED',
                    'detail': f'이번 달 AI 실행계획 생성은 {limit}회까지 사용할 수 있어요.',
                    'limit': limit,
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        payload = {
            'title': data['title'],
            'plan_depth': data.get('plan_depth', 'brief'),
            'category_id': data.get('category_id') or '',
            'student_level': data.get('student_level') or '',
            'level_label': data.get('level_label') or '',
            'difficulty': data.get('difficulty', 3),
            'final_goal': data['final_goal'],
            'selected_months': data['selected_months'],
            'milestones': data.get('milestones') or [],
            'constraints': data.get('constraints') or '',
            'previous_summary': data.get('previous_summary') or '',
        }

        try:
            result = generate_execution_plan(payload)
        except ExecutionPlanAiConfigError as exc:
            _release_quota(request.user)
            logger.warning("Execution plan AI config: %s", exc)
            return Response(
                {'code': 'OPENAI_NOT_CONFIGURED', 'detail': 'AI 생성 기능이 아직 설정되지 않았습니다.'},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        except ExecutionPlanAiUpstreamError as exc:
            _release_quota(request.user)
            logger.warning(
                "OpenAI upstream: status=%s msg=%s",
                getattr(exc, 'http_status', None),
                (getattr(exc, 'openai_message', None) or str(exc))[:500],
            )
            payload = {
                'code': 'OPENAI_ERROR',
                'detail': _openai_upstream_user_detail(exc),
            }
            if settings.DEBUG:
                payload['debug'] = {
                    'http_status': getattr(exc, 'http_status', None),
                    'openai_message': getattr(exc, 'openai_message', None),
                }
            return Response(payload, status=status.HTTP_502_BAD_GATEWAY)
        except ExecutionPlanAiParseError as exc:
            _release_quota(request.user)
            logger.warning("Parse error: %s", exc)
            return Response(
                {'code': 'AI_PARSE_ERROR', 'detail': '응답 형식을 해석하지 못했어요. 다시 시도해 주세요.'},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        except ExecutionPlanAiError as exc:
            _release_quota(request.user)
            logger.exception("Execution plan AI: %s", exc)
            return Response(
                {'code': 'AI_ERROR', 'detail': str(exc)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        weeks_per_month = getattr(settings, 'EXECUTION_PLAN_AI_WEEKS_PER_MONTH', 4)
        expected = compute_expected_week_count(data['selected_months'], weeks_per_month)

        response_body = {
            'schema_version': result.get('schemaVersion', 1),
            'expected_week_count_used': expected,
            'summary': result.get('summary', ''),
            'assumptions': result.get('assumptions') or [],
            'weeks': result.get('weeks') or [],
            'quota_remaining_after': remaining,
        }
        return Response(response_body, status=status.HTTP_200_OK)
