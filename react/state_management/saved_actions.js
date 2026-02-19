import {runInAction, transaction} from "mobx";

import api_requests from "./api_requests";
import navigate from "../navigation/navigate";
import taskState from "./state";
import mutateTask from "./api_mutation_buffer";


/**
 * This file contains functions that update both the local state and the
 * database. Changes made are generally reflected immediately in local
 * state, and saved asynchronously. Requests are buffered to avoid
 * spamming the backend.
 */


function addTask(text, parent) {
    const existing_sort_orders = [
        ...Object.values(parent.children).map(c => c.sort_order),
        0
    ];
    const new_sort_order = Math.max(existing_sort_orders) + 1;

    const new_task = taskState.addTask(parent, {
        text,
        sort_order: new_sort_order,
    });

    mutateTask(new_task);

    // let data = {
    //     text: text,
    //     parent_id: parent.id,
    // };
    // 
    // return api_requests.post("/new/", data).then((task_data) => {
    //     runInAction(() => {
    //         new_task.id = task_data.id;
    //     })
    // });
}


function deleteTask(task) {
    taskState.deleteTask(task);
    mutateTask(task);

    // return api_requests.delete(`/edit/${task.id}/`).then(() => {
    //     transaction(() => {
    //         if (taskState.hierarchy.includes(task)) {
    //             navigate.toTask(task.parent);
    //         }

    //         // Remove the deleted task from objects that reference it.
    //         delete task.parent.children[task.id];
    //         delete taskState.tasks_by_id[task.id];
    //     });
    // });
}


// function editTask(task, data) {
//     return api_requests.patch(`/edit/${task.id}/`, data);
// }


function setTaskText(task, text) {
    runInAction(() => {
        task.text = text;
    });

    mutateTask(task);

    // const data = {
    //     text: text,
    // };

    // return editTask(task, data).then((return_data) => {
    //     task.text = return_data.text;
    // });
}


function setTaskDone(task, done) {
    runInAction(() => {
        task.done = done;
    });

    mutateTask(task);
    // const data = {
    //     done: done,
    // };

    // return editTask(task, data).then((return_data) => {
    //     task.done = return_data.done;
    // });
}


function moveTask(task, new_sort_order, new_parent=undefined) {
    taskState.setSortOrder(task, new_sort_order, new_parent);
    mutateTask(task);

    // const data = {
    //     sort_order: new_sort_order,
    // };

    // if (new_parent !== undefined) {
    //     data.parent_id = new_parent.id;
    // }

    // return editTask(task, data);
}


export default {
    addTask,
    deleteTask,
    setTaskText,
    setTaskDone,
    moveTask,
}
