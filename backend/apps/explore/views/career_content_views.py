"""
커리어 탐색(별·직업) 정적 JSON — `apps/quiz/data` 단일 소스를 REST로 제공합니다.
"""

from __future__ import annotations

import json
from pathlib import Path

from django.conf import settings
from drf_spectacular.utils import extend_schema
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

_DATA_DIR = Path(settings.BASE_DIR) / 'apps' / 'quiz' / 'data'


def _load_json_file(filename: str):
    path = _DATA_DIR / filename
    with open(path, encoding='utf-8') as f:
        return json.load(f)


class CareerKingdomsJsonView(APIView):
    """GET: 8개 왕국(직업군) 메타데이터 — kingdoms.json"""

    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Explore - Career content'],
        summary='직업군(왕국) 목록',
        description='`apps/quiz/data/kingdoms.json` 내용을 그대로 반환합니다.',
    )
    def get(self, request):
        try:
            data = _load_json_file('kingdoms.json')
        except FileNotFoundError:
            return Response(
                {'detail': 'kingdoms.json not found'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except (json.JSONDecodeError, OSError) as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        return Response(data)


class CareerJobsJsonListView(APIView):
    """GET: 직업 설명 콘텐츠 목록 — jobs.json (선택: kingdom_id 필터)"""

    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Explore - Career content'],
        summary='직업 콘텐츠 목록',
        description=(
            '`apps/quiz/data/jobs.json` 배열을 반환합니다. '
            '`kingdom_id` 쿼리로 왕국별 필터가 가능합니다.'
        ),
    )
    def get(self, request):
        try:
            jobs = _load_json_file('jobs.json')
        except FileNotFoundError:
            return Response(
                {'detail': 'jobs.json not found'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except (json.JSONDecodeError, OSError) as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        kingdom_id = request.query_params.get('kingdom_id')
        if kingdom_id:
            jobs = [j for j in jobs if j.get('kingdomId') == kingdom_id]
        return Response(jobs)


class CareerJobJsonDetailView(APIView):
    """GET: 단일 직업 — jobs.json 항목"""

    permission_classes = [AllowAny]

    @extend_schema(
        tags=['Explore - Career content'],
        summary='직업 콘텐츠 단건',
    )
    def get(self, request, job_id: str):
        try:
            jobs = _load_json_file('jobs.json')
        except FileNotFoundError:
            return Response(
                {'detail': 'jobs.json not found'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
        except (json.JSONDecodeError, OSError) as e:
            return Response(
                {'detail': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        for row in jobs:
            if row.get('id') == job_id:
                return Response(row)
        return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
