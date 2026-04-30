from rest_framework import serializers
from django.contrib.auth.models import User
from .models import DailyEntry
import re


# ─── User Serializers ──────────────────────────────────────────────────────────

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    name = serializers.CharField(source='first_name', required=True)

    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'password')

    def validate_email(self, value):
        value = value.lower().strip()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate_name(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters.")
        return value

    def create(self, validated_data):
        email = validated_data['email']
        # Derive a safe username from email
        base_username = email.split('@')[0]
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        password = validated_data.pop('password')
        user = User(
            username=username,
            email=email,
            first_name=validated_data.get('first_name', ''),
        )
        user.set_password(password)
        user.save()
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='first_name')
    total_entries = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'username', 'date_joined', 'total_entries')
        read_only_fields = ('id', 'email', 'username', 'date_joined', 'total_entries')

    def get_total_entries(self, obj):
        return obj.entries.count()


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=6)


# ─── DailyEntry Serializer ─────────────────────────────────────────────────────

class DailyEntrySerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = DailyEntry
        fields = (
            'id', 'title', 'description', 'amount',
            'category', 'category_display',
            'status', 'status_display',
            'date', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'created_at', 'updated_at', 'category_display', 'status_display')

    def validate_amount(self, value):
        if value < 0:
            raise serializers.ValidationError("Amount cannot be negative.")
        return value

    def validate_title(self, value):
        if not value.strip():
            raise serializers.ValidationError("Title cannot be empty.")
        return value.strip()
