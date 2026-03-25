"""
Custom exception handler for DRF
"""

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger('apps')


def custom_exception_handler(exc, context):
    """
    Custom exception handler that provides consistent error responses
    """
    response = exception_handler(exc, context)
    
    if response is not None:
        custom_response_data = {
            'error': True,
            'message': str(exc),
            'status_code': response.status_code,
        }
        
        if hasattr(exc, 'detail'):
            custom_response_data['details'] = exc.detail
        
        response.data = custom_response_data
        
        logger.error(
            f"API Error: {exc.__class__.__name__} - {str(exc)} "
            f"(Status: {response.status_code}, Path: {context['request'].path})"
        )
    
    return response


class ServiceException(Exception):
    """
    Base exception for service layer errors
    """
    def __init__(self, message, status_code=status.HTTP_400_BAD_REQUEST):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)
