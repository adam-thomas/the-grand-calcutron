
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('calcutron', '0003_task_users'),
    ]

    def set_sort_orders(apps, schema_editor):
        Task = apps.get_model("calcutron", "Task")
        Task.objects.update(sort_order=models.F("pk"))

    operations = [
        migrations.RunPython(set_sort_orders, migrations.RunPython.noop),
    ]
