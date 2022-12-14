from django import forms

from .models import Task


class NewTaskForm(forms.ModelForm):
    class Meta:
        model = Task
        fields = ["parent", "text"]


class DeleteTaskForm(forms.Form):
    id = forms.IntegerField()


class EditTaskForm(forms.Form):
    id = forms.IntegerField()
    text = forms.Textarea()
    parent = forms.IntegerField(required=False)
    sort_order = forms.IntegerField(required=False)


class SetDoneTaskForm(forms.Form):
    id = forms.IntegerField()
    done = forms.BooleanField(required=False)
