"""
Views for learning resources
"""

from rest_framework import viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from drf_spectacular.utils import extend_schema
from django_filters.rest_framework import DjangoFilterBackend

from .models import Resource
from .serializers import ResourceSerializer


class ResourceViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for learning resources (read-only)
    """
    queryset = Resource.objects.filter(is_active=True)
    serializer_class = ResourceSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['resource_type']
    search_fields = ['title', 'description', 'tags']
    
    @extend_schema(tags=['Resources'])
    def list(self, request, *args, **kwargs):
        """Get resources list"""
        return super().list(request, *args, **kwargs)
    
    @extend_schema(tags=['Resources'])
    def retrieve(self, request, *args, **kwargs):
        """Get single resource and increment view count"""
        instance = self.get_object()
        instance.view_count += 1
        instance.save(update_fields=['view_count'])
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
