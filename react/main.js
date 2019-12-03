import $ from "jquery";
import React from "react";
import ReactDOM from "react-dom";

import taskState from "./state";
import DesktopUI from "./desktop_ui";
import MobileUI from "./mobile_ui";


// Track the DOM element that React will be added to.
let target;


// Create the appropriate React UI for how big the window is.
function renderReact() {
    let app_class = DesktopUI;
    if ($(window).width() < 800) {
        app_class = MobileUI;
    }

    ReactDOM.render(React.createElement(app_class), target);
}


// Fill out the taskState and start up the React UI.
function initialise() {
    // Grab the element we're injecting into.
    target = document.getElementById("app");

    // Basic error checking.
    if (!target) {
        console.error("Failed to find an element with id='app'");
        return;
    }

    // Get the tasks from the backend, and initialise the state with them.
    // (This will happen after the app is initially rendered.)
    $.get("/get_tasks", (return_data) => {
        taskState.initialise(return_data);

        // Create the React UI.
        renderReact();

        // Get the CSRF token we added, and store it in the state.
        taskState.csrf = $(target).children("input[name=csrfmiddlewaretoken]").val();

        // Reinitialise the UI if the window is resized.
        $(window).resize(renderReact);
    });
}


// Call initialise() when the page is ready.
$(document).ready(initialise);
