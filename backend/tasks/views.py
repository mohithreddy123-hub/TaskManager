import logging
import decimal

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Sum, Q
from django.db.models.functions import Coalesce
from datetime import date, timedelta

from .serializers import (
    RegisterSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    DailyEntrySerializer,
)
from .models import DailyEntry

logger = logging.getLogger(__name__)


# ──────────────────────────────────────────────────────────────────────────────
# Throttle class for login (limits brute force attacks)
# ──────────────────────────────────────────────────────────────────────────────

class LoginRateThrottle(AnonRateThrottle):
    """Allow maximum 10 login attempts per minute per IP."""
    rate = '10/min'
    scope = 'login'


# ──────────────────────────────────────────────────────────────────────────────
# Helper
# ──────────────────────────────────────────────────────────────────────────────

def _build_token_response(user, http_status=status.HTTP_200_OK, message=''):
    """Build a standard auth response with JWT tokens and user profile."""
    refresh = RefreshToken.for_user(user)
    return Response({
        'message': message,
        'user': UserProfileSerializer(user).data,
        'tokens': {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        },
    }, status=http_status)


# ──────────────────────────────────────────────────────────────────────────────
# Auth Views
# ──────────────────────────────────────────────────────────────────────────────

class RegisterView(APIView):
    """POST /api/auth/register"""
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            logger.info("New user registered: %s", user.email)
            return _build_token_response(
                user,
                http_status=status.HTTP_201_CREATED,
                message='Account created successfully.',
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """POST /api/auth/login"""
    permission_classes = [AllowAny]
    throttle_classes = [LoginRateThrottle]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')

        if not email or not password:
            return Response(
                {'error': 'Email and password are required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Look up user by email — always use the same generic error
        # to avoid leaking whether an email exists in the system
        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'Invalid email or password.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        except User.MultipleObjectsReturned:
            # Should never happen due to unique validation, but handle defensively
            logger.error("Multiple users found for email: %s", email)
            return Response(
                {'error': 'Account error. Please contact support.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # Check if account is active
        if not user_obj.is_active:
            return Response(
                {'error': 'This account has been deactivated.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        user = authenticate(request, username=user_obj.username, password=password)
        if user is None:
            logger.warning("Failed login attempt for email: %s", email)
            return Response(
                {'error': 'Invalid email or password.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        logger.info("User logged in: %s", user.email)
        return _build_token_response(user, message='Login successful.')


class ProfileView(APIView):
    """
    GET /api/auth/profile  — fetch profile
    PUT /api/auth/profile  — update name (partial update)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserProfileSerializer(request.user).data)

    def put(self, request):
        serializer = UserProfileSerializer(
            request.user, data=request.data, partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """POST /api/auth/change-password"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response(
                {'error': 'Current password is incorrect.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        new_password = serializer.validated_data['new_password']
        if user.check_password(new_password):
            return Response(
                {'error': 'New password must be different from the current password.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(new_password)
        user.save()
        logger.info("Password changed for user: %s", user.email)
        return Response({'message': 'Password changed successfully.'})


# ──────────────────────────────────────────────────────────────────────────────
# Dashboard Summary View
# ──────────────────────────────────────────────────────────────────────────────

class DashboardSummaryView(APIView):
    """GET /api/dashboard — aggregate stats for the logged-in user"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = date.today()
        week_start = today - timedelta(days=today.weekday())
        month_start = today.replace(day=1)

        # Single base queryset scoped to user — all further filters reuse this
        entries = DailyEntry.objects.filter(user=user)

        # Count queries (use the same queryset, Django caches smartly)
        # Count queries for tasks
        total_entries = entries.count()
        total_tasks = entries.filter(entry_type='task').count()
        completed_tasks = entries.filter(entry_type='task', status='completed').count()
        in_progress_tasks = entries.filter(entry_type='task', status='in_progress').count()
        pending_tasks = entries.filter(entry_type='task', status='pending').count()

        # Aggregate queries for expenses
        expenses = entries.filter(entry_type='expense')
        ZERO = decimal.Decimal('0.00')
        total_expenses = expenses.aggregate(s=Sum('amount'))['s'] or ZERO
        today_spending = expenses.filter(date=today).aggregate(s=Sum('amount'))['s'] or ZERO
        week_spending = expenses.filter(date__gte=week_start).aggregate(s=Sum('amount'))['s'] or ZERO
        month_spending = expenses.filter(date__gte=month_start).aggregate(s=Sum('amount'))['s'] or ZERO

        # Category breakdown only for expenses
        category_data = (
            expenses
            .values('category')
            .annotate(total=Sum('amount'))
            .order_by('category')
        )
        category_totals = {
            item['category']: float(item['total'] or 0)
            for item in category_data
        }

        return Response({
            'total_entries': total_entries,
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'in_progress_tasks': in_progress_tasks,
            'pending_tasks': pending_tasks,
            'total_expenses': float(total_expenses),
            'today_spending': float(today_spending),
            'week_spending': float(week_spending),
            'month_spending': float(month_spending),
            'category_totals': category_totals,
        })


# ──────────────────────────────────────────────────────────────────────────────
# DailyEntry CRUD Views
# ──────────────────────────────────────────────────────────────────────────────

class EntryListCreateView(APIView):
    """
    GET  /api/entries — list user's entries with optional filtering/search/sort
    POST /api/entries — create a new entry
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Always scope to the authenticated user — no cross-user data leakage
        entries = DailyEntry.objects.filter(user=request.user)

        # ── Filtering ──────────────────────────────────────────────────────────
        entry_type_filter = request.query_params.get('type', '').strip()
        status_filter = request.query_params.get('status', '').strip()
        category_filter = request.query_params.get('category', '').strip()
        search = request.query_params.get('search', '').strip()
        date_filter = request.query_params.get('date', '').strip()
        sort = request.query_params.get('sort', 'newest').strip()

        if entry_type_filter in DailyEntry.VALID_TYPES:
            entries = entries.filter(entry_type=entry_type_filter)

        # Validate status filter against known values
        if status_filter:
            if status_filter in DailyEntry.VALID_STATUSES:
                entries = entries.filter(status=status_filter)
            # silently ignore unknown status values (don't error, just ignore)

        # Validate category filter
        if category_filter:
            if category_filter in DailyEntry.VALID_CATEGORIES:
                entries = entries.filter(category=category_filter)

        # Full-text search on title and description
        if search:
            entries = entries.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )

        # Date range filtering
        if date_filter:
            today = date.today()
            if date_filter == 'today':
                entries = entries.filter(date=today)
            elif date_filter == 'week':
                entries = entries.filter(date__gte=today - timedelta(days=today.weekday()))
            elif date_filter == 'month':
                entries = entries.filter(date__gte=today.replace(day=1))

        # Sorting
        if sort == 'oldest':
            entries = entries.order_by('date', 'created_at')
        else:
            entries = entries.order_by('-date', '-created_at')

        serializer = DailyEntrySerializer(entries, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = DailyEntrySerializer(data=request.data)
        if serializer.is_valid():
            entry = serializer.save(user=request.user)
            logger.info("Entry created: id=%s by user=%s", entry.id, request.user.email)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EntryDetailView(APIView):
    """
    GET    /api/entries/{id} — fetch single entry
    PUT    /api/entries/{id} — full or partial update
    PATCH  /api/entries/{id} — partial update (alias)
    DELETE /api/entries/{id} — delete entry
    """
    permission_classes = [IsAuthenticated]

    def _get_entry(self, pk, user):
        """
        Fetch entry by PK scoped to the requesting user.
        Returns None if not found or belongs to another user — preventing
        enumeration attacks (user cannot tell if entry exists for another user).
        """
        try:
            return DailyEntry.objects.get(pk=pk, user=user)
        except DailyEntry.DoesNotExist:
            return None

    def get(self, request, pk):
        entry = self._get_entry(pk, request.user)
        if entry is None:
            return Response(
                {'error': 'Entry not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(DailyEntrySerializer(entry).data)

    def put(self, request, pk):
        entry = self._get_entry(pk, request.user)
        if entry is None:
            return Response(
                {'error': 'Entry not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = DailyEntrySerializer(entry, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    # PATCH mirrors PUT (both support partial updates)
    patch = put

    def delete(self, request, pk):
        entry = self._get_entry(pk, request.user)
        if entry is None:
            return Response(
                {'error': 'Entry not found.'},
                status=status.HTTP_404_NOT_FOUND,
            )
        entry_id = entry.id
        entry.delete()
        logger.info("Entry deleted: id=%s by user=%s", entry_id, request.user.email)
        return Response(
            {'message': 'Entry deleted successfully.'},
            status=status.HTTP_200_OK,
        )
