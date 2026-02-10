from django.contrib.auth.models import User
from django.test import TestCase

from ..models import Task


class TestTaskCreation(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user_1 = User.objects.create_user("leeroy")
        cls.user_2 = User.objects.create_user("jenkins")

        cls.task = Task.objects.create(text="An old task")
        cls.task.users.set([cls.user_1])

        cls.edit_url = f"/edit/{cls.task.id}/"
    
    def test_delete_task(self):
        """
        A user can delete their own task.
        """
        self.client.force_login(self.user_1)
        response = self.client.delete(self.edit_url)

        self.assertEqual(response.status_code, 204)
        self.assertEqual(Task.objects.count(), 0)

    def test_delete_by_wrong_user(self):
        """
        Users cannot delete tasks owned by other users.
        """
        self.client.force_login(self.user_2)
        response = self.client.delete(self.edit_url)

        self.assertEqual(response.status_code, 404)
        self.assertEqual(Task.objects.count(), 1)
