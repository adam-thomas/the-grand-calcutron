from django.contrib import admin
from django.urls import path, include
from django.contrib.staticfiles.urls import staticfiles_urlpatterns


app_name = "calcutron"


urlpatterns = [
    path("admin/", admin.site.urls, name="admin"),
]

urlpatterns += staticfiles_urlpatterns()
