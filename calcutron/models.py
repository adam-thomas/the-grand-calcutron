from django.db import models
from orderable.models import Orderable


class Task(Orderable):
    parent = models.ForeignKey("calcutron.Task", blank=True, null=True, on_delete=models.CASCADE, related_name="children")
    date_created = models.DateTimeField(auto_now_add=True)
    text = models.TextField()
    done = models.BooleanField(default=False)
    users = models.ManyToManyField("auth.User", blank=True)

    def __str__(self):
        return self.text
