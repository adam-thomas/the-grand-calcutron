// Required by Webpack Less build
require("../calcutron/static/styles/main.less");

import $ from "jquery";
import React from "react";
import ReactDOM from "react-dom";

import ajax_requests from "./ajax_requests";
import taskState from "./state";
import {BaseRoutedApp} from "./router";


// Track the DOM element that React will be added to.
let target;

// Store a pointer to a repeating login health check.
let healthCheckInterval = null;


// Update taskState.screen_width to reflect the current size of the window.
function saveScreenWidth() {
    taskState.screen_width = $(window).width();
}


// Poll the task data endpoint and update the taskState accordingly.
// This also functions as a health check, since if the user isn't logged in,
// the ensuing 401 response will cause a redirect to the login page as per
// the handling in ajax_requests.js.
function healthCheck() {
    return ajax_requests.get("/get_tasks/").then(
        (return_data) => {
            taskState.initialise(return_data);
        }
    );
}


// Start the repeating health check. It should fire once every 30 seconds.
function startHealthCheck() {
    healthCheck();

    if (healthCheckInterval === null) {
        healthCheckInterval = setInterval(healthCheck, 30 * 1000);
    }
}


// Stop the health check again.
function stopHealthCheck() {
    if (healthCheckInterval !== null) {
        clearInterval(healthCheckInterval);
        healthCheckInterval = null;
    }
}


// Fill out the taskState and start up the React UI.
function initialise() {
    // Grab the element we're injecting into.
    target = document.getElementById("app");

    // If this element can't be found, we're not on the right page - for example,
    // we might be on the login page - so skip the rest of the initialisation.
    if (!target) {
        return;
    }
    
    // Create the React UI.
    saveScreenWidth();
    ReactDOM.render(<BaseRoutedApp />, target);

    // Get the CSRF token we added, and store it in the state.
    taskState.csrf = $(target).children("input[name=csrfmiddlewaretoken]").val();

    // Reinitialise the UI if the window is resized.
    $(window).resize(saveScreenWidth);

    // Start our login health checks. Run them whenever the page is focused, and
    // pause them otherwise.
    // The health checks also (re)load all the task data, so we can use that as an
    // initialisation step.
    startHealthCheck();
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            startHealthCheck();
        } else {
            stopHealthCheck();
        }
    });
}


// Call initialise() when the page is ready.
$(document).ready(initialise);
