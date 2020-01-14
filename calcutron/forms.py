from django import forms

from .models import Task


class NewTaskForm(forms.ModelForm):
    class Meta:
        model = Task
        fields = ["parent", "title"]


class DeleteTaskForm(forms.Form):
    id = forms.IntegerField()


class EditTaskForm(forms.Form):
    id = forms.IntegerField()
    title = forms.CharField(max_length=255)


class SetDoneTaskForm(forms.Form):
    id = forms.IntegerField()
    done = forms.BooleanField(required=False)
