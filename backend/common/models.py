"""
Common base models for all Django apps
"""

from django.db import models
import uuid


class TimeStampedModel(models.Model):
    """
    Abstract base model that provides self-updating
    'created_at' and 'updated_at' fields.
    """
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='생성일시')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='수정일시')

    class Meta:
        abstract = True
        ordering = ['-created_at']


class UUIDPrimaryKeyModel(models.Model):
    """
    Abstract base model that uses UUID as primary key
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta:
        abstract = True
