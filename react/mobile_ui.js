import DjangoCSRFToken from 'django-react-csrftoken';
import {observer} from "mobx-react";
import React from "react";

import taskState from "./state";
import tab_container from "./tab_container";


@observer class TabMenu extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            menu_showing: false,
        };
    }

    toggleMenu() {
        this.setState({menu_showing: !this.state.menu_showing});
    }

    render() {
        let active_task = taskState.tasks[taskState.active_tab];
        let tab_menu_show_class = this.state.menu_showing ? "show " : "";

        return [
            (<div key="menu-bar" className="mobile-menu-bar">
                <button className="tab-menu-open-wrapper" onClick={this.toggleMenu.bind(this)}>
                    v
                </button>

                <div className="tab-display active button">{active_task.title}</div>
            </div>),

            (<div key="full-menu" className={tab_menu_show_class + "tab-menu"}>
                <tab_container.TabList extra_show_callback={this.toggleMenu.bind(this)} />
            </div>),
        ];
    }
}


@observer export default class MobileUI extends React.Component {
    render() {
        let active_task = taskState.tasks[taskState.active_tab];

        return [
            (<DjangoCSRFToken key="csrf" />),

            (<div key="ui" className="mobile-ui calcutron">
                <TabMenu key="tabs" />

                <div key="contents" className="task-container-wrapper">
                    {active_task &&
                        <tab_container.TabContainer task={active_task} />
                    }
                </div>
            </div>),
        ];
    }
}
