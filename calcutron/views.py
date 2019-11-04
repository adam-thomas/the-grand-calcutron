from django.views.generic import CreateView, FormView
from django.views.generic.list import ListView

from .forms import DeleteTaskForm, NewTaskForm
from .models import Task


class MainView(ListView):
    model = Task
    template_name = "calcutron/main.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)

        queryset = self.get_queryset()

        tabs = queryset.filter(parent__isnull=True)
        context["tabs"] = tabs
        context["contents"] = {}

        for tab in tabs:
            context["contents"][tab.id] = queryset.filter(parent=tab)

        return context


class NewTaskView(CreateView):
    model = Task
    form_class = NewTaskForm
    template_name = "calcutron/task_children.html"

    def dispatch(self, request, *args, **kwargs):
        if not request.is_ajax():
            raise Http404("Attempted to send a non-AJAX request to an AJAX view!")
        return super().dispatch(request, *args, **kwargs)

    def form_valid(self, form):
        self.object = form.save()
        return self.render_to_response({"task": self.object.parent})


class DeleteTaskView(FormView):
    model = Task
    form_class = DeleteTaskForm
    template_name = "calcutron/task_children.html"

    def dispatch(self, request, *args, **kwargs):
        if not request.is_ajax():
            raise Http404("Attempted to send a non-AJAX request to an AJAX view!")
        return super().dispatch(request, *args, **kwargs)

    def form_valid(self, form):
        self.object = self.model.objects.get(id=form.cleaned_data["id"])
        parent = self.object.parent
        self.object.delete()
        return self.render_to_response({"task": parent})
