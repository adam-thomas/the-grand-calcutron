import DjangoCSRFToken from 'django-react-csrftoken';
import $ from "jquery";
import {observer} from "mobx-react";
import React from "react";

import actions from "./actions";
import taskState from "./state";
import tab_container from "./tab_container";


@observer class TabBar extends React.Component {
    render() {
        return (
            <div className="tab-bar">
                <tab_container.TabList />
            </div>
        );
    }
}


@observer class TabSettingsBar extends React.Component {
    constructor(props) {
        super(props);
        this.title_field_ref = React.createRef();
    }

    delete() {
        actions.deleteTask(taskState.tasks[taskState.active_tab]);
    }

    add() {
        let field_element = $(this.title_field_ref.current);

        actions.addTask(field_element.val(), null);
        field_element.val("");
    }

    update() {
        let field_element = $(this.title_field_ref.current);

        actions.setTaskTitle(taskState.tasks[taskState.active_tab], field_element.val());
        field_element.val("");
    }

    toggleChildren() {
        this.setState({show_children: !this.state.show_children});
    }

    render() {
        let current_title = "";
        if (taskState.active_tab !== null) {
            current_title = taskState.tasks[taskState.active_tab].title
        }

        return (
            <div key="tab-update-form" className="tab-options">
                <span key="title" className="title">Tab options</span>
                <input key="text" ref={this.title_field_ref} defaultValue={current_title} type="text" className="task-title" name="title" />
                <div key="buttons" className="buttons-wrapper">
                    <button key="add" onClick={this.add.bind(this)}>Add</button>
                    <button key="update" onClick={this.update.bind(this)}>Update</button>
                    <button key="delete" onClick={this.delete.bind(this)}>Delete</button>
                </div>
            </div>
        )
    }
}


@observer export default class DesktopUI extends React.Component {
    render() {
        let active_task = taskState.tasks[taskState.active_tab];

        return [
            (<DjangoCSRFToken key="csrf" />),

            (<div key="ui" className="desktop-ui calcutron">
                <div key="contents" className="task-container-wrapper">
                    {active_task &&
                        <tab_container.TabContainer task={active_task} />
                    }
                </div>

                <div key="tab-column" className="tab-column">
                    <TabBar key="tabs" />
                    <TabSettingsBar key="settings" />
                </div>
            </div>),
        ];
    }
}
