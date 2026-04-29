from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('tasks.auth_urls')),
    path('api/', include('tasks.urls')),
]
