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


class _TaskListSerializer(serializers.ListSerializer):
    def update(self, instances, validated_data):
        """
        Organise edits to tasks by their supplied ids.

        Note that this serializer _only_ supports editing. Creation and deletion are
        handled elsewhere, so all ids are assumed to be valid.
    
        Based on the example in the DRF docs:
        https://www.django-rest-framework.org/api-guide/serializers/#customizing-multiple-update
        """
        task_mapping = {task.id: task for task in instances}
        data_mapping = {item["id"]: item for item in validated_data}

        updated_tasks = []
        for task_id, data in data_mapping.items():
            task = task_mapping.get(task_id, None)
            if task:
                updated_tasks.append(self.child.update(task, data))

        return updated_tasks


class TaskBulkEditSerializer(TaskSerializer):
    id = serializers.IntegerField()

    class Meta(TaskSerializer.Meta):
        list_serializer_class = _TaskListSerializer
