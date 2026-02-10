from django.contrib.auth.models import User
from django.test import TestCase

from ..models import Task


class TestTaskCreation(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user_1 = User.objects.create_user("leeroy")
        cls.user_2 = User.objects.create_user("jenkins")
    
    def test_task_creation(self):
        self.client.force_login(self.user_1)
        response = self.client.post("/new/", {
            "text": "A new task",
        }, content_type="application/json")

        self.assertEqual(response.status_code, 201)

        new_task = Task.objects.first()
        self.assertCountEqual(new_task.users.all(), [self.user_1])
        self.assertEqual(new_task.text, "A new task")

    def test_task_creation_under_parent(self):
        parent = Task.objects.create(text="parent")
        parent.users.set([self.user_1])

        self.client.force_login(self.user_1)
        response = self.client.post("/new/", {
            "text": "A new task",
            "parent": parent.id,
        }, content_type="application/json")

        self.assertEqual(response.status_code, 201)

        new_task = Task.objects.get(parent=parent.id)
        self.assertCountEqual(new_task.users.all(), [self.user_1])
        self.assertEqual(new_task.text, "A new task")

    def test_task_creation_under_wrong_parent(self):
        parent = Task.objects.create(text="parent")
        parent.users.set([self.user_1])

        # Log in as the other user, and assert that the creation now fails
        # because the parent's user list doesn't contain this user.
        self.client.force_login(self.user_2)
        response = self.client.post("/new/", {
            "text": "A new task",
            "parent": parent.id,
        }, content_type="application/json")

        self.assertEqual(response.status_code, 400)
