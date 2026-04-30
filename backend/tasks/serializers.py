from rest_framework import serializers
from django.contrib.auth.models import User
from django.core.validators import EmailValidator
from django.core.exceptions import ValidationError as DjangoValidationError

from .models import DailyEntry


# ─── User Serializers ──────────────────────────────────────────────────────────

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8, max_length=128)
    name = serializers.CharField(source='first_name', required=True, max_length=150)

    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'password')

    def validate_email(self, value):
        value = value.lower().strip()

        # Validate email format
        try:
            EmailValidator()(value)
        except DjangoValidationError:
            raise serializers.ValidationError("Enter a valid email address.")

        # Check uniqueness
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")

        return value

    def validate_password(self, value):
        # Must contain at least one letter and one digit
        has_letter = any(c.isalpha() for c in value)
        has_digit = any(c.isdigit() for c in value)
        if not has_letter or not has_digit:
            raise serializers.ValidationError(
                "Password must contain at least one letter and one number."
            )
        return value

    def validate_name(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters.")
        if not value.replace(' ', '').isalpha():
            raise serializers.ValidationError("Name must contain only letters.")
        return value

    def create(self, validated_data):
        email = validated_data['email']
        # Derive a unique, safe username from the email prefix
        base_username = email.split('@')[0][:30]   # MySQL username max is 150, but keep it short
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
        user.set_password(password)   # Hashes password — NEVER stored as plain text
        user.save()
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='first_name', max_length=150)
    total_entries = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'username', 'date_joined', 'total_entries')
        read_only_fields = ('id', 'email', 'username', 'date_joined', 'total_entries')

    def get_total_entries(self, obj):
        # Uses the reverse relation — no extra query when called after prefetch
        return obj.entries.count()

    def validate_name(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError("Name must be at least 2 characters.")
        return value


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, min_length=8, max_length=128)

    def validate_new_password(self, value):
        has_letter = any(c.isalpha() for c in value)
        has_digit = any(c.isdigit() for c in value)
        if not has_letter or not has_digit:
            raise serializers.ValidationError(
                "New password must contain at least one letter and one number."
            )
        return value


# ─── DailyEntry Serializer ─────────────────────────────────────────────────────

class DailyEntrySerializer(serializers.ModelSerializer):
    entry_type_display = serializers.CharField(source='get_entry_type_display', read_only=True)
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = DailyEntry
        fields = (
            'id', 'entry_type', 'entry_type_display', 
            'title', 'description', 'amount',
            'category', 'category_display',
            'status', 'status_display',
            'date', 'created_at', 'updated_at',
        )
        read_only_fields = (
            'id', 'created_at', 'updated_at', 'entry_type_display', 'category_display', 'status_display'
        )

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Title cannot be empty.")
        if len(value) < 2:
            raise serializers.ValidationError("Title must be at least 2 characters.")
        return value

    def validate_amount(self, value):
        if value is not None:
            if value < 0:
                raise serializers.ValidationError("Amount cannot be negative.")
            if value > 9999999.99:
                raise serializers.ValidationError("Amount is too large.")
        return value

    def validate_category(self, value):
        if value and value not in DailyEntry.VALID_CATEGORIES:
            raise serializers.ValidationError(
                f"Invalid category. Choose from: {', '.join(DailyEntry.VALID_CATEGORIES)}."
            )
        return value

    def validate_status(self, value):
        if value not in DailyEntry.VALID_STATUSES:
            raise serializers.ValidationError(
                f"Invalid status. Choose from: {', '.join(DailyEntry.VALID_STATUSES)}."
            )
        return value

    def validate_description(self, value):
        if value and len(value) > 2000:
            raise serializers.ValidationError("Description cannot exceed 2000 characters.")
        return value.strip() if value else ''

    def validate(self, data):
        # Determine the effective entry type for this operation (creates vs updates)
        entry_type = data.get('entry_type', getattr(self.instance, 'entry_type', 'expense'))

        if entry_type == 'expense':
            amount = data.get('amount', getattr(self.instance, 'amount', None))
            if amount is None or amount <= 0:
                raise serializers.ValidationError({"amount": "Amount is required and must be positive for expenses."})
            
            category = data.get('category', getattr(self.instance, 'category', None))
            if not category:
                raise serializers.ValidationError({"category": "Category is required for expenses."})

            date_val = data.get('date', getattr(self.instance, 'date', None))
            if not date_val:
                raise serializers.ValidationError({"date": "Date is required for expenses."})
        
        elif entry_type == 'task':
            # Tasks don't require an amount, default to 0 if not provided
            if 'amount' not in data and not self.instance:
                data['amount'] = 0.00
                
        return data
