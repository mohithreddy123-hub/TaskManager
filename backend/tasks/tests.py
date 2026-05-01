from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
from .models import DailyEntry
import datetime


class AuthTests(TestCase):
    """Test authentication flows."""

    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/auth/register'
        self.login_url = '/api/auth/login'
        self.logout_url = '/api/auth/logout'

    def test_register_returns_tokens(self):
        """Registration must auto-log the user in by returning JWT tokens."""
        res = self.client.post(self.register_url, {
            'name': 'Test User',
            'email': 'test@example.com',
            'password': 'Password1',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIn('tokens', res.data)
        self.assertIn('access', res.data['tokens'])
        self.assertIn('refresh', res.data['tokens'])
        self.assertIn('user', res.data)

    def test_login_returns_tokens_and_profile(self):
        """Login must return tokens + user profile in a single response."""
        User.objects.create_user(username='u1', email='u1@example.com', password='Password1')
        res = self.client.post(self.login_url, {
            'email': 'u1@example.com',
            'password': 'Password1',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', res.data)
        self.assertIn('user', res.data)

    def test_login_invalid_credentials(self):
        """Wrong password must return 401 with a generic error."""
        User.objects.create_user(username='u2', email='u2@example.com', password='Password1')
        res = self.client.post(self.login_url, {
            'email': 'u2@example.com',
            'password': 'WrongPass1',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('error', res.data)

    def test_register_duplicate_email(self):
        """Registering with an existing email must return 400."""
        User.objects.create_user(username='u3', email='dup@example.com', password='Password1')
        res = self.client.post(self.register_url, {
            'name': 'Dup User',
            'email': 'dup@example.com',
            'password': 'Password1',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_weak_password_rejected(self):
        """Password without a digit must be rejected."""
        res = self.client.post(self.register_url, {
            'name': 'Weak User',
            'email': 'weak@example.com',
            'password': 'onlyletters',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class EntryTests(TestCase):
    """Test DailyEntry CRUD operations."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='entryuser', email='entry@example.com', password='Password1'
        )
        self.client.force_authenticate(user=self.user)
        self.entries_url = '/api/entries'

    def test_create_expense(self):
        """Creating an expense with amount and category must succeed."""
        res = self.client.post(self.entries_url, {
            'entry_type': 'expense',
            'title': 'Lunch',
            'amount': 150.00,
            'category': 'food',
            'status': 'completed',
            'date': str(datetime.date.today()),
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['entry_type'], 'expense')

    def test_create_expense_without_amount_fails(self):
        """Expense without amount must be rejected."""
        res = self.client.post(self.entries_url, {
            'entry_type': 'expense',
            'title': 'No Amount',
            'category': 'food',
            'date': str(datetime.date.today()),
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_task(self):
        """Creating a task without amount must succeed."""
        res = self.client.post(self.entries_url, {
            'entry_type': 'task',
            'title': 'Write report',
            'status': 'pending',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['entry_type'], 'task')

    def test_entries_scoped_to_user(self):
        """A user must not see another user's entries."""
        other_user = User.objects.create_user(
            username='other', email='other@example.com', password='Password1'
        )
        DailyEntry.objects.create(
            user=other_user, entry_type='task', title='Secret task', status='pending'
        )
        res = self.client.get(self.entries_url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        # The results key exists when pagination is active
        results = res.data.get('results', res.data)
        self.assertEqual(len(results), 0)

    def test_delete_other_users_entry_is_404(self):
        """Attempting to delete another user's entry must return 404."""
        other_user = User.objects.create_user(
            username='other2', email='other2@example.com', password='Password1'
        )
        entry = DailyEntry.objects.create(
            user=other_user, entry_type='task', title='Private', status='pending'
        )
        res = self.client.delete(f'{self.entries_url}/{entry.pk}')
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_unauthenticated_access_denied(self):
        """Unauthenticated requests to protected endpoints must return 401."""
        unauth_client = APIClient()
        res = unauth_client.get(self.entries_url)
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)
