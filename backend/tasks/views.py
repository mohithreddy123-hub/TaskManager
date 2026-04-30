from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db.models import Sum, Q
from django.utils import timezone
from datetime import date, timedelta
import decimal

from .serializers import (
    RegisterSerializer,
    UserProfileSerializer,
    ChangePasswordSerializer,
    DailyEntrySerializer,
)
from .models import DailyEntry


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
            refresh = RefreshToken.for_user(user)
            return Response({
                'message': 'Account created successfully.',
                'user': UserProfileSerializer(user).data,
                'tokens': {
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                },
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """POST /api/auth/login"""
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip().lower()
        password = request.data.get('password', '')

        if not email or not password:
            return Response(
                {'error': 'Email and password are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {'error': 'Invalid email or password.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        user = authenticate(request, username=user_obj.username, password=password)
        if user is None:
            return Response(
                {'error': 'Invalid email or password.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)
        return Response({
            'message': 'Login successful.',
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            },
        }, status=status.HTTP_200_OK)


class ProfileView(APIView):
    """GET/PUT /api/auth/profile"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserProfileSerializer(request.user).data)

    def put(self, request):
        serializer = UserProfileSerializer(request.user, data=request.data, partial=True)
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
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(serializer.validated_data['new_password'])
        user.save()
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

        entries = DailyEntry.objects.filter(user=user)

        total_entries = entries.count()
        completed = entries.filter(status='completed').count()
        pending = entries.filter(status='pending').count()

        total_expenses = entries.aggregate(s=Sum('amount'))['s'] or decimal.Decimal('0.00')
        today_spending = entries.filter(date=today).aggregate(s=Sum('amount'))['s'] or decimal.Decimal('0.00')
        week_spending = entries.filter(date__gte=week_start).aggregate(s=Sum('amount'))['s'] or decimal.Decimal('0.00')
        month_spending = entries.filter(date__gte=month_start).aggregate(s=Sum('amount'))['s'] or decimal.Decimal('0.00')

        # Category breakdown
        category_totals = {}
        for entry in entries.values('category'):
            cat = entry['category']
            cat_amount = entries.filter(category=cat).aggregate(s=Sum('amount'))['s'] or decimal.Decimal('0.00')
            category_totals[cat] = float(cat_amount)

        return Response({
            'total_entries': total_entries,
            'completed': completed,
            'pending': pending,
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
    GET  /api/entries — list entries with optional filtering
    POST /api/entries — create new entry
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        entries = DailyEntry.objects.filter(user=request.user)

        # Filtering
        status_filter = request.query_params.get('status')
        category_filter = request.query_params.get('category')
        search = request.query_params.get('search', '').strip()
        date_filter = request.query_params.get('date')  # 'today', 'week', 'month'
        sort = request.query_params.get('sort', 'newest')

        if status_filter and status_filter in ['pending', 'completed']:
            entries = entries.filter(status=status_filter)

        if category_filter:
            entries = entries.filter(category=category_filter)

        if search:
            entries = entries.filter(
                Q(title__icontains=search) | Q(description__icontains=search)
            )

        if date_filter:
            today = date.today()
            if date_filter == 'today':
                entries = entries.filter(date=today)
            elif date_filter == 'week':
                entries = entries.filter(date__gte=today - timedelta(days=today.weekday()))
            elif date_filter == 'month':
                entries = entries.filter(date__gte=today.replace(day=1))

        if sort == 'oldest':
            entries = entries.order_by('date', 'created_at')
        else:
            entries = entries.order_by('-date', '-created_at')

        serializer = DailyEntrySerializer(entries, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = DailyEntrySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EntryDetailView(APIView):
    """
    GET    /api/entries/{id}
    PUT    /api/entries/{id}
    DELETE /api/entries/{id}
    """
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return DailyEntry.objects.get(pk=pk, user=user)
        except DailyEntry.DoesNotExist:
            return None

    def get(self, request, pk):
        entry = self.get_object(pk, request.user)
        if entry is None:
            return Response({'error': 'Entry not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(DailyEntrySerializer(entry).data)

    def put(self, request, pk):
        entry = self.get_object(pk, request.user)
        if entry is None:
            return Response({'error': 'Entry not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = DailyEntrySerializer(entry, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        entry = self.get_object(pk, request.user)
        if entry is None:
            return Response({'error': 'Entry not found.'}, status=status.HTTP_404_NOT_FOUND)
        entry.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
