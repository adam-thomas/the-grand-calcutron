from django.contrib import admin
from django.urls import path, include
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

from . import views


app_name = "calcutron"


urlpatterns = [
    path("admin/", admin.site.urls, name="admin"),

    path("", views.MainView.as_view(), name="main"),
]

urlpatterns += staticfiles_urlpatterns()
