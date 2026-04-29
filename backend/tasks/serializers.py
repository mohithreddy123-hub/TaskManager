from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Task


# ─── User Serializers ──────────────────────────────────────────────────────────

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    name = serializers.CharField(source='first_name', required=True)

    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'username', 'password')
        extra_kwargs = {'username': {'required': False}}

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        # Use email as username for uniqueness
        validated_data.setdefault('username', validated_data['email'])
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)  # hashes password
        user.save()
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='first_name')

    class Meta:
        model = User
        fields = ('id', 'name', 'email', 'username', 'date_joined')
        read_only_fields = ('id', 'email', 'username', 'date_joined')


# ─── Task Serializer ───────────────────────────────────────────────────────────

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ('id', 'title', 'description', 'status', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')
