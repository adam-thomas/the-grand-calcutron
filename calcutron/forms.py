from django import forms

from .models import Task


class NewTaskForm(forms.ModelForm):
    class Meta:
        model = Task
        fields = ["parent", "title"]


class DeleteTaskForm(forms.Form):
    id = forms.IntegerField()
