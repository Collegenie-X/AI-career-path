"""
Custom permission classes for DRF
"""

from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsOwnerOrReadOnly(BasePermission):
    """
    Custom permission to only allow owners of an object to edit it.
    Read permissions are allowed to any request.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'owner'):
            return obj.owner == request.user
        
        return False


class IsGroupAdmin(BasePermission):
    """
    Custom permission to only allow group admins to modify group settings.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        
        if hasattr(obj, 'creator'):
            return obj.creator == request.user
        elif hasattr(obj, 'owner'):
            return obj.owner == request.user
        
        return False


class IsAdminOrReadOnly(BasePermission):
    """
    Custom permission to only allow admins to edit.
    Read permissions are allowed to any request.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class IsOwner(BasePermission):
    """
    Custom permission to only allow owners of an object to access it.
    """
    def has_object_permission(self, request, view, obj):
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'owner'):
            return obj.owner == request.user
        
        return False
