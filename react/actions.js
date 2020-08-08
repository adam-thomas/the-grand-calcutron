import {transaction} from "mobx";

import ajax_requests from "./ajax_requests";
import taskState from "./state";


function addTask(title, parent_id) {
    let data = {
        title: title,
        parent: parent_id,
    };

    ajax_requests.post("/new", data, (return_data) => {
        taskState.addTask(id, return_data);
    });
}


function deleteTask(task) {
    let data = {
        id: task.id,
        parent: task.parent,
    };

    ajax_requests.post("/delete", data, () => {
        transaction(() => {
            delete taskState.tasks_by_id[task.id];

            if (task.parent !== null) {
                let parent_children = taskState.tasks_by_id[task.parent].children;
                delete parent_children[task.id];
            } else {
                delete taskState.tasks[task.id];
            }

            if (taskState.active_tab === task.id) {
                let root_ids = Object.keys(taskState.tasks);
                if (root_ids.length > 0) {
                    // Object.keys() returns a list of strings, so we need parseInt() to restore
                    // the proper functionality.
                    taskState.active_tab = parseInt(root_ids[0]);
                } else {
                    taskState.active_tab = null;
                }
            }
        });
    });
}


function setTaskTitle(task, title) {
    let data = {
        id: task.id,
        title: title,
    };

    ajax_requests.post("/edit", data, (return_data) => {
        task.title = return_data.title;
    });
}


function setTaskDone(task, done) {
    let data = {
        id: task.id,
        done: done,
    };

    ajax_requests.post("/done", data, (return_data) => {
        task.done = return_data.done;
    });
}


function setTaskParent(task, new_parent_id) {
    let data = {
        id: task.id,
        parent: new_parent_id,
    };

    ajax_requests.post("/edit", data, () => {});
}


function moveTask(task, new_sort_order, new_parent=undefined) {
    let data = {
        id: task.id,
        sort_order: new_sort_order,
    };

    if (new_parent !== undefined) {
        data.parent = new_parent.id;
    }

    ajax_requests.post("/edit", data, () => {});
}


export default {
    addTask,
    deleteTask,
    setTaskTitle,
    setTaskDone,
    setTaskParent,
    moveTask,
}
