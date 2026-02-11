from .task_test_case import TaskTestCase
from ..models import Task


class TestTaskCreation(TaskTestCase):
    def test_task_creation_no_parent(self):
        """
        Creating a top-level task.
        """
        self.client.force_login(self.user_1)
        response = self.client.post("/new/", {
            "text": "A new task",
        }, content_type="application/json")

        self.assertEqual(response.status_code, 201, response.data)

        new_task = Task.objects.first()
        self.assertCountEqual(new_task.users.all(), [self.user_1])
        self.assertEqual(new_task.text, "A new task")
        self.assertEqual(new_task.top_level_parent, None)

    def test_task_creation_under_parent(self):
        """
        Creating a task under one parent.
        """
        parent = self.create_task("parent", users=[self.user_1])

        self.client.force_login(self.user_1)
        response = self.client.post("/new/", {
            "text": "A new task",
            "parent": parent.id,
        }, content_type="application/json")

        self.assertEqual(response.status_code, 201, response.data)

        new_task = Task.objects.get(parent=parent.id)
        self.assertCountEqual(new_task.users.all(), [])
        self.assertEqual(new_task.text, "A new task")
        self.assertEqual(new_task.top_level_parent, parent)

    def test_task_creation_under_nested_parents(self):
        """
        Creating a task under a parent which itself has a parent.
        """
        top_parent = self.create_task("top parent", users=[self.user_1])
        middle_parent = self.create_task("middle parent", parent=top_parent)

        self.client.force_login(self.user_1)
        response = self.client.post("/new/", {
            "text": "A new task",
            "parent": middle_parent.id,
        }, content_type="application/json")

        self.assertEqual(response.status_code, 201, response.data)

        new_task = Task.objects.get(parent=middle_parent.id)
        self.assertCountEqual(new_task.users.all(), [])
        self.assertEqual(new_task.text, "A new task")
        self.assertEqual(new_task.top_level_parent, top_parent)

    def test_task_creation_under_wrong_parent(self):
        """
        Creating a task under a parent that belongs to a different user doesn't work.
        """
        parent = self.create_task("parent", users=[self.user_1])

        # Log in as the other user, and assert that the creation now fails
        # because the parent's user list doesn't contain this user.
        self.client.force_login(self.user_2)
        response = self.client.post("/new/", {
            "text": "A new task",
            "parent": parent.id,
        }, content_type="application/json")

        self.assertEqual(response.status_code, 400, response.data)
