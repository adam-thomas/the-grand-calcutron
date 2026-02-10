import taskState from "./state";


function _add_csrf(request_data) {
    return Object.assign({csrfmiddlewaretoken: taskState.csrf}, request_data);
}

function _run_fetch(url, options, success_callback) {
    // Set up JSON parsing and success and failure handling. All errors are reported
    // in basic fashion, using an `alert`, and re-thrown for other Promises to
    // potentially catch later.
    return fetch(url, options).then(
        (response) => {
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
        body: _add_csrf(data),
    }, success_callback);
}

function patch(url, data, success_callback) {
    return _run_fetch(url, {
        method: "PATCH",
        body: _add_csrf(data),
    }, success_callback);
}

function remove(url, data, success_callback) {
    return _run_fetch(url, {
        method: "DELETE",
        body: _add_csrf(data),
    }, success_callback);
}


export default {
    get,
    post,
    patch,
    delete: remove,
}
