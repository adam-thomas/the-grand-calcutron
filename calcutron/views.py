from django.contrib.auth.mixins import LoginRequiredMixin
from django.http import JsonResponse
from django.shortcuts import redirect
from django.views.generic import CreateView, FormView, View
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


class MainView(LoginRequiredMixin, ListView):
    model = Task
    template_name = "calcutron/main.html"

    def dispatch(self, request, *args, **kwargs):
        self.request = request
        return super().dispatch(request, *args, **kwargs)

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        queryset = self.get_queryset()

        tabs = queryset.filter(parent__isnull=True, users=self.request.user)
        context["tabs"] = tabs
        context["contents"] = {}

        for tab in tabs:
            context["contents"][tab.id] = queryset.filter(parent=tab)

        return context


class GetAllTasksView(LoginRequiredMixin, View):
    def get(self, request, *args, **kwargs):
        tasks = Task.objects.all()
        return JsonResponse({
            t.id: task_to_dict(t)
            for t in tasks
        })


class TaskView(LoginRequiredMixin, FormView):
    model = Task
    success_url = "/"
    template_name = "calcutron/task_children.html"

    def dispatch(self, request, *args, **kwargs):
        self.request = request
        return super().dispatch(request, *args, **kwargs)

    def resolve_form(self, form):
        # Must set self.object.
        pass

    def return_result(self, errors=None):
        if self.request.is_ajax():
            return JsonResponse(task_to_dict(self.object))
        else:
            return redirect("/")

    def form_invalid(self, form):
        if self.request.is_ajax():
            return JsonResponse({"errors": form.errors})
        else:
            return redirect("/")

    def form_valid(self, form):
        self.resolve_form(form)

        if self.request.is_ajax():
            return JsonResponse(task_to_dict(self.object))
        else:
            return redirect("/")


class NewTaskView(TaskView):
    form_class = NewTaskForm

    def resolve_form(self, form):
        self.object = form.save()
        self.object.users.add(self.request.user)


class DeleteTaskView(TaskView):
    form_class = DeleteTaskForm

    def resolve_form(self, form):
        self.object = self.model.objects.get(id=form.cleaned_data["id"])
        parent = self.object.parent
        self.object.delete()


class EditTaskView(TaskView):
    form_class = EditTaskForm

    def resolve_form(self, form):
        self.object = self.model.objects.get(id=form.cleaned_data["id"])
        self.object.title = form.cleaned_data["title"]
        self.object.save()
