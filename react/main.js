// Required by Webpack Less build
require("../calcutron/static/styles/main.less");

import $ from "jquery";
import {observer} from "mobx-react";
import React from "react";
import ReactDOM from "react-dom";

import taskState from "./state";
import DesktopUI from "./desktop_ui";
import MobileUI from "./mobile_ui";


// Track the DOM element that React will be added to.
let target;


// Update taskState.is_mobile to reflect the current size of the window.
function checkIsMobile() {
    taskState.is_mobile = ($(window).width() < 800);
}


// Top-level app component. Essentially delegates to DesktopUI or MobileUI,
// depending on how big the window is.
@observer class BaseApp extends React.Component {
    render() {
        let app_class = taskState.is_mobile ? MobileUI : DesktopUI;
        return React.createElement(app_class);
    }
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
        checkIsMobile();
        ReactDOM.render(<BaseApp />, target);

        // Get the CSRF token we added, and store it in the state.
        taskState.csrf = $(target).children("input[name=csrfmiddlewaretoken]").val();

        // Reinitialise the UI if the window is resized.
        $(window).resize(checkIsMobile);
    });
}


// Call initialise() when the page is ready.
$(document).ready(initialise);
