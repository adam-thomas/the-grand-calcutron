import taskState from "./state";


function _add_csrf(request_data) {
    return Object.assign({csrfmiddlewaretoken: taskState.csrf}, request_data);
}

function _run_fetch(url, options, success_callback) {
    // Set up JSON parsing and success and failure handling. All errors are reported
    // in basic fashion, using an `alert`, and re-thrown for other Promises to
    // potentially catch later.
    options = {
        ...options,
        headers: {
            ...(options.headers || {}),
            "X-CSRFToken": taskState.csrf,
            "Content-Type": "application/json",
        },
    };

    if (options.body) {
        options.body = JSON.stringify(options.body);
    }

    return fetch(url, options).then(
        (response) => {
            // Empty responses will throw an error if we try to call response.json() on them.
            // We can check for expected empty responses by testing the request method.
            // Clunky, but at least it also gives us protection against unexpected empty
            // responses to GET/POST/etc requests.
            if (options.method == "DELETE") {
                success_callback();
                return;
            }

            return response.json().then(
                (json_data) => {
                    if (json_data.errors) {
                        console.error("Request failed with errors", json_data.errors);
                        alert(Object.values(json_data.errors));
                        throw json_data.errors;
                    }
                    success_callback(json_data);
                },
                (error) => {
                    console.error(error);
                    alert(`Received invalid JSON in response: ${error}`);
                    throw error;
                },
            );
        },
        (error) => {
            console.error(error);
            alert(error);
            throw error;
        },
    );
}

function get(url, success_callback) {
    return _run_fetch(url, {}, success_callback);
}

function post(url, data, success_callback) {
    return _run_fetch(url, {
        method: "POST",
        body: data,
    }, success_callback);
}

function patch(url, data, success_callback) {
    return _run_fetch(url, {
        method: "PATCH",
        body: data,
    }, success_callback);
}

function remove(url, data, success_callback) {
    return _run_fetch(url, {
        method: "DELETE",
        body: data,
    }, success_callback);
}


export default {
    get,
    post,
    patch,
    delete: remove,
}
