from .task_test_case import TaskTestCase
from ..models import Task
from ..serializers import TaskSerializer


class TestTaskCreation(TaskTestCase):
    def test_serializer_matching(self):
        """
        Check that the list view's output matches how the Task serializer
        renders data.
        """
        parent = self.create_task("parent", users=[self.user_1])
        child = self.create_task("child", parent=parent)

        self.client.force_login(self.user_1)
        response = self.client.get("/get_tasks/")
        self.assertEqual(response.status_code, 200, response.data)
        list_view_data = response.data

        serializer_data = TaskSerializer(list(Task.objects.all()), many=True).data

        self.assertCountEqual(list_view_data, serializer_data)
