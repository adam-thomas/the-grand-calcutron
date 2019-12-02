from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import Http404, JsonResponse
from django.shortcuts import redirect
from django.views.generic import CreateView, FormView, TemplateView, View
from django.views.generic.list import ListView

from .forms import DeleteTaskForm, EditTaskForm, NewTaskForm
from .models import Task


def task_to_dict(task):
    # We can't just use model_to_dict here because the User isn't JSON-serializable.
    # TODO: I should probably install DRF at some point
    return {
        "id": task.id,
        "parent": task.parent_id,
        "title": task.title,
        "long_text": task.long_text,
        "order": task.sort_order,
    }


class MainView(LoginRequiredMixin, TemplateView):
    template_name = "calcutron/main.html"


class GetAllTasksView(LoginRequiredMixin, View):
    def get(self, request, *args, **kwargs):
        tasks = Task.objects.all()
        return JsonResponse({
            t.id: task_to_dict(t)
            for t in tasks
        })


class AjaxTaskView(LoginRequiredMixin, FormView):
    model = Task
    success_url = "/"
    template_name = ""

    def dispatch(self, request, *args, **kwargs):
        if not self.request.is_ajax():
            raise Http404

        self.request = request
        return super().dispatch(request, *args, **kwargs)

    def resolve_form(self, form):
        # Must set self.object.
        pass

    def form_invalid(self, form):
        return JsonResponse({"errors": form.errors})

    def form_valid(self, form):
        self.resolve_form(form)
        return JsonResponse(task_to_dict(self.object))


class NewTaskView(AjaxTaskView):
    form_class = NewTaskForm

    def resolve_form(self, form):
        self.object = form.save()
        self.object.users.add(self.request.user)


class DeleteTaskView(AjaxTaskView):
    form_class = DeleteTaskForm

    def resolve_form(self, form):
        self.object = self.model.objects.get(id=form.cleaned_data["id"])
        parent = self.object.parent
        self.object.delete()


class EditTaskView(AjaxTaskView):
    form_class = EditTaskForm

    def resolve_form(self, form):
        self.object = self.model.objects.get(id=form.cleaned_data["id"])
        self.object.title = form.cleaned_data["title"]
        self.object.save()
