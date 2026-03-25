"""
Custom middleware for performance monitoring and logging
"""

import time
import logging

logger = logging.getLogger('apps')


class PerformanceMonitoringMiddleware:
    """
    Middleware to monitor and log slow API requests
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.time()
        
        response = self.get_response(request)
        
        duration = time.time() - start_time
        
        if duration > 1.0:
            logger.warning(
                f"Slow request: {request.method} {request.path} "
                f"took {duration:.2f}s (Status: {response.status_code})"
            )
        
        response['X-Response-Time'] = f"{duration:.3f}s"
        
        return response
