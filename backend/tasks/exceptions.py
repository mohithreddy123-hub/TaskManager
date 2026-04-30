from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status as drf_status
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler that returns consistent JSON error responses.
    All errors are returned as: {"error": "message"} or {"field": ["error"]}
    """
    response = exception_handler(exc, context)

    if response is not None:
        data = response.data

        # Normalize DRF's 'detail' key to 'error' for consistent frontend handling
        if isinstance(data, dict) and 'detail' in data and len(data) == 1:
            response.data = {'error': str(data['detail'])}

        return response

    # Log unexpected server errors for debugging
    logger.exception(
        "Unhandled exception in %s",
        context.get('view', 'unknown view'),
        exc_info=exc,
    )
    return Response(
        {'error': 'An unexpected server error occurred. Please try again later.'},
        status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
