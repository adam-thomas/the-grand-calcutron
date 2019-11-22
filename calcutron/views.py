from django.contrib.auth.mixins import LoginRequiredMixin
from django.shortcuts import redirect
from django.views.generic import CreateView, FormView
from django.views.generic.list import ListView

from .forms import DeleteTaskForm, EditTaskForm, NewTaskForm
from .models import Task


class MainView(LoginRequiredMixin, ListView):
    model = Task
    template_name = "calcutron/base.html"

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
            return self.render_to_response({"task": self.object.parent, "depth": 0, "errors": None})
        else:
            return redirect("/")

    def form_invalid(self, form):
        return self.return_result(form.errors)

    def form_valid(self, form):
        self.resolve_form(form)
        return self.return_result()


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
