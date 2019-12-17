import {observer} from "mobx-react";
import React from "react";

import taskState from "./state";
import SubtaskList from "./task";


@observer class TabList extends React.Component {
    showTab(id) {
        taskState.active_tab = id;

        if (this.props.extra_show_callback) {
            this.props.extra_show_callback();
        }
    }

    renderTab(tab) {
        let activeClass = (tab.id === taskState.active_tab) ? "active" : "";

        return (
            <button key={tab.id} className={activeClass} onClick={this.showTab.bind(this, tab.id)}>
                <span>{tab.title}</span>
            </button>
        );
    }

    render() {
        let tabs = Object.values(taskState.tasks);
        return tabs.map(tab => this.renderTab(tab));
    }
}


@observer class TabContainer extends React.Component {
    render() {
        let task = this.props.task;

        return (
            <div className="tab-contents-container">
                <SubtaskList task={task} />
            </div>
        );
    }
}


export default {
    TabList,
    TabContainer,
}
