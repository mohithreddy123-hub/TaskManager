from django.db import models
from django.contrib.auth.models import User


class DailyEntry(models.Model):
    """Represents a single daily activity or expense entry for a user."""

    TYPE_CHOICES = [
        ('expense', 'Expense'),
        ('task', 'Task'),
    ]

    CATEGORY_CHOICES = [
        ('food', 'Food'),
        ('travel', 'Travel'),
        ('shopping', 'Shopping'),
        ('bills', 'Bills'),
        ('study', 'Study'),
        ('health', 'Health'),
        ('entertainment', 'Entertainment'),
        ('other', 'Other'),
    ]

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
    ]

    # Valid values used for validation elsewhere
    VALID_TYPES = [t[0] for t in TYPE_CHOICES]
    VALID_CATEGORIES = [c[0] for c in CATEGORY_CHOICES]
    VALID_STATUSES = [s[0] for s in STATUS_CHOICES]

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='entries', db_index=True
    )
    entry_type = models.CharField(
        max_length=20, choices=TYPE_CHOICES, default='expense', db_index=True
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, default='')
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00, null=True, blank=True)
    category = models.CharField(
        max_length=50, choices=CATEGORY_CHOICES, default='other', blank=True, null=True, db_index=True
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True
    )
    date = models.DateField(db_index=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['user', 'date'], name='entry_user_date_idx'),
            models.Index(fields=['user', 'status'], name='entry_user_status_idx'),
            models.Index(fields=['user', 'category'], name='entry_user_category_idx'),
            models.Index(fields=['user', 'entry_type'], name='entry_user_type_idx'),
        ]

    def __str__(self):
        if self.entry_type == 'expense':
            return f"[{self.category}] {self.title} — ₹{self.amount} ({self.user.username})"
        return f"[Task] {self.title} — {self.status} ({self.user.username})"
