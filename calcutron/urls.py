from django.contrib import admin
from django.urls import path, include
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

from . import views


app_name = "calcutron"


urlpatterns = [
    path("admin/", admin.site.urls, name="admin"),
    path("accounts/", include("django.contrib.auth.urls")),

    path("", views.MainView.as_view(), name="main"),
    path("health_check", views.LoginHealthCheck.as_view(), name="health_check"),
    path("get_tasks", views.GetAllTasksView.as_view(), name="get_tasks"),
    path("new", views.NewTaskView.as_view(), name="new"),
    path("delete", views.DeleteTaskView.as_view(), name="delete"),
    path("edit", views.EditTaskView.as_view(), name="edit"),
    path("done", views.SetDoneTaskView.as_view(), name="done"),
]

urlpatterns += staticfiles_urlpatterns()
