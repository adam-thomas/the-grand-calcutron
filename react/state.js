import {observable} from "mobx";


class TaskState {
    @observable tasks = {};
    @observable tasks_by_id = {};

    tasks_base = Object.freeze({
        title: "",
        long_text: null,
        id: null,
        order: null,
        parent: null,
        children: {},
    });

    initialise() {
        // todo: bring this in from the Django template
        this.addRootTask({title: "First Tab", id: 1});
        this.addRootTask({title: "Second Tab", id: 2});

        this.addTask(1, {title: "First child", id: 3});
        this.addTask(1, {title: "Second child", id: 4});
        this.addTask(3, {title: "First grandchild", id: 5});
        this.addTask(3, {title: "Second grandchild", id: 6});
    }

    addTask(parent_id, task_data) {
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
        return new_task;
    }
}


let state = new TaskState();
export default state;
