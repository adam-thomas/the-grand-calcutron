import taskState from "../state";


function _run_fetch(url, method, data=null) {
    /**
     * Set up JSON parsing and success and failure handling. All errors are reported
     * in basic fashion, using an `alert`, and re-thrown for other Promises to
     * potentially catch later.
     * 
     * On a successful request, this function returns a Promise that contains the
     * parsed JSON data from the response, or nothing (null) if the response is
     * intentionally empty.
     */
    const options = {
        headers: {
            "X-CSRFToken": taskState.csrf,
            "Content-Type": "application/json",
        },
        method: method,
    };

    if (data) {
        options.body = JSON.stringify(data);
    }

    return fetch(url, options).then(
        (response) => {
            // Check for specific failure status codes that need actioning - if the user is logged
            // out, bounce them to the login page and throw a status error.
            // DRF's SessionAuthentication annoyingly returns 403s when the user isn't authenticated;
            // handle that as well as 401.
            if (!response.ok) {
                if ([403, 401].includes(response.status)) {
                    window.location = "/accounts/login";
                }
                throw {"status": response.status};
            }

            // Empty responses will throw an error if we try to call response.json() on them.
            // We can check for expected empty responses by testing the request method.
            // Clunky, but at least it also gives us protection against unexpected empty
            // responses to GET/POST/etc requests.
            if (options.method == "DELETE" && response.ok) {
                return null;
            }

            return response.json().then(
                (json_data) => {
                    // If JSON parsing succeeded, we either have a valid response with data, or a
                    // failure response with error messages.
                    if (response.ok) {
                        return json_data;
                    }
                    
                    alert(JSON.stringify(json_data));
                    throw json_data;
                },
                (error) => {
                    // If the JSON parsing failed, we either have a successful response with invalid
                    // contents, or a normal empty failure response with no extra data.
                    if (response.ok) {
                        alert(`Received invalid JSON in response: ${error}`);
                        throw error;
                    }

                    alert(`Request failed with status code ${response.status}`);
                    throw {"status": response.status};
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

function get(url) {
    return _run_fetch(url, "GET");
}

function post(url, data) {
    return _run_fetch(url, "POST", data);
}

function patch(url, data) {
    return _run_fetch(url, "PATCH", data);
}

function remove(url, data) {
    return _run_fetch(url, "DELETE", data);
}


export default {
    get,
    post,
    patch,
    delete: remove,
}
