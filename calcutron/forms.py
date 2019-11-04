from django.forms import ModelForm

from .models import Task


class NewTaskForm(ModelForm):
    class Meta:
        model = Task
        fields = ["parent", "title"]
