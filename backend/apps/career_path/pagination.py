"""커뮤니티 그룹·학교 목록 — 프론트 `?page_size=` 반영."""

from rest_framework.pagination import PageNumberPagination


class CareerCommunityPageNumberPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200
