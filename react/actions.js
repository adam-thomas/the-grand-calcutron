import {transaction} from "mobx";

import ajax_requests from "./ajax_requests";
import taskState from "./state";


function addTask(title, parent_task) {
    let id = (parent_task === null) ? null : parent_task.id;

    let data = {
        title: title,
        parent: id,
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


function updateTask(title, task) {
    let data = {
        id: task.id,
        title: title,
    };

    ajax_requests.post("/edit", data, (return_data) => {
        task.title = return_data.title;
    });
}


function setDoneTask(done, task) {
    let data = {
        id: task.id,
        done: done,
    };

    ajax_requests.post("/done", data, (return_data) => {
        task.done = return_data.done;
    });
}


export default {
    addTask,
    deleteTask,
    updateTask,
    setDoneTask,
}
