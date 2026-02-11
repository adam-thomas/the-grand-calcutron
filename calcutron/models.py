from django.db import models
from orderable.models import Orderable
from orderable.managers import OrderableManager


class TaskManager(OrderableManager):
    def for_user(self, user):
        """
        Look up all tasks visible to the given user. A task is visible to a user if
        that user is in the users list of the top-level parent above that task in
        the hierarchy.
        """
        return self.filter(
            models.Q(parent__isnull=True, users=user) |
            models.Q(parent__isnull=False, top_level_parent__users=user)
        )


class Task(Orderable):
    parent = models.ForeignKey(
        "calcutron.Task",
        blank=True,
        null=True,
        on_delete=models.CASCADE,
        related_name="children",
    )

    date_created = models.DateTimeField(auto_now_add=True)
    text = models.TextField(blank=True, null=True)
    done = models.BooleanField(default=False)

    # This is only used on top-level parents,
    # to denote object permissions below them.
    users = models.ManyToManyField("auth.User", blank=True)

    # A shortcut FK to the parent object at the top of the hierarchy above this Task.
    # This is kept for performance and convenience reasons but is technically redundant;
    # ensuring this is valid must be done carefully.
    top_level_parent = models.ForeignKey(
        "calcutron.Task",
        blank=True,
        null=True,
        on_delete=models.CASCADE,
        related_name="all_descendants",
    )

    objects = TaskManager()

    def __str__(self):
        return self.text
