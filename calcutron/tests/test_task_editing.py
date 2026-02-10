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
    
    def test_edit_task(self):
        """
        A basic change to an existing task.
        """
        self.client.force_login(self.user_1)
        response = self.client.patch(self.edit_url, {
            "text": "An updated task",
        }, content_type="application/json")

        self.assertEqual(response.status_code, 200)

        self.task.refresh_from_db()
        self.assertEqual(self.task.text, "An updated task")

    def test_task_edit_by_wrong_user(self):
        """
        Users cannot edit tasks owned by other users.
        """
        self.client.force_login(self.user_2)
        response = self.client.patch(self.edit_url, {
            "text": "An updated task",
        }, content_type="application/json")

        self.assertEqual(response.status_code, 404)

    def test_move_task_under_wrong_parent(self):
        """
        Log in as the other user, and assert that the creation now fails
        because the parent's user list doesn't contain this user.
        """
        parent = Task.objects.create(text="parent")
        parent.users.set([self.user_2])

        self.client.force_login(self.user_1)
        response = self.client.patch(self.edit_url, {
            "parent": parent.id,
        }, content_type="application/json")

        self.assertEqual(response.status_code, 400)

    def test_cannot_donate_task(self):
        """
        Editing the `users` field in the submitted data is ignored.
        """
        self.client.force_login(self.user_1)
        response = self.client.patch(self.edit_url, {
            "text": "An updated task",
            "users": [self.user_2.id],
        }, content_type="application/json")

        self.assertEqual(response.status_code, 200)

        self.task.refresh_from_db()
        self.assertEqual(self.task.text, "An updated task")
        self.assertCountEqual(self.task.users.all(), [self.user_1])
    
