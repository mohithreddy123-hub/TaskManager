from django.contrib import admin
from .models import DailyEntry


@admin.register(DailyEntry)
class DailyEntryAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'amount', 'category', 'status', 'date', 'created_at')
    list_filter = ('category', 'status', 'date')
    search_fields = ('title', 'description', 'user__email')
    ordering = ('-date', '-created_at')
