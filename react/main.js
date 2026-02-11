// Required by Webpack Less build
require("../calcutron/static/styles/main.less");

import $ from "jquery";
import React from "react";
import ReactDOM from "react-dom";

import ajax_requests from "./api_requests/api_requests";
import taskState from "./state";
import {BaseRoutedApp} from "./navigation/router";


// Track the DOM element that React will be added to.
let target;

// Store a pointer to a repeating task data reload.
let reloadTaskInterval = null;


// Update taskState.screen_width to reflect the current size of the window.
function saveScreenWidth() {
    taskState.screen_width = $(window).width();
}


// Poll the task data endpoint and update the taskState accordingly.
// This also functions as a health check, since if the user isn't logged in,
// the ensuing 401 response will cause a redirect to the login page as per
// the handling in ajax_requests.js.
function loadTasks() {
    return ajax_requests.get("/get_tasks/").then(
        (return_data) => {
            taskState.initialise(return_data);
        }
    );
}


// Start the automatic task reloading. It fires immediately, then once every two
// minutes thereafter.
// TODO: Improve performance on the loading request so this can be done more regularly.
function startAutoReload() {
    loadTasks();

    // TODO: Reinstate this, but a) don't undo whatever you just
    //   did, b) show the loading state visibly in the UI.
    // if (reloadTaskInterval === null) {
    //     reloadTaskInterval = setInterval(loadTasks, 30 * 1000);
    // }
}


// Stop the auto-reload again.
function stopAutoReload() {
    if (reloadTaskInterval !== null) {
        clearInterval(reloadTaskInterval);
        reloadTaskInterval = null;
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

    // Start loading the tasks, and reload them automatically while the page is focused.
    startAutoReload();
    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            startAutoReload();
        } else {
            stopAutoReload();
        }
    });
}


// Call initialise() when the page is ready.
$(document).ready(initialise);
