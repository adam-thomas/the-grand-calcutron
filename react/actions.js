import {transaction} from "mobx";

import ajax_requests from "./ajax_requests";
import taskState from "./state";


function addTask(title, parent, task_list_container=null) {
    let data = {
        title: title,
        parent: parent.id,
    };

    ajax_requests.post("/new", data, (return_data) => {
        taskState.addTask(parent, return_data);

        if (task_list_container) {
            let container_obj = $(task_list_container)
            container_obj.scrollTop(container_obj.height())
        }
    });
}


function deleteTask(task) {
    let data = {
        id: task.id,
        parent: task.parent.id,
    };

    ajax_requests.post("/delete", data, () => {
        transaction(() => {
            let parent_children = task.parent.children;
            delete parent_children[task.id];

            if (taskState.hierarchy.includes(task)) {
                taskState.active_task = task.parent;
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
    moveTask,
}
