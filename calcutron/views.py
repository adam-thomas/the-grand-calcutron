from django.views.generic import CreateView
from django.views.generic.list import ListView

from .forms import NewTaskForm
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
    success_url = "/"
