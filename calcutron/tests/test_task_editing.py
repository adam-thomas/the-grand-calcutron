from .task_test_case import TaskTestCase
from ..models import Task


class TestTaskEditing(TaskTestCase):
    @classmethod
    def setUpTestData(cls):
        super().setUpTestData()

        cls.task = cls.create_task("An old task", users=[cls.user_1])
        cls.edit_url = f"/edit/{cls.task.id}/"

    def test_edit_task(self):
        """
        A basic change to an existing task.
        """
        self.client.force_login(self.user_1)
        response = self.client.patch(self.edit_url, {
            "text": "An updated task",
        }, content_type="application/json")

        self.assertEqual(response.status_code, 200, response.data)

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

        self.assertEqual(response.status_code, 404, response.data)

    def test_move_task_up(self):
        """
        Moving a task to the top of the hierarchy sets its user list to
        the active user and clears its top_level_parent.
        """
        task_to_move = self.create_task("to move", parent=self.task)

        self.client.force_login(self.user_1)
        response = self.client.patch(f"/edit/{task_to_move.id}/", {
            "parent": None,
        }, content_type="application/json")

        self.assertEqual(response.status_code, 200, response.data)

        task_to_move.refresh_from_db()
        self.assertEqual(task_to_move.parent, None)
        self.assertEqual(task_to_move.top_level_parent, None)
        self.assertCountEqual(task_to_move.users.all(), [self.user_1])

    def test_move_task_down(self):
        """
        Moving a task lower in the hierarchy empties its user list and
        sets its top_level_parent.
        """
        task_to_move = self.create_task("to move", users=[self.user_1])

        self.client.force_login(self.user_1)
        response = self.client.patch(f"/edit/{task_to_move.id}/", {
            "parent": self.task.id,
        }, content_type="application/json")

        self.assertEqual(response.status_code, 200, response.data)

        task_to_move.refresh_from_db()
        self.assertEqual(task_to_move.parent, self.task)
        self.assertEqual(task_to_move.top_level_parent, self.task)
        self.assertEqual(task_to_move.users.count(), 0)

    def test_move_task_across(self):
        """
        Moving a task into a different area of the tree sets its parentage
        correctly.
        """
        task_to_move = self.create_task("to move", parent=self.task)
        new_parent = self.create_task("new parent", users=[self.user_1])

        self.client.force_login(self.user_1)
        response = self.client.patch(f"/edit/{task_to_move.id}/", {
            "parent": new_parent.id,
        }, content_type="application/json")

        self.assertEqual(response.status_code, 200, response.data)

        task_to_move.refresh_from_db()
        self.assertEqual(task_to_move.parent, new_parent)
        self.assertEqual(task_to_move.top_level_parent, new_parent)

    def test_move_task_under_wrong_parent(self):
        """
        A task cannot be moved under a parent belonging to a different user.
        """
        parent = self.create_task("parent", users=[self.user_2])

        self.client.force_login(self.user_1)
        response = self.client.patch(self.edit_url, {
            "parent": parent.id,
        }, content_type="application/json")

        self.assertEqual(response.status_code, 400, response.data)

    def test_move_task_under_wrong_parent(self):
        """
        A task cannot be moved under a descendant of a top-level task belonging
        to a different user.
        """
        top_parent = self.create_task("top parent", users=[self.user_2])
        middle_parent = self.create_task("middle parent", parent=top_parent)

        self.client.force_login(self.user_1)
        response = self.client.patch(self.edit_url, {
            "parent": middle_parent.id,
        }, content_type="application/json")

        self.assertEqual(response.status_code, 400, response.data)

    def test_cannot_donate_task(self):
        """
        Editing the `users` field in the submitted data is ignored.
        """
        self.client.force_login(self.user_1)
        response = self.client.patch(self.edit_url, {
            "text": "An updated task",
            "users": [self.user_2.id],
        }, content_type="application/json")

        self.assertEqual(response.status_code, 200, response.data)

        self.task.refresh_from_db()
        self.assertEqual(self.task.text, "An updated task")
        self.assertCountEqual(self.task.users.all(), [self.user_1])
    