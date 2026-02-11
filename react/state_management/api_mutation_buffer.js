import { runInAction } from "mobx";

import api_requests from "./api_requests";
import taskState from "./state";

// A value of `null` indicates the task should be deleted.
const buffered_tasks = new Set();

// This cooldown timer prevents lots of requests from happening
// too quickly.
const cooldownInterval = null;


export default function mutateTask(task) {
    if (buffered_tasks.has(task)) {
        return;
    }

    buffered_tasks.add(task);

    if (!cooldownInterval) {
        applyNextMutation();
    }
}


function applyNextMutation() {
    if (buffered_tasks.size === 0) {
        return Promise.resolve();
    }

    // Take an arbitrary task from the buffer. Remove it to avoid spurious repeats.
    const task = buffered_tasks.values().next().value;
    buffered_tasks.delete(task);

    // Run the relevant API request.
    let request_promise;

    // Filter the task down to only the fields the backend will accept.
    const post_data = {
        done: task.done,
        parent_id: task.parent_id,
        sort_order: task.sort_order,
        text: task.text,
    }

    if (task.id === null) {
        // A task without an ID needs to be created.
        request_promise = api_requests.post("/new/", post_data).then((task_data) => {
            runInAction(() => {
                taskState.setRealId(task, task_data.id);
            })
        });

    } else if (task.to_delete) {
        // This flag prepares a task for deletion.
        request_promise = api_requests.delete(`/edit/${task.id}/`);
    
    } else {
        // Update the task according to its current state.
        request_promise = api_requests.patch(`/edit/${task.id}/`, post_data);
    }

    // After the request completes, check whether there are any other tasks in the
    // buffer, and apply another mutation if so.
    return request_promise.then(applyNextMutation);
}
