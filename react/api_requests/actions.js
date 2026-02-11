import {transaction} from "mobx";

import ajax_requests from "./api_requests";
import navigate from "../navigation/navigate";
import taskState from "../state";


function addTask(text, parent, task_list_container=null) {
    let data = {
        text: text,
        parent_id: parent.id,
    };

    return ajax_requests.post("/new/", data).then((return_data) => {
        const new_task = taskState.addTask(parent, return_data);

        if (task_list_container) {
            let container_obj = $(task_list_container);
            container_obj.scrollTop(container_obj[0].scrollHeight);
        }

        return new_task;
    });
}


function deleteTask(task) {
    return ajax_requests.delete(`/edit/${task.id}/`).then(() => {
        transaction(() => {
            if (taskState.hierarchy.includes(task)) {
                navigate.toTask(task.parent);
            }

            // Remove the deleted task from objects that reference it.
            delete task.parent.children[task.id];
            delete taskState.tasks_by_id[task.id];
        });
    });
}


function editTask(task, data) {
    return ajax_requests.patch(`/edit/${task.id}/`, data);
}


function setTaskText(task, text) {
    const data = {
        text: text,
    };

    return editTask(task, data).then((return_data) => {
        task.text = return_data.text;
    });
}


function setTaskDone(task, done) {
    const data = {
        done: done,
    };

    return editTask(task, data).then((return_data) => {
        task.done = return_data.done;
    });
}


function moveTask(task, new_sort_order, new_parent=undefined) {
    const data = {
        sort_order: new_sort_order,
    };

    if (new_parent !== undefined) {
        data.parent_id = new_parent.id;
    }

    return editTask(task, data);
}


export default {
    addTask,
    deleteTask,
    setTaskText,
    setTaskDone,
    moveTask,
}
