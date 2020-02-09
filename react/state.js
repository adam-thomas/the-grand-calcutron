import {observable, transaction} from "mobx";


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

    setTaskParent(task, target_parent) {
        // Move a task into another parent, and set its sort_order to be at the end of that parent's
        // list of children.
        let original_parent = this.tasks_by_id[task.parent];
        if (target_parent === original_parent) {
            return;
        }

        delete original_parent.children[task.id];
        target_parent.children[task.id] = task;
        task.parent = target_parent.id;

        let max_sort_order = 0;
        for (let child in Object.values(target_parent.children)) {
            max_sort_order = Math.max(max_sort_order, child.sort_order);
        }
        task.sort_order = max_sort_order + 1;
    }

    moveTaskBefore(task, target_task) {
        let target_parent = this.tasks_by_id[target_task.parent];

        if (task.parent !== target_task.parent) {
            this.setTaskParent(task, target_parent);
        }

        if (task.id === target_task.id) {
            return;
        }

        let new_sort_order = target_task.sort_order - 1;

        if (task.sort_order > target_task.sort_order) {
            // If the task being moved is currently below the target task,
            // move the target and everything in between the two down by one.
            for (let child of Object.values(target_parent.children)) {
                if (child.sort_order < task.sort_order && child.sort_order >= target_task.sort_order) {
                    child.sort_order++;
                }
            }
        } else {
            // If the task being moved is currently above the target task,
            // move everything between the two (but *not* the target) up by one.
            for (let child of Object.values(target_parent.children)) {
                if (child.sort_order > task.sort_order && child.sort_order < target_task.sort_order) {
                    child.sort_order--;
                }
            }
        }

        task.sort_order = new_sort_order;
    }

    moveTaskAfter(task, target_task) {
        let target_parent = this.tasks_by_id[target_task.parent];

        if (task.parent !== target_task.parent) {
            this.setTaskParent(task, target_parent);
        }

        if (task.id === target_task.id) {
            return;
        }

        let new_sort_order = target_task.sort_order + 1;

        if (task.sort_order > target_task.sort_order) {
            // If the task being moved is currently below the target task,
            // move everything in between the two (but not the target) down by one.
            for (let child of Object.values(target_parent.children)) {
                if (child.sort_order < task.sort_order && child.sort_order > target_task.sort_order) {
                    child.sort_order++;
                }
            }
        } else {
            // If the task being moved is currently above the target task,
            // move the target and everything between the two up by one.
            for (let child of Object.values(target_parent.children)) {
                if (child.sort_order > task.sort_order && child.sort_order <= target_task.sort_order) {
                    child.sort_order--;
                }
            }
        }

        task.sort_order = new_sort_order;
    }
}


let state = new TaskState();
export default state;
