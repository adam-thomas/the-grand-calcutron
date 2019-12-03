import DjangoCSRFToken from 'django-react-csrftoken';
import {observer} from "mobx-react";
import React from "react";

import taskState from "./state";
import tasks from "./tasks";


@observer class TabMenu extends React.Component {
    render() {
        let active_task = taskState.tasks[taskState.active_tab];

        return (
            <div className="mobile-menu-bar">
                <button className="tab-menu-open-wrapper">
                    v
                </button>

                <div className="tab-display active button">{active_task.title}</div>
            </div>
        );
    }
}


@observer export default class MobileUI extends React.Component {
    render() {
        let active_task = taskState.tasks[taskState.active_tab];

        return (
            <div className="mobile-ui calcutron">
                <DjangoCSRFToken key="csrf" />
                <TabMenu key="tabs" />

                <div key="contents" className="task-container-wrapper">
                    {active_task &&
                        <tasks.TabContainer task={active_task} />
                    }
                </div>
            </div>
        );
    }
}
