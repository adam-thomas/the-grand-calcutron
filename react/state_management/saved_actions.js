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
    const new_task = taskState.addTask(parent, { text });
    mutateTask(new_task, "create");
}


function deleteTask(task) {
    taskState.deleteTask(task);
    mutateTask(task, "delete");
}


function setTaskText(task, text) {
    runInAction(() => {
        task.text = text;
    });

    mutateTask(task, "update");
}


function setTaskDone(task, done) {
    runInAction(() => {
        task.done = done;
    });

    mutateTask(task, "update");
}


function moveTask(task, new_sort_order, new_parent=undefined) {
    taskState.setSortOrder(task, new_sort_order, new_parent);
    mutateTask(task, "update");
}


export default {
    addTask,
    deleteTask,
    setTaskText,
    setTaskDone,
    moveTask,
}
