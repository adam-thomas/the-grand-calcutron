import {action, observable, transaction} from "mobx";
import actions from "./actions";


class TaskState {
    @observable tasks = {};
    @observable tasks_by_id = {};
    @observable active_tab = null;
    @observable is_mobile = false;
    @observable dragged_item = null;
    csrf = null;

    tasks_base = Object.freeze({
        title: "",
        long_text: null,
        id: null,
        sort_order: null,
        parent: null,
        children: {},
    });


    initialise(tasks) {
        transaction(() => {
            this.tasks = {};
            this.tasks_by_id = {};
            this.active_tab = null;

            // Fill out tasks_by_id first, so that all the tasks exist for when we're constructing
            // the full tree of parents and children.
            for (let task_data of Object.values(tasks)) {
                let task = Object.assign({}, this.tasks_base, task_data)
                this.tasks_by_id[task.id] = task;

                if (task.parent === null && this.active_tab === null) {
                    this.active_tab = task_data.id;
                }
            }

            // Then, fill out the parent-child relationships.
            for (let task of Object.values(this.tasks_by_id)) {
                if (task.parent !== null) {
                    this.tasks_by_id[task.parent].children[task.id] = task;
                } else {
                    this.tasks[task.id] = task;
                }
            }
        });
    }


    @action.bound
    addTask(parent_id, task_data) {
        if (parent_id === null) {
            return this.addRootTask(task_data);
        }

        let parent = this.tasks_by_id[parent_id];
        task_data = Object.assign({}, this.tasks_base, task_data, {parent: parent_id});

        parent.children[task_data.id] = task_data;

        let new_task = parent.children[task_data.id];
        this.tasks_by_id[task_data.id] = new_task;
        return new_task;
    }


    @action.bound
    addRootTask(task_data) {
        task_data = Object.assign({}, this.tasks_base, task_data, {parent: null});
        this.tasks[task_data.id] = task_data;

        let new_task = this.tasks[task_data.id];
        this.tasks_by_id[task_data.id] = new_task;

        if (this.active_tab === null) {
            this.active_tab = task_data.id;
        }

        return new_task;
    }


    isAncestor(task, potential_ancestor) {
        // Return true iff `potential_ancestor` is above `task` in the tree, or is `task` itself.
        let parent_id = task.id;
        while (parent_id !== null) {
            if (parent_id === potential_ancestor.id) {
                return true;
            }

            parent_id = this.tasks_by_id[parent_id].parent;
        }

        return false;
    }


    @action.bound
    setSortOrder(task, new_value, new_parent=undefined) {
        task.sort_order = new_value;
        actions.moveTask(task, new_value, new_parent);
    }


    // Move a task into another parent, and set its sort_order to be at the end of that parent's
    // list of children.
    @action.bound
    setTaskParent(task, target_parent, skip_save=false) {
        // If `task` is an ancestor of `target_parent`, do nothing - we don't want to move a task
        // inside itself.
        if (this.isAncestor(target_parent, task)) {
            return;
        }

        // Set the moved task's sort_order to be after those of its new siblings.
        let max_sort_order = 0;
        for (let child of Object.values(target_parent.children)) {
            max_sort_order = Math.max(max_sort_order, child.sort_order);
        }
        task.sort_order = max_sort_order + 1;

        // Move `task` from its parent's set of children to `target_parent`'s set of children.
        let original_parent = this.tasks_by_id[task.parent];
        delete original_parent.children[task.id];
        target_parent.children[task.id] = task;
        task.parent = target_parent.id;

        // Tell the API about the changes - both to the sort order and to the parent.
        if (!skip_save) {
            this.setSortOrder(task, max_sort_order + 1, target_parent.id);
        }
    }


    @action.bound
    moveTaskBefore(task, target_task) {
        // If `task` is an ancestor of `target_task`, do nothing - we don't want to move a task
        // inside itself.
        if (this.isAncestor(target_task, task)) {
            return;
        }

        let target_parent = this.tasks_by_id[target_task.parent];

        // If the task being moved isn't in the same level of the hierarchy as the target,
        // update that first.
        if (task.parent !== target_task.parent) {
            this.setTaskParent(task, target_parent, true);
        }

        let new_sort_order = target_task.sort_order;

        if (task.sort_order > target_task.sort_order) {
            // If the task being moved is currently below the target task,
            // move the target and everything in between the two down by one.
            for (let child of Object.values(target_parent.children)) {
                if (child.sort_order < task.sort_order && child.sort_order >= target_task.sort_order) {
                    this.setSortOrder(child, child.sort_order + 1);
                }
            }

        } else {
            // If the task being moved is currently above the target task,
            // move everything between the two (but *not* the target) up by one.
            // Also decrement new_sort_order, so that the moved task comes in above target_task.
            for (let child of Object.values(target_parent.children)) {
                if (child.sort_order > task.sort_order && child.sort_order < target_task.sort_order) {
                    this.setSortOrder(child, child.sort_order - 1);
                }
            }
            new_sort_order--;
        }

        this.setSortOrder(task, new_sort_order, task.parent);
    }


    @action.bound
    moveTaskAfter(task, target_task) {
        // If `task` is an ancestor of `target_task`, do nothing - we don't want to move a task
        // inside itself.
        if (this.isAncestor(target_task, task)) {
            return;
        }

        let target_parent = this.tasks_by_id[target_task.parent];

        // If the task being moved isn't in the same level of the hierarchy as the target,
        // update that first.
        if (task.parent !== target_task.parent) {
            this.setTaskParent(task, target_parent, true);
        }

        let new_sort_order = target_task.sort_order;

        if (task.sort_order > target_task.sort_order) {
            // If the task being moved is currently below the target task,
            // move everything in between the two (but not the target) down by one.
            // Also increment new_sort_order, so that the moved task comes in below target_task.
            for (let child of Object.values(target_parent.children)) {
                if (child.sort_order < task.sort_order && child.sort_order > target_task.sort_order) {
                    this.setSortOrder(child, child.sort_order + 1);
                }
            }
            new_sort_order++;

        } else {
            // If the task being moved is currently above the target task,
            // move the target and everything between the two up by one.
            for (let child of Object.values(target_parent.children)) {
                if (child.sort_order > task.sort_order && child.sort_order <= target_task.sort_order) {
                    this.setSortOrder(child, child.sort_order - 1);
                }
            }
        }

        this.setSortOrder(task, new_sort_order, task.parent);
    }
}


let state = new TaskState();
export default state;
