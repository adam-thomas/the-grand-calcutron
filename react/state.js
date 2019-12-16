import {observable, transaction} from "mobx";


class TaskState {
    @observable tasks = {};
    @observable tasks_by_id = {};
    @observable active_tab = null;
    @observable is_mobile = false;
    csrf = null;

    tasks_base = Object.freeze({
        title: "",
        long_text: null,
        id: null,
        order: null,
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
}


let state = new TaskState();
export default state;
