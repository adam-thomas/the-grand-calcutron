from rest_framework import serializers

from .models import Task


TASK_API_FIELDS = (
    "done",
    "id",
    "parent_id",
    "sort_order",
    "text",
)


class TaskSerializer(serializers.ModelSerializer):
    parent_id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = Task
        fields = TASK_API_FIELDS
