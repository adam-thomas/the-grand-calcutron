from django.contrib import admin
from django.urls import path, include
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

from . import views


app_name = "calcutron"


urlpatterns = [
    path("admin/", admin.site.urls, name="admin"),
    path("accounts/", include("django.contrib.auth.urls")),

    path("health_check/", views.LoginHealthCheck.as_view(), name="health_check"),
    path("get_tasks/", views.GetAllTasksView.as_view(), name="get_tasks"),
    path("new/", views.CreateTaskView.as_view(), name="new"),
    path("edit/<int:pk>/", views.EditTaskView.as_view(), name="edit"),

    path("", views.MainView.as_view(), name="main"),
    path("<int:task_id>/", views.MainView.as_view(), name="main_with_task_id"),
]

urlpatterns += staticfiles_urlpatterns()
