from django.db import models
from orderable.models import Orderable


class Task(Orderable):
    parent = models.ForeignKey("calcutron.Task", blank=True, null=True, on_delete=models.CASCADE, related_name="children")
    date_created = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=255)
    long_text = models.TextField(blank=True, null=True)
    done = models.BooleanField(default=False)
    users = models.ManyToManyField("auth.User", blank=True, null=True)

    def __str__(self):
        return self.title
