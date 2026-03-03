from django.contrib.auth.mixins import LoginRequiredMixin
from django.db.models import F
from django.http import JsonResponse
from django.views.generic import TemplateView, View
from rest_framework.generics import CreateAPIView, ListAPIView, RetrieveDestroyAPIView, UpdateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.serializers import ValidationError

from .models import Task
from .permissions import can_access_task, TaskAccessPermission
from .serializers import TaskBulkEditSerializer, TaskSerializer, TASK_API_FIELDS



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

    def check_parent(self, task_data):
        """
        Check that if a task is being created or moved under a parent, that that parent
        is also accessible to this user.
        """
        parent_id = task_data.get("parent_id", None)
        if parent_id and not can_access_task(self.request.user, Task.objects.get(id=parent_id)):
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
    
    def set_task_data(self, saved_task):
        """
        Set a Task instance's user list and top_level_parent according
        to its position in the hierarchy.
        """
        saved_task.top_level_parent = self.calculate_top_level_parent(saved_task)
        saved_task.save()
        
        if saved_task.parent is None:
            saved_task.users.add(self.request.user)
        else:
            saved_task.users.set([])


class GetAllTasksView(UserTasksMixin, ListAPIView):
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        # Bypass the normal DRF serializer, because they're very slow on large lists.
        data = queryset.values(*TASK_API_FIELDS)

        return Response(data)


class CreateTaskView(UserTasksMixin, CreateAPIView):
    def perform_create(self, serializer):
        self.check_parent(serializer.validated_data)
        saved_task = serializer.save()
        self.set_task_data(saved_task)


class GetDeleteTaskView(UserTasksMixin, RetrieveDestroyAPIView):
    pass


class BulkEditTaskView(UserTasksMixin, UpdateAPIView):
    serializer_class = TaskBulkEditSerializer

    def perform_update(self, serializer):
        for item in serializer.validated_data:
            self.check_parent(item)
        
        saved_tasks = serializer.save()
        
        for task in saved_tasks:
            self.set_task_data(task)

    def update(self, request, *args, **kwargs):
        """Add many=True to the standard functionality so this view can handle bulk requests."""
        partial = kwargs.pop("partial", False)
        instances = self.get_queryset()
        serializer = self.get_serializer(instances, data=request.data, partial=partial, many=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
