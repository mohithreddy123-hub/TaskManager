from django.urls import path
from .views import EntryListCreateView, EntryDetailView, DashboardSummaryView

urlpatterns = [
    path('dashboard', DashboardSummaryView.as_view(), name='dashboard-summary'),
    path('entries', EntryListCreateView.as_view(), name='entry-list-create'),
    path('entries/<int:pk>', EntryDetailView.as_view(), name='entry-detail'),
]
