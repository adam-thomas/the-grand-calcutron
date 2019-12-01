import {transaction} from "mobx";

import ajax_requests from "./ajax_requests";
import taskState from "./state";


function add_task(title, parent_task) {
    let id = (parent_task === null) ? null : parent_task.id;

    let data = {
        title: title,
        parent: id,
    };

    ajax_requests.post("/new", data, (return_data) => {
        taskState.addTask(id, return_data);
    });
}


function update_task(title, task) {
    let data = {
        title: title,
    };

    ajax_requests.post("/edit/" + task.id, data, (return_data) => {
        task.title = return_data.title;
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
