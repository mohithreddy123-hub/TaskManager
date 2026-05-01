from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status as drf_status
import logging

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler that returns consistent JSON error responses.

    Rules:
    - Single-field errors → {"error": "message"}
    - Multi-field validation errors → {"field": ["error detail"]}
    - Unhandled 500s → {"error": "..."} with server-side logging
    """
    response = exception_handler(exc, context)

    if response is not None:
        data = response.data

        # Normalize DRF's 'detail' key → 'error' for consistent frontend handling
        # e.g. 401 Unauthorized, 403 Forbidden, 404 Not Found
        if isinstance(data, dict) and 'detail' in data and len(data) == 1:
            response.data = {'error': str(data['detail'])}

        # FIX: Also normalize non_field_errors to top-level 'error' key
        elif isinstance(data, dict) and 'non_field_errors' in data:
            errors = data.pop('non_field_errors')
            response.data = {
                'error': errors[0] if errors else 'Validation error.',
                **data,
            }

        return response

    # FIX: Log the view name properly (context['view'] is an object, not a string)
    view = context.get('view')
    view_name = type(view).__name__ if view else 'unknown view'
    logger.exception("Unhandled exception in %s", view_name, exc_info=exc)

    return Response(
        {'error': 'An unexpected server error occurred. Please try again later.'},
        status=drf_status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
