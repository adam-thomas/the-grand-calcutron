from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse
from django.views.generic import TemplateView, View
from rest_framework.generics import CreateAPIView, ListAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.serializers import ValidationError

from .models import Task
from .permissions import can_access_task, TaskAccessPermission
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
    model_class = Task
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, TaskAccessPermission]
    
    def get_queryset(self):
        return Task.objects.for_user(self.request.user)

    def check_parent(self, serializer):
        """
        Check that if this task is being created or moved under a parent, that that parent
        is also accessible to this user.
        """
        parent = serializer.validated_data.get("parent", None)
        if parent and not can_access_task(self.request.user, parent):
            raise ValidationError("Cannot assign to this parent.")
        
    def calculate_top_level_parent(self, task):
        """
        Figure out what a task's top-level parent should be based on its current parent
        (or lack thereof).
        """
        if task.parent is None:
            return None
        
        if task.parent.parent is None:
            return task.parent
        
        return task.parent.top_level_parent
    
    def save_and_set_data(self, serializer):
        """
        Save a Task instance, and set its user list and top_level_parent according
        to its position in the hierarchy.
        """
        edited_task = serializer.save()
        
        edited_task.top_level_parent = self.calculate_top_level_parent(edited_task)
        edited_task.save()
        
        if edited_task.parent is None:
            edited_task.users.add(self.request.user)
        else:
            edited_task.users.set([])


class GetAllTasksView(UserTasksMixin, ListAPIView):
    pass


class CreateTaskView(UserTasksMixin, CreateAPIView):
    def perform_create(self, serializer):
        self.check_parent(serializer)
        self.save_and_set_data(serializer)


class EditTaskView(UserTasksMixin, RetrieveUpdateDestroyAPIView):
    def perform_update(self, serializer):
        self.check_parent(serializer)
        self.save_and_set_data(serializer)
