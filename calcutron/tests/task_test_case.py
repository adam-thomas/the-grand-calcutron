from django.contrib.auth.models import User
from django.test import TestCase

from ..models import Task


class TaskTestCase(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user_1 = User.objects.create_user("leeroy")
        cls.user_2 = User.objects.create_user("jenkins")

    @classmethod
    def create_task(cls, text, *, parent=None, users=None, **kwargs):
        # Calculate what the top-level parent should be.
        top_level_parent = (parent.top_level_parent or parent) if parent else None

        data = {
            "text": text,
            "parent": parent,
            "top_level_parent": top_level_parent,
        }
        data.update(**kwargs)

        task = Task.objects.create(**data)
        if users:
            task.users.set(users)

        return task
    