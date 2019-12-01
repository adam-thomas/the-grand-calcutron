import {transaction} from "mobx";

import ajax_requests from "./ajax_requests";
import taskState from "./state";


function add_task(title, parent_task) {
    let data = {
        title: title,
        parent: parent_task.id,
    };

    ajax_requests.post("/new", data, (return_data) => {
        taskState.addTask(parent_task.id, return_data);
    });
}


function delete_task(task) {
    let data = {
        id: task.id,
        parent: task.parent,
    };

    ajax_requests.post("/delete", data, () => {
        let parent_children = taskState.tasks_by_id[task.parent].children;
        transaction(() => {
            delete taskState.tasks_by_id[task.id];
            delete parent_children[task.id];
        });
    });
}


export default {
    add_task,
    delete_task,
}
