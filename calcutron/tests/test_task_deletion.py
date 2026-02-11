from .task_test_case import TaskTestCase
from ..models import Task


class TestTaskDeletion(TaskTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.task = cls.create_task("An old task", users=[cls.user_1])
        cls.edit_url = f"/edit/{cls.task.id}/"
    
    def test_delete_task(self):
        """
        A user can delete their own task.
        """
        self.client.force_login(self.user_1)
        response = self.client.delete(self.edit_url)

        self.assertEqual(response.status_code, 204, response.data)
        self.assertEqual(Task.objects.count(), 0)

    def test_delete_by_wrong_user(self):
        """
        Users cannot delete tasks owned by other users.
        """
        self.client.force_login(self.user_2)
        response = self.client.delete(self.edit_url)

        self.assertEqual(response.status_code, 404, response.data)
        self.assertEqual(Task.objects.count(), 1)
