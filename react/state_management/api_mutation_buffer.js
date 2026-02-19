import { runInAction } from "mobx";

import api_requests from "./api_requests";
import taskState from "./state";

// A value of `null` indicates the task should be deleted.
const buffered_tasks = new Set();

// Wait a certain amount of time (ms) between requests to
// avoid churning the server.
// TODO: Set up bulk updates (especially for moving tasks and
// updating a load of sort_order values) and extend the cooldown
// a bit.
const cooldownTime = 1000;

// Store whether a mutation is actively occurring.
let mutationPromise = null;


export default function mutateTask(task) {
    buffered_tasks.add(task);

    if (!mutationPromise) {
        applyNextMutation();
    }
}


function applyNextMutation() {
    if (buffered_tasks.size === 0) {
        mutationPromise = null;
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
        // A task without an ID needs to be created in the database.
        // When it comes back, set its new ID and sort_order properly.
        request_promise = api_requests.post("/new/", post_data).then((task_data) => {
            runInAction(() => {
                taskState.setRealId(task, task_data.id, task_data.sort_order);
            })
        });

    } else if (task.to_delete) {
        // This flag prepares a task for deletion.
        request_promise = api_requests.delete(`/edit/${task.id}/`);
    
    } else {
        // Update the task according to its current state.
        request_promise = api_requests.patch(`/edit/${task.id}/`, post_data);
    }

    // After the request completes, wait for the cooldown timer, then re-run this function
    // to check the buffer again and save another mutation if needed.
    // If a request fails, clear the buffer and reset to a neutral state.
    //
    // TODO: This might end up with weird consequences - either reset more properly (reload
    // the currently displayed data?) or try to continue gracefully. Retrying the previous
    // operation may help.
    mutationPromise = request_promise.then(
        () => {
            return new Promise((resolve) => setTimeout(resolve, cooldownTime)).then(applyNextMutation);
        },
        (error) => {
            alert(`Request failed: ${error}`);
            buffered_tasks.clear();
        }
    )
    return mutationPromise;
}
