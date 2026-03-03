import { computed, observable, runInAction } from "mobx";

import api_requests from "./api_requests";
import taskState from "./state";

// Buffers.
// Use more than one buffer here so that we can perform operations in a safe order.
// Create actions must happen first, then edits, then deletions. This minimises the
// risk of invalid IDs causing problems.
const buffered_operations = observable({
    create: new Set(),
    update: new Set(),
    delete: new Set(),
});

// Wait a certain amount of time (ms) between requests to
// avoid churning the server.
// TODO: Set up bulk updates (especially for moving tasks and
// updating a load of sort_order values) and extend the cooldown
// a bit.
const cooldownTime = 1000;

// Store whether a mutation is actively occurring.
let mutationPromise = null;

// Maintain a set of all tasks in the buffer for convenient checking purposes.
const buffered_tasks = computed(() => {
    return new Set([
        ...buffered_operations.create,
        ...buffered_operations.update,
        ...buffered_operations.delete,
    ]);
})


export default function mutateTask(task, operation_key) {
    if (!Object.keys(buffered_operations).includes(operation_key)) {
        throw "Invalid task mutation key " + operation_key;
    }

    buffered_operations[operation_key].add(task);

    if (!mutationPromise) {
        applyNextMutation();
    }
}


export function isBuffered(task) {
    return buffered_tasks.get().has(task);
}


function popNextTask(buffer) {
    // Take an arbitrary task from the buffer. Remove it to avoid spurious repeats.
    const task = buffer.values().next().value;
    buffer.delete(task);

    // Filter the task down to only the fields the backend will accept, and return
    // that alongside the task itself.
    return {
        task: task,
        post_data: {
            done: task.done,
            parent_id: task.parent.id,
            sort_order: task.sort_order,
            text: task.text,
        },
    }
}


function applyNextMutation() {
    if (buffered_tasks.get().size === 0) {
        mutationPromise = null;
        return Promise.resolve();
    }

    // Run the relevant API request.
    let request_promise;

    // Look through the three buffers in strict order, and run the request appropriate
    // to what we find first.
    // Create operations always come first, so that if a task is created and then edited,
    // its ID is valid for the update operation. Likewise, delete operations come last,
    // so that if a task is both edited and removed, its ID is valid for that update
    // operation.
    if (buffered_operations.create.size !== 0) {
        const {task, post_data} = popNextTask(buffered_operations.create);

        // A task without an ID needs to be created in the database.
        // When it comes back, set its new ID and sort_order properly.
        request_promise = api_requests.post("/new/", post_data).then((task_data) => {
            runInAction(() => {
                taskState.setRealId(task, task_data.id, task_data.sort_order);
            })
        });

    } else if (buffered_operations.update.size !== 0) {
        const {task, post_data} = popNextTask(buffered_operations.update);
        request_promise = api_requests.patch(`/edit/${task.id}/`, post_data);

    } else {
        const {task} = popNextTask(buffered_operations.delete);
        request_promise = api_requests.delete(`/edit/${task.id}/`);
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
            buffered_operations.clear();
        }
    )
    return mutationPromise;
}
