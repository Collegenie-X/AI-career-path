"""
Views for portfolio management
"""

from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from django_filters.rest_framework import DjangoFilterBackend

from .models import PortfolioItem
from .serializers import PortfolioItemSerializer
from common.permissions import IsOwner


class PortfolioItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet for portfolio items (CRUD)
    """
    serializer_class = PortfolioItemSerializer
    permission_classes = [IsAuthenticated, IsOwner]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['item_type', 'is_ongoing']
    
    def get_queryset(self):
        return PortfolioItem.objects.filter(user=self.request.user)
    
    @extend_schema(tags=['Portfolio'])
    def list(self, request, *args, **kwargs):
        """Get user's portfolio items list"""
        return super().list(request, *args, **kwargs)
    
    @extend_schema(tags=['Portfolio'])
    def create(self, request, *args, **kwargs):
        """Create new portfolio item"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @extend_schema(tags=['Portfolio'])
    def retrieve(self, request, *args, **kwargs):
        """Get single portfolio item"""
        return super().retrieve(request, *args, **kwargs)
    
    @extend_schema(tags=['Portfolio'])
    def partial_update(self, request, *args, **kwargs):
        """Update portfolio item"""
        return super().partial_update(request, *args, **kwargs)
    
    @extend_schema(tags=['Portfolio'])
    def destroy(self, request, *args, **kwargs):
        """Delete portfolio item"""
        return super().destroy(request, *args, **kwargs)
