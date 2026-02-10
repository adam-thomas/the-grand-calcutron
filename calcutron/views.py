from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse
from django.views.generic import TemplateView, View
from rest_framework.generics import CreateAPIView, ListAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.serializers import ValidationError

from .models import Task
from .serializers import TaskSerializer



class MainView(LoginRequiredMixin, TemplateView):
    template_name = "calcutron/main.html"


class LoginHealthCheck(LoginRequiredMixin, View):
    """
    A basic healthcheck endpoint. The frontend can poll this, and will receive a redirect to the
    login page if the user's session has lapsed.

    TODO: Turn this into a REST view and do the redirecting in the frontend.
    """
    def get(self, request, *args, **kwargs):
        return JsonResponse({"success": True})


class UserTasksMixin:
    serializer_class = TaskSerializer

    def get_queryset(self):
        return Task.objects.filter(users=self.request.user)
    
    def check_parent(self, serializer):
        """
        Check that if this task is being created or moved under a parent, that that parent
        has the correct users on it.
        """
        parent = serializer.validated_data.get("parent", None)
        if parent and not self.get_queryset().filter(id=parent.id).exists():
            raise ValidationError("Cannot assign to this parent.")


class GetAllTasksView(UserTasksMixin, ListAPIView):
    pass


class CreateTaskView(UserTasksMixin, CreateAPIView):
    def perform_create(self, serializer):
        self.check_parent(serializer)

        new_object = serializer.save()
        new_object.users.add(self.request.user)


class EditTaskView(UserTasksMixin, RetrieveUpdateDestroyAPIView):
    def perform_update(self, serializer):
        self.check_parent(serializer)
        serializer.save()

