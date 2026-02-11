from rest_framework import permissions


def can_access_task(user, task):
    """
    Check whether this user has permission to access this task.
    
    Climb up the task's parental hierarchy until we reach the top;
    if the top-level parent has this user in its users list, grant
    permission, and deny otherwise.
    """
    user_list_manager = task.top_level_parent.users if task.top_level_parent else task.users

    return user in user_list_manager.all()


class TaskAccessPermission(permissions.BasePermission):
    message = "You don't have access to this task."

    def has_object_permission(self, request, view, obj):
        return can_access_task(request.user, obj)
